from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('institution/<str:institution_name>/', views.institution_detail, name='institution_detail'),
]
