from rest_framework import serializers
from .models import Person, UserAccount, Role, AssetType, AssetBrand, AssetModel, StockItemType, StockItemBrand, StockItemModel, ConsumableType, ConsumableBrand, ConsumableModel, RoomType, Room, Position, OrganizationalStructure


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
