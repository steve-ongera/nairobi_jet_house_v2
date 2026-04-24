# ═══════════════════════════════════════════════════════════════════════════════
# NairobiJetHouse V2 — backend/settings.py
# ═══════════════════════════════════════════════════════════════════════════════
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Security ─────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-change-this-before-production-njh-v2-2025'
)

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,0.0.0.0'
).split(',')

# ─── Application Definition ───────────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
]

LOCAL_APPS = [
    'core',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─── Middleware ───────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',          # serve static in prod
    'corsheaders.middleware.CorsMiddleware',               # must be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS':    [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = 'backend.asgi.application'

# ─── Database ─────────────────────────────────────────────────────────────────
_db_engine = os.environ.get('DB_ENGINE', 'sqlite')

if _db_engine == 'postgresql':
    DATABASES = {
        'default': {
            'ENGINE':   'django.db.backends.postgresql',
            'NAME':     os.environ.get('DB_NAME',     'NairobiJetHouse_db'),
            'USER':     os.environ.get('DB_USER',     'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST':     os.environ.get('DB_HOST',     'localhost'),
            'PORT':     os.environ.get('DB_PORT',     '5432'),
            'OPTIONS': {
                'connect_timeout': 10,
            },
            'CONN_MAX_AGE': int(os.environ.get('DB_CONN_MAX_AGE', 60)),
        }
    }
else:
    # SQLite — development only
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME':   BASE_DIR / 'db.sqlite3',
        }
    }

# ─── Custom User Model ────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'core.User'

# ─── Password Validation ──────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Africa/Nairobi'
USE_I18N      = True
USE_TZ        = True

# ─── Static & Media Files ─────────────────────────────────────────────────────
STATIC_URL       = '/static/'
STATIC_ROOT      = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

# WhiteNoise compressed static files for production
STATICFILES_STORAGE = (
    'whitenoise.storage.CompressedManifestStaticFilesStorage'
    if not DEBUG else
    'django.contrib.staticfiles.storage.StaticFilesStorage'
)

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'
).split(',')

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# In production, tighten this to specific origins only
if not DEBUG:
    CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# ─── Django REST Framework ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',   # for browsable API
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',   # remove in production
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.environ.get('THROTTLE_ANON', '200/hour'),
        'user': os.environ.get('THROTTLE_USER', '1000/hour'),
    },
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
    'DATE_FORMAT':     '%Y-%m-%d',
}

# ─── SimpleJWT ────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':          timedelta(
                                          hours=int(os.environ.get('JWT_ACCESS_HOURS', 8))
                                      ),
    'REFRESH_TOKEN_LIFETIME':         timedelta(
                                          days=int(os.environ.get('JWT_REFRESH_DAYS', 30))
                                      ),
    'ROTATE_REFRESH_TOKENS':          True,
    'BLACKLIST_AFTER_ROTATION':       True,
    'UPDATE_LAST_LOGIN':              True,
    'ALGORITHM':                      'HS256',
    'SIGNING_KEY':                    SECRET_KEY,
    'AUTH_HEADER_TYPES':              ('Bearer',),
    'AUTH_HEADER_NAME':               'HTTP_AUTHORIZATION',
    'USER_ID_FIELD':                  'id',
    'USER_ID_CLAIM':                  'user_id',
    'TOKEN_OBTAIN_SERIALIZER':        'rest_framework_simplejwt.serializers.TokenObtainPairSerializer',
    'TOKEN_REFRESH_SERIALIZER':       'rest_framework_simplejwt.serializers.TokenRefreshSerializer',
}

# ─── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend'    # dev: prints to console
    # 'django.core.mail.backends.smtp.EmailBackend'     # prod: uncomment
)

EMAIL_HOST          = os.environ.get('EMAIL_HOST',          'smtp.gmail.com')
EMAIL_PORT          = int(os.environ.get('EMAIL_PORT',      587))
EMAIL_USE_TLS       = os.environ.get('EMAIL_USE_TLS',       'True') == 'True'
EMAIL_USE_SSL       = os.environ.get('EMAIL_USE_SSL',       'False') == 'True'
EMAIL_HOST_USER     = os.environ.get('EMAIL_HOST_USER',     '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL  = os.environ.get(
    'DEFAULT_FROM_EMAIL',
    'NairobiJetHouse <noreply@nairobijethouse.com>'
)
SERVER_EMAIL        = DEFAULT_FROM_EMAIL

# ─── Caching ─────────────────────────────────────────────────────────────────
_cache_backend = os.environ.get('CACHE_BACKEND', 'dummy')

if _cache_backend == 'redis':
    CACHES = {
        'default': {
            'BACKEND':  'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            },
            'TIMEOUT': 300,
        }
    }
elif _cache_backend == 'memcached':
    CACHES = {
        'default': {
            'BACKEND':  'django.core.cache.backends.memcached.PyMemcacheCache',
            'LOCATION': os.environ.get('MEMCACHE_URL', '127.0.0.1:11211'),
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }

# ─── Celery (background tasks — webhook retries, email queuing) ───────────────
CELERY_BROKER_URL         = os.environ.get('CELERY_BROKER_URL', 'redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND     = os.environ.get('CELERY_RESULT_BACKEND', 'redis://127.0.0.1:6379/0')
CELERY_ACCEPT_CONTENT     = ['json']
CELERY_TASK_SERIALIZER    = 'json'
CELERY_RESULT_SERIALIZER  = 'json'
CELERY_TIMEZONE           = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_BEAT_SCHEDULER     = 'django_celery_beat.schedulers:DatabaseScheduler'

# ─── Stripe ───────────────────────────────────────────────────────────────────
STRIPE_PUBLIC_KEY  = os.environ.get('STRIPE_PUBLIC_KEY',  '')
STRIPE_SECRET_KEY  = os.environ.get('STRIPE_SECRET_KEY',  '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# ─── File Storage (S3 / local) ────────────────────────────────────────────────
_storage_backend = os.environ.get('STORAGE_BACKEND', 'local')

if _storage_backend == 's3':
    DEFAULT_FILE_STORAGE    = 'storages.backends.s3boto3.S3Boto3Storage'
    STATICFILES_STORAGE     = 'storages.backends.s3boto3.S3StaticStorage'
    AWS_ACCESS_KEY_ID       = os.environ.get('AWS_ACCESS_KEY_ID',     '')
    AWS_SECRET_ACCESS_KEY   = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', 'njh-assets')
    AWS_S3_REGION_NAME      = os.environ.get('AWS_S3_REGION_NAME',    'eu-west-1')
    AWS_S3_CUSTOM_DOMAIN    = os.environ.get('AWS_S3_CUSTOM_DOMAIN',  '')
    AWS_DEFAULT_ACL         = 'private'
    AWS_S3_FILE_OVERWRITE   = False
    AWS_QUERYSTRING_AUTH    = True

# ─── Logging ─────────────────────────────────────────────────────────────────
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'DEBUG' if DEBUG else 'INFO')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name} {process:d} {thread:d} — {message}',
            'style': '{',
        },
        'simple': {
            'format': '[{asctime}] {levelname} — {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'class':     'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class':       'logging.handlers.RotatingFileHandler',
            'filename':    BASE_DIR / 'logs' / 'njh.log',
            'maxBytes':    10 * 1024 * 1024,   # 10 MB
            'backupCount': 5,
            'formatter':   'verbose',
        },
        'mail_admins': {
            'level':   'ERROR',
            'class':   'django.utils.log.AdminEmailHandler',
            'filters': ['require_debug_false'],
        },
    },
    'root': {
        'handlers': ['console'],
        'level':    LOG_LEVEL,
    },
    'loggers': {
        'django': {
            'handlers':  ['console', 'file'],
            'level':     LOG_LEVEL,
            'propagate': False,
        },
        'django.request': {
            'handlers':  ['console', 'file', 'mail_admins'],
            'level':     'WARNING',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers':  ['console'],
            'level':     'WARNING',    # set to DEBUG to log all SQL
            'propagate': False,
        },
        'core': {
            'handlers':  ['console', 'file'],
            'level':     LOG_LEVEL,
            'propagate': False,
        },
    },
}

# Ensure logs directory exists
(BASE_DIR / 'logs').mkdir(exist_ok=True)

# ─── Security Headers (production) ───────────────────────────────────────────
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER         = True
    SECURE_CONTENT_TYPE_NOSNIFF        = True
    SECURE_HSTS_SECONDS                = 31536000      # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS     = True
    SECURE_HSTS_PRELOAD                = True
    SECURE_SSL_REDIRECT                = os.environ.get('SECURE_SSL_REDIRECT', 'True') == 'True'
    SESSION_COOKIE_SECURE              = True
    CSRF_COOKIE_SECURE                 = True
    X_FRAME_OPTIONS                    = 'DENY'
    SECURE_REFERRER_POLICY             = 'strict-origin-when-cross-origin'

# ─── Admin ────────────────────────────────────────────────────────────────────
ADMINS = [
    (os.environ.get('ADMIN_NAME', 'NJH Admin'),
     os.environ.get('ADMIN_EMAIL', 'admin@nairobijethouse.com')),
]

# ─── NJH Platform Config ─────────────────────────────────────────────────────
NJH_CONFIG = {
    'PLATFORM_NAME':        'NairobiJetHouse',
    'DEFAULT_COMMISSION':   Decimal('15.00') if False else 15.00,   # % charged on bookings
    'DEFAULT_MARKUP':       20.00,                                   # % added to operator rate
    'CURRENCY':             'USD',
    'RFQ_RESPONSE_HOURS':   4,       # hours operators have to respond to RFQ
    'PAYOUT_TERMS_DAYS':    7,       # default days after trip to release payout
    'MAX_BID_VALID_DAYS':   3,       # days an RFQ bid stays valid
    'SUPPORT_EMAIL':        os.environ.get('SUPPORT_EMAIL', 'ops@nairobijethouse.com'),
    'WEBHOOK_RETRY_LIMIT':  3,
    'WEBHOOK_RETRY_DELAY':  300,     # seconds between webhook retries
}