import json
import pandas as pd
import os
import sys

class S1Extractor:
    """
    Clase para procesar y extraer datos de archivos JSON del Sistema 1 (Declaraciones).
    Genera archivos CSV estandarizados organizados por carpetas.
    """
    
    def __init__(self, file_path, output_dir, state_name):
        self.file_path = file_path
        self.output_dir = os.path.join(output_dir, state_name)
        self.state_name = state_name
        self.data = []
        
        # DataFrames
        self.dfs = {}

        # Crear directorio específico para el estado
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def load_data(self):
        print(f"[{self.state_name}] Cargando {os.path.basename(self.file_path)}...")
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            print(f"[{self.state_name}] ✅ Datos cargados: {len(self.data)} registros.")
            return True
        except Exception as e:
            print(f"[{self.state_name}] ❌ Error cargando archivo: {e}")
            return False

    def get_list(self, obj, keys_candidates):
        """Helper to find a list inside a dictionary trying multiple keys"""
        if isinstance(obj, list):
            return obj
        if isinstance(obj, dict):
            for k in keys_candidates:
                if k in obj and isinstance(obj[k], list):
                    return obj[k]
            # Fallback: search for any list
            for v in obj.values():
                if isinstance(v, list):
                    return v
        return []

    def process_general(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            
            m = entry.get('metadata', {})
            if not isinstance(m, dict): m = {}
            
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            
            generales = pat.get('datosGenerales', {})
            if not isinstance(generales, dict): generales = {}
            
            empleo = pat.get('datosEmpleoCargoComision', {})
            
            # Handle empleo being a list or dict? Usually dict in recent standards, but verify
            if isinstance(empleo, list) and len(empleo) > 0:
                empleo = empleo[0]
            if not isinstance(empleo, dict): empleo = {}
            
            correo_obj = generales.get('correoElectronico', {})
            if not isinstance(correo_obj, dict): correo_obj = {}
            
            row = {
                'id': entry.get('id'),
                'fecha_actualizacion': m.get('actualizacion'),
                'institucion': m.get('institucion'),
                'tipo_declaracion': m.get('tipo'),
                'nombre': generales.get('nombre'),
                'primer_apellido': generales.get('primerApellido'),
                'segundo_apellido': generales.get('segundoApellido'),
                'correo': correo_obj.get('institucional') if correo_obj else generales.get('correoElectronico'),
                'empleo_nombre_ente': empleo.get('nombreEntePublico'),
                'empleo_cargo': empleo.get('empleoCargoComision'),
                'empleo_nivel': empleo.get('nivelEmpleoCargoComision'),
                'state': self.state_name
            }
            rows.append(row)
        self.dfs['s1_resumen'] = pd.DataFrame(rows)

    def process_ingresos(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            
            ingresos = pat.get('ingresos', {})
            
            # Validación de seguridad: ingresos debe ser un diccionario
            if not isinstance(ingresos, dict):
                ingresos = {}
            
            row = {
                'id': entry.get('id'),
                'state': self.state_name,
                'remuneracion_mensual_cargo': ingresos.get('remuneracionMensualCargoPublico', {}).get('valor') if isinstance(ingresos.get('remuneracionMensualCargoPublico'), dict) else ingresos.get('remuneracionMensualCargoPublico'),
                'otros_ingresos_mensuales': ingresos.get('otrosIngresosMensualesTotal', {}).get('valor') if isinstance(ingresos.get('otrosIngresosMensualesTotal'), dict) else ingresos.get('otrosIngresosMensualesTotal'),
                'ingreso_mensual_neto': ingresos.get('ingresoMensualNetoDeclarante', {}).get('valor') if isinstance(ingresos.get('ingresoMensualNetoDeclarante'), dict) else ingresos.get('ingresoMensualNetoDeclarante'),
                'ingreso_anual_neto': ingresos.get('ingresoAnualNetoDeclarante', {}).get('valor') if isinstance(ingresos.get('ingresoAnualNetoDeclarante'), dict) else ingresos.get('ingresoAnualNetoDeclarante'),
            }
            rows.append(row)
        self.dfs['s1_ingresos'] = pd.DataFrame(rows)

    def process_inmuebles(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue

            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            
            # Try 'bienesInmuebles' -> 'bienInmueble'
            bienes = pat.get('bienesInmuebles', {})
            if not isinstance(bienes, dict): bienes = {}
            
            items = self.get_list(bienes, ['bienInmueble', 'bienesInmuebles'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                tipo = item.get('tipoInmueble', {})
                if not isinstance(tipo, dict): tipo = {}
                
                valor = item.get('valorAdquisicion', {})
                if not isinstance(valor, dict): valor = {}
                
                forma = item.get('formaAdquisicion', {})
                if not isinstance(forma, dict): forma = {}
                
                titulares = item.get('titular', [])
                if isinstance(titulares, list):
                    titular_str = ", ".join([t.get('valor','') for t in titulares if isinstance(t, dict)])
                else:
                    titular_str = str(titulares)
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_inmueble': tipo.get('valor') if tipo else item.get('tipoInmueble'),
                    'titular': titular_str,
                    'valor_adquisicion': valor.get('valor'),
                    'moneda': valor.get('moneda'),
                    'forma_adquisicion': forma.get('valor') if forma else item.get('formaAdquisicion'),
                    'fecha_adquisicion': item.get('fechaAdquisicion')
                }
                rows.append(row)
        self.dfs['s1_bienes_inmuebles'] = pd.DataFrame(rows)

    def process_vehiculos(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue

            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            
            vehiculos_obj = pat.get('vehiculos', {})
            if not isinstance(vehiculos_obj, dict): vehiculos_obj = {}
            
            items = self.get_list(vehiculos_obj, ['vehiculo', 'vehiculos'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                tipo = item.get('tipoVehiculo', {})
                if not isinstance(tipo, dict): tipo = {}
                
                valor = item.get('valorAdquisicion', {})
                if not isinstance(valor, dict): valor = {}
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_vehiculo': tipo.get('valor') if tipo else item.get('tipoVehiculo'),
                    'marca': item.get('marca'),
                    'modelo': item.get('modelo'),
                    'anio': item.get('anio'),
                    'valor_adquisicion': valor.get('valor'),
                    'moneda': valor.get('moneda')
                }
                rows.append(row)
        self.dfs['s1_vehiculos'] = pd.DataFrame(rows)

    def process_interes_apoyos(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue

            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            
            interes = d.get('interes', {})
            if not isinstance(interes, dict): interes = {}
            
            apoyos_obj = interes.get('apoyos', {})
            if not isinstance(apoyos_obj, dict): apoyos_obj = {}
            
            items = self.get_list(apoyos_obj, ['apoyo', 'apoyos'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                beneficiario = item.get('beneficiarioPrograma', {})
                if not isinstance(beneficiario, dict): beneficiario = {}
                
                tipo = item.get('tipoApoyo', {})
                if not isinstance(tipo, dict): tipo = {}
                
                monto = item.get('montoApoyoMensual', {})
                if not isinstance(monto, dict): monto = {}
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'beneficiario': beneficiario.get('valor') if beneficiario else item.get('beneficiarioPrograma'),
                    'nombre_programa': item.get('nombrePrograma'),
                    'institucion_otorgante': item.get('institucionOtorgante'),
                    'nivel_gobierno': item.get('nivelOrdenGobierno'),
                    'tipo_apoyo': tipo.get('valor') if tipo else item.get('tipoApoyo'),
                    'forma_recepcion': item.get('formaRecepcion'),
                    'monto_apoyo': monto.get('valor'),
                    'moneda': monto.get('moneda')
                }
                rows.append(row)
        self.dfs['interes_apoyos'] = pd.DataFrame(rows)

    def process_interes_participacion(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            
            interes = d.get('interes', {})
            if not isinstance(interes, dict): interes = {}
            
            participacion_obj = interes.get('participacion', {})
            if not isinstance(participacion_obj, dict): participacion_obj = {}
            
            items = self.get_list(participacion_obj, ['participacion', 'participaciones'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                tipo = item.get('tipoParticipacion', {})
                if not isinstance(tipo, dict): tipo = {}
                
                sector = item.get('sector', {})
                if not isinstance(sector, dict): sector = {}
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'nombre_empresa': item.get('nombreEmpresaSociedadAsociacion'),
                    'tipo_participacion': tipo.get('valor') if tipo else item.get('tipoParticipacion'),
                    'porcentaje': item.get('porcentajeParticipacion'),
                    'sector': sector.get('valor') if sector else item.get('sector'),
                    'recibe_remuneracion': item.get('recibeRemuneracion')
                }
                rows.append(row)
        self.dfs['interes_participacion'] = pd.DataFrame(rows)

    def extract_all(self):
        if self.load_data():
            self.process_general()
            self.process_ingresos()
            self.process_inmuebles()
            self.process_vehiculos()
            self.process_interes_apoyos()
            self.process_interes_participacion()
            self.save_to_csv()

    def save_to_csv(self):
        for name, df in self.dfs.items():
            if not df.empty:
                filename = f"{name}.csv"
                path = os.path.join(self.output_dir, filename)
                df.to_csv(path, index=False, encoding='utf-8')
        print(f"[{self.state_name}] ✅ Archivos CSV generados en {self.output_dir}")

if __name__ == "__main__":
    # Configuración de directorios relativos
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    # Assuming src/ is inside system_1/
    # PDN_S1 is at ../PDN_S1 relative to src/
    BASE_DIR = os.path.join(CURRENT_DIR, '../PDN_S1/states')
    OUTPUT_DIR = os.path.join(CURRENT_DIR, '../csv_outputs')
    
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    if not os.path.exists(BASE_DIR):
        print(f"Error: Directorio de entrada no encontrado: {BASE_DIR}")
        sys.exit(1)

    # Listar carpetas de estados
    states = [d for d in os.listdir(BASE_DIR) if os.path.isdir(os.path.join(BASE_DIR, d))]
    
    print(f"--- Iniciando Procesamiento Masivo de {len(states)} Estados ---")
    
    for state in states:
        state_path = os.path.join(BASE_DIR, state)
        
        # Intentar cargar completo.json por defecto
        target_filename = 'completo.json'
        target_path = os.path.join(state_path, target_filename)
        
        # Si no existe, buscar el primer .json disponible
        if not os.path.exists(target_path):
            try:
                candidates = [f for f in os.listdir(state_path) if f.endswith('.json')]
                if not candidates:
                    print(f"[{state}] No se encontraron archivos .json")
                    continue
                target_path = os.path.join(state_path, candidates[0])
            except OSError:
                print(f"[{state}] Error accediendo al directorio")
                continue
        
        # Verificar si ya fue procesado (si existe el resumen)
        if os.path.exists(os.path.join(OUTPUT_DIR, state, 's1_resumen.csv')):
             print(f"[{state}] ⏭️  Ya procesado. Saltando...")
             continue
            
        extractor = S1Extractor(target_path, OUTPUT_DIR, state)
        extractor.extract_all()
        
    print("\n--- Procesamiento Completado ---")
