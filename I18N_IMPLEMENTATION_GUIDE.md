# I18N Implementation Guide

## Overview

This implementation follows **Option 2, Variant A**: Per-entity translation tables. All translatable content is stored in dedicated translation tables with foreign keys to parent entities, supporting English (`en`) and Arabic (`ar`) languages (extensible to more).

## Architecture

### Database Schema

Translation tables follow this pattern:

```
{entity}_translation
├── id (PK)
├── {entity}_id (FK to parent entity)
├── language_code ('en' or 'ar')
├── {translatable_field(s)}
├── created_at
└── updated_at

UNIQUE constraint on (entity_id, language_code)
```

### Translation Models Created

#### 1. Reference/Dictionary Data (UI Labels)
- `asset_type_translation` - Asset type labels
- `consumable_type_translation` - Consumable type labels
- `stock_item_type_translation` - Stock item type labels
- `location_type_translation` - Location type labels
- `organizational_structure_type_translation` - Org structure type labels
- `physical_condition_translation` - Condition labels and descriptions
- `role_translation` - Role labels and descriptions
- `position_translation` - Position labels and descriptions
- `asset_attribute_definition_translation` - Attribute descriptions
- `consumable_attribute_definition_translation` - Attribute descriptions
- `stock_item_attribute_definition_translation` - Attribute descriptions
- `maintenance_typical_step_translation` - Step descriptions
- `external_maintenance_typical_step_translation` - Step descriptions

#### 2. Entity Names
- `person_translation` - Person first/last names
- `supplier_translation` - Supplier names and addresses
- `warehouse_translation` - Warehouse names and addresses
- `location_translation` - Location names
- `organizational_structure_translation` - Structure names

#### 3. Operational Text
- `asset_movement_translation` - Movement reasons
- `consumable_movement_translation` - Movement reasons
- `stock_item_movement_translation` - Movement reasons
- `person_reports_problem_on_asset_translation` - Problem observations
- `person_reports_problem_on_consumable_translation` - Problem observations
- `person_reports_problem_on_stock_item_translation` - Problem observations
- `maintenance_translation` - Maintenance descriptions
- `asset_condition_history_translation` - Notes and issues
- `consumable_condition_history_translation` - Notes and issues
- `stock_item_condition_history_translation` - Notes and issues

#### 4. Other Human-Facing Text
- `asset_translation` - Asset names
- `consumable_translation` - Consumable names
- `stock_item_translation` - Stock item names
- `asset_model_translation` - Model names and notes
- `consumable_model_translation` - Model names and notes
- `stock_item_model_translation` - Model names and notes
- `administrative_certificate_translation` - Organization names
- `company_asset_request_translation` - Demand titles
- `external_maintenance_document_translation` - Provider decisions
- `maintenance_step_item_request_translation` - Request notes

## Files Created

### Database Migration
- `backend/api/migrations/0013_add_i18n_translation_tables.sql` - Raw SQL migration
- `backend/api/migrations/0013_add_i18n_translation_tables.py` - Django migration

### Django Models
- `backend/api/models/translations.py` - All 41 translation models
- `backend/api/models/__init__.py` - Exports for translation models

### Utilities
- `backend/api/utils/i18n.py` - Helper functions for translation handling
- `backend/api/utils/__init__.py` - Utility exports

### Serializers
- `backend/api/serializers/mixins.py` - `TranslatableFieldMixin` and `TranslatableModelSerializer`

### API Views
- `backend/api/views_i18n.py` - ViewSets for translation CRUD operations
- `backend/api/urls_i18n.py` - URL routes for translation APIs

### Management Command
- `backend/api/management/commands/apply_i18n_translation_tables.py` - Apply SQL migration

## Usage Guide

### 1. Apply the Database Migration

Option A: Using Django management command:
```bash
cd backend
python manage.py apply_i18n_translation_tables
```

Option B: Using Django migrate:
```bash
cd backend
python manage.py migrate
```

Option C: Manual SQL execution:
```bash
psql -U your_user -d your_db -f backend/api/migrations/0013_add_i18n_translation_tables.sql
```

### 2. Accessing Translations in Serializers

#### Method 1: Using TranslatableFieldMixin
```python
from api.serializers.mixins import TranslatableFieldMixin

class AssetTypeSerializer(TranslatableFieldMixin, serializers.ModelSerializer):
    asset_type_label = serializers.SerializerMethodField()
    
    class Meta:
        model = AssetType
        fields = ['asset_type_id', 'asset_type_label', 'asset_type_code']
    
    def get_asset_type_label(self, obj):
        return self.get_translated_field(
            obj, 'asset_type_label', 'AssetTypeTranslation'
        )
```

#### Method 2: Using Utility Functions
```python
from api.utils.i18n import translate_field

# In a view or serializer
translated_label = translate_field(
    entity=asset_type,
    language_code='ar',
    base_field_name='asset_type_label',
    translation_model=AssetTypeTranslation
)
```

#### Method 3: Using TranslatableModelSerializer
```python
from api.serializers.mixins import TranslatableModelSerializer

class AssetTypeSerializer(TranslatableModelSerializer):
    class Meta:
        model = AssetType
        fields = ['asset_type_id', 'asset_type_label', 'asset_type_code']
        translatable_fields = ['asset_type_label']
        translation_model = 'AssetTypeTranslation'
```

### 3. Specifying Language in API Requests

#### Query Parameter:
```
GET /api/asset-types/?lang=ar
```

#### Header:
```
Accept-Language: ar
```

### 4. Managing Translations via API

#### Get translations for an entity:
```
GET /api/translations/asset-types/?asset_type=1&lang=ar
```

#### Create/update translation:
```
POST /api/translations/asset-types/
{
    "asset_type": 1,
    "language_code": "ar",
    "asset_type_label": "ماوس"
}
```

#### Bulk update translations:
```
POST /api/translations/asset-types/bulk_update/
{
    "translations": [
        {"entity_id": 1, "language_code": "ar", "asset_type_label": "ماوس"},
        {"entity_id": 2, "language_code": "ar", "asset_type_label": "لوحة مفاتيح"}
    ]
}
```

### 5. Getting I18N Metadata

```
GET /api/i18n/metadata/
```

Returns:
```json
{
    "available_languages": [
        {"code": "en", "name": "English", "is_default": true},
        {"code": "ar", "name": "Arabic", "is_default": false}
    ],
    "translatable_entities": ["AssetType", "ConsumableType", ...],
    "coverage_stats": {
        "AssetType": {
            "total_entities": 10,
            "english_translations": 10,
            "arabic_translations": 5,
            "coverage_percent": 50.0
        }
    }
}
```

### 6. Searching Translations

```
GET /api/i18n/search/?q=ماوس&lang=ar
```

## Integration Checklist

### Backend Changes Required:

1. **Update main urls.py** to include i18n URLs:
```python
# In backend/api/urls.py or backend/urls.py
from django.urls import path, include

urlpatterns = [
    # ... existing URLs
    path('api/', include('api.urls_i18n')),
]
```

2. **Update existing serializers** to use translation mixins for translatable fields

3. **Add middleware** (optional) to extract language from request:
```python
# In settings.py
MIDDLEWARE = [
    # ... existing middleware
    'api.middleware.LanguageMiddleware',  # Create this
]
```

### Frontend Changes Required:

1. **Add language selector** to UI
2. **Send language header** with all API requests:
```javascript
fetch('/api/asset-types/', {
    headers: {
        'Accept-Language': 'ar'
    }
})
```
3. **Handle RTL layout** for Arabic interface
4. **Create translation management UI** for admins to add/edit translations

## Migration Strategy

### Phase 1: Database (Completed)
- ✓ Create translation tables
- ✓ Migrate existing data as English default

### Phase 2: Backend Integration (In Progress)
- Update serializers to use translation mixins
- Add language detection middleware
- Test all API endpoints with both languages

### Phase 3: Frontend Integration
- Add language switcher
- Implement RTL support
- Create translation admin interface

### Phase 4: Data Population
- Add Arabic translations for all reference data
- Translate operational text as needed

## Query Performance Tips

### 1. Use select_related for translations:
```python
# Good: Single query with join
AssetType.objects.prefetch_related('translations')

# Even better: Filter by language in query
AssetTypeTranslation.objects.filter(
    language_code='ar'
).select_related('asset_type')
```

### 2. Cache frequently accessed translations:
```python
from django.core.cache import cache

def get_cached_translation(entity_id, lang):
    cache_key = f'translation:{entity_id}:{lang}'
    value = cache.get(cache_key)
    if not value:
        value = AssetTypeTranslation.objects.get(
            asset_type_id=entity_id,
            language_code=lang
        ).asset_type_label
        cache.set(cache_key, value, 3600)
    return value
```

## Security Considerations

1. **Permission control**: Translation APIs require authentication
2. **Admin-only**: Bulk update operations should be restricted to admins
3. **Input validation**: All translated content is validated against max lengths
4. **Audit trail**: `created_at` and `updated_at` timestamps track changes

## Troubleshooting

### Issue: Translation not appearing
- Check that translation exists in database for the requested language
- Verify language code format (should be 'ar' not 'AR' or 'arabic')
- Check that serializer is using translation mixin

### Issue: Database migration fails
- Ensure all parent tables exist before running migration
- Check for foreign key constraint violations
- Run migration manually with SQL to see specific errors

### Issue: Performance degradation
- Add database indexes on (entity_id, language_code) columns
- Use prefetch_related in queries
- Consider caching for frequently accessed translations
