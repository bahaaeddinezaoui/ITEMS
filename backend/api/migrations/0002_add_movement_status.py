from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "DO $$ BEGIN\n"
                "    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_status') THEN\n"
                "        CREATE TYPE public.movement_status AS ENUM ('pending', 'rejected', 'accepted');\n"
                "    END IF;\n"
                "END $$;\n",
                "ALTER TABLE public.asset_movement\n"
                "    ADD COLUMN IF NOT EXISTS status public.movement_status NOT NULL DEFAULT 'pending';\n",
                "ALTER TABLE public.stock_item_movement\n"
                "    ADD COLUMN IF NOT EXISTS status public.movement_status NOT NULL DEFAULT 'pending';\n",
                "ALTER TABLE public.consumable_movement\n"
                "    ADD COLUMN IF NOT EXISTS status public.movement_status NOT NULL DEFAULT 'pending';\n",
            ],
            reverse_sql=[
                "ALTER TABLE public.asset_movement DROP COLUMN IF EXISTS status;\n",
                "ALTER TABLE public.stock_item_movement DROP COLUMN IF EXISTS status;\n",
                "ALTER TABLE public.consumable_movement DROP COLUMN IF EXISTS status;\n",
                "DO $$ BEGIN\n"
                "    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_status') THEN\n"
                "        DROP TYPE public.movement_status;\n"
                "    END IF;\n"
                "END $$;\n",
            ],
        ),
    ]
