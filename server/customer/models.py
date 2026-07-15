import uuid

from django.db import models
from django.utils import timezone

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
        ("ACCEPTED", "Accepted"),
        ("BOOKING", "Booking"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
        ("EXPIRED", "Expired"),
    )

    request_id=models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        blank=True
    )
    public_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    contact_unlocked = models.BooleanField(default=False)

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
    updated_at = models.DateTimeField(
        auto_now=True
    )

    expires_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_expired(self):
        return self.status == "PENDING" and self.expires_at and self.expires_at <= timezone.now()

    def __str__(self):
        return f"{self.name} - {self.from_location} to {self.to_location}"

    def save(self, *args, **kwargs):
        if not self.request_id:
            self.request_id = f"REQ-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)
