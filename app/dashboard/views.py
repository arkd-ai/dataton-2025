from django.shortcuts import render
from core.supabase_client import supabase

def index(request):
    """
    Pagina principal:
    - Mapa con diferentes capas
    - Buscador
    - Resultados por institucion
    """
    context = {
        # Placeholder data for the template
        'institutions': [], 
    }
    return render(request, 'dashboard/index.html', context)

def institution_detail(request, institution_name):
    """
    Detalle de las declaraciones de esa institucion:
    - Lista de declaraciones
    - Grafico de barras apiladas (Stacked bar)
    - Composicion de la Declaracion seleccionada
    """
    context = {
        'institution_name': institution_name,
        'declarations': [],
    }
    return render(request, 'dashboard/detail.html', context)
