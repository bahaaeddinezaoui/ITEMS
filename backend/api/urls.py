from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, PersonViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]
