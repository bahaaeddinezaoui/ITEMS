from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_rename_bdc_to_purchase_order_tables"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE IF EXISTS public.bon_de_commande
                RENAME TO purchase_order;

            COMMENT ON TABLE public.purchase_order IS
                'Renamed from bon_de_commande';

            ALTER TABLE IF EXISTS public.bon_de_livraison
                RENAME TO delivery_note;

            COMMENT ON TABLE public.delivery_note IS
                'Renamed from bon_de_livraison';

            ALTER TABLE IF EXISTS public.bon_de_reste
                RENAME TO backorder_report;

            COMMENT ON TABLE public.backorder_report IS
                'Renamed from bon_de_reste';
            """,
            reverse_sql="""
            ALTER TABLE IF EXISTS public.purchase_order
                RENAME TO bon_de_commande;

            COMMENT ON TABLE public.bon_de_commande IS
                'Renamed from purchase_order';

            ALTER TABLE IF EXISTS public.delivery_note
                RENAME TO bon_de_livraison;

            COMMENT ON TABLE public.bon_de_livraison IS
                'Renamed from delivery_note';

            ALTER TABLE IF EXISTS public.backorder_report
                RENAME TO bon_de_reste;

            COMMENT ON TABLE public.bon_de_reste IS
                'Renamed from backorder_report';
            """,
        ),
    ]
