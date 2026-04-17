-- Migration script to convert organizational_structure.structure_type to a foreign key table
-- Step 1: Create the new organizational_structure_type table
CREATE TABLE IF NOT EXISTS organizational_structure_type (
    organizational_structure_type_id SERIAL PRIMARY KEY,
    organizational_structure_type VARCHAR(30) NOT NULL UNIQUE
);

-- Step 2: Insert existing structure_type values into the new table
INSERT INTO organizational_structure_type (organizational_structure_type)
SELECT DISTINCT structure_type 
FROM organizational_structure 
WHERE structure_type IS NOT NULL AND structure_type != ''
ON CONFLICT DO NOTHING;

-- Step 3: Add the new foreign key column to organizational_structure
ALTER TABLE organizational_structure 
ADD COLUMN IF NOT EXISTS structure_type_id INTEGER;

-- Step 4: Update the foreign key column with corresponding IDs
UPDATE organizational_structure os
SET structure_type_id = ost.organizational_structure_type_id
FROM organizational_structure_type ost
WHERE os.structure_type = ost.organizational_structure_type;

-- Step 5: Add foreign key constraint
ALTER TABLE organizational_structure
ADD CONSTRAINT fk_organizational_structure_type
FOREIGN KEY (structure_type_id) REFERENCES organizational_structure_type(organizational_structure_type_id);

-- Step 6: Drop the old structure_type column
ALTER TABLE organizational_structure DROP COLUMN IF EXISTS structure_type;

-- Step 7: Add NOT NULL constraint if desired (optional - remove if you want to allow NULLs)
-- ALTER TABLE organizational_structure ALTER COLUMN structure_type_id SET NOT NULL;

-- Verify the migration
SELECT * FROM organizational_structure_type;
SELECT organizational_structure_id, structure_code, structure_name, structure_type_id, is_active FROM organizational_structure;
