import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'booking.settings')
django.setup()
from django.urls import resolve, get_resolver
resolver = get_resolver(None)
tests = [
    '/api/auth/admin/transactions/',
    '/api/auth/admin/operators/1/transactions/',
    '/api/auth/admin/operators/pending/',
    '/api/auth/admin/transactions',
    '/api/auth/admin/operators/1/transactions',
]
print('patterns:')
print([str(p) for p in resolver.url_patterns])
for t in tests:
    try:
        m = resolve(t)
        print('OK', t, m.func.__qualname__, m.func.__module__)
    except Exception as e:
        print('NO', t, type(e).__name__, e)
