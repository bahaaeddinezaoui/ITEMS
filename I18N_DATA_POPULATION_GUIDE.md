# I18N Data Population Guide

## Overview

This guide explains how to populate the translation tables with data. There are three phases:
1. **Phase 1**: Populate with English defaults (already done by SQL migration)
2. **Phase 2**: Add Arabic translations
3. **Phase 3**: Verify coverage

---

## Phase 1: Apply Database Migration (One-time)

### Method A: Using Django Management Command
```bash
cd backend
python manage.py apply_i18n_translation_tables
```

### Method B: Manual SQL Execution
```bash
# Connect to PostgreSQL
psql -U postgres -d your_database_name

# Execute the migration
\i backend/api/migrations/0013_add_i18n_translation_tables.sql
```

### Verification
After migration, check that tables were created:
```sql
\dt *_translation
```

---

## Phase 2: Populate English Defaults (if needed)

If the SQL migration didn't populate data, or you need to re-populate:

```bash
cd backend
python manage.py populate_translation_tables
```

Options:
```bash
# Dry run (preview without changes)
python manage.py populate_translation_tables --dry-run

# Verbose output (show each record)
python manage.py populate_translation_tables --verbose

# Specific entity only
python manage.py populate_translation_tables --entity AssetType
```

---

## Phase 3: Add Arabic Translations

### Method 1: Using Translation File (Recommended for bulk)

1. **Export template**:
```bash
python manage.py export_translation_template --all --format json --output translations_to_fill.json
```

2. **Edit the file** and add Arabic translations:
```json
{
  "AssetType": [
    {
      "entity_id": 1,
      "asset_type_label": "ماوس"
    }
  ]
}
```

3. **Import translations**:
```bash
python manage.py add_arabic_translations --file translations_to_fill.json
```

### Method 2: Interactive Mode (For small batches)

```bash
python manage.py add_arabic_translations --entity AssetType --interactive
```

This will prompt you for each item:
```
AssetType - 3 items need translation:
--------------------------------------------------

English: Mouse
Arabic: ماوس

English: Keyboard
Arabic: لوحة مفاتيح
```

### Method 3: Using Default Translations (For common terms)

```bash
python manage.py add_arabic_translations --use-defaults
```

This applies built-in translations for common terms like:
- Location Types: Office → مكتب, Storage → مخزن
- Physical Conditions: New → جديد, Good → جيد

---

## Phase 4: Verify Coverage

### Check Overall Statistics
```bash
python manage.py translation_coverage
```

Output example:
```
================================================================================
Entity                              Total       EN       AR  Coverage %
================================================================================
AssetType                               5        5        0        0.0%  ← ERROR
ConsumableType                          3        3        3      100.0%  ← SUCCESS
LocationType                            4        4        4      100.0%  ← SUCCESS
PhysicalCondition                       5        5        5      100.0%  ← SUCCESS
Role                                    4        4        2       50.0%  ← WARNING
Position                                3        3        1       33.3%  ← WARNING
================================================================================
OVERALL: 77 entities, 45 Arabic translations (58.4% coverage)
================================================================================
```

### Show Only Missing Translations
```bash
python manage.py translation_coverage --missing-only
```

### Check Specific Entity
```bash
python manage.py translation_coverage --entity AssetType
```

---

## Example: Complete Workflow

```bash
# Step 1: Apply database migration
python manage.py apply_i18n_translation_tables

# Step 2: Verify English defaults were populated
python manage.py translation_coverage

# Step 3: Export template for translation
python manage.py export_translation_template --all --missing-only --output ar_translations.json

# Step 4: Edit ar_translations.json (fill in Arabic values)
# Use any text editor or provide to translator

# Step 5: Import Arabic translations
python manage.py add_arabic_translations --file ar_translations.json

# Step 6: Verify final coverage
python manage.py translation_coverage
```

---

## JSON File Format

### Simple Entity (single field):
```json
{
  "LocationType": [
    {
      "entity_id": 1,
      "location_type_label": "مكتب"
    },
    {
      "entity_id": 2,
      "location_type_label": "مخزن"
    }
  ]
}
```

### Complex Entity (multiple fields):
```json
{
  "PhysicalCondition": [
    {
      "entity_id": 1,
      "condition_label": "جديد",
      "description": "لم يستخدم أبداً"
    },
    {
      "entity_id": 2,
      "condition_label": "ممتاز",
      "description": "مستعمل، كالجديد"
    }
  ]
}
```

### Person Entity (names):
```json
{
  "Person": [
    {
      "entity_id": 1,
      "first_name": "أحمد",
      "last_name": "محمد"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: "Table does not exist"
**Solution**: Run the SQL migration first
```bash
python manage.py apply_i18n_translation_tables
```

### Issue: "No translations created"
**Solution**: Check if base table has data
```sql
SELECT COUNT(*) FROM asset_type;
```

### Issue: "Duplicate key violation"
**Solution**: Translation already exists, use update mode or skip
```bash
python manage.py add_arabic_translations --file translations.json  # Will update existing
```

### Issue: Model not found
**Solution**: Ensure Django models are properly defined in `api/models/translations.py`

---

## Tips for Translators

1. **Use the CSV format** for easier editing in Excel:
```bash
python manage.py export_translation_template --all --format csv --output translations.csv
```

2. **Work entity by entity** to avoid confusion:
```bash
python manage.py export_translation_template --entity AssetType --format json
```

3. **Test with small batches** first:
```bash
python manage.py add_arabic_translations --file small_test.json --dry-run
```

4. **Keep backups** before bulk operations:
```bash
pg_dump -U postgres -d your_db > backup_before_translations.sql
```

---

## API Endpoints for Translation Management

After data is populated, you can manage translations via API:

### Get translations:
```bash
GET /api/translations/asset-types/?lang=ar
```

### Add translation:
```bash
POST /api/translations/asset-types/
{
  "asset_type": 1,
  "language_code": "ar",
  "asset_type_label": "ماوس"
}
```

### Bulk update:
```bash
POST /api/translations/asset-types/bulk_update/
{
  "translations": [
    {"entity_id": 1, "language_code": "ar", "asset_type_label": "ماوس"},
    {"entity_id": 2, "language_code": "ar", "asset_type_label": "لوحة مفاتيح"}
  ]
}
```

### Check I18N metadata:
```bash
GET /api/i18n/metadata/
```

---

## Next Steps

1. ✅ Run database migration
2. ✅ Verify English defaults
3. ✅ Export translation template
4. 🔄 Fill in Arabic translations (manual or with translator)
5. 🔄 Import Arabic translations
6. 🔄 Verify coverage reaches 100%
7. 🔄 Update frontend to use translations
