"""Development only (SERVE_SITES=True): Django stands in for Nginx and serves the static sites."""
from django.conf import settings
from django.http import Http404
from django.shortcuts import redirect
from django.views.static import serve


def serve_site(request, path=""):
    """/sites/<slug>/... from SITES_ROOT (platform projects) or demos/ (existing demos)."""
    slug, _, rest = path.partition("/")
    if not slug or slug.startswith(".") or slug == "_shared":
        raise Http404
    if not _ and not rest:
        return redirect(request.path + "/")
    for root in (settings.SITES_ROOT, settings.DEMOS_DIR):
        if (root / slug).is_dir():
            return serve(request, rest or "index.html", document_root=str(root / slug))
    raise Http404


def serve_shared(request, path):
    from projects.publish import sync_shared
    sync_shared()
    return serve(request, path, document_root=str(settings.SITES_ROOT / "_shared"))
