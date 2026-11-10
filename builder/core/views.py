"""SERVE_FILES=True (a computer without Nginx): Django stands in for Nginx and serves the files."""
from django.conf import settings
from django.http import Http404
from django.shortcuts import redirect
from django.urls import reverse
from django.views.static import serve


def serve_site(request, path=""):
    """/sites/<slug>/... from SITES_ROOT (platform projects) or demos/ (existing demos)."""
    slug, _, rest = path.partition("/")
    if not slug or slug.startswith(".") or slug == "_shared":
        raise Http404
    if not _ and not rest:
        return redirect(request.path + "/")
    if slug.startswith("sample-") and (not rest or rest.endswith(".html") or rest == "data.js"):
        # a design's live sample is for signed-in owners only (projects.views.sample_preview);
        # its photos stay public for the coming soon page. Nginx does the same (deploy/nginx-app.conf).
        return redirect(reverse("sample_preview", args=[slug[len("sample-"):], ""]))
    for root in (settings.SITES_ROOT, settings.DEMOS_DIR):
        if (root / slug).is_dir():
            return serve(request, rest or "index.html", document_root=str(root / slug))
    raise Http404


def serve_shared(request, path):
    from projects.publish import sync_shared
    sync_shared()
    return serve(request, path, document_root=str(settings.SITES_ROOT / "_shared"))


def serve_media(request, path):
    """/media/... from MEDIA_ROOT. Verification proof is never public (the team sees it in /manage/)."""
    if path.startswith("verification/"):
        raise Http404
    return serve(request, path, document_root=str(settings.MEDIA_ROOT))


def serve_static(request, path):
    """/static/... from STATIC_ROOT (collectstatic) when DEBUG=False."""
    return serve(request, path, document_root=str(settings.STATIC_ROOT))
