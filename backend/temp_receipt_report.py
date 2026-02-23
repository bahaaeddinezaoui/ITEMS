# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class ReceiptReport(models.Model):
    receipt_report_id = models.IntegerField(primary_key=True)
    report_datetime = models.DateTimeField(blank=True, null=True)
    report_full_code = models.CharField(max_length=48, blank=True, null=True)
    digital_copy = models.BinaryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'receipt_report'
        db_table_comment = 'This represents the "PV de r�ception"'
