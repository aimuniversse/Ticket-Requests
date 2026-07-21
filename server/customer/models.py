from django.db import models
from django.utils import timezone
from datetime import timedelta

# Create your models here.

class CustomerRequests(models.Model):
    BUS_TYPE_CHOICES=(
        ("AC_SLEEPER", "AC Sleeper"),
        ("NON_AC_SLEEPER", "Non AC Sleeper"),
        ("AC_SEATER", "AC Seater"),
        ("NON_AC_SEATER", "Non AC Seater"),
        ("SEMI_SLEEPER", "Semi Sleeper"),
    )

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("NEW", "New"),
        ("ASSIGNED", "Assigned"),
        ("ACCEPTED", "Accepted"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
        ("EXPIRED", "Expired"),
    )

    request_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        blank=True,
        null=True,
    )

    name = models.CharField(
        max_length=100,
    )
    phone_number = models.CharField(
        max_length=15
    )
    from_location = models.CharField(
        max_length=100
    )
    to_location = models.CharField(
        max_length=100
    )
    journey_date = models.DateField()
    journey_time = models.CharField(max_length=20, blank=True, null=True)
    total_tickets = models.PositiveIntegerField()
    bus_type = models.CharField(
        max_length=50,
        choices=BUS_TYPE_CHOICES
    )
    expected_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    assigned_operator = models.ForeignKey(
        "operators.Operator",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_requests"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    def refresh_status(self):
        if self.status in {"ACCEPTED", "COMPLETED", "CANCELLED", "EXPIRED"}:
            return self.status

        if self.expires_at and timezone.now() >= self.expires_at and self.status != "EXPIRED":
            self.status = "EXPIRED"
            self.save(update_fields=["status", "updated_at"])
            return self.status

        return self.status

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        updated_fields = []
        if is_new and not self.request_id:
            self.request_id = f"REQ-{self.id:05d}"
            updated_fields.append("request_id")
        if is_new and not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
            updated_fields.append("expires_at")
        if updated_fields:
            super().save(update_fields=updated_fields)

    def __str__(self):
        return f"{self.name} - {self.from_location} to {self.to_location}"