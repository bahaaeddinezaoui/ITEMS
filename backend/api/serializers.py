from rest_framework import serializers
from .models import Person, UserAccount, Role, AssetType, AssetBrand, AssetModel, StockItemType, StockItemBrand, StockItemModel, ConsumableType, ConsumableBrand, ConsumableModel, RoomType, Room, Position, OrganizationalStructure, OrganizationalStructureRelation, Asset, Maintenance, StockItem, Consumable, AssetAssignment, StockItemAssignment, ConsumableAssignment, PersonReportsProblemOnAsset, PersonReportsProblemOnStockItem, PersonReportsProblemOnConsumable


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


class UserAccountSerializer(serializers.ModelSerializer):
    """Serializer for UserAccount model"""
    person = PersonSerializer(read_only=True)
    roles = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = [
            'user_id',
            'username',
            'person',
            'account_status',
            'failed_login_attempts',
            'created_at_datetime',
            'last_login',
            'disabled_at_datetime',
            'password_last_changed_datetime',
            'roles',
        ]

    def get_roles(self, obj):
        role_mappings = obj.get_roles()
        return [RoleSerializer(rm.role).data for rm in role_mappings]


class UserAccountCreateSerializer(serializers.Serializer):
    """Create a login account for an existing person (superuser-only)."""
    person_id = serializers.IntegerField()
    username = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=128, write_only=True)
    account_status = serializers.ChoiceField(choices=['active', 'disabled'], default='active')
    role_code = serializers.CharField(max_length=24, required=False, allow_blank=True)


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

    def create(self, validated_data):
        last = Asset.objects.order_by('-asset_id').first()
        next_id = (last.asset_id + 1) if last else 1
        instance = Asset(**validated_data)
        instance.asset_id = next_id
        instance.save(force_insert=True)
        return instance

    class Meta:
        model = Asset
        fields = ['asset_id', 'asset_model', 'attribution_order_id', 'destruction_certificate_id', 
                  'asset_serial_number', 'asset_fabrication_datetime', 'asset_inventory_number', 
                  'asset_service_tag', 'asset_name', 'asset_name_in_the_administrative_certificate', 
                  'asset_arrival_datetime', 'asset_status']
        read_only_fields = ['asset_id']


class MaintenanceSerializer(serializers.ModelSerializer):
    """Serializer for Maintenance model"""
    asset_name = serializers.CharField(source='asset.asset_name', read_only=True)
    stock_item_name = serializers.CharField(source='stock_item.stock_item_name', read_only=True)
    consumable_name = serializers.CharField(source='consumable.consumable_name', read_only=True)
    performed_by_person_name = serializers.StringRelatedField(source='performed_by_person', read_only=True)
    approved_by_maintenance_chief_name = serializers.StringRelatedField(source='approved_by_maintenance_chief', read_only=True)

    class Meta:
        model = Maintenance
        fields = ['maintenance_id', 'asset', 'asset_name', 'stock_item', 'stock_item_name', 
                  'consumable', 'consumable_name', 'performed_by_person', 'performed_by_person_name',
                  'approved_by_maintenance_chief', 'approved_by_maintenance_chief_name',
                  'is_approved_by_maintenance_chief', 'start_datetime', 'end_datetime', 
                  'description', 'is_successful']
        read_only_fields = ['maintenance_id']


class StockItemSerializer(serializers.ModelSerializer):
    """Serializer for StockItem model"""

    def create(self, validated_data):
        last = StockItem.objects.order_by('-stock_item_id').first()
        next_id = (last.stock_item_id + 1) if last else 1
        instance = StockItem(**validated_data)
        instance.stock_item_id = next_id
        instance.save(force_insert=True)
        return instance

    class Meta:
        model = StockItem
        fields = ['stock_item_id', 'maintenance_step_id', 'stock_item_model', 'destruction_certificate_id',
                  'stock_item_fabrication_datetime', 'stock_item_name', 'stock_item_inventory_number',
                  'stock_item_warranty_expiry_in_months', 'stock_item_name_in_administrative_certificate',
                  'stock_item_arrival_datetime', 'stock_item_status']
        read_only_fields = ['stock_item_id']


class ConsumableSerializer(serializers.ModelSerializer):
    """Serializer for Consumable model"""

    def create(self, validated_data):
        last = Consumable.objects.order_by('-consumable_id').first()
        next_id = (last.consumable_id + 1) if last else 1
        instance = Consumable(**validated_data)
        instance.consumable_id = next_id
        instance.save(force_insert=True)
        return instance

    class Meta:
        model = Consumable
        fields = ['consumable_id', 'consumable_model', 'destruction_certificate_id', 'consumable_name',
                  'consumable_serial_number', 'consumable_fabrication_datetime', 'consumable_inventory_number',
                  'consumable_service_tag', 'consumable_name_in_administrative_certificate',
                  'consumable_arrival_datetime', 'consumable_status']
        read_only_fields = ['consumable_id']


class PersonReportsProblemOnAssetSerializer(serializers.ModelSerializer):
    """Serializer for person_reports_problem_on_asset table"""

    class Meta:
        model = PersonReportsProblemOnAsset
        fields = ['report_id', 'asset', 'person', 'report_datetime', 'owner_observation']


class PersonReportsProblemOnStockItemSerializer(serializers.ModelSerializer):
    """Serializer for person_reports_problem_on_stock_item table"""

    class Meta:
        model = PersonReportsProblemOnStockItem
        fields = ['report_id', 'stock_item', 'person', 'report_datetime', 'owner_observation']


class PersonReportsProblemOnConsumableSerializer(serializers.ModelSerializer):
    """Serializer for person_reports_problem_on_consumable table"""

    class Meta:
        model = PersonReportsProblemOnConsumable
        fields = ['report_id', 'consumable', 'person', 'report_datetime', 'owner_observation']


class AssetAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for AssetAssignment model"""

    class Meta:
        model = AssetAssignment
        fields = [
            'assignment_id',
            'person',
            'asset',
            'assigned_by_person_id',
            'start_datetime',
            'end_datetime',
            'condition_on_assignment',
            'is_active',
        ]


class StockItemAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for StockItemAssignment model"""

    class Meta:
        model = StockItemAssignment
        fields = [
            'assignment_id',
            'person',
            'stock_item',
            'assigned_by_person_id',
            'start_datetime',
            'end_datetime',
            'condition_on_assignment',
            'is_active',
        ]


class ConsumableAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for ConsumableAssignment model"""

    class Meta:
        model = ConsumableAssignment
        fields = [
            'assignment_id',
            'person',
            'consumable',
            'assigned_by_person_id',
            'start_datetime',
            'end_datetime',
            'condition_on_assignment',
            'is_active',
        ]


class ProblemReportCreateSerializer(serializers.Serializer):
    item_type = serializers.ChoiceField(choices=['asset', 'stock_item', 'consumable'])
    item_id = serializers.IntegerField()
    owner_observation = serializers.CharField(max_length=256)


class ProblemReportListItemSerializer(serializers.Serializer):
    item_type = serializers.ChoiceField(choices=['asset', 'stock_item', 'consumable'])
    item_id = serializers.IntegerField()
    report_id = serializers.IntegerField()
    report_datetime = serializers.DateTimeField()
    owner_observation = serializers.CharField(max_length=256)
    person_id = serializers.IntegerField()


