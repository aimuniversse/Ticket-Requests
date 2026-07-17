from django.db import migrations


class Migration(migrations.Migration):
    """Merge the two historical customer migration branches."""

    dependencies = [
        ("customer", "0002_alter_customerrequests_id"),
        ("customer", "0006_request_lifecycle"),
    ]

    operations = []
