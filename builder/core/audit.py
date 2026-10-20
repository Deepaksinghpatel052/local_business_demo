from .models import AuditLog
from .utils import client_ip


def audit(request, action, obj=None, **details):
    """Record an admin action. `obj` is any model instance (project, order, user…)."""
    AuditLog.objects.create(
        actor=request.user if request is not None and request.user.is_authenticated else None,
        action=action,
        target_type=obj._meta.model_name if obj is not None else "",
        target_id=str(obj.pk) if obj is not None else "",
        target_label=str(obj)[:200] if obj is not None else "",
        details=details,
        ip=client_ip(request) if request is not None else None,
    )
