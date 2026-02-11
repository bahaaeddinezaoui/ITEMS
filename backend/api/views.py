from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import hashlib
import os
from django.utils import timezone

from .models import Person, UserAccount, PersonRoleMapping, AssetType, AssetBrand, AssetModel, StockItemType, StockItemBrand, StockItemModel, ConsumableType, ConsumableBrand, ConsumableModel, RoomType, Room, Position, OrganizationalStructure, OrganizationalStructureRelation, Asset, Maintenance, StockItem, Consumable, AssetAssignment, StockItemAssignment, ConsumableAssignment, PersonReportsProblemOnAsset, PersonReportsProblemOnStockItem, PersonReportsProblemOnConsumable
from .serializers import PersonSerializer, LoginSerializer, UserProfileSerializer, UserAccountSerializer, UserAccountCreateSerializer, ProblemReportCreateSerializer, AssetTypeSerializer, AssetBrandSerializer, AssetModelSerializer, StockItemTypeSerializer, StockItemBrandSerializer, StockItemModelSerializer, ConsumableTypeSerializer, ConsumableBrandSerializer, ConsumableModelSerializer, RoomTypeSerializer, RoomSerializer, PositionSerializer, OrganizationalStructureSerializer, OrganizationalStructureRelationSerializer, AssetSerializer, MaintenanceSerializer, StockItemSerializer, ConsumableSerializer, AssetAssignmentSerializer, StockItemAssignmentSerializer, ConsumableAssignmentSerializer


def hash_password(password):
    """Hash password using SHA-512 to match existing database format"""
    return hashlib.sha512(password.encode()).hexdigest()


def _get_user_account_from_request(request):
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


def _has_role(user_account, role_code):
    return PersonRoleMapping.objects.filter(person=user_account.person, role__role_code=role_code).exists()


class ProblemReportViewSet(viewsets.ViewSet):
    """Owner reporting + chief viewing for asset/stock item/consumable problems"""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        is_chief = (
            user_account.is_superuser()
            or _has_role(user_account, 'maintenance_chief')
            or _has_role(user_account, 'exploitation_chief')
        )

        asset_qs = PersonReportsProblemOnAsset.objects.all()
        stock_item_qs = PersonReportsProblemOnStockItem.objects.all()
        consumable_qs = PersonReportsProblemOnConsumable.objects.all()

        if not is_chief:
            asset_qs = asset_qs.filter(person=user_account.person)
            stock_item_qs = stock_item_qs.filter(person=user_account.person)
            consumable_qs = consumable_qs.filter(person=user_account.person)

        results = []

        for r in asset_qs:
            results.append({
                'item_type': 'asset',
                'item_id': r.asset_id,
                'report_id': r.report_id,
                'report_datetime': r.report_datetime,
                'owner_observation': r.owner_observation,
                'person_id': r.person_id,
            })

        for r in stock_item_qs:
            results.append({
                'item_type': 'stock_item',
                'item_id': r.stock_item_id,
                'report_id': r.report_id,
                'report_datetime': r.report_datetime,
                'owner_observation': r.owner_observation,
                'person_id': r.person_id,
            })

        for r in consumable_qs:
            results.append({
                'item_type': 'consumable',
                'item_id': r.consumable_id,
                'report_id': r.report_id,
                'report_datetime': r.report_datetime,
                'owner_observation': r.owner_observation,
                'person_id': r.person_id,
            })

        results.sort(key=lambda x: x['report_datetime'], reverse=True)
        return Response(results)

    def create(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProblemReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item_type = serializer.validated_data['item_type']
        item_id = serializer.validated_data['item_id']
        owner_observation = serializer.validated_data['owner_observation']
        now = timezone.now()

        if item_type == 'asset':
            is_owner = AssetAssignment.objects.filter(asset_id=item_id, person=user_account.person, is_active=True).exists()
            if not is_owner and not user_account.is_superuser():
                return Response({'error': 'You can only report problems on assets you own'}, status=status.HTTP_403_FORBIDDEN)

            last = PersonReportsProblemOnAsset.objects.order_by('-report_id').first()
            next_id = (last.report_id + 1) if last else 1
            report = PersonReportsProblemOnAsset.objects.create(
                report_id=next_id,
                asset_id=item_id,
                person_id=user_account.person_id,
                report_datetime=now,
                owner_observation=owner_observation,
            )
            payload = {
                'item_type': 'asset',
                'item_id': report.asset_id,
                'report_id': report.report_id,
                'report_datetime': report.report_datetime,
                'owner_observation': report.owner_observation,
                'person_id': report.person_id,
            }
            return Response(payload, status=status.HTTP_201_CREATED)

        if item_type == 'stock_item':
            is_owner = StockItemAssignment.objects.filter(stock_item_id=item_id, person=user_account.person, is_active=True).exists()
            if not is_owner and not user_account.is_superuser():
                return Response({'error': 'You can only report problems on stock items you own'}, status=status.HTTP_403_FORBIDDEN)

            last = PersonReportsProblemOnStockItem.objects.order_by('-report_id').first()
            next_id = (last.report_id + 1) if last else 1
            report = PersonReportsProblemOnStockItem.objects.create(
                report_id=next_id,
                stock_item_id=item_id,
                person_id=user_account.person_id,
                report_datetime=now,
                owner_observation=owner_observation,
            )
            payload = {
                'item_type': 'stock_item',
                'item_id': report.stock_item_id,
                'report_id': report.report_id,
                'report_datetime': report.report_datetime,
                'owner_observation': report.owner_observation,
                'person_id': report.person_id,
            }
            return Response(payload, status=status.HTTP_201_CREATED)

        if item_type == 'consumable':
            is_owner = ConsumableAssignment.objects.filter(consumable_id=item_id, person=user_account.person, is_active=True).exists()
            if not is_owner and not user_account.is_superuser():
                return Response({'error': 'You can only report problems on consumables you own'}, status=status.HTTP_403_FORBIDDEN)

            last = PersonReportsProblemOnConsumable.objects.order_by('-report_id').first()
            next_id = (last.report_id + 1) if last else 1
            report = PersonReportsProblemOnConsumable.objects.create(
                report_id=next_id,
                consumable_id=item_id,
                person_id=user_account.person_id,
                report_datetime=now,
                owner_observation=owner_observation,
            )
            payload = {
                'item_type': 'consumable',
                'item_id': report.consumable_id,
                'report_id': report.report_id,
                'report_datetime': report.report_datetime,
                'owner_observation': report.owner_observation,
                'person_id': report.person_id,
            }
            return Response(payload, status=status.HTTP_201_CREATED)

        return Response({'error': 'Invalid item_type'}, status=status.HTTP_400_BAD_REQUEST)


class MyItemsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        asset_assignments = AssetAssignment.objects.filter(person=user_account.person).select_related('asset')
        stock_item_assignments = StockItemAssignment.objects.filter(person=user_account.person).select_related('stock_item')
        consumable_assignments = ConsumableAssignment.objects.filter(person=user_account.person).select_related('consumable')

        assets_current = [a.asset for a in asset_assignments.filter(is_active=True)]
        assets_history = asset_assignments.filter(is_active=False).order_by('-end_datetime')

        stock_items_current = [a.stock_item for a in stock_item_assignments.filter(is_active=True)]
        stock_items_history = stock_item_assignments.filter(is_active=False).order_by('-end_datetime')

        consumables_current = [a.consumable for a in consumable_assignments.filter(is_active=True)]
        consumables_history = consumable_assignments.filter(is_active=False).order_by('-end_datetime')

        payload = {
            'assets': {
                'current': AssetSerializer(assets_current, many=True).data,
                'history': [
                    {
                        'assignment_id': a.assignment_id,
                        'asset': AssetSerializer(a.asset).data,
                        'start_datetime': a.start_datetime,
                        'end_datetime': a.end_datetime,
                        'condition_on_assignment': a.condition_on_assignment,
                        'assigned_by_person_id': a.assigned_by_person_id,
                    }
                    for a in assets_history
                ],
            },
            'stock_items': {
                'current': StockItemSerializer(stock_items_current, many=True).data,
                'history': [
                    {
                        'assignment_id': a.assignment_id,
                        'stock_item': StockItemSerializer(a.stock_item).data,
                        'start_datetime': a.start_datetime,
                        'end_datetime': a.end_datetime,
                        'condition_on_assignment': a.condition_on_assignment,
                        'assigned_by_person_id': a.assigned_by_person_id,
                    }
                    for a in stock_items_history
                ],
            },
            'consumables': {
                'current': ConsumableSerializer(consumables_current, many=True).data,
                'history': [
                    {
                        'assignment_id': a.assignment_id,
                        'consumable': ConsumableSerializer(a.consumable).data,
                        'start_datetime': a.start_datetime,
                        'end_datetime': a.end_datetime,
                        'condition_on_assignment': a.condition_on_assignment,
                        'assigned_by_person_id': a.assigned_by_person_id,
                    }
                    for a in consumables_history
                ],
            },
        }

        return Response(payload)


class AssetAssignmentViewSet(viewsets.ViewSet):
    """Assign assets to people (superuser + exploitation_chief only)"""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        if not (user_account.is_superuser() or _has_role(user_account, 'exploitation_chief')):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        qs = AssetAssignment.objects.all().order_by('-start_datetime')
        return Response(AssetAssignmentSerializer(qs, many=True).data)

    def create(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        if not (user_account.is_superuser() or _has_role(user_account, 'exploitation_chief')):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AssetAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        now = timezone.now()
        asset_id = serializer.validated_data['asset'].asset_id

        AssetAssignment.objects.filter(asset_id=asset_id, is_active=True).update(is_active=False, end_datetime=now)

        last = AssetAssignment.objects.order_by('-assignment_id').first()
        next_id = (last.assignment_id + 1) if last else 1

        assignment = AssetAssignment.objects.create(
            assignment_id=next_id,
            person_id=serializer.validated_data['person'].person_id,
            asset_id=asset_id,
            assigned_by_person_id=user_account.person_id,
            start_datetime=serializer.validated_data.get('start_datetime') or now,
            end_datetime=serializer.validated_data.get('end_datetime') or now,
            condition_on_assignment=serializer.validated_data.get('condition_on_assignment') or '',
            is_active=serializer.validated_data.get('is_active', True),
        )

        return Response(AssetAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class StockItemAssignmentViewSet(viewsets.ViewSet):
    """Assign stock items to people (superuser + exploitation_chief only)"""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        if not (user_account.is_superuser() or _has_role(user_account, 'exploitation_chief')):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        qs = StockItemAssignment.objects.all().order_by('-start_datetime')
        return Response(StockItemAssignmentSerializer(qs, many=True).data)

    def create(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        if not (user_account.is_superuser() or _has_role(user_account, 'exploitation_chief')):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StockItemAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        now = timezone.now()
        item_id = serializer.validated_data['stock_item'].stock_item_id

        StockItemAssignment.objects.filter(stock_item_id=item_id, is_active=True).update(is_active=False, end_datetime=now)

        last = StockItemAssignment.objects.order_by('-assignment_id').first()
        next_id = (last.assignment_id + 1) if last else 1

        assignment = StockItemAssignment.objects.create(
            assignment_id=next_id,
            person_id=serializer.validated_data['person'].person_id,
            stock_item_id=item_id,
            assigned_by_person_id=user_account.person_id,
            start_datetime=serializer.validated_data.get('start_datetime') or now,
            end_datetime=serializer.validated_data.get('end_datetime') or now,
            condition_on_assignment=serializer.validated_data.get('condition_on_assignment') or '',
            is_active=serializer.validated_data.get('is_active', True),
        )

        return Response(StockItemAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class ConsumableAssignmentViewSet(viewsets.ViewSet):
    """Assign consumables to people (superuser + exploitation_chief only)"""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        if not (user_account.is_superuser() or _has_role(user_account, 'exploitation_chief')):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        qs = ConsumableAssignment.objects.all().order_by('-start_datetime')
        return Response(ConsumableAssignmentSerializer(qs, many=True).data)

    def create(self, request):
        user_account = _get_user_account_from_request(request)
        if not user_account:
            return Response({'error': 'User account not found'}, status=status.HTTP_404_NOT_FOUND)

        if not (user_account.is_superuser() or _has_role(user_account, 'exploitation_chief')):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ConsumableAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        now = timezone.now()
        item_id = serializer.validated_data['consumable'].consumable_id

        ConsumableAssignment.objects.filter(consumable_id=item_id, is_active=True).update(is_active=False, end_datetime=now)

        last = ConsumableAssignment.objects.order_by('-assignment_id').first()
        next_id = (last.assignment_id + 1) if last else 1

        assignment = ConsumableAssignment.objects.create(
            assignment_id=next_id,
            person_id=serializer.validated_data['person'].person_id,
            consumable_id=item_id,
            assigned_by_person_id=user_account.person_id,
            start_datetime=serializer.validated_data.get('start_datetime') or now,
            end_datetime=serializer.validated_data.get('end_datetime') or now,
            condition_on_assignment=serializer.validated_data.get('condition_on_assignment') or '',
            is_active=serializer.validated_data.get('is_active', True),
        )

        return Response(ConsumableAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class UserAccountViewSet(viewsets.ViewSet):
    """Superuser-only operations for user accounts"""
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

    def create(self, request):
        """Create a user account linked to an existing person (superuser-only)."""
        user_account = self._get_user_account(request)
        if not user_account or not user_account.is_superuser():
            return Response(
                {'error': 'Only superusers can create user accounts'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UserAccountCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        person_id = serializer.validated_data['person_id']
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        account_status = serializer.validated_data['account_status']
        role_code = serializer.validated_data.get('role_code')

        try:
            person = Person.objects.get(person_id=person_id)
        except Person.DoesNotExist:
            return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)

        if UserAccount.objects.filter(person=person).exists():
            return Response({'error': 'This person already has an account'}, status=status.HTTP_400_BAD_REQUEST)

        if UserAccount.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        last_user = UserAccount.objects.order_by('-user_id').first()
        next_user_id = (last_user.user_id + 1) if last_user else 1

        new_user = UserAccount.objects.create(
            user_id=next_user_id,
            person=person,
            username=username,
            password_hash=hash_password(password),
            created_at_datetime=now,
            account_status=account_status,
            failed_login_attempts=0,
            password_last_changed_datetime=now,
            modified_at_datetime=now,
            created_by_user_id=user_account.user_id,
            modified_by_user_id=user_account.user_id,
            # Some DBs enforce NOT NULL; keep consistent with your scripts
            disabled_at_datetime=now,
            last_login=now,
        )

        if role_code:
            try:
                from .models import Role
                role = Role.objects.get(role_code=role_code)
                PersonRoleMapping.objects.get_or_create(person=person, role=role)
            except Exception:
                pass

        return Response(UserAccountSerializer(new_user).data, status=status.HTTP_201_CREATED)


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
        """Optionally filter by is_approved status or role_code"""
        queryset = Person.objects.all().order_by('person_id')
        is_approved = self.request.query_params.get('is_approved', None)
        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == 'true')
            
        role_code = self.request.query_params.get('role', None)
        if role_code is not None:
            queryset = queryset.filter(personrolemapping__role__role_code=role_code)
            
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


class AssetViewSet(viewsets.ModelViewSet):
    """CRUD operations for Asset model"""
    queryset = Asset.objects.all().order_by('asset_id')
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Asset.objects.all().order_by('asset_id')
        asset_model_id = self.request.query_params.get('asset_model', None)
        if asset_model_id is not None:
            queryset = queryset.filter(asset_model_id=asset_model_id)
        return queryset


class StockItemViewSet(viewsets.ModelViewSet):
    """CRUD operations for StockItem model"""
    queryset = StockItem.objects.all().order_by('stock_item_id')
    serializer_class = StockItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StockItem.objects.all().order_by('stock_item_id')
        stock_item_model_id = self.request.query_params.get('stock_item_model', None)
        if stock_item_model_id is not None:
            queryset = queryset.filter(stock_item_model_id=stock_item_model_id)
        return queryset


class ConsumableViewSet(viewsets.ModelViewSet):
    """CRUD operations for Consumable model"""
    queryset = Consumable.objects.all().order_by('consumable_id')
    serializer_class = ConsumableSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Consumable.objects.all().order_by('consumable_id')
        consumable_model_id = self.request.query_params.get('consumable_model', None)
        if consumable_model_id is not None:
            queryset = queryset.filter(consumable_model_id=consumable_model_id)
        return queryset


class MaintenanceViewSet(viewsets.ModelViewSet):
    """CRUD operations for Maintenance model"""
    queryset = Maintenance.objects.all().order_by('maintenance_id')
    serializer_class = MaintenanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter maintenances based on query params.
        Can filter by asset_id, performed_by_person_id, etc.
        """
        queryset = Maintenance.objects.all().order_by('-start_datetime')
        
        asset_id = self.request.query_params.get('asset', None)
        if asset_id is not None:
            queryset = queryset.filter(asset_id=asset_id)
            
        performed_by_person_id = self.request.query_params.get('performed_by_person', None)
        if performed_by_person_id is not None:
            queryset = queryset.filter(performed_by_person_id=performed_by_person_id)
            
        approved_by_maintenance_chief_id = self.request.query_params.get('approved_by_maintenance_chief', None)
        if approved_by_maintenance_chief_id is not None:
            queryset = queryset.filter(approved_by_maintenance_chief_id=approved_by_maintenance_chief_id)
            
        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new maintenance record"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



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
        """Extract user account from JWT token"""
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
        """Extract user account from JWT token"""
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
        """Extract user account from JWT token"""
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
        """Extract user account from JWT token"""
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
