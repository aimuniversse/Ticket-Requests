from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("customer", "0003_alter_customerrequests_id"),
        ("operators", "0001_initial"),
    ]

    # The initial migration already contains assigned_operator.
    operations = []
