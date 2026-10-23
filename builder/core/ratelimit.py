"""Tiny cache-based rate limiter (no extra package)."""
import functools
import time

from django.core.cache import cache
from django.http import JsonResponse
from django.shortcuts import render

from .utils import client_ip


def hit(key, limit, period):
    """Count one hit; True if `key` is still within `limit` hits per `period` seconds."""
    bucket = "rl:%s:%d" % (key, int(time.time() // period))
    if cache.add(bucket, 1, period + 5):
        count = 1
    else:
        try:
            count = cache.incr(bucket)
        except ValueError:
            cache.set(bucket, 1, period + 5)
            count = 1
    return count <= limit


def ratelimit(name, limit, period, methods=("POST",)):
    """Limit a view per user (or per IP when logged out)."""
    def deco(view):
        @functools.wraps(view)
        def wrapped(request, *args, **kwargs):
            if request.method in methods:
                who = "u%s" % request.user.pk if request.user.is_authenticated else "ip%s" % client_ip(request)
                if not hit("%s:%s" % (name, who), limit, period):
                    msg = "Too many requests. Please wait a minute and try again."
                    if request.headers.get("x-requested-with") == "XMLHttpRequest" or request.content_type == "application/json":
                        return JsonResponse({"ok": False, "error": msg}, status=429)
                    return render(request, "429.html", {"message": msg}, status=429)
            return view(request, *args, **kwargs)
        return wrapped
    return deco
