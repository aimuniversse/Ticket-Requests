from django.db import models

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
        ("NEW", "New"),
        ("ASSIGNED", "Assigned"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    name = models.CharField(
        max_length=100
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
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="NEW"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.name} - {self.from_location} to {self.to_location}"