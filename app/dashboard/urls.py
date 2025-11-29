from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/institutions/', views.get_institutions, name='get_institutions'),
    path('institution/<str:institution_name>/', views.institution_detail, name='institution_detail'),
]
