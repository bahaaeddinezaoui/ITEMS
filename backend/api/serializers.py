from rest_framework import serializers
from .models import Person, UserAccount, Role, AssetType, AssetBrand, AssetModel, StockItemType, StockItemBrand, StockItemModel, ConsumableType, ConsumableBrand, ConsumableModel, RoomType, Room, Position, OrganizationalStructure, OrganizationalStructureRelation, Asset, StockItem, Consumable, AssetIsAssignedToPerson, StockItemIsAssignedToPerson, ConsumableIsAssignedToPerson, PersonReportsProblemOnAsset, PersonReportsProblemOnStockItem, PersonReportsProblemOnConsumable, MaintenanceTypicalStep, MaintenanceStep, AssetAttributeDefinition, AssetTypeAttribute, AssetModelAttributeValue, AssetAttributeValue


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for Person model"""
    class Meta:
        model = Person
        fields = ['person_id', 'first_name', 'last_name', 'sex', 'birth_date', 'is_approved']
        read_only_fields = ['person_id']


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model"""
    class Meta:
        model = Role
        fields = ['role_id', 'role_code', 'role_label', 'description']


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
        fields = ['user_id', 'username', 'person', 'is_superuser', 'roles', 'last_login']

    def get_is_superuser(self, obj):
        return obj.is_superuser()

    def get_roles(self, obj):
        role_mappings = obj.get_roles()
        return [RoleSerializer(rm.role).data for rm in role_mappings]


class AssetTypeSerializer(serializers.ModelSerializer):
    """Serializer for AssetType model"""
    class Meta:
        model = AssetType
        fields = ['asset_type_id', 'asset_type_label', 'asset_type_code']
        read_only_fields = ['asset_type_id']


class AssetBrandSerializer(serializers.ModelSerializer):
    """Serializer for AssetBrand model"""
    class Meta:
        model = AssetBrand
        fields = ['asset_brand_id', 'brand_name', 'brand_code', 'is_active']
        read_only_fields = ['asset_brand_id']


class AssetModelSerializer(serializers.ModelSerializer):
    """Serializer for AssetModel model"""
    brand_name = serializers.CharField(source='asset_brand.brand_name', read_only=True)
    asset_type_label = serializers.CharField(source='asset_type.asset_type_label', read_only=True)
    
    class Meta:
        model = AssetModel
        fields = [
            'asset_model_id', 'asset_brand', 'brand_name', 'asset_type', 'asset_type_label',
            'model_name', 'model_code', 'release_year', 'discontinued_year',
            'is_active', 'notes', 'warranty_expiry_in_months'
        ]
        read_only_fields = ['asset_model_id']


class StockItemTypeSerializer(serializers.ModelSerializer):
    """Serializer for StockItemType model"""
    class Meta:
        model = StockItemType
        fields = ['stock_item_type_id', 'stock_item_type_label', 'stock_item_type_code']
        read_only_fields = ['stock_item_type_id']


class StockItemBrandSerializer(serializers.ModelSerializer):
    """Serializer for StockItemBrand model"""
    class Meta:
        model = StockItemBrand
        fields = ['stock_item_brand_id', 'brand_name', 'brand_code', 'is_active']
        read_only_fields = ['stock_item_brand_id']


class StockItemModelSerializer(serializers.ModelSerializer):
    """Serializer for StockItemModel model"""
    brand_name = serializers.CharField(source='stock_item_brand.brand_name', read_only=True)
    stock_item_type_label = serializers.CharField(source='stock_item_type.stock_item_type_label', read_only=True)
    
    class Meta:
        model = StockItemModel
        fields = [
            'stock_item_model_id', 'stock_item_brand', 'brand_name', 'stock_item_type', 'stock_item_type_label',
            'model_name', 'model_code', 'release_year', 'discontinued_year',
            'is_active', 'notes', 'warranty_expiry_in_months'
        ]
        read_only_fields = ['stock_item_model_id']


class ConsumableTypeSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableType model"""
    class Meta:
        model = ConsumableType
        fields = ['consumable_type_id', 'consumable_type_label', 'consumable_type_code']
        read_only_fields = ['consumable_type_id']


class ConsumableBrandSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableBrand model"""
    class Meta:
        model = ConsumableBrand
        fields = ['consumable_brand_id', 'brand_name', 'brand_code', 'is_active']
        read_only_fields = ['consumable_brand_id']


class ConsumableModelSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableModel model"""
    brand_name = serializers.CharField(source='consumable_brand.brand_name', read_only=True)
    consumable_type_label = serializers.CharField(source='consumable_type.consumable_type_label', read_only=True)
    
    class Meta:
        model = ConsumableModel
        fields = [
            'consumable_model_id', 'consumable_brand', 'brand_name', 'consumable_type', 'consumable_type_label',
            'model_name', 'model_code', 'release_year', 'discontinued_year',
            'is_active', 'notes', 'warranty_expiry_in_months'
        ]
        read_only_fields = ['consumable_model_id']


class RoomTypeSerializer(serializers.ModelSerializer):
    """Serializer for RoomType model"""
    class Meta:
        model = RoomType
        fields = ['room_type_id', 'room_type_label', 'room_type_code']
        read_only_fields = ['room_type_id']


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model"""
    class Meta:
        model = Room
        fields = ['room_id', 'room_name', 'room_type']
        read_only_fields = ['room_id']


class PositionSerializer(serializers.ModelSerializer):
    """Serializer for Position model"""
    class Meta:
        model = Position
        fields = ['position_id', 'position_code', 'position_label', 'description']
        read_only_fields = ['position_id']


class OrganizationalStructureSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationalStructure model"""
    class Meta:
        model = OrganizationalStructure
        fields = ['organizational_structure_id', 'structure_code', 'structure_name', 'structure_type', 'is_active']
        read_only_fields = ['organizational_structure_id']


class OrganizationalStructureRelationSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationalStructureRelation model"""
    # Use explicit fields to ensure we handle the primary_key=True case correctly
    organizational_structure = serializers.PrimaryKeyRelatedField(queryset=OrganizationalStructure.objects.all())
    parent_organizational_structure = serializers.PrimaryKeyRelatedField(queryset=OrganizationalStructure.objects.all())
    
    # Include nested data for better readability
    organizational_structure_name = serializers.CharField(source='organizational_structure.structure_name', read_only=True)
    parent_organizational_structure_name = serializers.CharField(source='parent_organizational_structure.structure_name', read_only=True)
    
    class Meta:
        model = OrganizationalStructureRelation
        fields = ['organizational_structure', 'parent_organizational_structure', 'organizational_structure_name', 
                  'parent_organizational_structure_name', 'relation_id', 'relation_type']

    def create(self, validated_data):
        # Handle the assignment using _id suffixes to avoid instance checks on ForeignKey PKs
        instance = OrganizationalStructureRelation()
        org = validated_data.get('organizational_structure')
        parent = validated_data.get('parent_organizational_structure')
        
        # Use .pk if it's an object, otherwise use the value itself
        instance.organizational_structure_id = org.pk if hasattr(org, 'pk') else org
        instance.parent_organizational_structure_id = parent.pk if hasattr(parent, 'pk') else parent
        instance.relation_id = validated_data.get('relation_id')
        instance.relation_type = validated_data.get('relation_type', '')
        
        # Must use force_insert=True since we are providing the manual PK
        instance.save(force_insert=True)
        return instance

    def update(self, instance, validated_data):
        # Update fields that are not the primary key
        instance.relation_id = validated_data.get('relation_id', instance.relation_id)
        instance.relation_type = validated_data.get('relation_type', instance.relation_type)
        # Note: If we wanted to update the primary key, we'd have to delete and recreate 
        # because Django doesn't handle changing PKs well.
        instance.save()
        return instance


class AssetSerializer(serializers.ModelSerializer):
    """Serializer for Asset model"""
    class Meta:
        model = Asset
        fields = ['asset_id', 'asset_model', 'asset_serial_number', 'asset_inventory_number', 'asset_name', 'asset_status', 'asset_service_tag']
        read_only_fields = ['asset_id']


class AssetAttributeDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for AssetAttributeDefinition model"""
    class Meta:
        model = AssetAttributeDefinition
        fields = ['asset_attribute_definition_id', 'data_type', 'unit', 'description']
        read_only_fields = ['asset_attribute_definition_id']


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
    asset = AssetSerializer(read_only=True)
    
    class Meta:
        model = AssetIsAssignedToPerson
        fields = ['assignment_id', 'person', 'asset', 'assigned_by_person', 'start_datetime', 'end_datetime', 'condition_on_assignment', 'is_active']
        read_only_fields = ['assignment_id']


class StockItemSerializer(serializers.ModelSerializer):
    """Serializer for StockItem model"""
    class Meta:
        model = StockItem
        fields = ['stock_item_id', 'stock_item_model', 'stock_item_inventory_number', 'stock_item_name', 'stock_item_status']
        read_only_fields = ['stock_item_id']


class StockItemIsAssignedToPersonSerializer(serializers.ModelSerializer):
    """Serializer for StockItemIsAssignedToPerson model"""
    stock_item = StockItemSerializer(read_only=True)
    
    class Meta:
        model = StockItemIsAssignedToPerson
        fields = ['assignment_id', 'person', 'stock_item', 'assigned_by_person', 'start_datetime', 'end_datetime', 'condition_on_assignment', 'is_active']
        read_only_fields = ['assignment_id']


class ConsumableSerializer(serializers.ModelSerializer):
    """Serializer for Consumable model"""
    class Meta:
        model = Consumable
        fields = ['consumable_id', 'consumable_model', 'consumable_serial_number', 'consumable_inventory_number', 'consumable_name', 'consumable_status']
        read_only_fields = ['consumable_id']


class ConsumableIsAssignedToPersonSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableIsAssignedToPerson model"""
    consumable = ConsumableSerializer(read_only=True)
    
    class Meta:
        model = ConsumableIsAssignedToPerson
        fields = ['assignment_id', 'person', 'consumable', 'assigned_by_person', 'start_datetime', 'end_datetime', 'condition_on_assignment', 'is_active']
        read_only_fields = ['assignment_id']


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
    class Meta:
        model = MaintenanceTypicalStep
        fields = ['maintenance_typical_step_id', 'estimated_cost', 'actual_cost', 'description', 'maintenance_type']
        read_only_fields = ['maintenance_typical_step_id']


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
    
    class Meta:
        model = MaintenanceStep
        fields = [
            'maintenance_step_id', 'maintenance', 'maintenance_typical_step', 'maintenance_typical_step_id',
            'person', 'person_id',
            'asset_condition_history', 'stock_item_condition_history', 'consumable_condition_history',
            'start_datetime', 'end_datetime', 'is_successful'
        ]
        read_only_fields = ['maintenance_step_id']
