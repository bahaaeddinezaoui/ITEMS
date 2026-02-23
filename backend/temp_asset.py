# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Asset(models.Model):
    asset_id = models.IntegerField(primary_key=True)
    asset_model = models.ForeignKey('AssetModel', models.DO_NOTHING)
    attribution_order = models.ForeignKey('AttributionOrder', models.DO_NOTHING, blank=True, null=True)
    destruction_certificate = models.ForeignKey('DestructionCertificate', models.DO_NOTHING, blank=True, null=True)
    asset_serial_number = models.CharField(max_length=48, blank=True, null=True)
    asset_fabrication_datetime = models.DateTimeField(blank=True, null=True)
    asset_inventory_number = models.CharField(max_length=6, blank=True, null=True)
    asset_service_tag = models.CharField(max_length=24, blank=True, null=True)
    asset_name = models.CharField(max_length=48, blank=True, null=True)
    asset_name_in_the_administrative_certificate = models.CharField(max_length=48, blank=True, null=True)
    asset_arrival_datetime = models.DateTimeField(blank=True, null=True)
    asset_status = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'asset'
