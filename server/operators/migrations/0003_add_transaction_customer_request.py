from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('operators', '0002_create_missing_wallet_transaction'),
        ('customer', '0011_alter_customerrequests_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='customer_request',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name='transactions',
                to='customer.customerrequests',
            ),
        ),
    ]
