"""
Check translation coverage across all entities.

This command displays statistics about translation coverage for each
entity type, showing how many have English vs Arabic translations.

Usage:
    python manage.py translation_coverage
    python manage.py translation_coverage --entity AssetType
    python manage.py translation_coverage --missing-only
"""

from django.core.management.base import BaseCommand
from django.apps import apps
from django.db.models import Count, Q


class Command(BaseCommand):
    help = 'Check translation coverage statistics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--entity',
            type=str,
            help='Check specific entity only',
        )
        parser.add_argument(
            '--missing-only',
            action='store_true',
            help='Only show entities with missing translations',
        )
        parser.add_argument(
            '--min-coverage',
            type=int,
            default=0,
            help='Minimum Arabic coverage percentage to display',
        )

    def handle(self, *args, **options):
        entity_filter = options.get('entity')
        missing_only = options['missing_only']
        min_coverage = options['min_coverage']
        
        # Define all translatable entities
        entities = [
            ('AssetType', 'AssetTypeTranslation'),
            ('ConsumableType', 'ConsumableTypeTranslation'),
            ('StockItemType', 'StockItemTypeTranslation'),
            ('LocationType', 'LocationTypeTranslation'),
            ('OrganizationalStructureType', 'OrganizationalStructureTypeTranslation'),
            ('PhysicalCondition', 'PhysicalConditionTranslation'),
            ('Role', 'RoleTranslation'),
            ('Position', 'PositionTranslation'),
            ('AssetAttributeDefinition', 'AssetAttributeDefinitionTranslation'),
            ('ConsumableAttributeDefinition', 'ConsumableAttributeDefinitionTranslation'),
            ('StockItemAttributeDefinition', 'StockItemAttributeDefinitionTranslation'),
            ('MaintenanceTypicalStep', 'MaintenanceTypicalStepTranslation'),
            ('ExternalMaintenanceTypicalStep', 'ExternalMaintenanceTypicalStepTranslation'),
            ('Person', 'PersonTranslation'),
            ('Supplier', 'SupplierTranslation'),
            ('Warehouse', 'WarehouseTranslation'),
            ('Location', 'LocationTranslation'),
            ('OrganizationalStructure', 'OrganizationalStructureTranslation'),
            ('AssetMovement', 'AssetMovementTranslation'),
            ('ConsumableMovement', 'ConsumableMovementTranslation'),
            ('StockItemMovement', 'StockItemMovementTranslation'),
            ('PersonReportsProblemOnAsset', 'PersonReportsProblemOnAssetTranslation'),
            ('PersonReportsProblemOnConsumable', 'PersonReportsProblemOnConsumableTranslation'),
            ('PersonReportsProblemOnStockItem', 'PersonReportsProblemOnStockItemTranslation'),
            ('Maintenance', 'MaintenanceTranslation'),
            ('AssetConditionHistory', 'AssetConditionHistoryTranslation'),
            ('ConsumableConditionHistory', 'ConsumableConditionHistoryTranslation'),
            ('StockItemConditionHistory', 'StockItemConditionHistoryTranslation'),
            ('Asset', 'AssetTranslation'),
            ('Consumable', 'ConsumableTranslation'),
            ('StockItem', 'StockItemTranslation'),
            ('AssetModel', 'AssetModelTranslation'),
            ('ConsumableModel', 'ConsumableModelTranslation'),
            ('StockItemModel', 'StockItemModelTranslation'),
            ('AdministrativeCertificate', 'AdministrativeCertificateTranslation'),
            ('CompanyAssetRequest', 'CompanyAssetRequestTranslation'),
            ('ExternalMaintenanceDocument', 'ExternalMaintenanceDocumentTranslation'),
            ('MaintenanceStepItemRequest', 'MaintenanceStepItemRequestTranslation'),
        ]
        
        if entity_filter:
            entities = [(base, trans) for base, trans in entities 
                       if base == entity_filter or trans.replace('Translation', '') == entity_filter]
        
        # Print header
        self.stdout.write(self.style.SUCCESS(
            f'\n{"="*80}\n'
            f'{'Entity':<35} {'Total':>8} {'EN':>8} {'AR':>8} {'Coverage %':>12}\n'
            f'{"="*80}'
        ))
        
        total_entities = 0
        total_arabic = 0
        
        for base_name, trans_name in entities:
            stats = self.get_coverage_stats(base_name, trans_name)
            
            if stats is None:
                continue
            
            total_entities += stats['total']
            total_arabic += stats['arabic']
            
            coverage_pct = stats['coverage_pct']
            
            # Skip if below minimum coverage
            if coverage_pct < min_coverage:
                continue
            
            # Skip if not missing and missing-only flag is set
            if missing_only and stats['arabic'] >= stats['total']:
                continue
            
            # Color code based on coverage
            if coverage_pct == 100:
                color = self.style.SUCCESS
            elif coverage_pct >= 50:
                color = self.style.WARNING
            else:
                color = self.style.ERROR
            
            self.stdout.write(color(
                f'{base_name:<35} {stats["total"]:>8} {stats["english"]:>8} '
                f'{stats["arabic"]:>8} {coverage_pct:>11.1f}%'
            ))
        
        # Print summary
        overall_coverage = (total_arabic / total_entities * 100) if total_entities > 0 else 0
        self.stdout.write(self.style.SUCCESS(
            f'{"="*80}\n'
            f'OVERALL: {total_entities} entities, {total_arabic} Arabic translations '
            f'({overall_coverage:.1f}% coverage)\n'
            f'{"="*80}\n'
        ))
    
    def get_coverage_stats(self, base_name, trans_name):
        """Get coverage statistics for an entity."""
        try:
            BaseModel = apps.get_model('api', base_name)
            TransModel = apps.get_model('api', trans_name)
            
            # Count total base entities
            total = BaseModel.objects.count()
            
            if total == 0:
                return None
            
            # Find FK field name
            fk_field = None
            for field in TransModel._meta.fields:
                if field.is_relation and field.many_to_one:
                    fk_field = field.name
                    break
            
            if not fk_field:
                return None
            
            # Count translations by language
            en_count = TransModel.objects.filter(language_code='en').count()
            ar_count = TransModel.objects.filter(language_code='ar').count()
            
            return {
                'total': total,
                'english': en_count,
                'arabic': ar_count,
                'coverage_pct': (ar_count / total * 100) if total > 0 else 0,
            }
            
        except LookupError:
            return None
