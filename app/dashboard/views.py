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
    entidad_cd = request.GET.get('entidad_cd')
    try:
        page = int(request.GET.get('page', 1))
    except ValueError:
        page = 1
        
    page_size = 20
    declarations = []
    total_count = 0
    
    if supabase and entidad_cd:
        try:
            start = (page - 1) * page_size
            end = start + page_size - 1
            
            # Filter by ENTIDAD_CD and INSTITUCION
            response = supabase.table('declaracion_individual')\
                .select("*,diferencia_ingresos", count='exact')\
                .eq('ENTIDAD_CD', entidad_cd)\
                .eq('INSTITUCION', institution_name)\
                .gt('REMUNERACION_ANUAL_CARGO_PUBLICO', 0)\
                .gt('INGRESO_ANUAL_NETO_DECLARANTE', 0)\
                .order('diferencia_ingresos', desc=True)\
                .range(start, end)\
                .execute()
            
            declarations = response.data
            total_count = response.count if response.count else 0
            
        except Exception as e:
            print(f"Error fetching declarations: {e}")

    total_pages = (total_count + page_size - 1) // page_size
    
    # Calculate offset for the counter
    page_offset = (page - 1) * page_size

    context = {
        'institution_name': institution_name,
        'entidad_cd': entidad_cd,
        'declarations': declarations,
        'current_page': page,
        'total_pages': total_pages,
        'page_offset': page_offset,
        'has_previous': page > 1,
        'has_next': page < total_pages,
        'previous_page_num': page - 1,
        'next_page_num': page + 1,
    }
    return render(request, 'dashboard/detail.html', context)
