
class MaintenanceTypicalStepViewSet(viewsets.ReadOnlyModelViewSet):
    """ReadOnly ViewSet for MaintenanceTypicalStep"""
    queryset = MaintenanceTypicalStep.objects.all()
    serializer_class = MaintenanceTypicalStepSerializer
    permission_classes = [IsAuthenticated]
