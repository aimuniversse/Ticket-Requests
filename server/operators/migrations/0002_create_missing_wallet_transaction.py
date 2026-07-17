from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('operators', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE TABLE IF NOT EXISTS "operators_transaction" (
                    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                    "transaction_type" varchar(10) NOT NULL,
                    "credits" integer NOT NULL,
                    "balance_after_transaction" integer NOT NULL,
                    "description" varchar(255) NOT NULL,
                    "created_at" datetime NOT NULL,
                    "operator_id" bigint NOT NULL REFERENCES "operators_operator" ("id") DEFERRABLE INITIALLY DEFERRED
                );
                CREATE TABLE IF NOT EXISTS "operators_wallet" (
                    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
                    "current_balance" integer NOT NULL CHECK ("current_balance" >= 0),
                    "created_at" datetime NOT NULL,
                    "updated_at" datetime NOT NULL,
                    "operator_id" bigint NOT NULL UNIQUE REFERENCES "operators_operator" ("id") DEFERRABLE INITIALLY DEFERRED
                );
                CREATE INDEX IF NOT EXISTS "operators_transaction_operator_id_2b875156" ON "operators_transaction" ("operator_id");
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
