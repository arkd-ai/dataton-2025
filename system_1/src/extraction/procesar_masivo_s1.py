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

    def get_val(self, obj, key, default=None):
        """Helper to safely get value from nested dict structure like {key: {valor: X}} or {key: X}"""
        if not isinstance(obj, dict): return default
        val_obj = obj.get(key)
        if isinstance(val_obj, dict):
            return val_obj.get('valor', default)
        return val_obj if val_obj is not None else default

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

    def process_experiencia_laboral(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            pat = d.get('situacionPatrimonial', {}) if isinstance(d, dict) else {}
            exp_obj = pat.get('experienciaLaboral', {}) if isinstance(pat, dict) else {}
            
            items = self.get_list(exp_obj, ['experiencia'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'ambito_sector': self.get_val(item, 'ambitoSector'),
                    'nivel_gobierno': self.get_val(item, 'nivelOrdenGobierno'),
                    'ambito_publico': self.get_val(item, 'ambitoPublico'),
                    'nombre_ente': item.get('nombreEntePublico'),
                    'area_adscripcion': item.get('areaAdscripcion'),
                    'empleo_cargo': item.get('empleoCargoComision'),
                    'fecha_ingreso': item.get('fechaIngreso'),
                    'fecha_egreso': item.get('fechaEgreso'),
                    'ubicacion': self.get_val(item, 'ubicacion')
                }
                rows.append(row)
        self.dfs['s1_experiencia_laboral'] = pd.DataFrame(rows)

    def process_datos_pareja(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            pat = d.get('situacionPatrimonial', {}) if isinstance(d, dict) else {}
            pareja = pat.get('datosPareja', {}) if isinstance(pat, dict) else {}
            
            if not isinstance(pareja, dict): continue
            
            # Some schemas might have 'datosPareja' as a list or containing a list, handle if needed
            # But standard is a dict with direct fields or nested dicts
            
            if not pareja.get('ninguno') and pareja: 
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'nombre': pareja.get('nombre'),
                    'primer_apellido': pareja.get('primerApellido'),
                    'segundo_apellido': pareja.get('segundoApellido'),
                    'relacion': self.get_val(pareja, 'relacionConDeclarante'),
                    'ciudadano_extranjero': pareja.get('ciudadanoExtranjero'),
                    'curp': pareja.get('curp'), # Often masked
                    'habita_domicilio': pareja.get('habitaDomicilioDeclarante'),
                    'actividad_laboral': self.get_val(pareja, 'actividadLaboralSectorPublico')
                }
                rows.append(row)
        self.dfs['s1_datos_pareja'] = pd.DataFrame(rows)

    def process_datos_dependientes(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            pat = d.get('situacionPatrimonial', {}) if isinstance(d, dict) else {}
            dep_obj = pat.get('datosDependientesEconomicos', {}) if isinstance(pat, dict) else {}
            
            items = self.get_list(dep_obj, ['dependienteEconomico', 'dependientes'])
            
            for item in items:
                if not isinstance(item, dict): continue
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'nombre': item.get('nombre'),
                    'primer_apellido': item.get('primerApellido'),
                    'segundo_apellido': item.get('segundoApellido'),
                    'parentesco': self.get_val(item, 'parentescoRelacion'),
                    'ciudadano_extranjero': item.get('ciudadanoExtranjero'),
                    'actividad_laboral': self.get_val(item, 'actividadLaboralSectorPublico')
                }
                rows.append(row)
        self.dfs['s1_dependientes_economicos'] = pd.DataFrame(rows)

    def process_ingresos(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            ingresos = pat.get('ingresos', {})
            if not isinstance(ingresos, dict): ingresos = {}
            
            row = {
                'id': entry.get('id'),
                'state': self.state_name,
                'remuneracion_mensual_cargo': self.get_val(ingresos, 'remuneracionMensualCargoPublico'),
                'otros_ingresos_mensuales': self.get_val(ingresos, 'otrosIngresosMensualesTotal'),
                'ingreso_mensual_neto': self.get_val(ingresos, 'ingresoMensualNetoDeclarante'),
                'ingreso_anual_neto': self.get_val(ingresos, 'ingresoAnualNetoDeclarante'),
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
            bienes = pat.get('bienesInmuebles', {})
            if not isinstance(bienes, dict): bienes = {}
            
            items = self.get_list(bienes, ['bienInmueble', 'bienesInmuebles'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                titulares = item.get('titular', [])
                if isinstance(titulares, list):
                    titular_str = ", ".join([self.get_val(t, 'valor', '') for t in titulares if isinstance(t, dict)])
                else:
                    titular_str = str(titulares)
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_inmueble': self.get_val(item, 'tipoInmueble'),
                    'titular': titular_str,
                    'valor_adquisicion': self.get_val(item, 'valorAdquisicion'),
                    'moneda': item.get('valorAdquisicion', {}).get('moneda') if isinstance(item.get('valorAdquisicion'), dict) else None,
                    'forma_adquisicion': self.get_val(item, 'formaAdquisicion'),
                    'fecha_adquisicion': item.get('fechaAdquisicion')
                }
                rows.append(row)
        self.dfs['s1_bienes_inmuebles'] = pd.DataFrame(rows)

    def process_bienes_muebles(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            bienes = pat.get('bienesMuebles', {})
            if not isinstance(bienes, dict): bienes = {}
            
            items = self.get_list(bienes, ['bienMueble', 'bienesMuebles'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                titulares = item.get('titular', [])
                titular_str = ""
                if isinstance(titulares, list):
                    titular_str = ", ".join([self.get_val(t, 'valor', '') for t in titulares if isinstance(t, dict)])
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_bien': self.get_val(item, 'tipoBien'),
                    'descripcion': item.get('descripcionGeneralBien'),
                    'titular': titular_str,
                    'valor_adquisicion': self.get_val(item, 'valorAdquisicion'),
                    'moneda': item.get('valorAdquisicion', {}).get('moneda') if isinstance(item.get('valorAdquisicion'), dict) else None,
                    'forma_adquisicion': self.get_val(item, 'formaAdquisicion'),
                    'fecha_adquisicion': item.get('fechaAdquisicion')
                }
                rows.append(row)
        self.dfs['s1_bienes_muebles'] = pd.DataFrame(rows)

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
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_vehiculo': self.get_val(item, 'tipoVehiculo'),
                    'marca': item.get('marca'),
                    'modelo': item.get('modelo'),
                    'anio': item.get('anio'),
                    'valor_adquisicion': self.get_val(item, 'valorAdquisicion'),
                    'moneda': item.get('valorAdquisicion', {}).get('moneda') if isinstance(item.get('valorAdquisicion'), dict) else None,
                    'fecha_adquisicion': item.get('fechaAdquisicion'),
                    'forma_adquisicion': self.get_val(item, 'formaAdquisicion')
                }
                rows.append(row)
        self.dfs['s1_vehiculos'] = pd.DataFrame(rows)

    def process_inversiones(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            inv_obj = pat.get('inversionesCuentasValores', {}) # Standard name variations
            if not inv_obj: inv_obj = pat.get('inversiones', {})
            if not isinstance(inv_obj, dict): inv_obj = {}
            
            items = self.get_list(inv_obj, ['inversion', 'inversiones'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_inversion': self.get_val(item, 'tipoInversion'),
                    'subtipo_inversion': self.get_val(item, 'subTipoInversion'),
                    'institucion': item.get('institucionRazonSocial'), # older schemas
                    'numero_cuenta': item.get('numeroCuentaContrato'),
                    'saldo_situacion_actual': self.get_val(item, 'saldoSituacionActual'),
                    'moneda': item.get('saldoSituacionActual', {}).get('moneda') if isinstance(item.get('saldoSituacionActual'), dict) else None,
                }
                # Newer schemas have nested localizacionInversion
                loc = item.get('localizacionInversion', {})
                if isinstance(loc, dict):
                    row['pais'] = loc.get('pais')
                    row['institucion'] = loc.get('institucionRazonSocial')
                
                rows.append(row)
        self.dfs['s1_inversiones'] = pd.DataFrame(rows)

    def process_adeudos_pasivos(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            adeudos_obj = pat.get('adeudosPasivos', {})
            if not isinstance(adeudos_obj, dict): adeudos_obj = {}
            
            items = self.get_list(adeudos_obj, ['adeudo', 'adeudos'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_adeudo': self.get_val(item, 'tipoAdeudo'),
                    'monto_original': self.get_val(item, 'montoOriginal'),
                    'saldo_pendiente': self.get_val(item, 'saldoInsolutoSituacionActual'),
                    'moneda': item.get('saldoInsolutoSituacionActual', {}).get('moneda') if isinstance(item.get('saldoInsolutoSituacionActual'), dict) else None,
                    'fecha_adquisicion': item.get('fechaAdquisicion'),
                    'institucion': item.get('institucionRazonSocial') # older schemas or direct
                }
                # Check for otorgaCredito nested object
                otorgante = item.get('otorganteCredito', {})
                if isinstance(otorgante, dict):
                    row['otorgante'] = otorgante.get('nombreInstitucion') or otorgante.get('nombreRazonSocial')
                    
                rows.append(row)
        self.dfs['s1_adeudos_pasivos'] = pd.DataFrame(rows)
        
    def process_prestamo_comodato(self):
        rows = []
        for entry in self.data:
            if not isinstance(entry, dict): continue
            parent_id = entry.get('id')
            
            d = entry.get('declaracion', {})
            if not isinstance(d, dict): d = {}
            pat = d.get('situacionPatrimonial', {})
            if not isinstance(pat, dict): pat = {}
            prestamo_obj = pat.get('prestamoOComodato', {})
            if not isinstance(prestamo_obj, dict): prestamo_obj = {}
            
            items = self.get_list(prestamo_obj, ['prestamo'])
            
            for item in items:
                if not isinstance(item, dict): continue
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'tipo_bien': self.get_val(item, 'tipoBien'),
                    'marca': item.get('marca'),
                    'modelo': item.get('modelo'),
                    'anio': item.get('anio'),
                    'registro': item.get('numeroSerieRegistro'),
                    'relacion_dueno': self.get_val(item, 'relacionConDuenio')
                }
                
                dueno = item.get('duenioTitular', {})
                if isinstance(dueno, dict):
                     row['dueno'] = dueno.get('nombreRazonSocial') or dueno.get('nombre')
                
                rows.append(row)
        self.dfs['s1_prestamo_comodato'] = pd.DataFrame(rows)

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
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'beneficiario': self.get_val(item, 'beneficiarioPrograma'),
                    'nombre_programa': item.get('nombrePrograma'),
                    'institucion_otorgante': item.get('institucionOtorgante'),
                    'nivel_gobierno': item.get('nivelOrdenGobierno'),
                    'tipo_apoyo': self.get_val(item, 'tipoApoyo'),
                    'forma_recepcion': item.get('formaRecepcion'),
                    'monto_apoyo': self.get_val(item, 'montoApoyoMensual'),
                    'moneda': item.get('montoApoyoMensual', {}).get('moneda') if isinstance(item.get('montoApoyoMensual'), dict) else None
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
                
                row = {
                    'id_declaracion': parent_id,
                    'state': self.state_name,
                    'nombre_empresa': item.get('nombreEmpresaSociedadAsociacion'),
                    'tipo_participacion': self.get_val(item, 'tipoParticipacion'),
                    'porcentaje': item.get('porcentajeParticipacion'),
                    'sector': self.get_val(item, 'sector'),
                    'recibe_remuneracion': item.get('recibeRemuneracion')
                }
                rows.append(row)
        self.dfs['interes_participacion'] = pd.DataFrame(rows)

    def extract_all(self):
        if self.load_data():
            self.process_general()
            self.process_experiencia_laboral()
            self.process_datos_pareja()
            self.process_datos_dependientes()
            self.process_ingresos()
            self.process_inmuebles()
            self.process_bienes_muebles()
            self.process_vehiculos()
            self.process_inversiones()
            self.process_adeudos_pasivos()
            self.process_prestamo_comodato()
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
    # PDN_S1 is at ../../PDN_S1 relative to src/extraction/
    BASE_DIR = os.path.join(CURRENT_DIR, '../../PDN_S1/states')
    OUTPUT_DIR = os.path.join(CURRENT_DIR, '../../csv_outputs')
    
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
        
        # Force reprocessing for Guerrero
        if state != 'Guerrero' and os.path.exists(os.path.join(OUTPUT_DIR, state, 's1_resumen.csv')):
             print(f"[{state}] ⏭️  Ya procesado. Saltando...")
             continue
            
        extractor = S1Extractor(target_path, OUTPUT_DIR, state)
        extractor.extract_all()
        
    print("\n--- Procesamiento Completado ---")
