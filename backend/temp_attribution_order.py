# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AttributionOrder(models.Model):
    attribution_order_id = models.IntegerField(primary_key=True)
    warehouse = models.ForeignKey('Warehouse', models.DO_NOTHING)
    attribution_order_full_code = models.CharField(max_length=48, blank=True, null=True)
    attribution_order_date = models.DateField(blank=True, null=True)
    is_signed_by_central_chief = models.BooleanField(blank=True, null=True)
    attribution_order_barcode = models.CharField(max_length=24, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attribution_order'
