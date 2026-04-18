"""
Management command to apply i18n translation tables SQL migration.

Usage:
    python manage.py apply_i18n_translation_tables

This command runs the SQL migration file that creates all translation tables
and migrates existing data as English default.
"""

import os
from django.core.management.base import BaseCommand
from django.db import connection, transaction


class Command(BaseCommand):
    help = 'Apply i18n translation tables SQL migration'

    def handle(self, *args, **options):
        # Path to SQL file
        migrations_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'migrations'
        )
        sql_file = os.path.join(migrations_dir, '0013_add_i18n_translation_tables.sql')
        
        if not os.path.exists(sql_file):
            self.stdout.write(
                self.style.ERROR(f'SQL file not found: {sql_file}')
            )
            return
        
        self.stdout.write(f'Reading SQL file: {sql_file}')
        
        # Read SQL file
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Execute SQL
        self.stdout.write('Executing SQL migration...')
        
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # Execute each statement separately
                    statements = sql_content.split(';')
                    for i, statement in enumerate(statements):
                        statement = statement.strip()
                        if statement and not statement.startswith('--'):
                            try:
                                cursor.execute(statement)
                                if i % 10 == 0:
                                    self.stdout.write(f'  Executed statement {i}/{len(statements)}')
                            except Exception as e:
                                self.stdout.write(
                                    self.style.WARNING(f'  Skipped statement {i}: {str(e)[:100]}')
                                )
                
                self.stdout.write(
                    self.style.SUCCESS('Successfully applied i18n translation tables!')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error applying migration: {e}')
            )
            raise
