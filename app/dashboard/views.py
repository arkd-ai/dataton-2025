from django.shortcuts import render
from django.http import JsonResponse
from core.supabase_client import supabase

def index(request):
    """
    Pagina principal:
    - Mapa con diferentes capas
    - Buscador
    - Resultados por institucion
    """
    # Initially empty, waiting for map selection
    context = {
        'institutions': [], 
    }
    return render(request, 'dashboard/index.html', context)

def get_institutions(request):
    entidad_cd = request.GET.get('entidad_cd')
    institutions = []
    if supabase and entidad_cd:
        try:
            response = supabase.table('resumen_declaraciones_institucion_anual').select("*").eq('entidad_cd', entidad_cd).order('total_declaraciones', desc=True).execute()
            institutions = response.data
        except Exception as e:
            print(f"Error fetching data from Supabase: {e}")
    
    return JsonResponse({'institutions': institutions})

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
