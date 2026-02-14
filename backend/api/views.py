from django.utils import timezone
from django.db import models
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import hashlib
import os

from .models import Person, UserAccount, PersonRoleMapping, AssetType, AssetBrand, AssetModel, StockItemType, StockItemBrand, StockItemModel, ConsumableType, ConsumableBrand, ConsumableModel, RoomType, Room, Position, OrganizationalStructure, OrganizationalStructureRelation, Asset, StockItem, Consumable, AssetIsAssignedToPerson, StockItemIsAssignedToPerson, ConsumableIsAssignedToPerson, PersonReportsProblemOnAsset, PersonReportsProblemOnStockItem, PersonReportsProblemOnConsumable, Maintenance, MaintenanceStep, MaintenanceTypicalStep
from .serializers import PersonSerializer, LoginSerializer, UserProfileSerializer, AssetTypeSerializer, AssetBrandSerializer, AssetModelSerializer, StockItemTypeSerializer, StockItemBrandSerializer, StockItemModelSerializer, ConsumableTypeSerializer, ConsumableBrandSerializer, ConsumableModelSerializer, RoomTypeSerializer, RoomSerializer, PositionSerializer, OrganizationalStructureSerializer, OrganizationalStructureRelationSerializer, MaintenanceTypicalStepSerializer, MaintenanceStepSerializer


def hash_password(password):
    """Hash password using SHA-512 to match existing database format"""
    return hashlib.sha512(password.encode()).hexdigest()


class LoginView(APIView):
    """Handle user authentication"""
    permission_classes = [AllowAny]
    authentication_classes = [] # Disable authentication for login endpoint to prevent stale token issues

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # Log for debugging (ensure sensitive data isn't logged in production)
        with open('api_debug.log', 'a') as f:
            f.write(f"\n[{timezone.now()}] Login attempt for: {username}\n")

        try:
            user = UserAccount.objects.select_related('person').get(username=username)
        except UserAccount.DoesNotExist:
            with open('api_debug.log', 'a') as f:
                f.write(f"User not found: {username}\n")
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check password (assuming SHA-512 hash in database)
        password_hash = hash_password(password)
        if user.password_hash != password_hash:
            with open('api_debug.log', 'a') as f:
                f.write(f"Password mismatch for user: {username}\n")
                f.write(f"Provided hash: {password_hash[:20]}...\n")
                f.write(f"DB hash:       {user.password_hash[:20]}...\n")
            
            # Increment failed login attempts
            user.failed_login_attempts += 1
            user.save(update_fields=['failed_login_attempts'])
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if account is active
        if user.account_status != 'active':
            with open('api_debug.log', 'a') as f:
                f.write(f"Account not active: {user.account_status}\n")
            return Response(
                {'error': 'Account is not active'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Update last login
        user.last_login = timezone.now()
        user.failed_login_attempts = 0
        user.save(update_fields=['last_login', 'failed_login_attempts'])

        # Generate JWT tokens manually to avoid PK name issues with SimpleJWT
        refresh = RefreshToken()
        refresh['user_id'] = user.user_id # Explicitly set user_id
        refresh['username'] = user.username
        refresh['is_superuser'] = user.is_superuser()

        with open('api_debug.log', 'a') as f:
            f.write(f"Login successful for: {username}\n")

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        })


class PersonViewSet(viewsets.ModelViewSet):
    """CRUD operations for Person model"""
    queryset = Person.objects.all().order_by('person_id')
    serializer_class = PersonSerializer
    permission_classes = [AllowAny] # Temporarily disable for debugging

    def get_queryset(self):
        """Optionally filter by is_approved status or role"""
        queryset = Person.objects.all().order_by('person_id')
        
        # Filter by is_approved status
        is_approved = self.request.query_params.get('is_approved', None)
        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
        
        # Filter by role
        role = self.request.query_params.get('role', None)
        if role is not None:
            queryset = queryset.filter(
                personrolemapping__role__role_code=role
            ).distinct()
        
        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new person"""
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api_debug.log')
        with open(log_path, 'a') as f:
            f.write(f"\n--- Create Person Request at {timezone.now()} ---\n")
            f.write(f"Data: {request.data}\n")
            f.write(f"Headers: {request.headers}\n")
            
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get the next person_id (since it's not auto-generated by PostgreSQL)
            last_person = Person.objects.order_by('-person_id').first()
            next_id = (last_person.person_id + 1) if last_person else 1
            
            with open(log_path, 'a') as f:
                f.write(f"Validated Data: {serializer.validated_data}\n")
                f.write(f"Calculated next_id: {next_id}\n")

            # Create person with explicit ID
            person = Person.objects.create(
                person_id=next_id,
                **serializer.validated_data
            )
            
            with open(log_path, 'a') as f:
                f.write(f"Successfully created person ID: {person.person_id}\n")

            return Response(
                PersonSerializer(person).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            with open(log_path, 'a') as f:
                f.write(f"ERROR creating person: {str(e)}\n")
            raise


class AssetTypeViewSet(viewsets.ModelViewSet):
    """CRUD operations for AssetType model"""
    queryset = AssetType.objects.all().order_by('asset_type_id')
    serializer_class = AssetTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all asset types"""
        return AssetType.objects.all().order_by('asset_type_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            # Try to get user_id from token claims
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        # Fallback: try to get from username if available
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new asset type - only superusers can create"""
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api_debug.log')
        
        try:
            with open(log_path, 'a') as f:
                f.write(f"\n--- Create Asset Type Request ---\n")
                f.write(f"Data: {request.data}\n")
            
            user_account = self._get_user_account(request)
            
            if not user_account:
                with open(log_path, 'a') as f:
                    f.write(f"User account not found\n")
                return Response(
                    {'error': 'User account not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not user_account.is_superuser():
                with open(log_path, 'a') as f:
                    f.write(f"User {user_account.username} is not superuser\n")
                return Response(
                    {'error': 'Only superusers can create asset types'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get the next asset_type_id (since it's not auto-generated in PostgreSQL)
            last_asset_type = AssetType.objects.order_by('-asset_type_id').first()
            next_id = (last_asset_type.asset_type_id + 1) if last_asset_type else 1
            
            with open(log_path, 'a') as f:
                f.write(f"Calculated next asset_type_id: {next_id}\n")
            
            # Create asset type with explicit ID
            asset_type = AssetType.objects.create(
                asset_type_id=next_id,
                **serializer.validated_data
            )
            
            with open(log_path, 'a') as f:
                f.write(f"Successfully created asset type ID: {asset_type.asset_type_id}\n")
            
            return Response(
                AssetTypeSerializer(asset_type).data,
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            with open(log_path, 'a') as f:
                f.write(f"ERROR creating asset type: {str(e)}\n")
                import traceback
                f.write(f"Traceback: {traceback.format_exc()}\n")
            raise

    def update(self, request, *args, **kwargs):
        """Update asset type - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account:
            return Response(
                {'error': 'User account not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update asset types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete asset type - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account:
            return Response(
                {'error': 'User account not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete asset types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class AssetBrandViewSet(viewsets.ModelViewSet):
    """CRUD operations for AssetBrand model"""
    queryset = AssetBrand.objects.all().order_by('asset_brand_id')
    serializer_class = AssetBrandSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all asset brands"""
        return AssetBrand.objects.all().order_by('asset_brand_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new asset brand - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create asset brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next asset_brand_id
        last_brand = AssetBrand.objects.order_by('-asset_brand_id').first()
        next_id = (last_brand.asset_brand_id + 1) if last_brand else 1
        
        brand = AssetBrand.objects.create(asset_brand_id=next_id, **serializer.validated_data)
        return Response(AssetBrandSerializer(brand).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update asset brand - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update asset brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete asset brand - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete asset brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class AssetModelViewSet(viewsets.ModelViewSet):
    """CRUD operations for AssetModel model"""
    queryset = AssetModel.objects.all().order_by('asset_model_id')
    serializer_class = AssetModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all asset models, optionally filtered by asset_type"""
        queryset = AssetModel.objects.select_related('asset_brand', 'asset_type').order_by('asset_model_id')
        asset_type_id = self.request.query_params.get('asset_type', None)
        if asset_type_id is not None:
            try:
                asset_type_id = int(asset_type_id)
                queryset = queryset.filter(asset_type_id=asset_type_id)
            except (ValueError, TypeError):
                pass
        return queryset

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new asset model - only superusers can create"""
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api_debug.log')
        
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create asset models'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with open(log_path, 'a') as f:
                f.write(f"\n--- Create Asset Model Request ---\n")
                f.write(f"Data: {request.data}\n")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                with open(log_path, 'a') as f:
                    f.write(f"Serializer errors: {serializer.errors}\n")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the next asset_model_id
            last_model = AssetModel.objects.order_by('-asset_model_id').first()
            next_id = (last_model.asset_model_id + 1) if last_model else 1
            
            with open(log_path, 'a') as f:
                f.write(f"Calculated next asset_model_id: {next_id}\n")
            
            model = AssetModel.objects.create(asset_model_id=next_id, **serializer.validated_data)
            
            with open(log_path, 'a') as f:
                f.write(f"Successfully created asset model ID: {model.asset_model_id}\n")
            
            return Response(AssetModelSerializer(model).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            with open(log_path, 'a') as f:
                f.write(f"ERROR creating asset model: {str(e)}\n")
                import traceback
                f.write(f"Traceback: {traceback.format_exc()}\n")
            raise

    def update(self, request, *args, **kwargs):
        """Update asset model - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update asset models'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete asset model - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete asset models'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class StockItemTypeViewSet(viewsets.ModelViewSet):
    """CRUD operations for StockItemType model"""
    queryset = StockItemType.objects.all().order_by('stock_item_type_id')
    serializer_class = StockItemTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all stock item types"""
        return StockItemType.objects.all().order_by('stock_item_type_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new stock item type - only superusers can create"""
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api_debug.log')
        
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create stock item types'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with open(log_path, 'a') as f:
                f.write(f"\n--- Create Stock Item Type Request ---\n")
                f.write(f"Data: {request.data}\n")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                with open(log_path, 'a') as f:
                    f.write(f"Serializer errors: {serializer.errors}\n")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the next stock_item_type_id
            last_type = StockItemType.objects.order_by('-stock_item_type_id').first()
            next_id = (last_type.stock_item_type_id + 1) if last_type else 1
            
            with open(log_path, 'a') as f:
                f.write(f"Calculated next stock_item_type_id: {next_id}\n")
            
            stock_item_type = StockItemType.objects.create(stock_item_type_id=next_id, **serializer.validated_data)
            
            with open(log_path, 'a') as f:
                f.write(f"Successfully created stock item type ID: {stock_item_type.stock_item_type_id}\n")
            
            return Response(StockItemTypeSerializer(stock_item_type).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            with open(log_path, 'a') as f:
                f.write(f"ERROR creating stock item type: {str(e)}\n")
                import traceback
                f.write(f"Traceback: {traceback.format_exc()}\n")
            raise

    def update(self, request, *args, **kwargs):
        """Update stock item type - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update stock item types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete stock item type - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete stock item types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class StockItemBrandViewSet(viewsets.ModelViewSet):
    """CRUD operations for StockItemBrand model"""
    queryset = StockItemBrand.objects.all().order_by('stock_item_brand_id')
    serializer_class = StockItemBrandSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all stock item brands"""
        return StockItemBrand.objects.all().order_by('stock_item_brand_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new stock item brand - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create stock item brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next stock_item_brand_id
        last_brand = StockItemBrand.objects.order_by('-stock_item_brand_id').first()
        next_id = (last_brand.stock_item_brand_id + 1) if last_brand else 1
        
        brand = StockItemBrand.objects.create(stock_item_brand_id=next_id, **serializer.validated_data)
        return Response(StockItemBrandSerializer(brand).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update stock item brand - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update stock item brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete stock item brand - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete stock item brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class StockItemModelViewSet(viewsets.ModelViewSet):
    """CRUD operations for StockItemModel model"""
    queryset = StockItemModel.objects.all().order_by('stock_item_model_id')
    serializer_class = StockItemModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all stock item models, optionally filtered by stock_item_type"""
        queryset = StockItemModel.objects.select_related('stock_item_brand', 'stock_item_type').order_by('stock_item_model_id')
        stock_item_type_id = self.request.query_params.get('stock_item_type', None)
        if stock_item_type_id is not None:
            try:
                stock_item_type_id = int(stock_item_type_id)
                queryset = queryset.filter(stock_item_type_id=stock_item_type_id)
            except (ValueError, TypeError):
                pass
        return queryset

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new stock item model - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create stock item models'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next stock_item_model_id
        last_model = StockItemModel.objects.order_by('-stock_item_model_id').first()
        next_id = (last_model.stock_item_model_id + 1) if last_model else 1
        
        model = StockItemModel.objects.create(stock_item_model_id=next_id, **serializer.validated_data)
        return Response(StockItemModelSerializer(model).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update stock item model - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update stock item models'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete stock item model - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete stock item models'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class ConsumableTypeViewSet(viewsets.ModelViewSet):
    """CRUD operations for ConsumableType model"""
    queryset = ConsumableType.objects.all().order_by('consumable_type_id')
    serializer_class = ConsumableTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all consumable types"""
        return ConsumableType.objects.all().order_by('consumable_type_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new consumable type - only superusers can create"""
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api_debug.log')
        
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create consumable types'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with open(log_path, 'a') as f:
                f.write(f"\n--- Create Consumable Type Request ---\n")
                f.write(f"Data: {request.data}\n")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                with open(log_path, 'a') as f:
                    f.write(f"Serializer errors: {serializer.errors}\n")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the next consumable_type_id
            last_type = ConsumableType.objects.order_by('-consumable_type_id').first()
            next_id = (last_type.consumable_type_id + 1) if last_type else 1
            
            with open(log_path, 'a') as f:
                f.write(f"Calculated next consumable_type_id: {next_id}\n")
            
            consumable_type = ConsumableType.objects.create(consumable_type_id=next_id, **serializer.validated_data)
            
            with open(log_path, 'a') as f:
                f.write(f"Successfully created consumable type ID: {consumable_type.consumable_type_id}\n")
            
            return Response(ConsumableTypeSerializer(consumable_type).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            with open(log_path, 'a') as f:
                f.write(f"ERROR creating consumable type: {str(e)}\n")
                import traceback
                f.write(f"Traceback: {traceback.format_exc()}\n")
            raise

    def update(self, request, *args, **kwargs):
        """Update consumable type - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update consumable types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete consumable type - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete consumable types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class ConsumableBrandViewSet(viewsets.ModelViewSet):
    """CRUD operations for ConsumableBrand model"""
    queryset = ConsumableBrand.objects.all().order_by('consumable_brand_id')
    serializer_class = ConsumableBrandSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all consumable brands"""
        return ConsumableBrand.objects.all().order_by('consumable_brand_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new consumable brand - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create consumable brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next consumable_brand_id
        last_brand = ConsumableBrand.objects.order_by('-consumable_brand_id').first()
        next_id = (last_brand.consumable_brand_id + 1) if last_brand else 1
        
        brand = ConsumableBrand.objects.create(consumable_brand_id=next_id, **serializer.validated_data)
        return Response(ConsumableBrandSerializer(brand).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update consumable brand - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update consumable brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete consumable brand - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete consumable brands'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class ConsumableModelViewSet(viewsets.ModelViewSet):
    """CRUD operations for ConsumableModel model"""
    queryset = ConsumableModel.objects.all().order_by('consumable_model_id')
    serializer_class = ConsumableModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all consumable models, optionally filtered by consumable_type"""
        queryset = ConsumableModel.objects.select_related('consumable_brand', 'consumable_type').order_by('consumable_model_id')
        consumable_type_id = self.request.query_params.get('consumable_type', None)
        if consumable_type_id is not None:
            try:
                consumable_type_id = int(consumable_type_id)
                queryset = queryset.filter(consumable_type_id=consumable_type_id)
            except (ValueError, TypeError):
                pass
        return queryset

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new consumable model - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create consumable models'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next consumable_model_id
        last_model = ConsumableModel.objects.order_by('-consumable_model_id').first()
        next_id = (last_model.consumable_model_id + 1) if last_model else 1
        
        model = ConsumableModel.objects.create(consumable_model_id=next_id, **serializer.validated_data)
        return Response(ConsumableModelSerializer(model).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update consumable model - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update consumable models'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete consumable model - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete consumable models'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class RoomTypeViewSet(viewsets.ModelViewSet):
    """CRUD operations for RoomType model"""
    queryset = RoomType.objects.all().order_by('room_type_id')
    serializer_class = RoomTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all room types"""
        return RoomType.objects.all().order_by('room_type_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new room type - only superusers can create"""
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api_debug.log')
        
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create room types'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with open(log_path, 'a') as f:
                f.write(f"\n--- Create Room Type Request ---\n")
                f.write(f"Data: {request.data}\n")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                with open(log_path, 'a') as f:
                    f.write(f"Serializer errors: {serializer.errors}\n")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the next room_type_id
            last_type = RoomType.objects.order_by('-room_type_id').first()
            next_id = (last_type.room_type_id + 1) if last_type else 1
            
            with open(log_path, 'a') as f:
                f.write(f"Calculated next room_type_id: {next_id}\n")
            
            room_type = RoomType.objects.create(room_type_id=next_id, **serializer.validated_data)
            
            with open(log_path, 'a') as f:
                f.write(f"Successfully created room type ID: {room_type.room_type_id}\n")
            
            return Response(RoomTypeSerializer(room_type).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            with open(log_path, 'a') as f:
                f.write(f"ERROR creating room type: {str(e)}\n")
                import traceback
                f.write(f"Traceback: {traceback.format_exc()}\n")
            raise

    def update(self, request, *args, **kwargs):
        """Update room type - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update room types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete room type - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete room types'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class RoomViewSet(viewsets.ModelViewSet):
    """CRUD operations for Room model"""
    queryset = Room.objects.all().order_by('room_id')
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all rooms"""
        return Room.objects.all().order_by('room_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def create(self, request, *args, **kwargs):
        """Create a new room - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create rooms'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next room_id
        last_room = Room.objects.order_by('-room_id').first()
        next_id = (last_room.room_id + 1) if last_room else 1
        
        room = Room.objects.create(room_id=next_id, **serializer.validated_data)
        return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update room - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update rooms'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete room - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete rooms'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class PositionViewSet(viewsets.ModelViewSet):
    """CRUD operations for Position model"""
    queryset = Position.objects.all().order_by('position_id')
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all positions"""
        return Position.objects.all().order_by('position_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token or request.user"""
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
             if isinstance(request.user, UserAccount):
                 return request.user

        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        return None

    def create(self, request, *args, **kwargs):
        """Create position - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create positions'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next position_id
        last_position = Position.objects.order_by('-position_id').first()
        next_id = (last_position.position_id + 1) if last_position else 1
        
        position = Position.objects.create(position_id=next_id, **serializer.validated_data)
        return Response(PositionSerializer(position).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update position - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update positions'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete position - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete positions'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class OrganizationalStructureViewSet(viewsets.ModelViewSet):
    """CRUD operations for OrganizationalStructure model"""
    queryset = OrganizationalStructure.objects.all().order_by('organizational_structure_id')
    serializer_class = OrganizationalStructureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all organizational structures"""
        return OrganizationalStructure.objects.all().order_by('organizational_structure_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token or request.user"""
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
             if isinstance(request.user, UserAccount):
                 return request.user

        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        return None

    def create(self, request, *args, **kwargs):
        """Create organizational structure - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create organizational structures'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next organizational_structure_id
        last_org_struct = OrganizationalStructure.objects.order_by('-organizational_structure_id').first()
        next_id = (last_org_struct.organizational_structure_id + 1) if last_org_struct else 1
        
        org_structure = OrganizationalStructure.objects.create(
            organizational_structure_id=next_id,
            **serializer.validated_data
        )
        return Response(OrganizationalStructureSerializer(org_structure).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update organizational structure - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update organizational structures'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete organizational structure - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete organizational structures'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class PositionViewSet(viewsets.ModelViewSet):
    """CRUD operations for Position model"""
    queryset = Position.objects.all().order_by('position_id')
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all positions"""
        return Position.objects.all().order_by('position_id')

    def _get_user_account(self, request):
        """Extract user account from JWT token or request.user"""
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
             if isinstance(request.user, UserAccount):
                 return request.user

        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        return None

    def create(self, request, *args, **kwargs):
        """Create position - only superusers can create"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create positions'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the next position_id
        last_position = Position.objects.order_by('-position_id').first()
        next_id = (last_position.position_id + 1) if last_position else 1
        
        position = Position.objects.create(position_id=next_id, **serializer.validated_data)
        return Response(PositionSerializer(position).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update position - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update positions'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete position - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete positions'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

class OrganizationalStructureRelationViewSet(viewsets.ModelViewSet):
    """CRUD operations for OrganizationalStructureRelation model"""
    queryset = OrganizationalStructureRelation.objects.all()
    serializer_class = OrganizationalStructureRelationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all organizational structure relations"""
        org_structure_id = self.request.query_params.get('org_structure_id')
        if org_structure_id:
            # Get both parent and child relationships for a specific organization
            return OrganizationalStructureRelation.objects.filter(
                organizational_structure_id=org_structure_id
            ) | OrganizationalStructureRelation.objects.filter(
                parent_organizational_structure_id=org_structure_id
            )
        return OrganizationalStructureRelation.objects.all()

    def _get_user_account(self, request):
        """Extract user account from JWT token or request.user"""
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
             if isinstance(request.user, UserAccount):
                 return request.user

        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        return None

    def create(self, request, *args, **kwargs):
        """Create organizational structure relation - only superusers can create"""
        log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'api_debug.log')
        
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create organizational structure relations'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            with open(log_path, 'a') as f:
                f.write(f"\n--- Create Relation Request ---\n")
                f.write(f"Data: {request.data}\n")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                with open(log_path, 'a') as f:
                    f.write(f"Serializer errors: {serializer.errors}\n")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # The custom create() method in the serializer handles the manual PK saving
            relation = serializer.save()
            
            with open(log_path, 'a') as f:
                f.write(f"Successfully created relation: {relation}\n")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            with open(log_path, 'a') as f:
                f.write(f"ERROR creating relation: {str(e)}\n")
                import traceback
                f.write(f"Traceback: {traceback.format_exc()}\n")
            raise

    def update(self, request, *args, **kwargs):
        """Update organizational structure relation - only superusers can update"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can update organizational structure relations'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete organizational structure relation - only superusers can delete"""
        user_account = self._get_user_account(request)
        
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can delete organizational structure relations'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class MaintenanceViewSet(viewsets.ModelViewSet):
    """CRUD operations for Maintenance model"""
    queryset = Maintenance.objects.all().order_by('-maintenance_id')
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        """Extract user account from JWT token or request.user"""
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
             if isinstance(request.user, UserAccount):
                 return request.user

        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        return None

    def get_queryset(self):
        """Filter maintenance records based on user role"""
        user_account = self._get_user_account(self.request)
        
        if not user_account:
            return Maintenance.objects.none()

        person = user_account.person
        is_chief = user_account.is_superuser() or PersonRoleMapping.objects.filter(
            person=person,
            role__role_code__in=['maintenance_chief', 'exploitation_chief']
        ).exists()

        if is_chief:
            # Chiefs see all maintenance records
            return Maintenance.objects.all().select_related('asset', 'performed_by_person', 'approved_by_maintenance_chief').order_by('-maintenance_id')
        else:
            # Technicians see maintenances they are assigned to (performed_by_person)
            # OR maintenances where they are assigned to at least one maintenance step
            from django.db.models import Q
            step_maintenance_ids = MaintenanceStep.objects.filter(
                person=person
            ).values_list('maintenance_id', flat=True)
            return Maintenance.objects.filter(
                Q(performed_by_person=person) | Q(maintenance_id__in=step_maintenance_ids)
            ).select_related('asset', 'performed_by_person', 'approved_by_maintenance_chief').order_by('-maintenance_id').distinct()

    def list(self, request, *args, **kwargs):
        """Override list to return custom format"""
        queryset = self.get_queryset()
        
        maintenances = []
        for maintenance in queryset:
            # Get maintenance steps for this maintenance
            steps = MaintenanceStep.objects.filter(maintenance=maintenance).order_by('maintenance_step_id')
            
            # Calculate maintenance status based on steps
            status = 'pending'  # default status
            if steps.exists():
                step_count = steps.count()
                completed_steps = steps.filter(is_successful=True).count()
                failed_steps = steps.filter(is_successful=False).count()
                
                if failed_steps > 0:
                    status = 'failed'
                elif completed_steps == step_count:
                    status = 'completed'
                elif completed_steps > 0:
                    status = 'in-progress'
            
            maintenances.append({
                'maintenance_id': maintenance.maintenance_id,
                'asset_id': maintenance.asset.asset_id,
                'asset_name': maintenance.asset.asset_name or f'Asset {maintenance.asset.asset_id}',
                'performed_by_person': maintenance.performed_by_person.person_id,
                'performed_by_person_name': f"{maintenance.performed_by_person.first_name} {maintenance.performed_by_person.last_name}",
                'approved_by_maintenance_chief': maintenance.approved_by_maintenance_chief.person_id,
                'is_approved_by_maintenance_chief': maintenance.is_approved_by_maintenance_chief,
                'start_datetime': maintenance.start_datetime,
                'end_datetime': maintenance.end_datetime,
                'description': maintenance.description,
                'is_successful': maintenance.is_successful,
                'status': status,
                'step_count': steps.count(),
            })

        return Response(maintenances)

    def retrieve(self, request, *args, **kwargs):
        """Get a single maintenance record"""
        maintenance = self.get_object()
        
        # Get maintenance steps
        steps = MaintenanceStep.objects.filter(maintenance=maintenance).order_by('maintenance_step_id')
        
        # Calculate status based on steps
        status = 'pending'
        if steps.exists():
            step_count = steps.count()
            completed_steps = steps.filter(is_successful=True).count()
            failed_steps = steps.filter(is_successful=False).count()
            
            if failed_steps > 0:
                status = 'failed'
            elif completed_steps == step_count:
                status = 'completed'
            elif completed_steps > 0:
                status = 'in-progress'
        
        return Response({
            'maintenance_id': maintenance.maintenance_id,
            'asset_id': maintenance.asset.asset_id,
            'asset_name': maintenance.asset.asset_name or f'Asset {maintenance.asset.asset_id}',
            'performed_by_person': maintenance.performed_by_person.person_id,
            'performed_by_person_name': f"{maintenance.performed_by_person.first_name} {maintenance.performed_by_person.last_name}",
            'approved_by_maintenance_chief': maintenance.approved_by_maintenance_chief.person_id,
            'is_approved_by_maintenance_chief': maintenance.is_approved_by_maintenance_chief,
            'start_datetime': maintenance.start_datetime,
            'end_datetime': maintenance.end_datetime,
            'description': maintenance.description,
            'is_successful': maintenance.is_successful,
            'status': status,
            'step_count': steps.count(),
        })

    def update(self, request, *args, **kwargs):
        """Update maintenance record"""
        user_account = self._get_user_account(request)
        
        if not user_account:
            return Response(
                {'error': 'Could not identify user'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        maintenance = self.get_object()
        person = user_account.person
        
        # Only chiefs can update maintenance, or the assigned technician can update their own
        is_chief = user_account.is_superuser() or PersonRoleMapping.objects.filter(
            person=person,
            role__role_code__in=['maintenance_chief', 'exploitation_chief']
        ).exists()
        
        is_assigned_technician = maintenance.performed_by_person == person

        if not (is_chief or is_assigned_technician):
            return Response(
                {'error': 'You do not have permission to update this maintenance record'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Update allowed fields
        if 'performed_by_person' in request.data and is_chief:
            maintenance.performed_by_person_id = request.data['performed_by_person']
        if 'is_approved_by_maintenance_chief' in request.data and is_chief:
            maintenance.is_approved_by_maintenance_chief = request.data['is_approved_by_maintenance_chief']
        if 'start_datetime' in request.data:
            maintenance.start_datetime = request.data['start_datetime']
        if 'end_datetime' in request.data:
            maintenance.end_datetime = request.data['end_datetime']
        if 'description' in request.data:
            maintenance.description = request.data['description']
        if 'is_successful' in request.data:
            maintenance.is_successful = request.data['is_successful']

        maintenance.save()

        # Get maintenance steps for status
        steps = MaintenanceStep.objects.filter(maintenance=maintenance).order_by('maintenance_step_id')
        
        # Calculate status based on steps
        status_value = 'pending'
        if steps.exists():
            step_count = steps.count()
            completed_steps = steps.filter(is_successful=True).count()
            failed_steps = steps.filter(is_successful=False).count()
            
            if failed_steps > 0:
                status_value = 'failed'
            elif completed_steps == step_count:
                status_value = 'completed'
            elif completed_steps > 0:
                status_value = 'in-progress'

        return Response({
            'maintenance_id': maintenance.maintenance_id,
            'asset_id': maintenance.asset.asset_id,
            'asset_name': maintenance.asset.asset_name or f'Asset {maintenance.asset.asset_id}',
            'performed_by_person': maintenance.performed_by_person.person_id,
            'performed_by_person_name': f"{maintenance.performed_by_person.first_name} {maintenance.performed_by_person.last_name}",
            'approved_by_maintenance_chief': maintenance.approved_by_maintenance_chief.person_id,
            'is_approved_by_maintenance_chief': maintenance.is_approved_by_maintenance_chief,
            'start_datetime': maintenance.start_datetime,
            'end_datetime': maintenance.end_datetime,
            'description': maintenance.description,
            'is_successful': maintenance.is_successful,
            'status': status_value,
            'step_count': steps.count(),
        })


class MyItemsView(APIView):
    """View to get all items assigned to the current user"""
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            # Try to get user_id from token claims
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        # Fallback: try to get from username if available
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def get(self, request):
        """Get all items assigned to the current user"""
        user_account = self._get_user_account(request)
        
        if not user_account:
            return Response(
                {'error': 'Could not identify user'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        person = user_account.person

        # Get current asset assignments (is_active = true)
        current_assets = AssetIsAssignedToPerson.objects.filter(
            person=person,
            is_active=True
        ).select_related('asset', 'asset__asset_model')

        # Get asset history (is_active = false)
        asset_history = AssetIsAssignedToPerson.objects.filter(
            person=person,
            is_active=False
        ).select_related('asset', 'asset__asset_model')

        # Get current stock item assignments
        current_stock_items = StockItemIsAssignedToPerson.objects.filter(
            person=person,
            is_active=True
        ).select_related('stock_item', 'stock_item__stock_item_model')

        # Get stock item history
        stock_item_history = StockItemIsAssignedToPerson.objects.filter(
            person=person,
            is_active=False
        ).select_related('stock_item', 'stock_item__stock_item_model')

        # Get current consumable assignments
        current_consumables = ConsumableIsAssignedToPerson.objects.filter(
            person=person,
            is_active=True
        ).select_related('consumable', 'consumable__consumable_model')

        # Get consumable history
        consumable_history = ConsumableIsAssignedToPerson.objects.filter(
            person=person,
            is_active=False
        ).select_related('consumable', 'consumable__consumable_model')

        # Serialize the data
        asset_current_data = [
            {
                'asset_id': a.asset.asset_id,
                'asset_name': a.asset.asset_name,
                'asset_status': a.asset.asset_status,
                'asset_inventory_number': a.asset.asset_inventory_number,
                'asset_serial_number': a.asset.asset_serial_number,
            }
            for a in current_assets
        ]

        asset_history_data = [
            {
                'assignment_id': a.assignment_id,
                'start_datetime': a.start_datetime,
                'end_datetime': a.end_datetime,
                'condition_on_assignment': a.condition_on_assignment,
                'asset': {
                    'asset_id': a.asset.asset_id,
                    'asset_name': a.asset.asset_name,
                }
            }
            for a in asset_history
        ]

        stock_item_current_data = [
            {
                'stock_item_id': s.stock_item.stock_item_id,
                'stock_item_name': s.stock_item.stock_item_name,
                'stock_item_status': s.stock_item.stock_item_status,
                'stock_item_inventory_number': s.stock_item.stock_item_inventory_number,
            }
            for s in current_stock_items
        ]

        stock_item_history_data = [
            {
                'assignment_id': s.assignment_id,
                'start_datetime': s.start_datetime,
                'end_datetime': s.end_datetime,
                'condition_on_assignment': s.condition_on_assignment,
                'stock_item': {
                    'stock_item_id': s.stock_item.stock_item_id,
                    'stock_item_name': s.stock_item.stock_item_name,
                }
            }
            for s in stock_item_history
        ]

        consumable_current_data = [
            {
                'consumable_id': c.consumable.consumable_id,
                'consumable_name': c.consumable.consumable_name,
                'consumable_status': c.consumable.consumable_status,
                'consumable_inventory_number': c.consumable.consumable_inventory_number,
                'consumable_serial_number': c.consumable.consumable_serial_number,
            }
            for c in current_consumables
        ]

        consumable_history_data = [
            {
                'assignment_id': c.assignment_id,
                'start_datetime': c.start_datetime,
                'end_datetime': c.end_datetime,
                'condition_on_assignment': c.condition_on_assignment,
                'consumable': {
                    'consumable_id': c.consumable.consumable_id,
                    'consumable_name': c.consumable.consumable_name,
                }
            }
            for c in consumable_history
        ]

        return Response({
            'assets': {
                'current': asset_current_data,
                'history': asset_history_data,
            },
            'stock_items': {
                'current': stock_item_current_data,
                'history': stock_item_history_data,
            },
            'consumables': {
                'current': consumable_current_data,
                'history': consumable_history_data,
            }
        })


class ProblemReportView(APIView):
    """View to handle problem reports for items (assets, stock items, consumables)"""
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            # Try to get user_id from token claims
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        # Fallback: try to get from username if available
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def get(self, request):
        """Get problem reports - all reports for maintenance chiefs/superusers, personal reports for others"""
        user_account = self._get_user_account(request)
        
        if not user_account:
            return Response(
                {'error': 'Could not identify user'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        person = user_account.person
        is_chief = user_account.is_superuser() or PersonRoleMapping.objects.filter(
            person=person,
            role__role_code__in=['maintenance_chief', 'exploitation_chief']
        ).exists()

        # Collect all reports
        all_reports = []

        if is_chief:
            # Maintenance chief sees all reports
            asset_reports = PersonReportsProblemOnAsset.objects.all().select_related('asset', 'person')
            for report in asset_reports:
                all_reports.append({
                    'report_id': report.report_id,
                    'item_type': 'asset',
                    'item_id': report.asset.asset_id,
                    'person_id': report.person.person_id,
                    'person_name': f"{report.person.first_name} {report.person.last_name}",
                    'report_datetime': report.report_datetime,
                    'owner_observation': report.owner_observation,
                })

            stock_item_reports = PersonReportsProblemOnStockItem.objects.all().select_related('stock_item', 'person')
            for report in stock_item_reports:
                all_reports.append({
                    'report_id': report.report_id,
                    'item_type': 'stock_item',
                    'item_id': report.stock_item.stock_item_id,
                    'person_id': report.person.person_id,
                    'person_name': f"{report.person.first_name} {report.person.last_name}",
                    'report_datetime': report.report_datetime,
                    'owner_observation': report.owner_observation,
                })

            consumable_reports = PersonReportsProblemOnConsumable.objects.all().select_related('consumable', 'person')
            for report in consumable_reports:
                all_reports.append({
                    'report_id': report.report_id,
                    'item_type': 'consumable',
                    'item_id': report.consumable.consumable_id,
                    'person_id': report.person.person_id,
                    'person_name': f"{report.person.first_name} {report.person.last_name}",
                    'report_datetime': report.report_datetime,
                    'owner_observation': report.owner_observation,
                })
        else:
            # Regular users see only their own reports
            asset_reports = PersonReportsProblemOnAsset.objects.filter(person=person).select_related('asset')
            for report in asset_reports:
                all_reports.append({
                    'report_id': report.report_id,
                    'item_type': 'asset',
                    'item_id': report.asset.asset_id,
                    'person_id': report.person.person_id,
                    'person_name': f"{person.first_name} {person.last_name}",
                    'report_datetime': report.report_datetime,
                    'owner_observation': report.owner_observation,
                })

            stock_item_reports = PersonReportsProblemOnStockItem.objects.filter(person=person).select_related('stock_item')
            for report in stock_item_reports:
                all_reports.append({
                    'report_id': report.report_id,
                    'item_type': 'stock_item',
                    'item_id': report.stock_item.stock_item_id,
                    'person_id': report.person.person_id,
                    'person_name': f"{person.first_name} {person.last_name}",
                    'report_datetime': report.report_datetime,
                    'owner_observation': report.owner_observation,
                })

            consumable_reports = PersonReportsProblemOnConsumable.objects.filter(person=person).select_related('consumable')
            for report in consumable_reports:
                all_reports.append({
                    'report_id': report.report_id,
                    'item_type': 'consumable',
                    'item_id': report.consumable.consumable_id,
                    'person_id': report.person.person_id,
                    'person_name': f"{person.first_name} {person.last_name}",
                    'report_datetime': report.report_datetime,
                    'owner_observation': report.owner_observation,
                })

        # Sort by report_datetime descending (newest first)
        all_reports.sort(key=lambda x: x['report_datetime'], reverse=True)

        return Response(all_reports)

    def post(self, request):
        """Create a new problem report"""
        user_account = self._get_user_account(request)
        
        if not user_account:
            return Response(
                {'error': 'Could not identify user'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        person = user_account.person
        item_type = request.data.get('item_type')
        item_id = request.data.get('item_id')
        owner_observation = request.data.get('owner_observation', '')

        if not item_type or not item_id:
            return Response(
                {'error': 'item_type and item_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Helper function to get next report_id
            def get_next_report_id(model_class):
                max_id = model_class.objects.aggregate(models.Max('report_id'))['report_id__max']
                return (max_id or 0) + 1
            
            if item_type == 'asset':
                asset = Asset.objects.get(asset_id=item_id)
                next_id = get_next_report_id(PersonReportsProblemOnAsset)
                report = PersonReportsProblemOnAsset.objects.create(
                    report_id=next_id,
                    asset=asset,
                    person=person,
                    report_datetime=timezone.now(),
                    owner_observation=owner_observation
                )
                return Response(
                    {'report_id': report.report_id, 'message': 'Asset problem report created successfully'},
                    status=status.HTTP_201_CREATED
                )
            
            elif item_type == 'stock_item':
                stock_item = StockItem.objects.get(stock_item_id=item_id)
                next_id = get_next_report_id(PersonReportsProblemOnStockItem)
                report = PersonReportsProblemOnStockItem.objects.create(
                    report_id=next_id,
                    stock_item=stock_item,
                    person=person,
                    report_datetime=timezone.now(),
                    owner_observation=owner_observation
                )
                return Response(
                    {'report_id': report.report_id, 'message': 'Stock item problem report created successfully'},
                    status=status.HTTP_201_CREATED
                )
            
            elif item_type == 'consumable':
                consumable = Consumable.objects.get(consumable_id=item_id)
                next_id = get_next_report_id(PersonReportsProblemOnConsumable)
                report = PersonReportsProblemOnConsumable.objects.create(
                    report_id=next_id,
                    consumable=consumable,
                    person=person,
                    report_datetime=timezone.now(),
                    owner_observation=owner_observation
                )
                return Response(
                    {'report_id': report.report_id, 'message': 'Consumable problem report created successfully'},
                    status=status.HTTP_201_CREATED
                )
            
            else:
                return Response(
                    {'error': f'Invalid item_type: {item_type}. Must be asset, stock_item, or consumable.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except (Asset.DoesNotExist, StockItem.DoesNotExist, Consumable.DoesNotExist):
            return Response(
                {'error': f'{item_type} with id {item_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error creating problem report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreateMaintenanceView(APIView):
    """View to create maintenance from a problem report"""
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        """Extract user account from JWT token"""
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                username = request.auth.get('username')
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        
        return None

    def post(self, request):
        """Create a maintenance request from a problem report"""
        user_account = self._get_user_account(request)
        
        if not user_account:
            return Response(
                {'error': 'Could not identify user'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is a maintenance chief
        is_chief = user_account.is_superuser() or PersonRoleMapping.objects.filter(
            person=user_account.person,
            role__role_code__in=['maintenance_chief', 'exploitation_chief']
        ).exists()

        if not is_chief:
            return Response(
                {'error': 'Only maintenance chiefs can create maintenance requests'},
                status=status.HTTP_403_FORBIDDEN
            )

        item_type = request.data.get('item_type')
        report_id = request.data.get('report_id')
        technician_person_id = request.data.get('technician_person_id')
        description = request.data.get('description', '')

        if not item_type or not report_id or not technician_person_id:
            return Response(
                {'error': 'item_type, report_id, and technician_person_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Currently only assets can have maintenance in the database schema
            if item_type == 'asset':
                report = PersonReportsProblemOnAsset.objects.get(report_id=report_id)
                asset = report.asset
                technician = Person.objects.get(person_id=technician_person_id)
                
                # Get next maintenance_id
                max_id = Maintenance.objects.aggregate(models.Max('maintenance_id'))['maintenance_id__max']
                next_id = (max_id or 0) + 1
                
                # Create maintenance record
                maintenance = Maintenance.objects.create(
                    maintenance_id=next_id,
                    asset=asset,
                    performed_by_person=technician,
                    approved_by_maintenance_chief=user_account.person,
                    is_approved_by_maintenance_chief=False,
                    start_datetime=timezone.now(),
                    end_datetime=timezone.now(),
                    description=description,
                    is_successful=None
                )
                
                return Response(
                    {'maintenance_id': maintenance.maintenance_id, 'message': 'Maintenance request created successfully'},
                    status=status.HTTP_201_CREATED
                )
            
            else:
                return Response(
                    {'error': f'Maintenance can only be created for assets, not {item_type}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except PersonReportsProblemOnAsset.DoesNotExist:
            return Response(
                {'error': f'Asset problem report with id {report_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Person.DoesNotExist:
            return Response(
                {'error': f'Technician with id {technician_person_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error creating maintenance: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MaintenanceStepViewSet(viewsets.ModelViewSet):
    """CRUD operations for MaintenanceStep model with strict permissions"""
    serializer_class = MaintenanceStepSerializer
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        """Extract user account from JWT token or request.user"""
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
             if isinstance(request.user, UserAccount):
                 return request.user

        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get('user_id')
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass
        return None

    def get_queryset(self):
        """Filter maintenance steps based on user role"""
        user_account = self._get_user_account(self.request)
        if not user_account:
            return MaintenanceStep.objects.none()

        person = user_account.person
        is_chief = user_account.is_superuser() or PersonRoleMapping.objects.filter(
            person=person,
            role__role_code__in=['maintenance_chief', 'exploitation_chief']
        ).exists()

        if is_chief:
            # Chiefs see all steps
            return MaintenanceStep.objects.all().order_by('maintenance_step_id')
        else:
            # Technicians see steps assigned to them OR steps of maintenances assigned to them
            return MaintenanceStep.objects.filter(
                models.Q(person=person) | 
                models.Q(maintenance__performed_by_person=person)
            ).distinct().order_by('maintenance_step_id')

    def create(self, request, *args, **kwargs):
        """Create a new maintenance step"""
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check permissions for assigning person
        # Logic: Only Maintenance Chief and Main Technician (of the maintenance) can assign people
        
        maintenance_id = request.data.get('maintenance')
        try:
            maintenance = Maintenance.objects.get(maintenance_id=maintenance_id)
        except Maintenance.DoesNotExist:
             return Response({'error': 'Maintenance not found'}, status=status.HTTP_404_NOT_FOUND)

        is_chief = user_account.is_superuser() or PersonRoleMapping.objects.filter(
            person=user_account.person,
            role__role_code__in=['maintenance_chief', 'exploitation_chief']
        ).exists()
        
        is_main_technician = maintenance.performed_by_person == user_account.person
        
        # Validate person assignment
        target_person_id = request.data.get('person_id') or request.data.get('person')
        if target_person_id:
            if not (is_chief or is_main_technician):
                 return Response(
                    {'error': 'Only Maintenance Chief or Main Maintenance Technician can assign technicians to steps.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Generate new ID
        max_id = MaintenanceStep.objects.aggregate(models.Max('maintenance_step_id'))['maintenance_step_id__max']
        next_id = (max_id or 0) + 1
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(maintenance_step_id=next_id)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Update maintenance step"""
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        step = self.get_object()
        maintenance = step.maintenance
        
        is_chief = user_account.is_superuser() or PersonRoleMapping.objects.filter(
            person=user_account.person,
            role__role_code__in=['maintenance_chief', 'exploitation_chief']
        ).exists()
        
        is_main_technician = maintenance.performed_by_person == user_account.person
        is_assigned_technician = step.person == user_account.person

        # Check if attempting to change person
        new_person_id = request.data.get('person_id') or request.data.get('person')
        
        if new_person_id and str(new_person_id) != str(step.person_id):
            # Changing assignment
            if not (is_chief or is_main_technician):
                 return Response(
                    {'error': 'Only Maintenance Chief or Main Maintenance Technician can reassign steps.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Check general update permissions
        if not (is_chief or is_main_technician or is_assigned_technician):
             return Response(
                {'error': 'You do not have permission to update this step.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

class MaintenanceTypicalStepViewSet(viewsets.ReadOnlyModelViewSet):
    """ReadOnly ViewSet for MaintenanceTypicalStep"""
    queryset = MaintenanceTypicalStep.objects.all()
    serializer_class = MaintenanceTypicalStepSerializer
    permission_classes = [IsAuthenticated]
