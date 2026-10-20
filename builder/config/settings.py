"""
Settings for the Devnixplus site builder (app.devnixplus.com).

Every secret and every value that differs between your laptop and the server
comes from the .env file in the repository root (see .env.example).
"""
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent          # builder/
REPO_DIR = BASE_DIR.parent                                  # local_business_demo/

env = environ.Env()
environ.Env.read_env(REPO_DIR / ".env")

DEBUG = env.bool("DEBUG", default=False)
SECRET_KEY = env("SECRET_KEY", default="dev-only-insecure-key-change-me" if DEBUG else environ.Env.NOTSET)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["127.0.0.1", "localhost"])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "core",
    "accounts",
    "templates_lib",
    "projects",
    "billing",
    "crm",
    "adminpanel",
    "pages",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "accounts.middleware.OnboardingMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "core.context_processors.platform",
            ],
        },
    },
]

DATABASES = {"default": env.db("DATABASE_URL", default="sqlite:///%s" % (BASE_DIR / "db.sqlite3"))}
DATABASES["default"]["ATOMIC_REQUESTS"] = False
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

LANGUAGE_CODE = "en-in"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = Path(env("STATIC_ROOT", default=str(REPO_DIR / "var" / "static")))
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(env("MEDIA_ROOT", default=str(REPO_DIR / "var" / "media")))

CACHES = {"default": env.cache("CACHE_URL", default="locmemcache://")}

# --- allauth: email + password, and "Continue with Google" ----------------
SITE_ID = 1
LOGIN_URL = "account_login"
LOGIN_REDIRECT_URL = "dashboard"
ACCOUNT_LOGOUT_REDIRECT_URL = "home"
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*"]
ACCOUNT_SIGNUP_FORM_CLASS = "accounts.forms.SignupExtraForm"
ACCOUNT_EMAIL_VERIFICATION = env("ACCOUNT_EMAIL_VERIFICATION", default="optional")
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_LOGOUT_ON_GET = False
ACCOUNT_RATE_LIMITS = {
    "login": "20/m/ip",
    "login_failed": "10/m/ip,5/5m/key",
    "signup": "5/h/ip",
    "reset_password": "5/h/ip,3/h/key",
}
SOCIALACCOUNT_LOGIN_ON_GET = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APPS": [{
            "client_id": env("GOOGLE_CLIENT_ID", default=""),
            "secret": env("GOOGLE_CLIENT_SECRET", default=""),
            "key": "",
        }] if env("GOOGLE_CLIENT_ID", default="") else [],
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"prompt": "select_account"},
    }
}
GOOGLE_LOGIN_ENABLED = bool(env("GOOGLE_CLIENT_ID", default=""))

# --- Email -----------------------------------------------------------------
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="localhost")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="Devnixplus <no-reply@devnixplus.com>")
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# --- Where the sites live and how they are addressed -----------------------
APP_URL = env("APP_URL", default="http://127.0.0.1:8000").rstrip("/")
DEMO_URL_STYLE = env("DEMO_URL_STYLE", default="path")            # "path" | "subdomain"
DEMO_BASE_URL = env("DEMO_BASE_URL", default=APP_URL + "/sites").rstrip("/")   # path style: <base>/<slug>/
DEMO_DOMAIN = env("DEMO_DOMAIN", default="demo.devnixplus.com")  # subdomain style: <slug>.<domain>
DEMO_SCHEME = env("DEMO_SCHEME", default="https")
SITES_ROOT = Path(env("SITES_ROOT", default=str(REPO_DIR / "var" / "sites")))   # prod: /var/www/demos
SHARED_VERSION = env("SHARED_VERSION", default="v1")
SERVE_SITES = env.bool("SERVE_SITES", default=DEBUG)               # Django serves SITES_ROOT + /_shared/ (dev only)
TEMPLATE_DIR = REPO_DIR / "template"                               # the existing renderer
DEMOS_DIR = REPO_DIR / "demos"                                     # existing demos + sample-* templates
RESERVED_SLUGS = {"app", "www", "api", "admin", "_shared", "static", "media", "manage", "sites", "mail", "demo"}

# --- Payments (Razorpay) ----------------------------------------------------
RAZORPAY_KEY_ID = env("RAZORPAY_KEY_ID", default="")
RAZORPAY_KEY_SECRET = env("RAZORPAY_KEY_SECRET", default="")
RAZORPAY_WEBHOOK_SECRET = env("RAZORPAY_WEBHOOK_SECRET", default="")
DEMO_PAYMENTS = env.bool("DEMO_PAYMENTS", default=not RAZORPAY_KEY_ID)

# --- Invoices ---------------------------------------------------------------
GST_ENABLED = env.bool("GST_ENABLED", default=False)
COMPANY = {
    "name": env("COMPANY_NAME", default="Devnixplus"),
    "address": env("COMPANY_ADDRESS", default="India"),
    "email": env("COMPANY_EMAIL", default="hello@devnixplus.com"),
    "phone": env("COMPANY_PHONE", default="+91 91835 59191"),
    "gstin": env("COMPANY_GSTIN", default=""),
    "state": env("COMPANY_STATE", default=""),
    "invoice_prefix": env("INVOICE_PREFIX", default="DNX"),
}

# --- Messaging providers ------------------------------------------------------
SMS_PROVIDER = env("SMS_PROVIDER", default="mock")                 # mock | msg91
MSG91_AUTH_KEY = env("MSG91_AUTH_KEY", default="")
MSG91_TEMPLATE_ID = env("MSG91_TEMPLATE_ID", default="")
WHATSAPP_PROVIDER = env("WHATSAPP_PROVIDER", default="mock")       # mock | cloud
WHATSAPP_TOKEN = env("WHATSAPP_TOKEN", default="")
WHATSAPP_PHONE_ID = env("WHATSAPP_PHONE_ID", default="")

# --- Uploads ------------------------------------------------------------------
DATA_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024

# --- Security (production) ------------------------------------------------------
SESSION_COOKIE_SECURE = env.bool("SECURE_COOKIES", default=not DEBUG)
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=0 if DEBUG else 31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = False      # customer sites on *.demo… must not inherit app policies by accident
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=False)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "SAMEORIGIN"              # the editor shows its live preview in a same-origin iframe

# --- Logging --------------------------------------------------------------------
LOG_DIR = Path(env("LOG_DIR", default=str(REPO_DIR / "var" / "logs")))
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"plain": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"}},
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "plain"},
        "file": {
            "class": "logging.handlers.RotatingFileHandler", "formatter": "plain",
            "filename": str(LOG_DIR / "builder.log"), "maxBytes": 5 * 1024 * 1024, "backupCount": 5,
            "encoding": "utf-8",
        },
    },
    "root": {"handlers": ["console", "file"], "level": "INFO"},
    "loggers": {"django.request": {"handlers": ["console", "file"], "level": "WARNING", "propagate": False}},
}
