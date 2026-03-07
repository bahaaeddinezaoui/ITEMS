from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0015_destruction_certificate_digital_copy_path"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name="DestructionCertificate",
                    fields=[
                        (
                            "destruction_certificate_id",
                            models.AutoField(
                                primary_key=True,
                                serialize=False,
                                db_column="destruction_certificate_id",
                            ),
                        ),
                        (
                            "digital_copy",
                            models.TextField(
                                blank=True,
                                null=True,
                                db_column="digital_copy",
                            ),
                        ),
                        (
                            "destruction_datetime",
                            models.DateTimeField(
                                blank=True,
                                null=True,
                                db_column="destruction_datetime",
                            ),
                        ),
                    ],
                    options={
                        "managed": False,
                        "db_table": "destruction_certificate",
                    },
                ),
            ],
        ),
    ]
