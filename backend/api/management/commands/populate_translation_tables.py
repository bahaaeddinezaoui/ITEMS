"""
Management command to populate translation tables with existing data.

This command copies existing text data from base tables into translation tables
as English (en) defaults. After running this, Arabic translations can be added.

Usage:
    python manage.py populate_translation_tables
    python manage.py populate_translation_tables --dry-run  # Preview changes
    python manage.py populate_translation_tables --verbose   # Show details
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.apps import apps


class Command(BaseCommand):
    help = 'Populate translation tables with existing data as English defaults'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview changes without writing to database',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output for each record',
        )
        parser.add_argument(
            '--entity',
            type=str,
            help='Process only specific entity (e.g., AssetType, Person)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        verbose = options['verbose']
        specific_entity = options.get('entity')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Track statistics
        stats = {'created': 0, 'skipped': 0, 'errors': 0}
        
        # Define entity mappings: (base_model, translation_model, field_mappings)
        # field_mappings: list of (base_field, translation_field)
        entity_mappings = self.get_entity_mappings()
        
        # Filter if specific entity requested
        if specific_entity:
            entity_mappings = [
                m for m in entity_mappings 
                if m[0] == specific_entity or m[1].replace('Translation', '') == specific_entity
            ]
            if not entity_mappings:
                self.stdout.write(self.style.ERROR(f'Unknown entity: {specific_entity}'))
                return
        
        for base_model_name, trans_model_name, field_mappings in entity_mappings:
            try:
                self.process_entity(
                    base_model_name, 
                    trans_model_name, 
                    field_mappings,
                    dry_run,
                    verbose,
                    stats
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error processing {base_model_name}: {str(e)}')
                )
                stats['errors'] += 1
        
        # Summary
        self.stdout.write(self.style.SUCCESS(
            f'\n{"="*50}\n'
            f'SUMMARY:\n'
            f'  Translations created: {stats["created"]}\n'
            f'  Skipped (no data): {stats["skipped"]}\n'
            f'  Errors: {stats["errors"]}\n'
            f'{"="*50}'
        ))
    
    def get_entity_mappings(self):
        """Define all entity mappings for data migration."""
        return [
            # ============================================================================
            # SECTION 1: REFERENCE/DICTIONARY DATA (UI Labels)
            # ============================================================================
            
            # AssetType
            ('AssetType', 'AssetTypeTranslation', [
                ('asset_type_label', 'asset_type_label'),
            ]),
            
            # ConsumableType
            ('ConsumableType', 'ConsumableTypeTranslation', [
                ('consumable_type_label', 'consumable_type_label'),
            ]),
            
            # StockItemType
            ('StockItemType', 'StockItemTypeTranslation', [
                ('stock_item_type_label', 'stock_item_type_label'),
            ]),
            
            # LocationType
            ('LocationType', 'LocationTypeTranslation', [
                ('location_type_label', 'location_type_label'),
            ]),
            
            # OrganizationalStructureType
            ('OrganizationalStructureType', 'OrganizationalStructureTypeTranslation', [
                ('organizational_structure_type', 'organizational_structure_type_label'),
            ]),
            
            # PhysicalCondition
            ('PhysicalCondition', 'PhysicalConditionTranslation', [
                ('condition_label', 'condition_label'),
                ('description', 'description'),
            ]),
            
            # Role
            ('Role', 'RoleTranslation', [
                ('role_label', 'role_label'),
                ('description', 'description'),
            ]),
            
            # Position
            ('Position', 'PositionTranslation', [
                ('position_label', 'position_label'),
                ('description', 'description'),
            ]),
            
            # AssetAttributeDefinition
            ('AssetAttributeDefinition', 'AssetAttributeDefinitionTranslation', [
                ('description', 'description'),
                ('unit', 'unit'),
            ]),
            
            # ConsumableAttributeDefinition
            ('ConsumableAttributeDefinition', 'ConsumableAttributeDefinitionTranslation', [
                ('description', 'description'),
                ('unit', 'unit'),
            ]),
            
            # StockItemAttributeDefinition
            ('StockItemAttributeDefinition', 'StockItemAttributeDefinitionTranslation', [
                ('description', 'description'),
                ('unit', 'unit'),
            ]),
            
            # MaintenanceTypicalStep
            ('MaintenanceTypicalStep', 'MaintenanceTypicalStepTranslation', [
                ('description', 'description'),
            ]),
            
            # ExternalMaintenanceTypicalStep
            ('ExternalMaintenanceTypicalStep', 'ExternalMaintenanceTypicalStepTranslation', [
                ('description', 'description'),
            ]),
            
            # ============================================================================
            # SECTION 2: ENTITY NAMES
            # ============================================================================
            
            # Person
            ('Person', 'PersonTranslation', [
                ('first_name', 'first_name'),
                ('last_name', 'last_name'),
            ]),
            
            # Supplier
            ('Supplier', 'SupplierTranslation', [
                ('supplier_name', 'supplier_name'),
                ('supplier_address', 'supplier_address'),
            ]),
            
            # Warehouse
            ('Warehouse', 'WarehouseTranslation', [
                ('warehouse_name', 'warehouse_name'),
                ('warehouse_address', 'warehouse_address'),
            ]),
            
            # Location
            ('Location', 'LocationTranslation', [
                ('location_name', 'location_name'),
            ]),
            
            # OrganizationalStructure
            ('OrganizationalStructure', 'OrganizationalStructureTranslation', [
                ('structure_name', 'structure_name'),
            ]),
            
            # ============================================================================
            # SECTION 3: OPERATIONAL TEXT
            # ============================================================================
            
            # AssetMovement
            ('AssetMovement', 'AssetMovementTranslation', [
                ('movement_reason', 'movement_reason'),
            ]),
            
            # ConsumableMovement
            ('ConsumableMovement', 'ConsumableMovementTranslation', [
                ('movement_reason', 'movement_reason'),
            ]),
            
            # StockItemMovement
            ('StockItemMovement', 'StockItemMovementTranslation', [
                ('movement_reason', 'movement_reason'),
            ]),
            
            # PersonReportsProblemOnAsset
            ('PersonReportsProblemOnAsset', 'PersonReportsProblemOnAssetTranslation', [
                ('owner_observation', 'owner_observation'),
            ]),
            
            # PersonReportsProblemOnConsumable
            ('PersonReportsProblemOnConsumable', 'PersonReportsProblemOnConsumableTranslation', [
                ('owner_observation', 'owner_observation'),
            ]),
            
            # PersonReportsProblemOnStockItem
            ('PersonReportsProblemOnStockItem', 'PersonReportsProblemOnStockItemTranslation', [
                ('owner_observation', 'owner_observation'),
            ]),
            
            # Maintenance
            ('Maintenance', 'MaintenanceTranslation', [
                ('description', 'description'),
            ]),
            
            # AssetConditionHistory
            ('AssetConditionHistory', 'AssetConditionHistoryTranslation', [
                ('notes', 'notes'),
                ('cosmetic_issues', 'cosmetic_issues'),
                ('functional_issues', 'functional_issues'),
            ]),
            
            # ConsumableConditionHistory
            ('ConsumableConditionHistory', 'ConsumableConditionHistoryTranslation', [
                ('notes', 'notes'),
                ('cosmetic_issues', 'cosmetic_issues'),
                ('functional_issues', 'functional_issues'),
            ]),
            
            # StockItemConditionHistory
            ('StockItemConditionHistory', 'StockItemConditionHistoryTranslation', [
                ('notes', 'notes'),
                ('cosmetic_issues', 'cosmetic_issues'),
                ('functional_issues', 'functional_issues'),
            ]),
            
            # ============================================================================
            # SECTION 4: OTHER HUMAN-FACING TEXT
            # ============================================================================
            
            # Asset
            ('Asset', 'AssetTranslation', [
                ('asset_name', 'asset_name'),
                ('asset_name_in_the_administrative_certificate', 'asset_name_in_the_administrative_certificate'),
            ]),
            
            # Consumable
            ('Consumable', 'ConsumableTranslation', [
                ('consumable_name', 'consumable_name'),
                ('consumable_name_in_administrative_certificate', 'consumable_name_in_administrative_certificate'),
            ]),
            
            # StockItem
            ('StockItem', 'StockItemTranslation', [
                ('stock_item_name', 'stock_item_name'),
                ('stock_item_name_in_administrative_certificate', 'stock_item_name_in_administrative_certificate'),
            ]),
            
            # AssetModel
            ('AssetModel', 'AssetModelTranslation', [
                ('model_name', 'model_name'),
                ('notes', 'notes'),
            ]),
            
            # ConsumableModel
            ('ConsumableModel', 'ConsumableModelTranslation', [
                ('model_name', 'model_name'),
                ('notes', 'notes'),
            ]),
            
            # StockItemModel
            ('StockItemModel', 'StockItemModelTranslation', [
                ('model_name', 'model_name'),
                ('notes', 'notes'),
            ]),
            
            # AdministrativeCertificate
            ('AdministrativeCertificate', 'AdministrativeCertificateTranslation', [
                ('interested_organization', 'interested_organization'),
            ]),
            
            # CompanyAssetRequest
            ('CompanyAssetRequest', 'CompanyAssetRequestTranslation', [
                ('title_of_demand', 'title_of_demand'),
                ('organization_body_designation', 'organization_body_designation'),
            ]),
            
            # ExternalMaintenanceDocument
            ('ExternalMaintenanceDocument', 'ExternalMaintenanceDocumentTranslation', [
                ('maintenance_provider_final_decision', 'maintenance_provider_final_decision'),
            ]),
            
            # MaintenanceStepItemRequest
            ('MaintenanceStepItemRequest', 'MaintenanceStepItemRequestTranslation', [
                ('note', 'note'),
            ]),
        ]
    
    def process_entity(self, base_model_name, trans_model_name, field_mappings, 
                      dry_run, verbose, stats):
        """Process a single entity type."""
        self.stdout.write(f'\nProcessing {base_model_name}...')
        
        try:
            BaseModel = apps.get_model('api', base_model_name)
            TranslationModel = apps.get_model('api', trans_model_name)
        except LookupError as e:
            self.stdout.write(self.style.WARNING(f'  Model not found: {e}'))
            stats['errors'] += 1
            return
        
        # Get all base entities
        entities = BaseModel.objects.all()
        total = entities.count()
        
        if total == 0:
            self.stdout.write(self.style.WARNING(f'  No records found'))
            return
        
        self.stdout.write(f'  Found {total} records')
        
        # Find the foreign key field name in translation model
        fk_field = None
        for field in TranslationModel._meta.fields:
            if field.is_relation and field.many_to_one:
                fk_field = field.name
                break
        
        if not fk_field:
            self.stdout.write(self.style.ERROR(f'  No FK field found in {trans_model_name}'))
            stats['errors'] += 1
            return
        
        # Process each entity
        created_count = 0
        skipped_count = 0
        
        for entity in entities:
            # Check if translation already exists
            existing = TranslationModel.objects.filter(
                **{fk_field: entity},
                language_code='en'
            ).exists()
            
            if existing:
                skipped_count += 1
                if verbose:
                    self.stdout.write(f'  Skipped {entity.pk} (already exists)')
                continue
            
            # Build translation data
            translation_data = {
                fk_field: entity,
                'language_code': 'en',
            }
            
            has_data = False
            for base_field, trans_field in field_mappings:
                value = getattr(entity, base_field, None)
                if value:
                    translation_data[trans_field] = value
                    has_data = True
            
            if not has_data:
                skipped_count += 1
                if verbose:
                    self.stdout.write(f'  Skipped {entity.pk} (no text data)')
                continue
            
            # Create translation
            if not dry_run:
                try:
                    TranslationModel.objects.create(**translation_data)
                    created_count += 1
                    if verbose:
                        self.stdout.write(f'  Created translation for {entity.pk}')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'  Error creating translation for {entity.pk}: {e}'))
                    stats['errors'] += 1
            else:
                created_count += 1
                if verbose:
                    self.stdout.write(f'  [DRY RUN] Would create translation for {entity.pk}')
        
        stats['created'] += created_count
        stats['skipped'] += skipped_count
        
        self.stdout.write(
            f'  {base_model_name}: Created {created_count}, Skipped {skipped_count}'
        )
