"""
Export translation template for translators.

This command generates a JSON/CSV file with English text that needs
Arabic translation. Translators can fill in the Arabic values and
import using add_arabic_translations command.

Usage:
    python manage.py export_translation_template --entity AssetType
    python manage.py export_translation_template --all --format json
    python manage.py export_translation_template --all --format csv
"""

import json
import csv
import os
from django.core.management.base import BaseCommand
from django.apps import apps


class Command(BaseCommand):
    help = 'Export translation template for translators'

    def add_arguments(self, parser):
        parser.add_argument(
            '--entity',
            type=str,
            help='Specific entity to export (e.g., AssetType)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Export all translatable entities',
        )
        parser.add_argument(
            '--format',
            type=str,
            choices=['json', 'csv'],
            default='json',
            help='Output format',
        )
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path',
        )
        parser.add_argument(
            '--missing-only',
            action='store_true',
            help='Only export items without Arabic translation',
        )

    def handle(self, *args, **options):
        entity = options.get('entity')
        export_all = options['all']
        fmt = options['format']
        output_path = options.get('output')
        missing_only = options['missing_only']
        
        if not entity and not export_all:
            self.stdout.write(
                self.style.ERROR('Please specify --entity or --all')
            )
            return
        
        # Determine entities to export
        if export_all:
            entities = self.get_all_translatable_entities()
        else:
            entities = [entity]
        
        # Export data
        data = {}
        for entity_name in entities:
            entity_data = self.export_entity(entity_name, missing_only)
            if entity_data:
                data[entity_name] = entity_data
        
        # Generate output
        if fmt == 'json':
            output = json.dumps(data, indent=2, ensure_ascii=False)
        else:
            output = self.to_csv(data)
        
        # Write to file or stdout
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(output)
            self.stdout.write(self.style.SUCCESS(f'Exported to: {output_path}'))
        else:
            self.stdout.write(output)
        
        # Summary
        total_items = sum(len(items) for items in data.values())
        self.stdout.write(self.style.SUCCESS(
            f'\nExported {total_items} items from {len(data)} entities'
        ))
    
    def get_all_translatable_entities(self):
        """Get list of all translatable entity names."""
        return [
            'AssetType', 'ConsumableType', 'StockItemType',
            'LocationType', 'OrganizationalStructureType',
            'PhysicalCondition', 'Role', 'Position',
            'AssetAttributeDefinition', 'ConsumableAttributeDefinition',
            'StockItemAttributeDefinition',
            'MaintenanceTypicalStep', 'ExternalMaintenanceTypicalStep',
            'Location', 'OrganizationalStructure',
        ]
    
    def export_entity(self, entity_name, missing_only):
        """Export translations for a single entity."""
        try:
            base_model = apps.get_model('api', entity_name)
            trans_model_name = f'{entity_name}Translation'
            translation_model = apps.get_model('api', trans_model_name)
            
            # Find FK field
            fk_field = None
            for field in translation_model._meta.fields:
                if field.is_relation and field.many_to_one:
                    fk_field = field.name
                    break
            
            if not fk_field:
                return None
            
            # Find label field
            label_field = None
            for field in translation_model._meta.fields:
                if field.name.endswith('_label') or field.name.endswith('_name'):
                    label_field = field.name
                    break
            
            if not label_field:
                # Try other common field names
                for field in ['description', 'structure_name', 'location_name']:
                    if hasattr(translation_model, field):
                        label_field = field
                        break
            
            if not label_field:
                self.stdout.write(
                    self.style.WARNING(f'No label field found for {entity_name}')
                )
                return None
            
            # Get English translations
            english_trans = translation_model.objects.filter(language_code='en')
            
            if missing_only:
                # Filter out those that already have Arabic
                existing_arabic = set(
                    translation_model.objects.filter(language_code='ar')
                    .values_list(f'{fk_field}_id', flat=True)
                )
                english_trans = english_trans.exclude(
                    **{f'{fk_field}_id__in': existing_arabic}
                )
            
            # Build export data
            items = []
            for trans in english_trans:
                entity = getattr(trans, fk_field)
                english_value = getattr(trans, label_field, '')
                
                if english_value:
                    items.append({
                        'entity_id': entity.pk,
                        'english': english_value,
                        'arabic': '',  # Empty - to be filled by translator
                        'field': label_field,
                    })
            
            return items
            
        except LookupError as e:
            self.stdout.write(
                self.style.WARNING(f'Could not export {entity_name}: {e}')
            )
            return None
    
    def to_csv(self, data):
        """Convert data to CSV format."""
        lines = []
        lines.append('entity,entity_id,field,english,arabic')
        
        for entity_name, items in data.items():
            for item in items:
                lines.append(
                    f'"{entity_name}",{item["entity_id"]},'
                    f'"{item["field"]}","{item["english"]}",'
                    f'"{item["arabic"]}"'
                )
        
        return '\n'.join(lines)
