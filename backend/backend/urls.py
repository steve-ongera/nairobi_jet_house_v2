# ═══════════════════════════════════════════════════════════════════════════════
# NairobiJetHouse V2 — backend/urls.py  (project root URL conf)
# ═══════════════════════════════════════════════════════════════════════════════
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import RedirectView


# ── Health-check endpoint (used by load balancers / CI) ──────────────────────
def health_check(request):
    from django.db import connection
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False
    payload = {
        'status':  'ok' if db_ok else 'degraded',
        'service': 'NairobiJetHouse API',
        'version': 'v2',
        'db':      'connected' if db_ok else 'unreachable',
    }
    return JsonResponse(payload, status=200 if db_ok else 503)


# ── API root info ─────────────────────────────────────────────────────────────
def api_root(request):
    return JsonResponse({
        'service':     'NairobiJetHouse API',
        'version':     'v2',
        'docs':        '/api/',          # DRF browsable API
        'health':      '/health/',
        'admin_panel': '/admin-panel/',
    })


urlpatterns = [

    # ── Django admin panel (internal staff use) ────────────────────────────
    path('admin-panel/', admin.site.urls),

    # ── Health & info ─────────────────────────────────────────────────────
    path('health/', health_check, name='health-check'),
    path('',        api_root,     name='api-root'),

    # ── Main API (all app endpoints) ──────────────────────────────────────
    path('api/', include('core.urls')),

    # ── Redirect bare /api to browsable root ──────────────────────────────
    path('api', RedirectView.as_view(url='/api/', permanent=False)),
]

# ── Serve media files in development ─────────────────────────────────────────
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # DRF browsable API login/logout (dev only)
    urlpatterns += [
        path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    ]