"""
Status changes made by the team or by payments:
verification decisions, go-live, suspend/reactivate, expiry.
"""
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from core.notify import notify_owner
from crm.models import log_activity

from .models import Project, VerificationRequest
from .publish import publish_project

YEAR = timedelta(days=365)


def after_payment(project, order_type):
    """Called once per paid order (inside the payment transaction)."""
    from core.models import PlatformSettings
    ps = PlatformSettings.load()
    if order_type == "hosting_new":
        project.plan = Project.PLAN_HOSTED
        required = ps.require_verification_hosted
    else:
        if project.plan == Project.PLAN_NONE:
            project.plan = Project.PLAN_DOWNLOAD
        required = ps.require_verification_download

    if project.is_approved:
        project.status = Project.APPROVED if order_type == "hosting_new" else (
            project.status if project.status == Project.LIVE else Project.DOWNLOAD_READY)
    elif required:
        project.status = Project.PENDING_VERIFICATION
    else:
        VerificationRequest.objects.create(project=project, maps_link="https://maps.google.com/",
                                           decision=VerificationRequest.APPROVED, decided_at=timezone.now(),
                                           reason="Auto-approved: verification is turned off in settings")
        project.status = Project.APPROVED if order_type == "hosting_new" else Project.DOWNLOAD_READY
    project.save()
    if project.status == Project.APPROVED and not ps.require_verification_hosted:
        go_live(project, actor=None)


@transaction.atomic
def approve(project, reviewer):
    vr = project.verifications.filter(decision=VerificationRequest.PENDING).first()
    if vr is None:
        raise ValueError("No pending verification request for this project.")
    vr.decision = VerificationRequest.APPROVED
    vr.reviewer = reviewer
    vr.decided_at = timezone.now()
    vr.save()
    if project.plan == Project.PLAN_HOSTED:
        project.status = Project.APPROVED
        msg = ("Good news! %s is verified. Our team is making your website live now; you will get the link shortly."
               % project.business_name)
    else:
        project.status = Project.DOWNLOAD_READY
        msg = ("Good news! %s is verified. You can now download your website from your dashboard "
               "(free re-downloads any time)." % project.business_name)
    project.status_note = ""
    project.save()
    log_activity(project.owner, "approved", project)
    transaction.on_commit(lambda: notify_owner(project.owner, "Your business is verified", msg))
    return vr


@transaction.atomic
def reject(project, reviewer, reason):
    """Reject, refund every paid order of this project, and take the preview down."""
    from billing.services import refund_order
    vr = project.verifications.filter(decision=VerificationRequest.PENDING).first()
    if vr is None:
        vr = VerificationRequest.objects.create(project=project, maps_link="https://maps.google.com/",
                                                owner_notes="(rejected without a request from the owner)")
    vr.decision = VerificationRequest.REJECTED
    vr.reviewer = reviewer
    vr.reason = reason[:300]
    vr.decided_at = timezone.now()
    vr.save()
    project.status = Project.REJECTED
    project.status_note = reason[:300]
    project.save()
    refunds = []
    for order in project.orders.filter(status="paid", type__in=["hosting_new", "download"]):
        refunds.append(refund_order(order, "Verification rejected: " + reason))
    log_activity(project.owner, "rejected", project, detail=reason)
    publish_project(project, "unavailable")
    transaction.on_commit(lambda: notify_owner(
        project.owner, "We could not verify your business",
        "Sorry, we could not verify %s.\nReason: %s\nYour payment is being refunded to the original payment "
        "method (usually 5-7 working days)." % (project.business_name, reason)))
    return refunds


@transaction.atomic
def go_live(project, actor):
    if project.status not in (Project.APPROVED, Project.EXPIRED, Project.LIVE):
        raise ValueError("Only approved projects can go live.")
    project.status = Project.LIVE
    now = timezone.now()
    if not project.went_live_at:
        project.went_live_at = now
    if not project.hosting_expires_at or project.hosting_expires_at < now:
        project.hosting_expires_at = now + YEAR
    project.save()
    publish_project(project, "live")
    log_activity(project.owner, "live", project, once=True)
    transaction.on_commit(lambda: notify_owner(
        project.owner, "Your website is live!",
        "%s is now live at %s\nEvery change you make from your dashboard is published instantly."
        % (project.business_name, project.public_url)))


@transaction.atomic
def suspend(project, reason=""):
    if project.status != Project.SUSPENDED:
        project.status_before_suspend = project.status
    project.status = Project.SUSPENDED
    project.status_note = reason[:300]
    project.save()
    publish_project(project, "unavailable")


@transaction.atomic
def reactivate(project):
    if project.status != Project.SUSPENDED:
        return
    project.status = project.status_before_suspend or Project.PREVIEW
    project.status_before_suspend = ""
    project.status_note = ""
    project.save()
    publish_project(project)


def extend_hosting(project):
    """Renewal: one more year from the current expiry date (not from today)."""
    now = timezone.now()
    base = project.hosting_expires_at or now
    new_expiry = base + YEAR
    if new_expiry < now:                 # expired more than a year ago: a full year from today
        new_expiry = now + YEAR
    project.hosting_expires_at = new_expiry
    if project.status == Project.EXPIRED:
        project.status = Project.LIVE
    project.save()
    if project.status == Project.LIVE:
        publish_project(project, "live")
    return new_expiry
