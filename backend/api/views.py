from __future__ import annotations

import hashlib
import os

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Asset,
    AssetAttributeDefinition,
    AssetAttributeValue,
    AssetBrand,
    AssetModel,
    AssetModelAttributeValue,
    AssetType,
    AssetTypeAttribute,
    Consumable,
    ConsumableAttributeDefinition,
    ConsumableAttributeValue,
    ConsumableBrand,
    ConsumableModel,
    ConsumableModelAttributeValue,
    ConsumableType,
    ConsumableTypeAttribute,
    Maintenance,
    MaintenanceStep,
    MaintenanceTypicalStep,
    OrganizationalStructure,
    OrganizationalStructureRelation,
    Person,
    PersonReportsProblemOnAsset,
    PersonReportsProblemOnConsumable,
    PersonReportsProblemOnStockItem,
    PersonRoleMapping,
    Position,
    Room,
    RoomType,
    StockItem,
    StockItemAttributeDefinition,
    StockItemAttributeValue,
    StockItemBrand,
    StockItemModel,
    StockItemModelAttributeValue,
    StockItemType,
    StockItemTypeAttribute,
    UserAccount,
)
from .serializers import (
    AssetAttributeDefinitionSerializer,
    AssetAttributeValueSerializer,
    AssetBrandSerializer,
    AssetModelAttributeValueSerializer,
    AssetModelSerializer,
    AssetSerializer,
    AssetTypeAttributeSerializer,
    AssetTypeSerializer,
    ConsumableAttributeDefinitionSerializer,
    ConsumableAttributeValueSerializer,
    ConsumableBrandSerializer,
    ConsumableModelAttributeValueSerializer,
    ConsumableModelSerializer,
    ConsumableSerializer,
    ConsumableTypeAttributeSerializer,
    ConsumableTypeSerializer,
    LoginSerializer,
    MaintenanceStepSerializer,
    MaintenanceTypicalStepSerializer,
    OrganizationalStructureRelationSerializer,
    OrganizationalStructureSerializer,
    PersonSerializer,
    PositionSerializer,
    RoomSerializer,
    RoomTypeSerializer,
    StockItemAttributeDefinitionSerializer,
    StockItemAttributeValueSerializer,
    StockItemBrandSerializer,
    StockItemModelAttributeValueSerializer,
    StockItemModelSerializer,
    StockItemSerializer,
    StockItemTypeAttributeSerializer,
    StockItemTypeSerializer,
    UserProfileSerializer,
)


def hash_password(password: str) -> str:
    """Hash password using SHA-512 to match existing database format."""

    return hashlib.sha512(password.encode()).hexdigest()


class SuperuserWriteMixin:
    """Mixin enforcing superuser-only writes while allowing authenticated reads."""

    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, "user") and request.user and getattr(request.user, "is_authenticated", False):
            if isinstance(request.user, UserAccount):
                return request.user

        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass

        try:
            if hasattr(request, "auth") and request.auth is not None:
                username = request.auth.get("username")
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass

        return None

    def _require_superuser(self, request, action_label: str):
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not user_account.is_superuser():
            return Response({"error": f"Only superusers can {action_label}"}, status=status.HTTP_403_FORBIDDEN)
        return None

    def create(self, request, *args, **kwargs):  # noqa: D401
        denial = self._require_superuser(request, f"create {self.basename.replace('-', ' ')}")
        if denial:
            return denial
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        denial = self._require_superuser(request, f"update {self.basename.replace('-', ' ')}")
        if denial:
            return denial
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, f"delete {self.basename.replace('-', ' ')}")
        if denial:
            return denial
        return super().destroy(request, *args, **kwargs)


class LoginView(APIView):
    """Handle user authentication."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        with open("api_debug.log", "a") as f:
            f.write(f"\n[{timezone.now()}] Login attempt for: {username}\n")

        try:
            user = UserAccount.objects.select_related("person").get(username=username)
        except UserAccount.DoesNotExist:
            with open("api_debug.log", "a") as f:
                f.write(f"User not found: {username}\n")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        password_hash = hash_password(password)
        if user.password_hash != password_hash:
            with open("api_debug.log", "a") as f:
                f.write(f"Password mismatch for user: {username}\n")
            user.failed_login_attempts += 1
            user.save(update_fields=["failed_login_attempts"])
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if user.account_status != "active":
            return Response({"error": "Account is not active"}, status=status.HTTP_403_FORBIDDEN)

        user.last_login = timezone.now()
        user.failed_login_attempts = 0
        user.save(update_fields=["last_login", "failed_login_attempts"])

        refresh = RefreshToken()
        refresh["user_id"] = user.user_id
        refresh["username"] = user.username
        refresh["is_superuser"] = user.is_superuser()

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserProfileSerializer(user).data,
            }
        )


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all().order_by("person_id")
    serializer_class = PersonSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Person.objects.all().order_by("person_id")
        is_approved = self.request.query_params.get("is_approved")
        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == "true")

        role = self.request.query_params.get("role")
        if role is not None:
            queryset = queryset.filter(personrolemapping__role__role_code=role).distinct()

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_person = Person.objects.order_by("-person_id").first()
        next_id = (last_person.person_id + 1) if last_person else 1
        person = Person.objects.create(person_id=next_id, **serializer.validated_data)
        return Response(PersonSerializer(person).data, status=status.HTTP_201_CREATED)


class AssetTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetType.objects.all().order_by("asset_type_id")
    serializer_class = AssetTypeSerializer


class AssetBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetBrand.objects.all().order_by("asset_brand_id")
    serializer_class = AssetBrandSerializer


class AssetModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetModel.objects.all().order_by("asset_model_id")
    serializer_class = AssetModelSerializer

    def get_queryset(self):
        queryset = AssetModel.objects.select_related("asset_brand", "asset_type").order_by("asset_model_id")
        asset_type_id = self.request.query_params.get("asset_type")
        if asset_type_id is not None:
            try:
                queryset = queryset.filter(asset_type_id=int(asset_type_id))
            except (ValueError, TypeError):
                pass
        return queryset


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by("asset_id")
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Asset.objects.select_related("asset_model").order_by("asset_id")
        asset_model_id = self.request.query_params.get("asset_model")
        if asset_model_id is not None:
            try:
                queryset = queryset.filter(asset_model_id=int(asset_model_id))
            except (ValueError, TypeError):
                pass
        return queryset


class AssetAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetAttributeDefinition.objects.all().order_by("asset_attribute_definition_id")
    serializer_class = AssetAttributeDefinitionSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create asset attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_def = AssetAttributeDefinition.objects.order_by("-asset_attribute_definition_id").first()
        next_id = (last_def.asset_attribute_definition_id + 1) if last_def else 1
        definition = AssetAttributeDefinition.objects.create(asset_attribute_definition_id=next_id, **serializer.validated_data)
        return Response(AssetAttributeDefinitionSerializer(definition).data, status=status.HTTP_201_CREATED)


class AssetTypeAttributeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetTypeAttribute.objects.all().order_by("asset_type_id", "asset_attribute_definition_id")
    serializer_class = AssetTypeAttributeSerializer

    def get_queryset(self):
        queryset = AssetTypeAttribute.objects.select_related("asset_attribute_definition", "asset_type")
        asset_type_id = self.request.query_params.get("asset_type")
        if asset_type_id is not None:
            try:
                queryset = queryset.filter(asset_type_id=int(asset_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete asset type attributes")
        if denial:
            return denial

        asset_type_id = request.query_params.get("asset_type")
        definition_id = request.query_params.get("asset_attribute_definition") or kwargs.get("pk")
        if asset_type_id:
            deleted, _ = AssetTypeAttribute.objects.filter(
                asset_type_id=asset_type_id,
                asset_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class AssetModelAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetModelAttributeValue.objects.all().order_by("asset_model_id", "asset_attribute_definition_id")
    serializer_class = AssetModelAttributeValueSerializer

    def get_queryset(self):
        queryset = AssetModelAttributeValue.objects.select_related("asset_attribute_definition", "asset_model")
        asset_model_id = self.request.query_params.get("asset_model")
        if asset_model_id is not None:
            try:
                queryset = queryset.filter(asset_model_id=int(asset_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete asset model attributes")
        if denial:
            return denial

        asset_model_id = request.query_params.get("asset_model")
        definition_id = request.query_params.get("asset_attribute_definition") or kwargs.get("pk")
        if asset_model_id:
            deleted, _ = AssetModelAttributeValue.objects.filter(
                asset_model_id=asset_model_id,
                asset_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class AssetAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetAttributeValue.objects.all().order_by("asset_id", "asset_attribute_definition_id")
    serializer_class = AssetAttributeValueSerializer

    def get_queryset(self):
        queryset = AssetAttributeValue.objects.select_related("asset_attribute_definition", "asset")
        asset_id = self.request.query_params.get("asset")
        if asset_id is not None:
            try:
                queryset = queryset.filter(asset_id=int(asset_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete asset attributes")
        if denial:
            return denial

        asset_id = request.query_params.get("asset")
        definition_id = request.query_params.get("asset_attribute_definition") or kwargs.get("pk")
        if asset_id:
            deleted, _ = AssetAttributeValue.objects.filter(
                asset_id=asset_id,
                asset_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class StockItemTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemType.objects.all().order_by("stock_item_type_id")
    serializer_class = StockItemTypeSerializer


class StockItemBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemBrand.objects.all().order_by("stock_item_brand_id")
    serializer_class = StockItemBrandSerializer


class StockItemModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemModel.objects.all().order_by("stock_item_model_id")
    serializer_class = StockItemModelSerializer

    def get_queryset(self):
        queryset = StockItemModel.objects.select_related("stock_item_brand", "stock_item_type").order_by("stock_item_model_id")
        stock_item_type_id = self.request.query_params.get("stock_item_type")
        if stock_item_type_id is not None:
            try:
                queryset = queryset.filter(stock_item_type_id=int(stock_item_type_id))
            except (ValueError, TypeError):
                pass
        return queryset


class StockItemViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItem.objects.all().order_by("stock_item_id")
    serializer_class = StockItemSerializer

    def get_queryset(self):
        queryset = StockItem.objects.select_related("stock_item_model").order_by("stock_item_id")
        stock_item_model_id = self.request.query_params.get("stock_item_model")
        if stock_item_model_id is not None:
            try:
                queryset = queryset.filter(stock_item_model_id=int(stock_item_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock items")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = StockItem.objects.order_by("-stock_item_id").first()
        next_id = (last_item.stock_item_id + 1) if last_item else 1
        item = StockItem.objects.create(stock_item_id=next_id, **serializer.validated_data)
        return Response(StockItemSerializer(item).data, status=status.HTTP_201_CREATED)


class StockItemAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemAttributeDefinition.objects.all().order_by("stock_item_attribute_definition_id")
    serializer_class = StockItemAttributeDefinitionSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock item attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_def = StockItemAttributeDefinition.objects.order_by("-stock_item_attribute_definition_id").first()
        next_id = (last_def.stock_item_attribute_definition_id + 1) if last_def else 1
        definition = StockItemAttributeDefinition.objects.create(
            stock_item_attribute_definition_id=next_id, **serializer.validated_data
        )
        return Response(StockItemAttributeDefinitionSerializer(definition).data, status=status.HTTP_201_CREATED)


class StockItemTypeAttributeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemTypeAttribute.objects.all().order_by("stock_item_type_id", "stock_item_attribute_definition_id")
    serializer_class = StockItemTypeAttributeSerializer

    def get_queryset(self):
        queryset = StockItemTypeAttribute.objects.select_related("stock_item_attribute_definition", "stock_item_type")
        stock_item_type_id = self.request.query_params.get("stock_item_type")
        if stock_item_type_id is not None:
            try:
                queryset = queryset.filter(stock_item_type_id=int(stock_item_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete stock item type attributes")
        if denial:
            return denial

        stock_item_type_id = request.query_params.get("stock_item_type")
        definition_id = request.query_params.get("stock_item_attribute_definition") or kwargs.get("pk")
        if stock_item_type_id:
            deleted, _ = StockItemTypeAttribute.objects.filter(
                stock_item_type_id=stock_item_type_id,
                stock_item_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class StockItemModelAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemModelAttributeValue.objects.all().order_by(
        "stock_item_model_id", "stock_item_attribute_definition_id"
    )
    serializer_class = StockItemModelAttributeValueSerializer

    def get_queryset(self):
        queryset = StockItemModelAttributeValue.objects.select_related(
            "stock_item_attribute_definition", "stock_item_model"
        )
        stock_item_model_id = self.request.query_params.get("stock_item_model")
        if stock_item_model_id is not None:
            try:
                queryset = queryset.filter(stock_item_model_id=int(stock_item_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete stock item model attributes")
        if denial:
            return denial

        stock_item_model_id = request.query_params.get("stock_item_model")
        definition_id = request.query_params.get("stock_item_attribute_definition") or kwargs.get("pk")
        if stock_item_model_id:
            deleted, _ = StockItemModelAttributeValue.objects.filter(
                stock_item_model_id=stock_item_model_id,
                stock_item_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class StockItemAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemAttributeValue.objects.all().order_by("stock_item_id", "stock_item_attribute_definition_id")
    serializer_class = StockItemAttributeValueSerializer

    def get_queryset(self):
        queryset = StockItemAttributeValue.objects.select_related("stock_item_attribute_definition", "stock_item")
        stock_item_id = self.request.query_params.get("stock_item")
        if stock_item_id is not None:
            try:
                queryset = queryset.filter(stock_item_id=int(stock_item_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete stock item attributes")
        if denial:
            return denial

        stock_item_id = request.query_params.get("stock_item")
        definition_id = request.query_params.get("stock_item_attribute_definition") or kwargs.get("pk")
        if stock_item_id:
            deleted, _ = StockItemAttributeValue.objects.filter(
                stock_item_id=stock_item_id,
                stock_item_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class ConsumableTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableType.objects.all().order_by("consumable_type_id")
    serializer_class = ConsumableTypeSerializer


class ConsumableBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableBrand.objects.all().order_by("consumable_brand_id")
    serializer_class = ConsumableBrandSerializer


class ConsumableModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableModel.objects.all().order_by("consumable_model_id")
    serializer_class = ConsumableModelSerializer

    def get_queryset(self):
        queryset = ConsumableModel.objects.select_related("consumable_brand", "consumable_type").order_by(
            "consumable_model_id"
        )
        consumable_type_id = self.request.query_params.get("consumable_type")
        if consumable_type_id is not None:
            try:
                queryset = queryset.filter(consumable_type_id=int(consumable_type_id))
            except (ValueError, TypeError):
                pass
        return queryset


class ConsumableViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Consumable.objects.all().order_by("consumable_id")
    serializer_class = ConsumableSerializer

    def get_queryset(self):
        queryset = Consumable.objects.select_related("consumable_model").order_by("consumable_id")
        consumable_model_id = self.request.query_params.get("consumable_model")
        if consumable_model_id is not None:
            try:
                queryset = queryset.filter(consumable_model_id=int(consumable_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumables")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = Consumable.objects.order_by("-consumable_id").first()
        next_id = (last_item.consumable_id + 1) if last_item else 1
        item = Consumable.objects.create(consumable_id=next_id, **serializer.validated_data)
        return Response(ConsumableSerializer(item).data, status=status.HTTP_201_CREATED)


class ConsumableAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableAttributeDefinition.objects.all().order_by("consumable_attribute_definition_id")
    serializer_class = ConsumableAttributeDefinitionSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumable attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_def = ConsumableAttributeDefinition.objects.order_by("-consumable_attribute_definition_id").first()
        next_id = (last_def.consumable_attribute_definition_id + 1) if last_def else 1
        definition = ConsumableAttributeDefinition.objects.create(
            consumable_attribute_definition_id=next_id, **serializer.validated_data
        )
        return Response(ConsumableAttributeDefinitionSerializer(definition).data, status=status.HTTP_201_CREATED)


class ConsumableTypeAttributeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableTypeAttribute.objects.all().order_by("consumable_type_id", "consumable_attribute_definition_id")
    serializer_class = ConsumableTypeAttributeSerializer

    def get_queryset(self):
        queryset = ConsumableTypeAttribute.objects.select_related("consumable_attribute_definition", "consumable_type")
        consumable_type_id = self.request.query_params.get("consumable_type")
        if consumable_type_id is not None:
            try:
                queryset = queryset.filter(consumable_type_id=int(consumable_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete consumable type attributes")
        if denial:
            return denial

        consumable_type_id = request.query_params.get("consumable_type")
        definition_id = request.query_params.get("consumable_attribute_definition") or kwargs.get("pk")
        if consumable_type_id:
            deleted, _ = ConsumableTypeAttribute.objects.filter(
                consumable_type_id=consumable_type_id,
                consumable_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class ConsumableModelAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableModelAttributeValue.objects.all().order_by("consumable_model_id", "consumable_attribute_definition_id")
    serializer_class = ConsumableModelAttributeValueSerializer

    def get_queryset(self):
        queryset = ConsumableModelAttributeValue.objects.select_related(
            "consumable_attribute_definition", "consumable_model"
        )
        consumable_model_id = self.request.query_params.get("consumable_model")
        if consumable_model_id is not None:
            try:
                queryset = queryset.filter(consumable_model_id=int(consumable_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete consumable model attributes")
        if denial:
            return denial

        consumable_model_id = request.query_params.get("consumable_model")
        definition_id = request.query_params.get("consumable_attribute_definition") or kwargs.get("pk")
        if consumable_model_id:
            deleted, _ = ConsumableModelAttributeValue.objects.filter(
                consumable_model_id=consumable_model_id,
                consumable_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class ConsumableAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableAttributeValue.objects.all().order_by("consumable_id", "consumable_attribute_definition_id")
    serializer_class = ConsumableAttributeValueSerializer

    def get_queryset(self):
        queryset = ConsumableAttributeValue.objects.select_related("consumable_attribute_definition", "consumable")
        consumable_id = self.request.query_params.get("consumable")
        if consumable_id is not None:
            try:
                queryset = queryset.filter(consumable_id=int(consumable_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete consumable attributes")
        if denial:
            return denial

        consumable_id = request.query_params.get("consumable")
        definition_id = request.query_params.get("consumable_attribute_definition") or kwargs.get("pk")
        if consumable_id:
            deleted, _ = ConsumableAttributeValue.objects.filter(
                consumable_id=consumable_id,
                consumable_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


# --- The rest of the module (rooms, positions, org structure, maintenance, my-items, problem reports)
# remains in the original codebase. If you need them refactored too, we can iterate.
