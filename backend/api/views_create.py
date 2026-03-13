def create(self, request, *args, **kwargs):
    last_item = MaintenanceStep.objects.order_by('-maintenance_step_id').first()
    next_id = last_item.maintenance_step_id + 1 if last_item else 1
    data = request.data.copy()
    if 'digital_copy' in request.FILES:
        data.pop('digital_copy', None)
    serializer = self.get_serializer(data=data)
    serializer.is_valid(raise_exception=True)
    maintenance = serializer.validated_data.get('maintenance')
    if maintenance and getattr(maintenance, 'end_datetime', None) is not None:
        return Response({'error': 'Maintenance is ended'}, status=status.HTTP_400_BAD_REQUEST)
    if maintenance and getattr(maintenance, 'start_datetime', None) is None:
        try:
            pending_asset_move = AssetMovement.objects.filter(status='pending', movement_reason=f'maintenance_create_{maintenance.maintenance_id}').exists()
            pending_stock_moves = StockItemMovement.objects.filter(status='pending', movement_reason=f'problem_report_include_{maintenance.maintenance_id}').exists()
            pending_consumable_moves = ConsumableMovement.objects.filter(status='pending', movement_reason=f'problem_report_include_{maintenance.maintenance_id}').exists()
            if pending_asset_move or pending_stock_moves or pending_consumable_moves:
                pending_parts = []
                if pending_asset_move:
                    pending_parts.append('asset movement request')
                if pending_stock_moves:
                    pending_parts.append('included stock items movements')
                if pending_consumable_moves:
                    pending_parts.append('included consumables movements')
                return Response({'error': 'Maintenance cannot start until the following approvals are decided (accepted/rejected): ' + ', '.join(pending_parts) + '.', 'pending_approvals': {'asset_movement': bool(pending_asset_move), 'included_stock_items': bool(pending_stock_moves), 'included_consumables': bool(pending_consumable_moves)}}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            pass
    person_data = serializer.validated_data.get('person')
    target_person_id = getattr(person_data, 'person_id', None) if person_data else request.data.get('person_id')
    if target_person_id:
        try:
            target_person_id = int(target_person_id)
            is_allowed, error_response = self._validate_assignment_permission(request, target_person_id)
            if not is_allowed:
                return error_response
        except (ValueError, TypeError):
            return Response({'error': 'Invalid person_id'}, status=status.HTTP_400_BAD_REQUEST)
    asset_id = getattr(maintenance, 'asset_id', None) if maintenance else None
    if asset_id:
        open_external_maintenance_q = Q(external_maintenance_status__isnull=True, item_sent_to_external_maintenance_datetime__isnull=False, item_received_by_company_datetime__isnull=True) | Q(external_maintenance_status__isnull=False) & ~Q(external_maintenance_status__in=['DRAFT', 'RECEIVED_BY_COMPANY'])
        if ExternalMaintenance.objects.filter(maintenance__asset_id=asset_id).filter(open_external_maintenance_q).exists():
            return Response({'error': 'Cannot create maintenance steps while the asset has an ongoing external maintenance.'}, status=status.HTTP_400_BAD_REQUEST)
    data = dict(serializer.validated_data)
    if not data.get('maintenance_step_status'):
        data['maintenance_step_status'] = 'pending'
    try:
        step = MaintenanceStep.objects.create(maintenance_step_id=next_id, **data)
    except IntegrityError:
        return Response({'error': 'Failed to create maintenance step due to database constraints.'}, status=status.HTTP_400_BAD_REQUEST)
    self._maybe_set_maintenance_start_datetime(step, new_status=getattr(step, 'maintenance_step_status', None))
    return Response(self.get_serializer(step).data, status=status.HTTP_201_CREATED)
def get_queryset(self):
    qs = MaintenanceStep.objects.select_related('maintenance', 'maintenance_typical_step', 'person').all().order_by('maintenance_step_id')
    maintenance_id = self.request.query_params.get('maintenance')
    if maintenance_id is not None:
        try:
            qs = qs.filter(maintenance_id=int(maintenance_id))
        except (ValueError, TypeError):
            pass
    return qs
