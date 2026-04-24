from rest_framework import serializers
from django.utils import timezone
from .models import Person, UserAccount, Role, PhysicalCondition, AssetType, AssetBrand, AssetModel, AssetModelDefaultStockItem, AssetModelDefaultConsumable, StockItemType, StockItemBrand, StockItemModel, ConsumableType, ConsumableBrand, ConsumableModel, LocationType, Location, LocationRelation, Position, PositionRoleMapping, OrganizationalStructureType, OrganizationalStructure, OrganizationalStructureRelation, Asset, StockItem, Consumable, AssetIsAssignedToPerson, StockItemIsAssignedToPerson, ConsumableIsAssignedToPerson, PersonReportsProblemOnAsset, PersonReportsProblemOnStockItem, PersonReportsProblemOnConsumable, MaintenanceTypicalStep, MaintenanceStep, Maintenance, AssetAttributeDefinition, AssetTypeAttribute, AssetModelAttributeValue, AssetAttributeValue, StockItemAttributeDefinition, StockItemTypeAttribute, StockItemModelAttributeValue, StockItemAttributeValue, ConsumableAttributeDefinition, ConsumableTypeAttribute, ConsumableModelAttributeValue, ConsumableAttributeValue, Warehouse, AttributionOrder, ReceiptReport, AdministrativeCertificate, StockItemConsumableDestructionCertificate, AssetDestructionCertificate, AssetDestructionCertificateAsset, AssetFailedExternalMaintenance, CompanyAssetRequest, MaintenanceStepItemRequest, ExternalMaintenanceProvider, ExternalMaintenance, ExternalMaintenanceStep, ExternalMaintenanceTypicalStep, ExternalMaintenanceDocument, AttributionOrderAssetStockItemAccessory, AttributionOrderAssetConsumableAccessory, AssetIncidentReport, AssetIncidentReportStockItem, AssetIncidentReportConsumable, AuthenticationLog, UserSession
from .translations import LocationTranslation, LocationTypeTranslation, OrganizationalStructureTypeTranslation, OrganizationalStructureTranslation, PositionTranslation, RoleTranslation, AssetTypeTranslation, StockItemTypeTranslation, ConsumableTypeTranslation, AssetBrandTranslation, StockItemBrandTranslation, ConsumableBrandTranslation, PersonTranslation, AssetAttributeDefinitionTranslation, ConsumableAttributeDefinitionTranslation, StockItemAttributeDefinitionTranslation, AssetTranslation, StockItemTranslation, ConsumableTranslation, AssetModelTranslation, StockItemModelTranslation, ConsumableModelTranslation


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for Person model"""
    role_code = serializers.SerializerMethodField()
    first_name_en = serializers.SerializerMethodField()
    first_name_ar = serializers.SerializerMethodField()
    last_name_en = serializers.SerializerMethodField()
    last_name_ar = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Person
        fields = ['person_id', 'first_name', 'last_name', 'sex', 'birth_date', 'is_approved', 'role_code', 'first_name_en', 'first_name_ar', 'last_name_en', 'last_name_ar', 'translations']
        read_only_fields = ['person_id']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = PersonTranslation.objects.get(person=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except PersonTranslation.DoesNotExist:
            return None

    def get_first_name_en(self, obj):
        return self._get_translated_field(obj, 'en', 'first_name')

    def get_first_name_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'first_name')

    def get_last_name_en(self, obj):
        return self._get_translated_field(obj, 'en', 'last_name')

    def get_last_name_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'last_name')

    def get_role_code(self, obj):
        # Returns the role code of the first role associated with this person
        from .models import PersonRoleMapping
        mapping = PersonRoleMapping.objects.filter(person=obj).select_related('role').first()
        return mapping.role.role_code if mapping and mapping.role else None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret.get('sex'):
            ret['sex'] = ret['sex'].strip()
        return ret


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model"""
    role_label_ar = serializers.SerializerMethodField()
    role_label_en = serializers.SerializerMethodField()
    description_ar = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Role
        fields = ['role_id', 'role_code', 'role_label', 'description', 'role_label_ar', 'role_label_en', 'description_ar', 'description_en', 'translations']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = RoleTranslation.objects.get(role=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except RoleTranslation.DoesNotExist:
            return None

    def get_role_label_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'role_label')

    def get_role_label_en(self, obj):
        return self._get_translated_field(obj, 'en', 'role_label')

    def get_description_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'description')

    def get_description_en(self, obj):
        return self._get_translated_field(obj, 'en', 'description')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class PhysicalConditionSerializer(serializers.ModelSerializer):
    condition_label_ar = serializers.SerializerMethodField()
    condition_label_en = serializers.SerializerMethodField()

    class Meta:
        model = PhysicalCondition
        fields = ['condition_id', 'condition_code', 'condition_label', 'condition_label_ar', 'condition_label_en', 'description']

    def _get_translated_label(self, obj, lang_code):
        try:
            from .translations import PhysicalConditionTranslation
            translation = PhysicalConditionTranslation.objects.get(
                physical_condition=obj, language_code=lang_code
            )
            return translation.condition_label or None
        except Exception:
            return None

    def get_condition_label_ar(self, obj):
        return self._get_translated_label(obj, 'ar')

    def get_condition_label_en(self, obj):
        return self._get_translated_label(obj, 'en')


class LoginSerializer(serializers.Serializer):
    """Serializer for login request"""
    username = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=128, write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with roles"""
    person = PersonSerializer(read_only=True)
    is_superuser = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['user_id', 'username', 'person', 'is_superuser', 'roles', 'last_login', 'is_approved']

    def get_is_superuser(self, obj):
        return obj.is_superuser()

    def get_roles(self, obj):
        role_mappings = obj.get_roles()
        return [RoleSerializer(rm.role).data for rm in role_mappings]


class AssetTypeSerializer(serializers.ModelSerializer):
    """Serializer for AssetType model"""
    asset_type_label_ar = serializers.SerializerMethodField()
    asset_type_label_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = AssetType
        fields = ['asset_type_id', 'asset_type_label', 'asset_type_code', 'asset_type_label_ar', 'asset_type_label_en', 'translations']
        read_only_fields = ['asset_type_id']

    def _get_translated_label(self, obj, lang_code):
        try:
            translation = AssetTypeTranslation.objects.get(asset_type=obj, language_code=lang_code)
            return translation.asset_type_label
        except AssetTypeTranslation.DoesNotExist:
            return None

    def get_asset_type_label_ar(self, obj):
        return self._get_translated_label(obj, 'ar')

    def get_asset_type_label_en(self, obj):
        return self._get_translated_label(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class AssetBrandSerializer(serializers.ModelSerializer):
    """Serializer for AssetBrand model"""
    brand_name_ar = serializers.SerializerMethodField()
    brand_name_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = AssetBrand
        fields = ['asset_brand_id', 'brand_name', 'brand_code', 'is_active', 'brand_name_ar', 'brand_name_en', 'translations']
        read_only_fields = ['asset_brand_id']

    def _get_translated_name(self, obj, lang_code):
        try:
            translation = AssetBrandTranslation.objects.get(asset_brand=obj, language_code=lang_code)
            return translation.brand_name
        except AssetBrandTranslation.DoesNotExist:
            return None

    def get_brand_name_ar(self, obj):
        return self._get_translated_name(obj, 'ar')

    def get_brand_name_en(self, obj):
        return self._get_translated_name(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class AssetModelSerializer(serializers.ModelSerializer):
    """Serializer for AssetModel model"""
    brand_name = serializers.CharField(source='asset_brand.brand_name', read_only=True)
    asset_type_label = serializers.CharField(source='asset_type.asset_type_label', read_only=True)
    model_name_ar = serializers.SerializerMethodField()
    model_name_en = serializers.SerializerMethodField()
    notes_ar = serializers.SerializerMethodField()
    notes_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = AssetModel
        fields = [
            'asset_model_id', 'asset_brand', 'brand_name', 'asset_type', 'asset_type_label',
            'model_name', 'model_code', 'release_year', 'discontinued_year',
            'is_active', 'notes', 'warranty_expiry_in_months',
            'model_name_ar', 'model_name_en', 'notes_ar', 'notes_en', 'translations'
        ]
        read_only_fields = ['asset_model_id']

    def _get_translation_field(self, obj, lang_code, field_name):
        try:
            translation = AssetModelTranslation.objects.get(asset_model=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except AssetModelTranslation.DoesNotExist:
            return None

    def get_model_name_ar(self, obj):
        return self._get_translation_field(obj, 'ar', 'model_name')

    def get_model_name_en(self, obj):
        return self._get_translation_field(obj, 'en', 'model_name')

    def get_notes_ar(self, obj):
        return self._get_translation_field(obj, 'ar', 'notes')

    def get_notes_en(self, obj):
        return self._get_translation_field(obj, 'en', 'notes')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class StockItemTypeSerializer(serializers.ModelSerializer):
    """Serializer for StockItemType model"""
    stock_item_type_label_ar = serializers.SerializerMethodField()
    stock_item_type_label_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = StockItemType
        fields = ['stock_item_type_id', 'stock_item_type_label', 'stock_item_type_code', 'stock_item_type_label_ar', 'stock_item_type_label_en', 'translations']
        read_only_fields = ['stock_item_type_id']

    def _get_translated_label(self, obj, lang_code):
        try:
            translation = StockItemTypeTranslation.objects.get(stock_item_type=obj, language_code=lang_code)
            return translation.stock_item_type_label
        except StockItemTypeTranslation.DoesNotExist:
            return None

    def get_stock_item_type_label_ar(self, obj):
        return self._get_translated_label(obj, 'ar')

    def get_stock_item_type_label_en(self, obj):
        return self._get_translated_label(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class StockItemBrandSerializer(serializers.ModelSerializer):
    """Serializer for StockItemBrand model"""
    brand_name_ar = serializers.SerializerMethodField()
    brand_name_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = StockItemBrand
        fields = ['stock_item_brand_id', 'brand_name', 'brand_code', 'is_active', 'brand_name_ar', 'brand_name_en', 'translations']
        read_only_fields = ['stock_item_brand_id']

    def _get_translated_name(self, obj, lang_code):
        try:
            translation = StockItemBrandTranslation.objects.get(stock_item_brand=obj, language_code=lang_code)
            return translation.brand_name
        except StockItemBrandTranslation.DoesNotExist:
            return None

    def get_brand_name_ar(self, obj):
        return self._get_translated_name(obj, 'ar')

    def get_brand_name_en(self, obj):
        return self._get_translated_name(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class StockItemModelSerializer(serializers.ModelSerializer):
    """Serializer for StockItemModel model"""
    brand_name = serializers.CharField(source='stock_item_brand.brand_name', read_only=True)
    stock_item_type_label = serializers.CharField(source='stock_item_type.stock_item_type_label', read_only=True)
    model_name_ar = serializers.SerializerMethodField()
    model_name_en = serializers.SerializerMethodField()
    notes_ar = serializers.SerializerMethodField()
    notes_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = StockItemModel
        fields = [
            'stock_item_model_id', 'stock_item_brand', 'brand_name', 'stock_item_type', 'stock_item_type_label',
            'model_name', 'model_code', 'release_year', 'discontinued_year',
            'is_active', 'notes', 'warranty_expiry_in_months',
            'model_name_ar', 'model_name_en', 'notes_ar', 'notes_en', 'translations'
        ]
        read_only_fields = ['stock_item_model_id']

    def _get_translation_field(self, obj, lang_code, field_name):
        try:
            translation = StockItemModelTranslation.objects.get(stock_item_model=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except StockItemModelTranslation.DoesNotExist:
            return None

    def get_model_name_ar(self, obj):
        return self._get_translation_field(obj, 'ar', 'model_name')

    def get_model_name_en(self, obj):
        return self._get_translation_field(obj, 'en', 'model_name')

    def get_notes_ar(self, obj):
        return self._get_translation_field(obj, 'ar', 'notes')

    def get_notes_en(self, obj):
        return self._get_translation_field(obj, 'en', 'notes')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class ConsumableTypeSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableType model"""
    consumable_type_label_ar = serializers.SerializerMethodField()
    consumable_type_label_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = ConsumableType
        fields = ['consumable_type_id', 'consumable_type_label', 'consumable_type_code', 'consumable_type_label_ar', 'consumable_type_label_en', 'translations']
        read_only_fields = ['consumable_type_id']

    def _get_translated_label(self, obj, lang_code):
        try:
            translation = ConsumableTypeTranslation.objects.get(consumable_type=obj, language_code=lang_code)
            return translation.consumable_type_label
        except ConsumableTypeTranslation.DoesNotExist:
            return None

    def get_consumable_type_label_ar(self, obj):
        return self._get_translated_label(obj, 'ar')

    def get_consumable_type_label_en(self, obj):
        return self._get_translated_label(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class ConsumableBrandSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableBrand model"""
    brand_name_ar = serializers.SerializerMethodField()
    brand_name_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = ConsumableBrand
        fields = ['consumable_brand_id', 'brand_name', 'brand_code', 'is_active', 'brand_name_ar', 'brand_name_en', 'translations']
        read_only_fields = ['consumable_brand_id']

    def _get_translated_name(self, obj, lang_code):
        try:
            translation = ConsumableBrandTranslation.objects.get(consumable_brand=obj, language_code=lang_code)
            return translation.brand_name
        except ConsumableBrandTranslation.DoesNotExist:
            return None

    def get_brand_name_ar(self, obj):
        return self._get_translated_name(obj, 'ar')

    def get_brand_name_en(self, obj):
        return self._get_translated_name(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class ConsumableModelSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableModel model"""
    brand_name = serializers.CharField(source='consumable_brand.brand_name', read_only=True)
    consumable_type_label = serializers.CharField(source='consumable_type.consumable_type_label', read_only=True)
    model_name_ar = serializers.SerializerMethodField()
    model_name_en = serializers.SerializerMethodField()
    notes_ar = serializers.SerializerMethodField()
    notes_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = ConsumableModel
        fields = [
            'consumable_model_id', 'consumable_brand', 'brand_name', 'consumable_type', 'consumable_type_label',
            'model_name', 'model_code', 'release_year', 'discontinued_year',
            'is_active', 'notes', 'warranty_expiry_in_months',
            'model_name_ar', 'model_name_en', 'notes_ar', 'notes_en', 'translations'
        ]
        read_only_fields = ['consumable_model_id']

    def _get_translation_field(self, obj, lang_code, field_name):
        try:
            translation = ConsumableModelTranslation.objects.get(consumable_model=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except ConsumableModelTranslation.DoesNotExist:
            return None

    def get_model_name_ar(self, obj):
        return self._get_translation_field(obj, 'ar', 'model_name')

    def get_model_name_en(self, obj):
        return self._get_translation_field(obj, 'en', 'model_name')

    def get_notes_ar(self, obj):
        return self._get_translation_field(obj, 'ar', 'notes')

    def get_notes_en(self, obj):
        return self._get_translation_field(obj, 'en', 'notes')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class AssetModelDefaultStockItemSerializer(serializers.ModelSerializer):
    """Serializer for AssetModelDefaultStockItem model"""
    stock_item_model_name = serializers.CharField(source='stock_item_model.model_name', read_only=True)
    asset_model_name = serializers.CharField(source='asset_model.model_name', read_only=True)
    
    class Meta:
        model = AssetModelDefaultStockItem
        fields = ['id', 'asset_model', 'asset_model_name', 'stock_item_model', 'stock_item_model_name', 'quantity', 'notes']
        read_only_fields = ['id']


class AssetModelDefaultConsumableSerializer(serializers.ModelSerializer):
    """Serializer for AssetModelDefaultConsumable model"""
    consumable_model_name = serializers.CharField(source='consumable_model.model_name', read_only=True)
    asset_model_name = serializers.CharField(source='asset_model.model_name', read_only=True)
    
    class Meta:
        model = AssetModelDefaultConsumable
        fields = ['id', 'asset_model', 'asset_model_name', 'consumable_model', 'consumable_model_name', 'quantity', 'notes']
        read_only_fields = ['id']


class LocationTypeSerializer(serializers.ModelSerializer):
    """Serializer for LocationType model"""
    location_type_label_ar = serializers.SerializerMethodField()
    location_type_label_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = LocationType
        fields = ['location_type_id', 'location_type_label', 'location_type_code', 'location_type_label_ar', 'location_type_label_en', 'translations']
        read_only_fields = ['location_type_id']

    def _get_translated_label(self, obj, lang_code):
        try:
            translation = LocationTypeTranslation.objects.get(location_type=obj, language_code=lang_code)
            return translation.location_type_label
        except LocationTypeTranslation.DoesNotExist:
            return None

    def get_location_type_label_ar(self, obj):
        return self._get_translated_label(obj, 'ar')

    def get_location_type_label_en(self, obj):
        return self._get_translated_label(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location model"""
    location_type_label = serializers.CharField(source='location_type.location_type_label', read_only=True)
    location_type_code = serializers.CharField(source='location_type.location_type_code', read_only=True)
    location_type_label_ar = serializers.SerializerMethodField()
    location_type_label_en = serializers.SerializerMethodField()
    location_name_ar = serializers.SerializerMethodField()
    location_name_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Location
        fields = ['location_id', 'location_name', 'location_type', 'location_type_label', 'location_type_code', 'location_type_label_ar', 'location_type_label_en', 'location_name_ar', 'location_name_en', 'translations']
        read_only_fields = ['location_id']

    def _get_translated_name(self, obj, lang_code):
        try:
            translation = LocationTranslation.objects.get(location=obj, language_code=lang_code)
            return translation.location_name
        except LocationTranslation.DoesNotExist:
            return None

    def get_location_name_ar(self, obj):
        return self._get_translated_name(obj, 'ar')

    def get_location_name_en(self, obj):
        return self._get_translated_name(obj, 'en')

    def _get_translated_type_label(self, obj, lang_code):
        try:
            location_type = obj.location_type
            if not location_type:
                return None
            translation = LocationTypeTranslation.objects.get(location_type=location_type, language_code=lang_code)
            return translation.location_type_label
        except LocationTypeTranslation.DoesNotExist:
            return None

    def get_location_type_label_ar(self, obj):
        return self._get_translated_type_label(obj, 'ar')

    def get_location_type_label_en(self, obj):
        return self._get_translated_type_label(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class LocationRelationSerializer(serializers.ModelSerializer):
    """Serializer for LocationRelation model"""
    child_location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    parent_location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    child_location_name = serializers.CharField(source='child_location.location_name', read_only=True)
    parent_location_name = serializers.CharField(source='parent_location.location_name', read_only=True)
    child_location_name_ar = serializers.SerializerMethodField()
    child_location_name_en = serializers.SerializerMethodField()
    parent_location_name_ar = serializers.SerializerMethodField()
    parent_location_name_en = serializers.SerializerMethodField()

    def _get_translated_name(self, location, lang_code):
        try:
            translation = LocationTranslation.objects.get(location=location, language_code=lang_code)
            return translation.location_name
        except LocationTranslation.DoesNotExist:
            return None

    def get_child_location_name_ar(self, obj):
        return self._get_translated_name(obj.child_location, 'ar')

    def get_child_location_name_en(self, obj):
        return self._get_translated_name(obj.child_location, 'en')

    def get_parent_location_name_ar(self, obj):
        return self._get_translated_name(obj.parent_location, 'ar')

    def get_parent_location_name_en(self, obj):
        return self._get_translated_name(obj.parent_location, 'en')

    class Meta:
        model = LocationRelation
        fields = [
            'child_location', 'parent_location', 'relation_id',
            'child_location_name', 'parent_location_name',
            'child_location_name_ar', 'child_location_name_en',
            'parent_location_name_ar', 'parent_location_name_en'
        ]


class MaintenanceStepItemRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceStepItemRequest
        fields = [
            'maintenance_step_item_request_id',
            'maintenance_step',
            'requested_by_person',
            'fulfilled_by_person',
            'rejected_by_person',
            'request_type',
            'status',
            'created_at',
            'fulfilled_at',
            'rejected_at',
            'requested_stock_item_model',
            'requested_consumable_model',
            'stock_item',
            'consumable',
            'source_location',
            'destination_location',
            'note',
        ]


class PositionSerializer(serializers.ModelSerializer):
    """Serializer for Position model"""
    position_label_ar = serializers.SerializerMethodField()
    position_label_en = serializers.SerializerMethodField()
    description_ar = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Position
        fields = ['position_id', 'position_code', 'position_label', 'description', 'position_label_ar', 'position_label_en', 'description_ar', 'description_en', 'translations']
        read_only_fields = ['position_id']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = PositionTranslation.objects.get(position=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except PositionTranslation.DoesNotExist:
            return None

    def get_position_label_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'position_label')

    def get_position_label_en(self, obj):
        return self._get_translated_field(obj, 'en', 'position_label')

    def get_description_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'description')

    def get_description_en(self, obj):
        return self._get_translated_field(obj, 'en', 'description')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class PositionRoleMappingSerializer(serializers.ModelSerializer):
    """Serializer for PositionRoleMapping model"""
    position = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all())
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    position_label = serializers.CharField(source='position.position_label', read_only=True)
    position_code = serializers.CharField(source='position.position_code', read_only=True)
    role_code = serializers.CharField(source='role.role_code', read_only=True)
    role_label = serializers.CharField(source='role.role_label', read_only=True)
    position_label_ar = serializers.SerializerMethodField()
    position_label_en = serializers.SerializerMethodField()
    role_label_ar = serializers.SerializerMethodField()
    role_label_en = serializers.SerializerMethodField()

    class Meta:
        model = PositionRoleMapping
        fields = ['position', 'position_label', 'position_code', 'position_label_ar', 'position_label_en', 'role', 'role_code', 'role_label', 'role_label_ar', 'role_label_en', 'created_at']
        read_only_fields = ['created_at']

    def _get_position_translated_field(self, obj, lang_code, field_name):
        try:
            translation = PositionTranslation.objects.get(position=obj.position, language_code=lang_code)
            return getattr(translation, field_name, None)
        except PositionTranslation.DoesNotExist:
            return None

    def _get_role_translated_field(self, obj, lang_code, field_name):
        try:
            translation = RoleTranslation.objects.get(role=obj.role, language_code=lang_code)
            return getattr(translation, field_name, None)
        except RoleTranslation.DoesNotExist:
            return None

    def get_position_label_ar(self, obj):
        return self._get_position_translated_field(obj, 'ar', 'position_label')

    def get_position_label_en(self, obj):
        return self._get_position_translated_field(obj, 'en', 'position_label')

    def get_role_label_ar(self, obj):
        return self._get_role_translated_field(obj, 'ar', 'role_label')

    def get_role_label_en(self, obj):
        return self._get_role_translated_field(obj, 'en', 'role_label')

    def create(self, validated_data):
        instance = PositionRoleMapping()
        position = validated_data.get('position')
        role = validated_data.get('role')
        instance.position_id = position.pk if hasattr(position, 'pk') else position
        instance.role_id = role.pk if hasattr(role, 'pk') else role
        instance.created_at = timezone.now()
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.save()
        return instance


class OrganizationalStructureTypeSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationalStructureType model"""
    organizational_structure_type_ar = serializers.SerializerMethodField()
    organizational_structure_type_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = OrganizationalStructureType
        fields = ['organizational_structure_type_id', 'organizational_structure_type', 'organizational_structure_type_ar', 'organizational_structure_type_en', 'translations']
        read_only_fields = ['organizational_structure_type_id']

    def _get_translated_type(self, obj, lang_code):
        try:
            translation = OrganizationalStructureTypeTranslation.objects.get(organizational_structure_type=obj, language_code=lang_code)
            return translation.organizational_structure_type_label
        except OrganizationalStructureTypeTranslation.DoesNotExist:
            return None

    def get_organizational_structure_type_ar(self, obj):
        return self._get_translated_type(obj, 'ar')

    def get_organizational_structure_type_en(self, obj):
        return self._get_translated_type(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class OrganizationalStructureSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationalStructure model"""
    structure_type_label = serializers.CharField(source='structure_type.organizational_structure_type', read_only=True)
    structure_type_label_ar = serializers.SerializerMethodField()
    structure_type_label_en = serializers.SerializerMethodField()
    structure_name_ar = serializers.SerializerMethodField()
    structure_name_en = serializers.SerializerMethodField()
    structure_type_id = serializers.PrimaryKeyRelatedField(
        queryset=OrganizationalStructureType.objects.all(),
        source='structure_type',
        required=False,
        allow_null=True
    )
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = OrganizationalStructure
        fields = ['organizational_structure_id', 'structure_code', 'structure_name', 'structure_type_id', 'structure_type_label', 'structure_type_label_ar', 'structure_type_label_en', 'structure_name_ar', 'structure_name_en', 'is_active', 'translations']
        read_only_fields = ['organizational_structure_id']

    def _get_translated_name(self, obj, lang_code):
        try:
            translation = OrganizationalStructureTranslation.objects.get(organizational_structure=obj, language_code=lang_code)
            return translation.structure_name
        except OrganizationalStructureTranslation.DoesNotExist:
            return None

    def get_structure_name_ar(self, obj):
        return self._get_translated_name(obj, 'ar')

    def get_structure_name_en(self, obj):
        return self._get_translated_name(obj, 'en')

    def _get_translated_type_label(self, obj, lang_code):
        try:
            structure_type = obj.structure_type
            if not structure_type:
                return None
            translation = OrganizationalStructureTypeTranslation.objects.get(organizational_structure_type=structure_type, language_code=lang_code)
            return translation.organizational_structure_type_label
        except OrganizationalStructureTypeTranslation.DoesNotExist:
            return None

    def get_structure_type_label_ar(self, obj):
        return self._get_translated_type_label(obj, 'ar')

    def get_structure_type_label_en(self, obj):
        return self._get_translated_type_label(obj, 'en')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class OrganizationalStructureRelationSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationalStructureRelation model"""
    # Use explicit fields to ensure we handle the primary_key=True case correctly
    child_organizational_structure = serializers.PrimaryKeyRelatedField(queryset=OrganizationalStructure.objects.all())
    parent_organizational_structure = serializers.PrimaryKeyRelatedField(queryset=OrganizationalStructure.objects.all())
    
    # Include nested data for better readability
    organizational_structure_name = serializers.CharField(source='child_organizational_structure.structure_name', read_only=True)
    parent_organizational_structure_name = serializers.CharField(source='parent_organizational_structure.structure_name', read_only=True)
    child_organizational_structure_name_ar = serializers.SerializerMethodField()
    child_organizational_structure_name_en = serializers.SerializerMethodField()
    parent_organizational_structure_name_ar = serializers.SerializerMethodField()
    parent_organizational_structure_name_en = serializers.SerializerMethodField()
    
    class Meta:
        model = OrganizationalStructureRelation
        fields = ['child_organizational_structure', 'parent_organizational_structure', 'organizational_structure_name', 
                  'parent_organizational_structure_name', 'child_organizational_structure_name_ar',
                  'child_organizational_structure_name_en', 'parent_organizational_structure_name_ar',
                  'parent_organizational_structure_name_en', 'relation_id']

    def _get_translated_name(self, structure, lang_code):
        try:
            translation = OrganizationalStructureTranslation.objects.get(organizational_structure=structure, language_code=lang_code)
            return translation.structure_name
        except OrganizationalStructureTranslation.DoesNotExist:
            return None

    def get_child_organizational_structure_name_ar(self, obj):
        return self._get_translated_name(obj.child_organizational_structure, 'ar')

    def get_child_organizational_structure_name_en(self, obj):
        return self._get_translated_name(obj.child_organizational_structure, 'en')

    def get_parent_organizational_structure_name_ar(self, obj):
        return self._get_translated_name(obj.parent_organizational_structure, 'ar')

    def get_parent_organizational_structure_name_en(self, obj):
        return self._get_translated_name(obj.parent_organizational_structure, 'en')

    def create(self, validated_data):
        # Handle the assignment using _id suffixes to avoid instance checks on ForeignKey PKs
        instance = OrganizationalStructureRelation()
        org = validated_data.get('child_organizational_structure')
        parent = validated_data.get('parent_organizational_structure')

        # Use .pk if it's an object, otherwise use the value itself
        instance.child_organizational_structure_id = org.pk if hasattr(org, 'pk') else org
        instance.parent_organizational_structure_id = parent.pk if hasattr(parent, 'pk') else parent

        # Auto-generate relation_id if not provided
        relation_id = validated_data.get('relation_id')
        if relation_id is None:
            from django.db.models import Max
            max_id = OrganizationalStructureRelation.objects.aggregate(Max('relation_id'))['relation_id__max']
            relation_id = (max_id or 0) + 1
        instance.relation_id = relation_id

        # Must use force_insert=True since we are providing the manual PK
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        # Update fields that are not the primary key
        instance.relation_id = validated_data.get('relation_id', instance.relation_id)
        # Note: If we wanted to update the primary key, we'd have to delete and recreate 
        # because Django doesn't handle changing PKs well.
        instance.save()
        return instance


class AssetSerializer(serializers.ModelSerializer):
    """Serializer for Asset model"""

    failed_external_maintenance_id = serializers.IntegerField(read_only=True, required=False)

    included_stock_items = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True, default=list
    )
    included_consumables = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True, default=list
    )

    stock_item_composition = serializers.SerializerMethodField()
    consumable_composition = serializers.SerializerMethodField()

    asset_name_ar = serializers.SerializerMethodField()
    asset_name_en = serializers.SerializerMethodField()
    asset_status_ar = serializers.SerializerMethodField()
    asset_status_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Asset
        fields = [
            'asset_id', 'asset_model', 'attribution_order', 'asset_serial_number',
            'asset_inventory_number', 'asset_name', 'asset_status', 'asset_service_tag', 'destruction_certificate_id',
            'failed_external_maintenance_id',
            'included_stock_items', 'included_consumables',
            'stock_item_composition', 'consumable_composition',
            'asset_name_ar', 'asset_name_en', 'asset_status_ar', 'asset_status_en', 'translations'
        ]
        read_only_fields = ['asset_id']

    def get_stock_item_composition(self, obj):
        items = getattr(obj, '_current_stock_items', None)
        if items is None:
            from .models import AssetIsComposedOfStockItemHistory
            items = AssetIsComposedOfStockItemHistory.objects.filter(asset=obj, end_datetime__isnull=True).select_related('stock_item')
        result = []
        for item in items:
            si = item.stock_item
            si_status_ar = None
            si_status_en = None
            try:
                t = StockItemTranslation.objects.get(stock_item=si, language_code='ar')
                si_status_ar = t.stock_item_status
            except Exception:
                pass
            try:
                t = StockItemTranslation.objects.get(stock_item=si, language_code='en')
                si_status_en = t.stock_item_status
            except Exception:
                pass
            result.append({
                'stock_item_id': si.stock_item_id,
                'stock_item_name': si.stock_item_name,
                'stock_item_status': si.stock_item_status,
                'stock_item_status_ar': si_status_ar,
                'stock_item_status_en': si_status_en,
            })
        return result

    def get_consumable_composition(self, obj):
        items = getattr(obj, '_current_consumables', None)
        if items is None:
            from .models import AssetIsComposedOfConsumableHistory
            items = AssetIsComposedOfConsumableHistory.objects.filter(asset=obj, end_datetime__isnull=True).select_related('consumable')
        result = []
        for item in items:
            c = item.consumable
            c_status_ar = None
            c_status_en = None
            try:
                t = ConsumableTranslation.objects.get(consumable=c, language_code='ar')
                c_status_ar = t.consumable_status
            except Exception:
                pass
            try:
                t = ConsumableTranslation.objects.get(consumable=c, language_code='en')
                c_status_en = t.consumable_status
            except Exception:
                pass
            result.append({
                'consumable_id': c.consumable_id,
                'consumable_name': c.consumable_name,
                'consumable_status': c.consumable_status,
                'consumable_status_ar': c_status_ar,
                'consumable_status_en': c_status_en,
            })
        return result

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = AssetTranslation.objects.get(asset=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except Exception:
            return None

    def get_asset_name_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'asset_name')

    def get_asset_name_en(self, obj):
        return self._get_translated_field(obj, 'en', 'asset_name')

    def get_asset_status_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'asset_status')

    def get_asset_status_en(self, obj):
        return self._get_translated_field(obj, 'en', 'asset_status')

    def create(self, validated_data):
        # Remove non-model fields before creating the Asset
        included_stock_items = validated_data.pop('included_stock_items', [])
        included_consumables = validated_data.pop('included_consumables', [])
        translations_data = validated_data.pop('translations', None)
        instance = Asset.objects.create(**validated_data)
        if translations_data:
            from api.utils.i18n import save_translations, translate_status
            # Ensure English version has name and status
            en_data = translations_data.get('en', {})
            if not en_data and instance.asset_name:
                en_data = {'asset_name': instance.asset_name}
                translations_data['en'] = en_data
            elif instance.asset_name and 'asset_name' not in en_data:
                en_data['asset_name'] = instance.asset_name
            if instance.asset_status and 'asset_status' not in en_data:
                en_data['asset_status'] = translate_status(instance.asset_status, 'en')
                translations_data['en'] = en_data
            # Ensure Arabic version also gets the status
            ar_data = translations_data.get('ar', {})
            if instance.asset_status and 'asset_status' not in ar_data:
                ar_data['asset_status'] = translate_status(instance.asset_status, 'ar')
                translations_data['ar'] = ar_data
            save_translations(instance, translations_data)
        elif instance.asset_name or instance.asset_status:
            # No translations provided, but save name and status in both en and ar translation rows
            from api.utils.i18n import save_translations, translate_status
            trans_data = {}
            if instance.asset_name or instance.asset_status:
                en_entry = {}
                if instance.asset_name:
                    en_entry['asset_name'] = instance.asset_name
                if instance.asset_status:
                    en_entry['asset_status'] = translate_status(instance.asset_status, 'en')
                trans_data['en'] = en_entry
            if instance.asset_name or instance.asset_status:
                ar_entry = {}
                if instance.asset_name:
                    ar_entry['asset_name'] = instance.asset_name
                if instance.asset_status:
                    ar_entry['asset_status'] = translate_status(instance.asset_status, 'ar')
                trans_data['ar'] = ar_entry
            save_translations(instance, trans_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        included_stock_items = validated_data.pop('included_stock_items', None)
        included_consumables = validated_data.pop('included_consumables', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations, translate_status
            # Ensure English version is also saved
            en_data = translations_data.get('en', {})
            if instance.asset_name and 'asset_name' not in en_data:
                en_data['asset_name'] = instance.asset_name
            if instance.asset_status and 'asset_status' not in en_data:
                en_data['asset_status'] = translate_status(instance.asset_status, 'en')
                translations_data['en'] = en_data
            # Ensure Arabic version also gets the status
            ar_data = translations_data.get('ar', {})
            if instance.asset_status and 'asset_status' not in ar_data:
                ar_data['asset_status'] = translate_status(instance.asset_status, 'ar')
                translations_data['ar'] = ar_data
            save_translations(instance, translations_data)
        elif instance.asset_name or instance.asset_status:
            from api.utils.i18n import save_translations, translate_status
            en_entry = {}
            if instance.asset_name:
                en_entry['asset_name'] = instance.asset_name
            if instance.asset_status:
                en_entry['asset_status'] = translate_status(instance.asset_status, 'en')
            ar_entry = {}
            if instance.asset_name:
                ar_entry['asset_name'] = instance.asset_name
            if instance.asset_status:
                ar_entry['asset_status'] = translate_status(instance.asset_status, 'ar')
            save_translations(instance, {'en': en_entry, 'ar': ar_entry})
        return instance


class AssetAttributeDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for AssetAttributeDefinition model"""
    description_ar = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()
    unit_ar = serializers.SerializerMethodField()
    unit_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = AssetAttributeDefinition
        fields = ['asset_attribute_definition_id', 'data_type', 'unit', 'description', 'description_ar', 'description_en', 'unit_ar', 'unit_en', 'translations']
        read_only_fields = ['asset_attribute_definition_id']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = AssetAttributeDefinitionTranslation.objects.get(asset_attribute_definition=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except AssetAttributeDefinitionTranslation.DoesNotExist:
            return None

    def get_description_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'description')

    def get_description_en(self, obj):
        return self._get_translated_field(obj, 'en', 'description')

    def get_unit_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'unit')

    def get_unit_en(self, obj):
        return self._get_translated_field(obj, 'en', 'unit')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class AssetTypeAttributeSerializer(serializers.ModelSerializer):
    """Serializer for AssetTypeAttribute model"""
    asset_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=AssetAttributeDefinition.objects.all())
    asset_type = serializers.PrimaryKeyRelatedField(queryset=AssetType.objects.all())
    definition = AssetAttributeDefinitionSerializer(source='asset_attribute_definition', read_only=True)

    class Meta:
        model = AssetTypeAttribute
        fields = ['asset_attribute_definition', 'asset_type', 'is_mandatory', 'default_value', 'definition']

    def create(self, validated_data):
        instance = AssetTypeAttribute()
        definition = validated_data.get('asset_attribute_definition')
        asset_type = validated_data.get('asset_type')
        instance.asset_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.asset_type_id = asset_type.pk if hasattr(asset_type, 'pk') else asset_type
        instance.is_mandatory = validated_data.get('is_mandatory')
        instance.default_value = validated_data.get('default_value')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.is_mandatory = validated_data.get('is_mandatory', instance.is_mandatory)
        instance.default_value = validated_data.get('default_value', instance.default_value)
        instance.save()
        return instance


class AssetModelAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for AssetModelAttributeValue model"""
    asset_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=AssetAttributeDefinition.objects.all())
    asset_model = serializers.PrimaryKeyRelatedField(queryset=AssetModel.objects.all())
    definition = AssetAttributeDefinitionSerializer(source='asset_attribute_definition', read_only=True)

    class Meta:
        model = AssetModelAttributeValue
        fields = [
            'asset_model', 'asset_attribute_definition', 'definition',
            'value_bool', 'value_string', 'value_number', 'value_date'
        ]

    def create(self, validated_data):
        instance = AssetModelAttributeValue()
        definition = validated_data.get('asset_attribute_definition')
        asset_model = validated_data.get('asset_model')
        instance.asset_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.asset_model_id = asset_model.pk if hasattr(asset_model, 'pk') else asset_model
        instance.value_bool = validated_data.get('value_bool')
        instance.value_string = validated_data.get('value_string')
        instance.value_number = validated_data.get('value_number')
        instance.value_date = validated_data.get('value_date')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.value_bool = validated_data.get('value_bool', instance.value_bool)
        instance.value_string = validated_data.get('value_string', instance.value_string)
        instance.value_number = validated_data.get('value_number', instance.value_number)
        instance.value_date = validated_data.get('value_date', instance.value_date)
        instance.save()
        return instance


class AssetAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for AssetAttributeValue model"""
    asset_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=AssetAttributeDefinition.objects.all())
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())
    definition = AssetAttributeDefinitionSerializer(source='asset_attribute_definition', read_only=True)

    class Meta:
        model = AssetAttributeValue
        fields = [
            'asset', 'asset_attribute_definition', 'definition',
            'value_bool', 'value_string', 'value_number', 'value_date'
        ]

    def create(self, validated_data):
        instance = AssetAttributeValue()
        definition = validated_data.get('asset_attribute_definition')
        asset = validated_data.get('asset')
        instance.asset_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.asset_id = asset.pk if hasattr(asset, 'pk') else asset
        instance.value_bool = validated_data.get('value_bool')
        instance.value_string = validated_data.get('value_string')
        instance.value_number = validated_data.get('value_number')
        instance.value_date = validated_data.get('value_date')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.value_bool = validated_data.get('value_bool', instance.value_bool)
        instance.value_string = validated_data.get('value_string', instance.value_string)
        instance.value_number = validated_data.get('value_number', instance.value_number)
        instance.value_date = validated_data.get('value_date', instance.value_date)
        instance.save()
        return instance


class AssetIsAssignedToPersonSerializer(serializers.ModelSerializer):
    """Serializer for AssetIsAssignedToPerson model"""
    
    class Meta:
        model = AssetIsAssignedToPerson
        fields = ['assignment_id', 'person', 'asset', 'assigned_by_person', 'start_datetime', 'end_datetime', 'condition_on_assignment', 'is_active', 'is_confirmed_by_exploitation_chief']
        read_only_fields = ['assignment_id', 'assigned_by_person', 'end_datetime']
        extra_kwargs = {
            'is_active': {'required': False},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Nest the asset details in the response
        if instance.asset:
            representation['asset'] = AssetSerializer(instance.asset).data
        return representation


class StockItemAttributeDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for StockItemAttributeDefinition model"""
    description_ar = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()
    unit_ar = serializers.SerializerMethodField()
    unit_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = StockItemAttributeDefinition
        fields = ['stock_item_attribute_definition_id', 'data_type', 'unit', 'description', 'description_ar', 'description_en', 'unit_ar', 'unit_en', 'translations']
        read_only_fields = ['stock_item_attribute_definition_id']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = StockItemAttributeDefinitionTranslation.objects.get(stock_item_attribute_definition=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except StockItemAttributeDefinitionTranslation.DoesNotExist:
            return None

    def get_description_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'description')

    def get_description_en(self, obj):
        return self._get_translated_field(obj, 'en', 'description')

    def get_unit_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'unit')

    def get_unit_en(self, obj):
        return self._get_translated_field(obj, 'en', 'unit')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class StockItemTypeAttributeSerializer(serializers.ModelSerializer):
    """Serializer for StockItemTypeAttribute model"""
    stock_item_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=StockItemAttributeDefinition.objects.all())
    stock_item_type = serializers.PrimaryKeyRelatedField(queryset=StockItemType.objects.all())
    definition = StockItemAttributeDefinitionSerializer(source='stock_item_attribute_definition', read_only=True)

    class Meta:
        model = StockItemTypeAttribute
        fields = ['stock_item_attribute_definition', 'stock_item_type', 'is_mandatory', 'default_value', 'definition']

    def create(self, validated_data):
        instance = StockItemTypeAttribute()
        definition = validated_data.get('stock_item_attribute_definition')
        stock_item_type = validated_data.get('stock_item_type')
        instance.stock_item_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.stock_item_type_id = stock_item_type.pk if hasattr(stock_item_type, 'pk') else stock_item_type
        instance.is_mandatory = validated_data.get('is_mandatory')
        instance.default_value = validated_data.get('default_value')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.is_mandatory = validated_data.get('is_mandatory', instance.is_mandatory)
        instance.default_value = validated_data.get('default_value', instance.default_value)
        instance.save()
        return instance


class StockItemModelAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for StockItemModelAttributeValue model"""
    stock_item_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=StockItemAttributeDefinition.objects.all())
    stock_item_model = serializers.PrimaryKeyRelatedField(queryset=StockItemModel.objects.all())
    definition = StockItemAttributeDefinitionSerializer(source='stock_item_attribute_definition', read_only=True)

    class Meta:
        model = StockItemModelAttributeValue
        fields = [
            'stock_item_model', 'stock_item_attribute_definition', 'definition',
            'value_bool', 'value_string', 'value_number', 'value_date'
        ]

    def create(self, validated_data):
        instance = StockItemModelAttributeValue()
        definition = validated_data.get('stock_item_attribute_definition')
        stock_item_model = validated_data.get('stock_item_model')
        instance.stock_item_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.stock_item_model_id = stock_item_model.pk if hasattr(stock_item_model, 'pk') else stock_item_model
        instance.value_bool = validated_data.get('value_bool')
        instance.value_string = validated_data.get('value_string')
        instance.value_number = validated_data.get('value_number')
        instance.value_date = validated_data.get('value_date')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.value_bool = validated_data.get('value_bool', instance.value_bool)
        instance.value_string = validated_data.get('value_string', instance.value_string)
        instance.value_number = validated_data.get('value_number', instance.value_number)
        instance.value_date = validated_data.get('value_date', instance.value_date)
        instance.save()
        return instance


class StockItemAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for StockItemAttributeValue model"""
    stock_item_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=StockItemAttributeDefinition.objects.all())
    stock_item = serializers.PrimaryKeyRelatedField(queryset=StockItem.objects.all())
    definition = StockItemAttributeDefinitionSerializer(source='stock_item_attribute_definition', read_only=True)

    class Meta:
        model = StockItemAttributeValue
        fields = [
            'stock_item', 'stock_item_attribute_definition', 'definition',
            'value_bool', 'value_string', 'value_number', 'value_date'
        ]

    def create(self, validated_data):
        instance = StockItemAttributeValue()
        definition = validated_data.get('stock_item_attribute_definition')
        stock_item = validated_data.get('stock_item')
        instance.stock_item_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.stock_item_id = stock_item.pk if hasattr(stock_item, 'pk') else stock_item
        instance.value_bool = validated_data.get('value_bool')
        instance.value_string = validated_data.get('value_string')
        instance.value_number = validated_data.get('value_number')
        instance.value_date = validated_data.get('value_date')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.value_bool = validated_data.get('value_bool', instance.value_bool)
        instance.value_string = validated_data.get('value_string', instance.value_string)
        instance.value_number = validated_data.get('value_number', instance.value_number)
        instance.value_date = validated_data.get('value_date', instance.value_date)
        instance.save()
        return instance


class ConsumableAttributeDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableAttributeDefinition model"""
    description_ar = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()
    unit_ar = serializers.SerializerMethodField()
    unit_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = ConsumableAttributeDefinition
        fields = ['consumable_attribute_definition_id', 'data_type', 'unit', 'description', 'description_ar', 'description_en', 'unit_ar', 'unit_en', 'translations']
        read_only_fields = ['consumable_attribute_definition_id']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = ConsumableAttributeDefinitionTranslation.objects.get(consumable_attribute_definition=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except ConsumableAttributeDefinitionTranslation.DoesNotExist:
            return None

    def get_description_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'description')

    def get_description_en(self, obj):
        return self._get_translated_field(obj, 'en', 'description')

    def get_unit_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'unit')

    def get_unit_en(self, obj):
        return self._get_translated_field(obj, 'en', 'unit')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class ConsumableTypeAttributeSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableTypeAttribute model"""
    consumable_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=ConsumableAttributeDefinition.objects.all())
    consumable_type = serializers.PrimaryKeyRelatedField(queryset=ConsumableType.objects.all())
    definition = ConsumableAttributeDefinitionSerializer(source='consumable_attribute_definition', read_only=True)

    class Meta:
        model = ConsumableTypeAttribute
        fields = ['consumable_attribute_definition', 'consumable_type', 'is_mandatory', 'default_value', 'definition']

    def create(self, validated_data):
        instance = ConsumableTypeAttribute()
        definition = validated_data.get('consumable_attribute_definition')
        consumable_type = validated_data.get('consumable_type')
        instance.consumable_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.consumable_type_id = consumable_type.pk if hasattr(consumable_type, 'pk') else consumable_type
        instance.is_mandatory = validated_data.get('is_mandatory')
        instance.default_value = validated_data.get('default_value')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.is_mandatory = validated_data.get('is_mandatory', instance.is_mandatory)
        instance.default_value = validated_data.get('default_value', instance.default_value)
        instance.save()
        return instance


class ConsumableModelAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableModelAttributeValue model"""
    consumable_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=ConsumableAttributeDefinition.objects.all())
    consumable_model = serializers.PrimaryKeyRelatedField(queryset=ConsumableModel.objects.all())
    definition = ConsumableAttributeDefinitionSerializer(source='consumable_attribute_definition', read_only=True)

    class Meta:
        model = ConsumableModelAttributeValue
        fields = [
            'consumable_model', 'consumable_attribute_definition', 'definition',
            'value_bool', 'value_string', 'value_number', 'value_date'
        ]

    def create(self, validated_data):
        instance = ConsumableModelAttributeValue()
        definition = validated_data.get('consumable_attribute_definition')
        consumable_model = validated_data.get('consumable_model')
        instance.consumable_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.consumable_model_id = consumable_model.pk if hasattr(consumable_model, 'pk') else consumable_model
        instance.value_bool = validated_data.get('value_bool')
        instance.value_string = validated_data.get('value_string')
        instance.value_number = validated_data.get('value_number')
        instance.value_date = validated_data.get('value_date')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.value_bool = validated_data.get('value_bool', instance.value_bool)
        instance.value_string = validated_data.get('value_string', instance.value_string)
        instance.value_number = validated_data.get('value_number', instance.value_number)
        instance.value_date = validated_data.get('value_date', instance.value_date)
        instance.save()
        return instance


class ConsumableAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableAttributeValue model"""
    consumable_attribute_definition = serializers.PrimaryKeyRelatedField(queryset=ConsumableAttributeDefinition.objects.all())
    consumable = serializers.PrimaryKeyRelatedField(queryset=Consumable.objects.all())
    definition = ConsumableAttributeDefinitionSerializer(source='consumable_attribute_definition', read_only=True)

    class Meta:
        model = ConsumableAttributeValue
        fields = [
            'consumable', 'consumable_attribute_definition', 'definition',
            'value_bool', 'value_string', 'value_number', 'value_date'
        ]

    def create(self, validated_data):
        instance = ConsumableAttributeValue()
        definition = validated_data.get('consumable_attribute_definition')
        consumable = validated_data.get('consumable')
        instance.consumable_attribute_definition_id = definition.pk if hasattr(definition, 'pk') else definition
        instance.consumable_id = consumable.pk if hasattr(consumable, 'pk') else consumable
        instance.value_bool = validated_data.get('value_bool')
        instance.value_string = validated_data.get('value_string')
        instance.value_number = validated_data.get('value_number')
        instance.value_date = validated_data.get('value_date')
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        instance.value_bool = validated_data.get('value_bool', instance.value_bool)
        instance.value_string = validated_data.get('value_string', instance.value_string)
        instance.value_number = validated_data.get('value_number', instance.value_number)
        instance.value_date = validated_data.get('value_date', instance.value_date)
        instance.save()
        return instance


class StockItemSerializer(serializers.ModelSerializer):
    """Serializer for StockItem model"""
    stock_item_name_ar = serializers.SerializerMethodField()
    stock_item_name_en = serializers.SerializerMethodField()
    stock_item_status_ar = serializers.SerializerMethodField()
    stock_item_status_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = StockItem
        fields = ['stock_item_id', 'stock_item_model', 'stock_item_inventory_number', 'stock_item_name', 'stock_item_status', 'stock_item_consumable_destruction_certificate_id', 'stock_item_name_in_administrative_certificate', 'stock_item_name_ar', 'stock_item_name_en', 'stock_item_status_ar', 'stock_item_status_en', 'translations']
        read_only_fields = ['stock_item_id']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = StockItemTranslation.objects.get(stock_item=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except Exception:
            return None

    def get_stock_item_name_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'stock_item_name')

    def get_stock_item_name_en(self, obj):
        return self._get_translated_field(obj, 'en', 'stock_item_name')

    def get_stock_item_status_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'stock_item_status')

    def get_stock_item_status_en(self, obj):
        return self._get_translated_field(obj, 'en', 'stock_item_status')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = StockItem.objects.create(**validated_data)
        if translations_data:
            from api.utils.i18n import save_translations, translate_status
            # Ensure English version has name and status
            en_data = translations_data.get('en', {})
            if not en_data and instance.stock_item_name:
                en_data = {'stock_item_name': instance.stock_item_name}
                translations_data['en'] = en_data
            elif instance.stock_item_name and 'stock_item_name' not in en_data:
                en_data['stock_item_name'] = instance.stock_item_name
            if instance.stock_item_status and 'stock_item_status' not in en_data:
                en_data['stock_item_status'] = translate_status(instance.stock_item_status, 'en')
                translations_data['en'] = en_data
            if instance.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in en_data:
                en_data['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                translations_data['en'] = en_data
            # Ensure Arabic version also gets the status
            ar_data = translations_data.get('ar', {})
            if instance.stock_item_status and 'stock_item_status' not in ar_data:
                ar_data['stock_item_status'] = translate_status(instance.stock_item_status, 'ar')
                translations_data['ar'] = ar_data
            if instance.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in ar_data:
                ar_data['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                translations_data['ar'] = ar_data
            save_translations(instance, translations_data)
        elif instance.stock_item_name or instance.stock_item_status or instance.stock_item_name_in_administrative_certificate:
            # No translations provided, but save name and status in both en and ar translation rows
            from api.utils.i18n import save_translations, translate_status
            en_entry = {}
            if instance.stock_item_name:
                en_entry['stock_item_name'] = instance.stock_item_name
            if instance.stock_item_status:
                en_entry['stock_item_status'] = translate_status(instance.stock_item_status, 'en')
            if instance.stock_item_name_in_administrative_certificate:
                en_entry['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
            ar_entry = {}
            if instance.stock_item_name:
                ar_entry['stock_item_name'] = instance.stock_item_name
            if instance.stock_item_status:
                ar_entry['stock_item_status'] = translate_status(instance.stock_item_status, 'ar')
            if instance.stock_item_name_in_administrative_certificate:
                ar_entry['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
            save_translations(instance, {'en': en_entry, 'ar': ar_entry})
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations, translate_status
            en_data = translations_data.get('en', {})
            if instance.stock_item_name and 'stock_item_name' not in en_data:
                en_data['stock_item_name'] = instance.stock_item_name
            if instance.stock_item_status and 'stock_item_status' not in en_data:
                en_data['stock_item_status'] = translate_status(instance.stock_item_status, 'en')
                translations_data['en'] = en_data
            if instance.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in en_data:
                en_data['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                translations_data['en'] = en_data
            # Ensure Arabic version also gets the status
            ar_data = translations_data.get('ar', {})
            if instance.stock_item_status and 'stock_item_status' not in ar_data:
                ar_data['stock_item_status'] = translate_status(instance.stock_item_status, 'ar')
                translations_data['ar'] = ar_data
            if instance.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in ar_data:
                ar_data['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                translations_data['ar'] = ar_data
            save_translations(instance, translations_data)
        elif instance.stock_item_name or instance.stock_item_status or instance.stock_item_name_in_administrative_certificate:
            from api.utils.i18n import save_translations, translate_status
            en_entry = {}
            if instance.stock_item_name:
                en_entry['stock_item_name'] = instance.stock_item_name
            if instance.stock_item_status:
                en_entry['stock_item_status'] = translate_status(instance.stock_item_status, 'en')
            if instance.stock_item_name_in_administrative_certificate:
                en_entry['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
            ar_entry = {}
            if instance.stock_item_name:
                ar_entry['stock_item_name'] = instance.stock_item_name
            if instance.stock_item_status:
                ar_entry['stock_item_status'] = translate_status(instance.stock_item_status, 'ar')
            if instance.stock_item_name_in_administrative_certificate:
                ar_entry['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
            save_translations(instance, {'en': en_entry, 'ar': ar_entry})
        return instance


class StockItemIsAssignedToPersonSerializer(serializers.ModelSerializer):
    """Serializer for StockItemIsAssignedToPerson model"""
    
    class Meta:
        model = StockItemIsAssignedToPerson
        fields = ['assignment_id', 'person', 'stock_item', 'assigned_by_person', 'start_datetime', 'end_datetime', 'condition_on_assignment', 'is_active', 'is_confirmed_by_exploitation_chief']
        read_only_fields = ['assignment_id', 'assigned_by_person', 'end_datetime']
        extra_kwargs = {
            'is_active': {'required': False},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Nest the stock item details in the response
        if instance.stock_item:
            representation['stock_item'] = StockItemSerializer(instance.stock_item).data
        return representation


class ConsumableSerializer(serializers.ModelSerializer):
    """Serializer for Consumable model"""
    consumable_name_ar = serializers.SerializerMethodField()
    consumable_name_en = serializers.SerializerMethodField()
    consumable_status_ar = serializers.SerializerMethodField()
    consumable_status_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Consumable
        fields = ['consumable_id', 'consumable_model', 'consumable_serial_number', 'consumable_inventory_number', 'consumable_name', 'consumable_status', 'stock_item_consumable_destruction_certificate_id', 'consumable_name_in_administrative_certificate', 'consumable_name_ar', 'consumable_name_en', 'consumable_status_ar', 'consumable_status_en', 'translations']
        read_only_fields = ['consumable_id']

    def _get_translated_field(self, obj, lang_code, field_name):
        try:
            translation = ConsumableTranslation.objects.get(consumable=obj, language_code=lang_code)
            return getattr(translation, field_name, None)
        except Exception:
            return None

    def get_consumable_name_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'consumable_name')

    def get_consumable_name_en(self, obj):
        return self._get_translated_field(obj, 'en', 'consumable_name')

    def get_consumable_status_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'consumable_status')

    def get_consumable_status_en(self, obj):
        return self._get_translated_field(obj, 'en', 'consumable_status')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = Consumable.objects.create(**validated_data)
        if translations_data:
            from api.utils.i18n import save_translations, translate_status
            # Ensure English version has name and status
            en_data = translations_data.get('en', {})
            if not en_data and instance.consumable_name:
                en_data = {'consumable_name': instance.consumable_name}
                translations_data['en'] = en_data
            elif instance.consumable_name and 'consumable_name' not in en_data:
                en_data['consumable_name'] = instance.consumable_name
            if instance.consumable_status and 'consumable_status' not in en_data:
                en_data['consumable_status'] = translate_status(instance.consumable_status, 'en')
                translations_data['en'] = en_data
            if instance.consumable_name_in_administrative_certificate and 'consumable_name_in_administrative_certificate' not in en_data:
                en_data['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
                translations_data['en'] = en_data
            # Ensure Arabic version also gets the status
            ar_data = translations_data.get('ar', {})
            if instance.consumable_status and 'consumable_status' not in ar_data:
                ar_data['consumable_status'] = translate_status(instance.consumable_status, 'ar')
                translations_data['ar'] = ar_data
            if instance.consumable_name_in_administrative_certificate and 'consumable_name_in_administrative_certificate' not in ar_data:
                ar_data['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
                translations_data['ar'] = ar_data
            save_translations(instance, translations_data)
        elif instance.consumable_name or instance.consumable_status or instance.consumable_name_in_administrative_certificate:
            # No translations provided, but save name and status in both en and ar translation rows
            from api.utils.i18n import save_translations, translate_status
            en_entry = {}
            if instance.consumable_name:
                en_entry['consumable_name'] = instance.consumable_name
            if instance.consumable_status:
                en_entry['consumable_status'] = translate_status(instance.consumable_status, 'en')
            if instance.consumable_name_in_administrative_certificate:
                en_entry['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
            ar_entry = {}
            if instance.consumable_name:
                ar_entry['consumable_name'] = instance.consumable_name
            if instance.consumable_status:
                ar_entry['consumable_status'] = translate_status(instance.consumable_status, 'ar')
            if instance.consumable_name_in_administrative_certificate:
                ar_entry['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
            save_translations(instance, {'en': en_entry, 'ar': ar_entry})
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations, translate_status
            en_data = translations_data.get('en', {})
            if instance.consumable_name and 'consumable_name' not in en_data:
                en_data['consumable_name'] = instance.consumable_name
            if instance.consumable_status and 'consumable_status' not in en_data:
                en_data['consumable_status'] = translate_status(instance.consumable_status, 'en')
                translations_data['en'] = en_data
            if instance.consumable_name_in_administrative_certificate and 'consumable_name_in_administrative_certificate' not in en_data:
                en_data['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
                translations_data['en'] = en_data
            # Ensure Arabic version also gets the status
            ar_data = translations_data.get('ar', {})
            if instance.consumable_status and 'consumable_status' not in ar_data:
                ar_data['consumable_status'] = translate_status(instance.consumable_status, 'ar')
                translations_data['ar'] = ar_data
            if instance.consumable_name_in_administrative_certificate and 'consumable_name_in_administrative_certificate' not in ar_data:
                ar_data['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
                translations_data['ar'] = ar_data
            save_translations(instance, translations_data)
        elif instance.consumable_name or instance.consumable_status or instance.consumable_name_in_administrative_certificate:
            from api.utils.i18n import save_translations, translate_status
            en_entry = {}
            if instance.consumable_name:
                en_entry['consumable_name'] = instance.consumable_name
            if instance.consumable_status:
                en_entry['consumable_status'] = translate_status(instance.consumable_status, 'en')
            if instance.consumable_name_in_administrative_certificate:
                en_entry['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
            ar_entry = {}
            if instance.consumable_name:
                ar_entry['consumable_name'] = instance.consumable_name
            if instance.consumable_status:
                ar_entry['consumable_status'] = translate_status(instance.consumable_status, 'ar')
            if instance.consumable_name_in_administrative_certificate:
                ar_entry['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
            save_translations(instance, {'en': en_entry, 'ar': ar_entry})
        return instance


class ConsumableIsAssignedToPersonSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableIsAssignedToPerson model"""
    
    class Meta:
        model = ConsumableIsAssignedToPerson
        fields = ['assignment_id', 'person', 'consumable', 'assigned_by_person', 'start_datetime', 'end_datetime', 'condition_on_assignment', 'is_active', 'is_confirmed_by_exploitation_chief']
        read_only_fields = ['assignment_id', 'assigned_by_person', 'end_datetime']
        extra_kwargs = {
            'is_active': {'required': False},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Nest the consumable details in the response
        if instance.consumable:
            representation['consumable'] = ConsumableSerializer(instance.consumable).data
        return representation


class PersonReportsProblemOnAssetSerializer(serializers.ModelSerializer):
    """Serializer for PersonReportsProblemOnAsset model"""
    class Meta:
        model = PersonReportsProblemOnAsset
        fields = ['report_id', 'asset', 'person', 'report_datetime', 'owner_observation']
        read_only_fields = ['report_id', 'report_datetime']


class PersonReportsProblemOnStockItemSerializer(serializers.ModelSerializer):
    """Serializer for PersonReportsProblemOnStockItem model"""
    class Meta:
        model = PersonReportsProblemOnStockItem
        fields = ['report_id', 'stock_item', 'person', 'report_datetime', 'owner_observation']
        read_only_fields = ['report_id', 'report_datetime']


class PersonReportsProblemOnConsumableSerializer(serializers.ModelSerializer):
    """Serializer for PersonReportsProblemOnConsumable model"""
    class Meta:
        model = PersonReportsProblemOnConsumable
        fields = ['report_id', 'consumable', 'person', 'report_datetime', 'owner_observation']
        read_only_fields = ['report_id', 'report_datetime']


class MaintenanceTypicalStepSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceTypicalStep model"""
    description_ar = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()
    maintenance_type_ar = serializers.SerializerMethodField()
    maintenance_type_en = serializers.SerializerMethodField()
    operation_type_ar = serializers.SerializerMethodField()
    operation_type_en = serializers.SerializerMethodField()
    maintenance_domain_ar = serializers.SerializerMethodField()
    maintenance_domain_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = MaintenanceTypicalStep
        fields = [
            'maintenance_typical_step_id',
            'estimated_cost',
            'actual_cost',
            'description',
            'description_ar',
            'description_en',
            'translations',
            'maintenance_type',
            'maintenance_type_ar',
            'maintenance_type_en',
            'operation_type',
            'operation_type_ar',
            'operation_type_en',
            'maintenance_domain',
            'maintenance_domain_ar',
            'maintenance_domain_en',
        ]
        read_only_fields = ['maintenance_typical_step_id']

    def _get_translation(self, obj, lang_code):
        try:
            from .translations import MaintenanceTypicalStepTranslation
            return MaintenanceTypicalStepTranslation.objects.get(
                maintenance_typical_step=obj, language_code=lang_code
            )
        except Exception:
            return None

    def _get_translated_field(self, obj, lang_code, field_name):
        translation = self._get_translation(obj, lang_code)
        if translation:
            return getattr(translation, field_name, None)
        return None

    def get_description_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'description')

    def get_description_en(self, obj):
        return self._get_translated_field(obj, 'en', 'description')

    def get_maintenance_type_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'maintenance_type')

    def get_maintenance_type_en(self, obj):
        return self._get_translated_field(obj, 'en', 'maintenance_type')

    def get_operation_type_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'operation_type')

    def get_operation_type_en(self, obj):
        return self._get_translated_field(obj, 'en', 'operation_type')

    def get_maintenance_domain_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'maintenance_domain')

    def get_maintenance_domain_en(self, obj):
        return self._get_translated_field(obj, 'en', 'maintenance_domain')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class MaintenanceStepSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceStep model"""
    # Nested fields for read-only details
    person_id = serializers.PrimaryKeyRelatedField(
        queryset=Person.objects.all(), source='person', write_only=True
    )
    person = PersonSerializer(read_only=True)
    maintenance_typical_step_id = serializers.PrimaryKeyRelatedField(
        queryset=MaintenanceTypicalStep.objects.all(), source='maintenance_typical_step', write_only=True
    )
    maintenance_typical_step = MaintenanceTypicalStepSerializer(read_only=True)

    def validate(self, attrs):
        status_value = attrs.get("maintenance_step_status")
        if status_value is not None:
            if status_value == "in progress":
                status_value = "In Progress"
                attrs["maintenance_step_status"] = status_value

            allowed = {
                "pending",
                "started",
                "pending (waiting for stock item)",
                "pending (waiting for consumable)",
                "In Progress",
                "done",
                "failed (to be sent to a higher level)",
                "cancelled",
            }
            if status_value not in allowed:
                raise serializers.ValidationError({"maintenance_step_status": "Invalid status"})

            current = getattr(self, "instance", None)
            old_status = getattr(current, "maintenance_step_status", None) if current is not None else None
            if old_status is not None:
                if old_status == "in progress":
                    old_status = "In Progress"

                order = {
                    "pending": 10,
                    "started": 20,
                    "pending (waiting for stock item)": 30,
                    "pending (waiting for consumable)": 30,
                    "In Progress": 40,
                    "done": 50,
                    "failed (to be sent to a higher level)": 50,
                    "cancelled": 50,
                }
                old_rank = order.get(old_status)
                new_rank = order.get(status_value)
                if old_rank is not None and new_rank is not None and new_rank < old_rank:
                    if old_status == "In Progress" and status_value in {
                        "pending (waiting for stock item)",
                        "pending (waiting for consumable)",
                    }:
                        return attrs
                    raise serializers.ValidationError({"maintenance_step_status": "Status cannot be set to an earlier value"})
        return attrs
    
    class Meta:
        model = MaintenanceStep
        fields = [
            'maintenance_step_id', 'maintenance', 'maintenance_typical_step', 'maintenance_typical_step_id',
            'person', 'person_id',
            'maintenance_step_status', 'note',
            'asset_condition_history', 'stock_item_condition_history', 'consumable_condition_history',
            'start_datetime', 'end_datetime', 'is_successful'
        ]
        read_only_fields = ['maintenance_step_id']


class MaintenanceSerializer(serializers.ModelSerializer):
    """Serializer for Maintenance model"""

    performed_by_person_name = serializers.SerializerMethodField()
    performed_by_person_name_ar = serializers.SerializerMethodField()
    performed_by_person_name_en = serializers.SerializerMethodField()
    asset_name = serializers.SerializerMethodField()
    asset_serial_number = serializers.SerializerMethodField()
    asset_inventory_number = serializers.SerializerMethodField()
    asset_service_tag = serializers.SerializerMethodField()
    asset_status = serializers.SerializerMethodField()
    asset_model_name = serializers.SerializerMethodField()
    asset_brand_name = serializers.SerializerMethodField()
    asset_brand_name_ar = serializers.SerializerMethodField()
    asset_brand_name_en = serializers.SerializerMethodField()
    asset_type_label = serializers.SerializerMethodField()
    asset_type_label_ar = serializers.SerializerMethodField()
    asset_type_label_en = serializers.SerializerMethodField()
    has_steps = serializers.SerializerMethodField()
    has_external_maintenances = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Maintenance
        fields = [
            'maintenance_id',
            'asset',
            'description',
            'maintenance_status',
            'start_datetime',
            'end_datetime',
            'is_successful',
            'performed_by_person',
            'performed_by_person_name',
            'performed_by_person_name_ar',
            'performed_by_person_name_en',
            'asset_name',
            'asset_serial_number',
            'asset_inventory_number',
            'asset_service_tag',
            'asset_status',
            'asset_model_name',
            'asset_brand_name',
            'asset_brand_name_ar',
            'asset_brand_name_en',
            'asset_type_label',
            'asset_type_label_ar',
            'asset_type_label_en',
            'has_steps',
            'has_external_maintenances',
            'total_cost',
        ]
        read_only_fields = ['maintenance_id']

    def _get_person_name(self, obj, lang_code=None):
        person = getattr(obj, 'performed_by_person', None)
        if not person:
            return None
        if lang_code:
            try:
                translation = PersonTranslation.objects.get(person=person, language_code=lang_code)
                first = getattr(translation, 'first_name', '') or ''
                last = getattr(translation, 'last_name', '') or ''
                full = (first + ' ' + last).strip()
                return full or None
            except PersonTranslation.DoesNotExist:
                return None
        first = getattr(person, 'first_name', '') or ''
        last = getattr(person, 'last_name', '') or ''
        full = (first + ' ' + last).strip()
        return full or None

    def get_performed_by_person_name(self, obj):
        return self._get_person_name(obj)

    def get_performed_by_person_name_ar(self, obj):
        return self._get_person_name(obj, 'ar')

    def get_performed_by_person_name_en(self, obj):
        return self._get_person_name(obj, 'en')

    def get_asset_name(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        return getattr(asset, 'asset_name', None) or None

    def get_asset_serial_number(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        return getattr(asset, 'asset_serial_number', None) or None

    def get_asset_inventory_number(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        return getattr(asset, 'asset_inventory_number', None) or None

    def get_asset_service_tag(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        return getattr(asset, 'asset_service_tag', None) or None

    def get_asset_status(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        return getattr(asset, 'asset_status', None) or None

    def get_asset_model_name(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        model = getattr(asset, 'asset_model', None)
        if not model:
            return None
        return getattr(model, 'model_name', None) or None

    def _get_brand(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        model = getattr(asset, 'asset_model', None)
        if not model:
            return None
        return getattr(model, 'asset_brand', None)

    def get_asset_brand_name(self, obj):
        brand = self._get_brand(obj)
        if not brand:
            return None
        return getattr(brand, 'brand_name', None) or None

    def get_asset_brand_name_ar(self, obj):
        brand = self._get_brand(obj)
        if not brand:
            return None
        try:
            translation = AssetBrandTranslation.objects.get(asset_brand=brand, language_code='ar')
            return translation.brand_name or None
        except AssetBrandTranslation.DoesNotExist:
            return None

    def get_asset_brand_name_en(self, obj):
        brand = self._get_brand(obj)
        if not brand:
            return None
        try:
            translation = AssetBrandTranslation.objects.get(asset_brand=brand, language_code='en')
            return translation.brand_name or None
        except AssetBrandTranslation.DoesNotExist:
            return None

    def _get_asset_type(self, obj):
        asset = getattr(obj, 'asset', None)
        if not asset:
            return None
        model = getattr(asset, 'asset_model', None)
        if not model:
            return None
        return getattr(model, 'asset_type', None)

    def get_asset_type_label(self, obj):
        atype = self._get_asset_type(obj)
        if not atype:
            return None
        return getattr(atype, 'asset_type_label', None) or None

    def get_asset_type_label_ar(self, obj):
        atype = self._get_asset_type(obj)
        if not atype:
            return None
        try:
            translation = AssetTypeTranslation.objects.get(asset_type=atype, language_code='ar')
            return translation.asset_type_label or None
        except AssetTypeTranslation.DoesNotExist:
            return None

    def get_asset_type_label_en(self, obj):
        atype = self._get_asset_type(obj)
        if not atype:
            return None
        try:
            translation = AssetTypeTranslation.objects.get(asset_type=atype, language_code='en')
            return translation.asset_type_label or None
        except AssetTypeTranslation.DoesNotExist:
            return None

    def get_has_steps(self, obj):
        return obj.steps.exists()

    def get_has_external_maintenances(self, obj):
        from .models import ExternalMaintenance
        return ExternalMaintenance.objects.filter(maintenance=obj).exists()

    def get_total_cost(self, obj):
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                total_cost = 0.0

                # 1. Normal steps
                cursor.execute('''
                    SELECT s.maintenance_step_id, t.actual_cost, t.operation_type
                    FROM maintenance_step s
                    JOIN maintenance_typical_step t ON s.maintenance_typical_step_id = t.maintenance_typical_step_id
                    WHERE s.maintenance_id = %s
                ''', [obj.maintenance_id])
                steps = cursor.fetchall()
                
                for step_id, actual_cost, operation_type in steps:
                    if actual_cost:
                        total_cost += float(actual_cost)
                        
                    if operation_type == 'add':
                        # Added stock items to asset — only first-time additions
                        # (no prior history entry for the same stock_item+asset pair)
                        cursor.execute('''
                            SELECT st.stock_item_model_id
                            FROM asset_is_composed_of_stock_item_history h
                            JOIN stock_item st ON h.stock_item_id = st.stock_item_id
                            WHERE h.maintenance_step_id = %s
                              AND NOT EXISTS (
                                  SELECT 1
                                  FROM asset_is_composed_of_stock_item_history prior
                                  WHERE prior.stock_item_id = h.stock_item_id
                                    AND prior.asset_id = h.asset_id
                                    AND prior.id < h.id
                              )
                        ''', [step_id])
                        for (model_id,) in cursor.fetchall():
                            cursor.execute('SELECT AVG(unit_price) FROM stock_item_model_is_found_in_purchase_order WHERE stock_item_model_id = %s', [model_id])
                            avg = cursor.fetchone()[0]
                            if avg: total_cost += float(avg)
                            
                        # Added consumables to asset — only first-time additions
                        # (no prior history entry for the same consumable+asset pair)
                        cursor.execute('''
                            SELECT c.consumable_model_id
                            FROM asset_is_composed_of_consumable_history h
                            JOIN consumable c ON h.consumable_id = c.consumable_id
                            WHERE h.maintenance_step_id = %s
                              AND NOT EXISTS (
                                  SELECT 1
                                  FROM asset_is_composed_of_consumable_history prior
                                  WHERE prior.consumable_id = h.consumable_id
                                    AND prior.asset_id = h.asset_id
                                    AND prior.id < h.id
                              )
                        ''', [step_id])
                        for (model_id,) in cursor.fetchall():
                            cursor.execute('SELECT AVG(unit_price) FROM consumable_model_is_found_in_purchase_order WHERE consumable_model_id = %s', [model_id])
                            avg = cursor.fetchone()[0]
                            if avg: total_cost += float(avg)
                            
                        # Added consumables to stock item — only first-time additions
                        # (no prior history entry for the same consumable+stock_item pair)
                        cursor.execute('''
                            SELECT c.consumable_model_id
                            FROM consumable_is_used_in_stock_item_history h
                            JOIN consumable c ON h.consumable_id = c.consumable_id
                            WHERE h.maintenance_step_id = %s
                              AND NOT EXISTS (
                                  SELECT 1
                                  FROM consumable_is_used_in_stock_item_history prior
                                  WHERE prior.consumable_id = h.consumable_id
                                    AND prior.stock_item_id = h.stock_item_id
                                    AND prior.id < h.id
                              )
                        ''', [step_id])
                        for (model_id,) in cursor.fetchall():
                            cursor.execute('SELECT AVG(unit_price) FROM consumable_model_is_found_in_purchase_order WHERE consumable_model_id = %s', [model_id])
                            avg = cursor.fetchone()[0]
                            if avg: total_cost += float(avg)

                # 2. External steps
                cursor.execute('''
                    SELECT t.actual_cost
                    FROM external_maintenance ext
                    JOIN external_maintenance_step es ON ext.external_maintenance_id = es.external_maintenance_id
                    JOIN external_maintenance_typical_step t ON es.external_maintenance_typical_step_id = t.external_maintenance_typical_step_id
                    WHERE ext.maintenance_id = %s
                ''', [obj.maintenance_id])
                ext_steps = cursor.fetchall()
                
                for (actual_cost,) in ext_steps:
                    if actual_cost:
                        total_cost += float(actual_cost)

                return round(total_cost, 2)
        except Exception:
            return 0.0


class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse model"""
    class Meta:
        model = Warehouse
        fields = ['warehouse_id', 'warehouse_name', 'warehouse_address']
        read_only_fields = ['warehouse_id']


class AttributionOrderSerializer(serializers.ModelSerializer):
    """Serializer for AttributionOrder model"""
    warehouse_name = serializers.CharField(source='warehouse.warehouse_name', read_only=True)

    class Meta:
        model = AttributionOrder
        fields = [
            'attribution_order_id', 'warehouse', 'warehouse_name',
            'attribution_order_full_code', 'attribution_order_date',
            'is_signed_by_central_chief', 'attribution_order_barcode'
        ]
        read_only_fields = ['attribution_order_id']


class AttributionOrderAssetStockItemAccessorySerializer(serializers.ModelSerializer):
    """Serializer for AttributionOrderAssetStockItemAccessory model"""

    stock_item_name = serializers.CharField(source='stock_item.stock_item_name', read_only=True)
    asset_name = serializers.CharField(source='asset.asset_name', read_only=True)

    class Meta:
        model = AttributionOrderAssetStockItemAccessory
        fields = [
            'id',
            'attribution_order',
            'asset',
            'asset_name',
            'stock_item',
            'stock_item_name',
        ]
        read_only_fields = ['id']


class AttributionOrderAssetConsumableAccessorySerializer(serializers.ModelSerializer):
    """Serializer for AttributionOrderAssetConsumableAccessory model"""

    consumable_name = serializers.CharField(source='consumable.consumable_name', read_only=True)
    asset_name = serializers.CharField(source='asset.asset_name', read_only=True)

    class Meta:
        model = AttributionOrderAssetConsumableAccessory
        fields = [
            'id',
            'attribution_order',
            'asset',
            'asset_name',
            'consumable',
            'consumable_name',
        ]
        read_only_fields = ['id']


class ReceiptReportSerializer(serializers.ModelSerializer):
    """Serializer for ReceiptReport model"""
    class Meta:
        model = ReceiptReport
        fields = ['receipt_report_id', 'report_datetime', 'report_full_code', 'digital_copy']
        read_only_fields = ['receipt_report_id', 'report_datetime']


class AdministrativeCertificateSerializer(serializers.ModelSerializer):
    """Serializer for AdministrativeCertificate model"""
    class Meta:
        model = AdministrativeCertificate
        fields = [
            'administrative_certificate_id', 'warehouse', 'attribution_order', 'receipt_report',
            'interested_organization', 'operation', 'format',
            'is_signed_by_warehouse_storage_magaziner', 'is_signed_by_warehouse_storage_accountant',
            'is_signed_by_warehouse_storage_marketer', 'is_signed_by_warehouse_it_chief',
            'is_signed_by_warehouse_leader', 'are_items_moved', 'digital_copy'
        ]
        read_only_fields = ['administrative_certificate_id']


class StockItemConsumableDestructionCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockItemConsumableDestructionCertificate
        fields = ['destruction_certificate_id', 'digital_copy', 'destruction_datetime']
        read_only_fields = ['destruction_certificate_id', 'destruction_datetime', 'digital_copy']


class AssetDestructionCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetDestructionCertificate
        fields = ['asset_destruction_certificate_id', 'digital_copy', 'destruction_datetime']
        read_only_fields = ['asset_destruction_certificate_id', 'destruction_datetime', 'digital_copy']


class AssetFailedExternalMaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetFailedExternalMaintenance
        fields = ['asset', 'external_maintenance', 'failed_datetime']
        read_only_fields = ['asset', 'external_maintenance', 'failed_datetime']


class AssetDestructionCertificateAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetDestructionCertificateAsset
        fields = ['id', 'asset_destruction_certificate_id', 'asset_id', 'external_maintenance_id']
        read_only_fields = ['id']


class CompanyAssetRequestSerializer(serializers.ModelSerializer):
    """Serializer for CompanyAssetRequest model"""

    class Meta:
        model = CompanyAssetRequest
        fields = [
            'company_asset_request_id',
            'attribution_order',
            'is_signed_by_company',
            'administrative_serial_number',
            'title_of_demand',
            'organization_body_designation',
            'register_number_or_book_journal_of_corpse',
            'register_number_or_book_journal_of_establishment',
            'is_signed_by_company_leader',
            'is_signed_by_regional_provider',
            'is_signed_by_company_representative',
            'digital_copy',
        ]
        read_only_fields = ['company_asset_request_id']


class AssetIncidentReportStockItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetIncidentReportStockItem
        fields = ['id', 'asset_incident_report', 'stock_item']
        read_only_fields = ['id']


class AssetIncidentReportConsumableSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetIncidentReportConsumable
        fields = ['id', 'asset_incident_report', 'consumable']


class AuthenticationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthenticationLog
        fields = ['log_id', 'user', 'attempted_username', 'event_type', 'ip_address', 'event_timestamp', 'failure_reason']


class UserSessionSerializer(serializers.ModelSerializer):
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = UserSession
        fields = ['session_id', 'user', 'ip_address', 'user_agent', 'login_datetime', 'last_activity', 'logout_datetime', 'is_current']

    def get_is_current(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        # We'll store session_id in the token and put it in request.session_id via middleware
        current_session_id = getattr(request, 'session_id', None)
        return obj.session_id == current_session_id
        read_only_fields = ['id']


class AssetIncidentReportSerializer(serializers.ModelSerializer):
    asset_serial_number = serializers.CharField(source='asset.asset_serial_number', read_only=True)
    asset_name = serializers.CharField(source='asset.asset_name', read_only=True)
    asset_type_label = serializers.CharField(source='asset.asset_model.asset_type.asset_type_label', read_only=True, default=None)
    asset_brand_name = serializers.CharField(source='asset.asset_model.asset_brand.brand_name', read_only=True, default=None)
    asset_model_name = serializers.CharField(source='asset.asset_model.model_name', read_only=True, default=None)
    asset_inventory_number = serializers.CharField(source='asset.asset_inventory_number', read_only=True, default=None)
    asset_service_tag = serializers.CharField(source='asset.asset_service_tag', read_only=True, default=None)
    asset_status = serializers.CharField(source='asset.asset_status', read_only=True, default=None)
    owner_person_name = serializers.SerializerMethodField()
    school_headquarter_person_name = serializers.SerializerMethodField()
    stock_item_ids = serializers.SerializerMethodField()
    consumable_ids = serializers.SerializerMethodField()
    reason_ar = serializers.SerializerMethodField()
    reason_en = serializers.SerializerMethodField()
    status_ar = serializers.SerializerMethodField()
    status_en = serializers.SerializerMethodField()

    class Meta:
        model = AssetIncidentReport
        fields = [
            'asset_incident_report_id',
            'asset',
            'asset_serial_number',
            'asset_name',
            'asset_type_label',
            'asset_brand_name',
            'asset_model_name',
            'asset_inventory_number',
            'asset_service_tag',
            'asset_status',
            'owner_person',
            'owner_person_name',
            'school_headquarter_person',
            'school_headquarter_person_name',
            'reason',
            'owner_note',
            'digital_copy',
            'is_signed_by_owner',
            'is_signed_by_it_bureau_chief',
            'is_signed_by_exploitation_chief',
            'is_signed_by_protection_and_security_bureau_chief',
            'is_signed_by_school_headquarter',
            'it_bureau_chief_note',
            'exploitation_chief_note',
            'protection_and_security_bureau_chief_note',
            'school_headquarter_note',
            'report_datetime',
            'status',
            'maintenance',
            'stock_item_ids',
            'consumable_ids',
            'reason_ar',
            'reason_en',
            'status_ar',
            'status_en',
        ]
        read_only_fields = ['asset_incident_report_id']
        extra_kwargs = {
            'owner_person': {'required': False, 'allow_null': True},
            'school_headquarter_person': {'required': False, 'allow_null': True},
            'maintenance': {'required': False, 'allow_null': True},
        }

    def _get_translation(self, obj, field_name, lang_code):
        try:
            from api.translations import AssetIncidentReportTranslation
            translation = AssetIncidentReportTranslation.objects.get(
                asset_incident_report=obj, language_code=lang_code
            )
            return getattr(translation, field_name, None)
        except AssetIncidentReportTranslation.DoesNotExist:
            return None

    def get_reason_ar(self, obj):
        return self._get_translation(obj, 'reason', 'ar')

    def get_reason_en(self, obj):
        return self._get_translation(obj, 'reason', 'en')

    def get_status_ar(self, obj):
        return self._get_translation(obj, 'status', 'ar')

    def get_status_en(self, obj):
        return self._get_translation(obj, 'status', 'en')

    def get_owner_person_name(self, obj):
        person = getattr(obj, 'owner_person', None)
        if not person:
            return None
        return f"{person.first_name} {person.last_name}".strip()

    def get_school_headquarter_person_name(self, obj):
        person = getattr(obj, 'school_headquarter_person', None)
        if not person:
            return None
        return f"{person.first_name} {person.last_name}".strip()

    def get_stock_item_ids(self, obj):
        return [item.stock_item_id for item in obj.included_stock_items.all()]

    def get_consumable_ids(self, obj):
        return [item.consumable_id for item in obj.included_consumables.all()]


class ExternalMaintenanceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalMaintenanceProvider
        fields = [
            'external_maintenance_provider_id',
            'external_maintenance_provider_name',
            'external_maintenance_provider_location',
        ]


class ExternalMaintenanceTypicalStepSerializer(serializers.ModelSerializer):
    description_ar = serializers.SerializerMethodField()
    description_en = serializers.SerializerMethodField()
    maintenance_type_ar = serializers.SerializerMethodField()
    maintenance_type_en = serializers.SerializerMethodField()
    operation_type_ar = serializers.SerializerMethodField()
    operation_type_en = serializers.SerializerMethodField()
    maintenance_domain_ar = serializers.SerializerMethodField()
    maintenance_domain_en = serializers.SerializerMethodField()
    translations = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = ExternalMaintenanceTypicalStep
        fields = [
            'external_maintenance_typical_step_id',
            'estimated_cost',
            'actual_cost',
            'maintenance_type',
            'maintenance_type_ar',
            'maintenance_type_en',
            'description',
            'description_ar',
            'description_en',
            'translations',
            'maintenance_domain',
            'maintenance_domain_ar',
            'maintenance_domain_en',
            'operation_type',
            'operation_type_ar',
            'operation_type_en',
        ]
        read_only_fields = ['external_maintenance_typical_step_id']

    def _get_translation(self, obj, lang_code):
        try:
            from .translations import ExternalMaintenanceTypicalStepTranslation
            return ExternalMaintenanceTypicalStepTranslation.objects.get(
                external_maintenance_typical_step=obj, language_code=lang_code
            )
        except Exception:
            return None

    def _get_translated_field(self, obj, lang_code, field_name):
        translation = self._get_translation(obj, lang_code)
        if translation:
            return getattr(translation, field_name, None)
        return None

    def get_description_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'description')

    def get_description_en(self, obj):
        return self._get_translated_field(obj, 'en', 'description')

    def get_maintenance_type_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'maintenance_type')

    def get_maintenance_type_en(self, obj):
        return self._get_translated_field(obj, 'en', 'maintenance_type')

    def get_operation_type_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'operation_type')

    def get_operation_type_en(self, obj):
        return self._get_translated_field(obj, 'en', 'operation_type')

    def get_maintenance_domain_ar(self, obj):
        return self._get_translated_field(obj, 'ar', 'maintenance_domain')

    def get_maintenance_domain_en(self, obj):
        return self._get_translated_field(obj, 'en', 'maintenance_domain')

    def create(self, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().create(validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance

    def update(self, instance, validated_data):
        translations_data = validated_data.pop('translations', None)
        instance = super().update(instance, validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        return instance


class ExternalMaintenanceStepSerializer(serializers.ModelSerializer):
    external_maintenance_provider_id = serializers.IntegerField(
        source='external_maintenance.external_maintenance_provider_id',
        read_only=True,
    )
    external_maintenance_provider_name = serializers.CharField(
        source='external_maintenance.external_maintenance_provider.external_maintenance_provider_name',
        read_only=True,
    )
    external_maintenance_typical_step_description = serializers.CharField(
        source='external_maintenance_typical_step.description',
        read_only=True,
    )
    external_maintenance_typical_step_description_ar = serializers.SerializerMethodField()
    external_maintenance_typical_step_description_en = serializers.SerializerMethodField()

    class Meta:
        model = ExternalMaintenanceStep
        fields = [
            'external_maintenance_step_id',
            'external_maintenance_provider_id',
            'external_maintenance_provider_name',
            'external_maintenance',
            'external_maintenance_typical_step',
            'external_maintenance_typical_step_description',
            'external_maintenance_typical_step_description_ar',
            'external_maintenance_typical_step_description_en',
            'start_datetime',
            'end_datetime',
            'is_successful',
        ]

    def get_external_maintenance_typical_step_description_ar(self, obj):
        typical_step = getattr(obj, 'external_maintenance_typical_step', None)
        if not typical_step:
            return None
        try:
            from .translations import ExternalMaintenanceTypicalStepTranslation
            translation = ExternalMaintenanceTypicalStepTranslation.objects.get(
                external_maintenance_typical_step=typical_step, language_code='ar'
            )
            return translation.description or None
        except Exception:
            return None

    def get_external_maintenance_typical_step_description_en(self, obj):
        typical_step = getattr(obj, 'external_maintenance_typical_step', None)
        if not typical_step:
            return None
        try:
            from .translations import ExternalMaintenanceTypicalStepTranslation
            translation = ExternalMaintenanceTypicalStepTranslation.objects.get(
                external_maintenance_typical_step=typical_step, language_code='en'
            )
            return translation.description or None
        except Exception:
            return None


class ExternalMaintenanceDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalMaintenanceDocument
        fields = [
            'external_maintenance_document_id',
            'external_maintenance',
            'document_is_signed',
            'item_is_received_by_maintenance_provider',
            'maintenance_provider_final_decision',
            'digital_copy',
        ]


class ExternalMaintenanceSerializer(serializers.ModelSerializer):
    maintenance_asset_id = serializers.IntegerField(source='maintenance.asset_id', read_only=True)
    maintenance_asset_name = serializers.CharField(source='maintenance.asset.asset_name', read_only=True)

    class Meta:
        model = ExternalMaintenance
        fields = [
            'external_maintenance_id',
            'maintenance',
            'maintenance_asset_id',
            'maintenance_asset_name',
            'external_maintenance_provider',
            'external_maintenance_status',
            'item_received_by_maintenance_provider_datetime',
            'item_sent_to_company_datetime',
            'item_sent_to_external_maintenance_datetime',
            'item_received_by_company_datetime',
        ]
