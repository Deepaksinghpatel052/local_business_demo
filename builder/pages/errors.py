from django.http import HttpResponseServerError
from django.shortcuts import render
from django.template import loader


def not_found(request, exception=None):
    return render(request, "404.html", status=404)


def server_error(request):
    # no request context: the error may have come from the database
    return HttpResponseServerError(loader.render_to_string("500.html"))
