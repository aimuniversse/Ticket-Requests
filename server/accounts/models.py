from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager

# Create your models here.

class User(AbstractBaseUser,PermissionsMixin):

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("operator", "Operator"),
    )

    APPROVAL_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    name = models.CharField(
    max_length=100,
    null=True,
    blank=True
)
    
    phone_number = models.CharField(
        max_length=15,
        unique=True
    )
    email = models.EmailField(
        unique=True
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )
    approved_by = models.ForeignKey(
    "self",
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name="approved_users"
)

    approved_at = models.DateTimeField(
    null=True,
    blank=True
)

    rejection_reason = models.TextField(
    null=True,
    blank=True
)

    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_CHOICES,
        default="pending"
    )

    is_active = models.BooleanField(
        default=False
    )

    is_staff = models.BooleanField(
        default=False
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    objects = UserManager()


    USERNAME_FIELD = "phone_number"

    REQUIRED_FIELDS = [
        "email"
    ]


    def __str__(self):
        return self.phone_number