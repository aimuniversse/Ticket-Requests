import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "booking.settings")

django.setup()

from accounts.models import User

if not User.objects.filter(email="admin@gmail.com").exists():
    User.objects.create_superuser(
        phone_number="9876543210",
        email="admin@gmail.com",
        password="Admin@123"
    )

print("Admin created")