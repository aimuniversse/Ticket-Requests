from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("customer", "0003_alter_customerrequests_id"),
        ("operators", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="customerrequests",
            name="assigned_operator",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="assigned_requests",
                to="operators.operator",
            ),
        ),
    ]
