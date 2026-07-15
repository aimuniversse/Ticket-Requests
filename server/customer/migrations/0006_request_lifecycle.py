# Generated manually for the request lifecycle workflow.
import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("customer", "0005_alter_customerrequests_id")]

    operations = [
        migrations.AddField(
            model_name="customerrequests",
            name="contact_unlocked",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="customerrequests",
            name="expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="customerrequests",
            name="public_token",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name="customerrequests",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"), ("ACCEPTED", "Accepted"),
                    ("BOOKING", "Booking"), ("COMPLETED", "Completed"),
                    ("CANCELLED", "Cancelled"), ("EXPIRED", "Expired"),
                ],
                default="PENDING", max_length=20,
            ),
        ),
        migrations.RunSQL(
            "UPDATE customer_customerrequests SET status = 'PENDING' WHERE status = 'NEW';"
            "UPDATE customer_customerrequests SET status = 'ACCEPTED' WHERE status = 'ASSIGNED';",
            "UPDATE customer_customerrequests SET status = 'NEW' WHERE status = 'PENDING';"
            "UPDATE customer_customerrequests SET status = 'ASSIGNED' WHERE status = 'ACCEPTED';",
        ),
    ]
