from django.db import models
from django.conf import settings


class Operator(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    company_name = models.CharField(
        max_length=200
    )

    service_count = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


class OperatorService(models.Model):

    operator = models.ForeignKey(
        Operator,
        related_name="services",
        on_delete=models.CASCADE
    )

    from_location = models.CharField(
        max_length=100
    )

    to_location = models.CharField(
        max_length=100
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )