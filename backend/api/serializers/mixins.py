"""
Serializer mixins for I18N support.

These mixins make it easy to include translated fields in serializers.
"""

from typing import Any, Optional
from rest_framework import serializers


class TranslatableFieldMixin:
    """
    Mixin to add translated field support to serializers.
    
    Usage:
        class AssetTypeSerializer(TranslatableFieldMixin, serializers.ModelSerializer):
            asset_type_label = serializers.SerializerMethodField()
            
            class Meta:
                model = AssetType
                fields = ['asset_type_id', 'asset_type_label', 'asset_type_code']
            
            def get_asset_type_label(self, obj):
                return self.get_translated_field(
                    obj, 'asset_type_label', 'AssetTypeTranslation'
                )
    """
    
    def get_language_code(self) -> str:
        """Get language code from request context."""
        request = self.context.get('request')
        if request:
            # Try to get from query param, header, or user preference
            lang = request.query_params.get('lang')
            if lang:
                return lang
            
            # Check Accept-Language header
            lang = request.headers.get('Accept-Language', '').split(',')[0].split(';')[0].strip()
            if lang:
                # Normalize language code (e.g., 'ar-SA' -> 'ar')
                return lang.split('-')[0].lower()
        
        return 'en'  # Default to English
    
    def get_translated_field(self, obj: Any, field_name: str, 
                            translation_model_name: str) -> Any:
        """
        Get translated field value with fallback to base field.
        
        Args:
            obj: The base entity instance
            field_name: Name of the field to translate
            translation_model_name: Name of the translation model (e.g., 'AssetTypeTranslation')
        
        Returns:
            Translated value or base field value
        """
        from django.apps import apps
        from api.utils.i18n import get_translation_for_entity
        
        language_code = self.get_language_code()
        
        # If English, return base field directly
        if language_code == 'en':
            return getattr(obj, field_name, None)
        
        # Get translation model
        try:
            translation_model = apps.get_model('api', translation_model_name)
        except LookupError:
            return getattr(obj, field_name, None)
        
        # Try to get translation
        translation = get_translation_for_entity(obj, language_code, translation_model)
        if translation:
            translated_value = getattr(translation, field_name, None)
            if translated_value:
                return translated_value
        
        # Fallback to base field
        return getattr(obj, field_name, None)


class TranslatableModelSerializer(TranslatableFieldMixin, serializers.ModelSerializer):
    """
    Base serializer that automatically handles translated fields.
    
    Define translatable_fields in Meta class:
    
        class AssetTypeSerializer(TranslatableModelSerializer):
            class Meta:
                model = AssetType
                fields = ['asset_type_id', 'asset_type_label', 'asset_type_code']
                translatable_fields = ['asset_type_label']
                translation_model = 'AssetTypeTranslation'
    """
    
    def to_representation(self, instance):
        """Override to inject translated values."""
        data = super().to_representation(instance)
        
        translatable_fields = getattr(self.Meta, 'translatable_fields', [])
        translation_model = getattr(self.Meta, 'translation_model', None)
        
        if not translatable_fields or not translation_model:
            return data
        
        language_code = self.get_language_code()
        if language_code == 'en':
            return data  # No translation needed
        
        # Get translation
        from django.apps import apps
        from api.utils.i18n import get_translation_for_entity
        
        try:
            translation_model_cls = apps.get_model('api', translation_model)
            translation = get_translation_for_entity(instance, language_code, translation_model_cls)
            
            if translation:
                for field in translatable_fields:
                    translated_value = getattr(translation, field, None)
                    if translated_value:
                        data[field] = translated_value
        except LookupError:
            pass
        
        return data


# ============================================================================
# Convenience Functions for Serializers
# ============================================================================

def create_translated_field(field_name: str, translation_model_name: str) -> serializers.SerializerMethodField:
    """
    Create a SerializerMethodField that returns translated value.
    
    Usage:
        class MySerializer(serializers.ModelSerializer):
            name = create_translated_field('name', 'AssetTypeTranslation')
    """
    def get_field(self, obj):
        return self.get_translated_field(obj, field_name, translation_model_name)
    
    return serializers.SerializerMethodField(get_field)


def make_serializer_translatable(serializer_class, translatable_fields: list, 
                                 translation_model_name: str):
    """
    Dynamically add translation support to an existing serializer.
    
    Usage:
        TranslatableAssetTypeSerializer = make_serializer_translatable(
            AssetTypeSerializer,
            ['asset_type_label'],
            'AssetTypeTranslation'
        )
    """
    # Add mixin to bases
    new_bases = (TranslatableFieldMixin,) + serializer_class.__bases__
    
    # Create new serializer class
    new_serializer = type(
        f'Translatable{serializer_class.__name__}',
        new_bases,
        dict(serializer_class.__dict__)
    )
    
    # Add translation methods for each field
    for field in translatable_fields:
        method_name = f'get_{field}'
        
        def make_getter(field_name, model_name):
            def getter(self, obj):
                return self.get_translated_field(obj, field_name, model_name)
            return getter
        
        setattr(new_serializer, method_name, make_getter(field, translation_model_name))
    
    return new_serializer
