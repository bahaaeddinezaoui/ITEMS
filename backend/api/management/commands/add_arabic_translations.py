"""
Management command to add Arabic translations.

This command can be used to:
1. Add Arabic translations from a JSON/CSV file
2. Add Arabic translations interactively
3. Import translations from a structured data file

Usage:
    python manage.py add_arabic_translations --file translations.json
    python manage.py add_arabic_translations --entity AssetType --interactive
    python manage.py add_arabic_translations --auto-translate  # Using translation service
"""

import json
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from django.apps import apps


# Common translations for reference data (example - you should customize this)
DEFAULT_ARABIC_TRANSLATIONS = {
    'AssetType': {
        # Add your Arabic translations here
        # 'Mouse': 'ماوس',
        # 'Keyboard': 'لوحة مفاتيح',
    },
    'PhysicalCondition': {
        'New': 'جديد',
        'Very good': 'ممتاز',
        'Good': 'جيد',
        'Damaged': 'تالف',
        'Broken': 'معطل',
    },
    'LocationType': {
        'Office': 'مكتب',
        'Storage': 'مخزن',
        'Server room': 'غرفة الخوادم',
        'Workshop': 'ورشة عمل',
    },
}


class Command(BaseCommand):
    help = 'Add Arabic translations to the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to JSON file containing translations',
        )
        parser.add_argument(
            '--entity',
            type=str,
            help='Specific entity to translate (e.g., AssetType)',
        )
        parser.add_argument(
            '--interactive',
            action='store_true',
            help='Interactive mode - prompt for each translation',
        )
        parser.add_argument(
            '--use-defaults',
            action='store_true',
            help='Use built-in default translations for common terms',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview changes without writing to database',
        )

    def handle(self, *args, **options):
        file_path = options.get('file')
        entity = options.get('entity')
        interactive = options['interactive']
        use_defaults = options['use_defaults']
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made\n'))
        
        stats = {'created': 0, 'updated': 0, 'skipped': 0, 'errors': 0}
        
        if file_path:
            self.process_file(file_path, dry_run, stats)
        elif use_defaults:
            self.process_defaults(entity, dry_run, stats)
        elif interactive:
            self.process_interactive(entity, dry_run, stats)
        else:
            self.stdout.write(
                self.style.ERROR('Please specify one of: --file, --use-defaults, or --interactive')
            )
            return
        
        self.print_summary(stats)
    
    def process_file(self, file_path, dry_run, stats):
        """Process translations from JSON file."""
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.stdout.write(f'Processing translations from {file_path}...\n')
        
        # Expected format: {"EntityName": [{"entity_id": 1, "field": "value", ...}, ...]}
        for entity_name, translations in data.items():
            self.process_entity_translations(entity_name, translations, dry_run, stats)
    
    def process_defaults(self, specific_entity, dry_run, stats):
        """Process built-in default translations."""
        self.stdout.write('Processing default Arabic translations...\n')
        
        entities = [specific_entity] if specific_entity else DEFAULT_ARABIC_TRANSLATIONS.keys()
        
        for entity_name in entities:
            if entity_name not in DEFAULT_ARABIC_TRANSLATIONS:
                self.stdout.write(self.style.WARNING(f'No defaults for {entity_name}'))
                continue
            
            translations = []
            base_model = apps.get_model('api', entity_name)
            
            # Get English translations to match with Arabic
            trans_model_name = f'{entity_name}Translation'
            translation_model = apps.get_model('api', trans_model_name)
            
            # Find FK field
            fk_field = self.get_fk_field(translation_model)
            if not fk_field:
                continue
            
            # Get all English translations
            english_trans = translation_model.objects.filter(language_code='en')
            
            for eng in english_trans:
                entity = getattr(eng, fk_field)
                base_obj = entity
                
                # Match based on label field
                for field_name in ['asset_type_label', 'consumable_type_label', 
                                  'stock_item_type_label', 'location_type_label',
                                  'condition_label', 'role_label', 'position_label']:
                    if hasattr(eng, field_name):
                        english_value = getattr(eng, field_name)
                        if english_value in DEFAULT_ARABIC_TRANSLATIONS[entity_name]:
                            arabic_value = DEFAULT_ARABIC_TRANSLATIONS[entity_name][english_value]
                            translations.append({
                                'entity_id': base_obj.pk,
                                field_name: arabic_value,
                            })
                        break
            
            if translations:
                self.process_entity_translations(entity_name, translations, dry_run, stats)
    
    def process_interactive(self, specific_entity, dry_run, stats):
        """Interactive mode - prompt user for translations."""
        self.stdout.write('Interactive Arabic Translation Mode\n')
        self.stdout.write('=' * 50 + '\n')
        
        # Get list of translatable entities
        if specific_entity:
            entities = [specific_entity]
        else:
            entities = [
                'AssetType', 'ConsumableType', 'StockItemType', 
                'LocationType', 'PhysicalCondition', 'Role', 'Position'
            ]
        
        for entity_name in entities:
            try:
                base_model = apps.get_model('api', entity_name)
                trans_model_name = f'{entity_name}Translation'
                translation_model = apps.get_model('api', trans_model_name)
                
                fk_field = self.get_fk_field(translation_model)
                if not fk_field:
                    continue
                
                # Get entities without Arabic translation
                english_trans = translation_model.objects.filter(language_code='en')
                existing_arabic = set(
                    translation_model.objects.filter(language_code='ar')
                    .values_list(f'{fk_field}_id', flat=True)
                )
                
                to_translate = english_trans.exclude(**{f'{fk_field}_id__in': existing_arabic})
                
                if not to_translate.exists():
                    self.stdout.write(f'{entity_name}: All items already have Arabic translations')
                    continue
                
                self.stdout.write(f'\n{entity_name} - {to_translate.count()} items need translation:')
                self.stdout.write('-' * 50)
                
                for eng in to_translate[:20]:  # Limit to 20 per session
                    entity = getattr(eng, fk_field)
                    
                    # Find the label field
                    label_field = None
                    for field in ['asset_type_label', 'consumable_type_label', 
                                 'stock_item_type_label', 'location_type_label',
                                 'condition_label', 'role_label', 'position_label',
                                 'structure_name', 'location_name']:
                        if hasattr(eng, field):
                            label_field = field
                            break
                    
                    if not label_field:
                        continue
                    
                    english_text = getattr(eng, label_field)
                    
                    # Prompt for Arabic translation
                    self.stdout.write(f'\nEnglish: {english_text}')
                    arabic_text = input('Arabic: ').strip()
                    
                    if arabic_text:
                        if not dry_run:
                            translation_model.objects.create(
                                **{fk_field: entity},
                                language_code='ar',
                                **{label_field: arabic_text}
                            )
                            stats['created'] += 1
                        else:
                            stats['created'] += 1
                            self.stdout.write(self.style.SUCCESS(f'  [DRY RUN] Would create: {arabic_text}'))
                    else:
                        stats['skipped'] += 1
                        self.stdout.write('  Skipped')
                
            except LookupError as e:
                self.stdout.write(self.style.WARNING(f'Could not process {entity_name}: {e}'))
    
    def process_entity_translations(self, entity_name, translations, dry_run, stats):
        """Process translations for a specific entity."""
        try:
            base_model = apps.get_model('api', entity_name)
            trans_model_name = f'{entity_name}Translation'
            translation_model = apps.get_model('api', trans_model_name)
            
            fk_field = self.get_fk_field(translation_model)
            if not fk_field:
                self.stdout.write(self.style.ERROR(f'No FK field in {trans_model_name}'))
                stats['errors'] += 1
                return
            
            for trans_data in translations:
                entity_id = trans_data.pop('entity_id')
                
                try:
                    entity = base_model.objects.get(pk=entity_id)
                except base_model.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'  {entity_name} #{entity_id} not found')
                    )
                    stats['errors'] += 1
                    continue
                
                # Check if Arabic translation exists
                existing = translation_model.objects.filter(
                    **{fk_field: entity},
                    language_code='ar'
                ).first()
                
                if existing:
                    # Update existing
                    if not dry_run:
                        for field, value in trans_data.items():
                            setattr(existing, field, value)
                        existing.save()
                    stats['updated'] += 1
                else:
                    # Create new
                    if not dry_run:
                        translation_model.objects.create(
                            **{fk_field: entity},
                            language_code='ar',
                            **trans_data
                        )
                    stats['created'] += 1
                    
        except LookupError as e:
            self.stdout.write(self.style.ERROR(f'Model error for {entity_name}: {e}'))
            stats['errors'] += 1
    
    def get_fk_field(self, translation_model):
        """Get the foreign key field name from translation model."""
        for field in translation_model._meta.fields:
            if field.is_relation and field.many_to_one:
                return field.name
        return None
    
    def print_summary(self, stats):
        """Print summary statistics."""
        self.stdout.write(self.style.SUCCESS(
            f'\n{"="*50}\n'
            f'TRANSLATION SUMMARY:\n'
            f'  Created: {stats["created"]}\n'
            f'  Updated: {stats["updated"]}\n'
            f'  Skipped: {stats["skipped"]}\n'
            f'  Errors: {stats["errors"]}\n'
            f'{"="*50}'
        ))
