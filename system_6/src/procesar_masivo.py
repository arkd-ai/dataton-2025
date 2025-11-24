import json
import pandas as pd
import os

class OCDSExtractor:
    """
    Clase para procesar y extraer datos de archivos JSON con el estándar OCDS.
    Genera archivos CSV estandarizados organizados por carpetas.
    """
    
    def __init__(self, file_path, output_dir, state_name):
        self.file_path = file_path
        self.output_dir = os.path.join(output_dir, state_name)
        self.state_name = state_name
        self.data = []
        
        # DataFrames
        self.df_resumen = pd.DataFrame()
        self.df_items = pd.DataFrame()
        self.df_parties = pd.DataFrame()
        self.df_awards = pd.DataFrame()
        self.df_contracts = pd.DataFrame()

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

    def process_general(self):
        resumen_list = []
        for entry in self.data:
            ocid = entry.get('ocid', '')
            tender = entry.get('tender', {})
            buyer = entry.get('buyer', {})
            
            resumen = {
                'ocid': ocid,
                'id': entry.get('id', ''),
                'date': entry.get('date', ''),
                'state': self.state_name,  # Agregamos columna de origen
                'title': tender.get('title', ''),
                'description': tender.get('description', ''),
                'status': tender.get('status', ''),
                'procurementMethod': tender.get('procurementMethod', ''),
                'procurementMethodDetails': tender.get('procurementMethodDetails', ''),
                'mainProcurementCategory': tender.get('mainProcurementCategory', ''),
                'value_amount': tender.get('value', {}).get('amount', 0),
                'value_currency': tender.get('value', {}).get('currency', ''),
                'tender_start_date': tender.get('tenderPeriod', {}).get('startDate', ''),
                'tender_end_date': tender.get('tenderPeriod', {}).get('endDate', ''),
                'buyer_name': buyer.get('name', ''),
                'buyer_id': buyer.get('id', '')
            }
            resumen_list.append(resumen)
        self.df_resumen = pd.DataFrame(resumen_list)

    def process_items(self):
        items_list = []
        for entry in self.data:
            ocid = entry.get('ocid', '')
            tender = entry.get('tender', {})
            for item in tender.get('items', []):
                item_data = {
                    'ocid': ocid,
                    'state': self.state_name,
                    'item_id': item.get('id', ''),
                    'description': item.get('description', ''),
                    'quantity': item.get('quantity', ''),
                    'classification_id': item.get('classification', {}).get('id', ''),
                    'classification_desc': item.get('classification', {}).get('description', ''),
                    'unit_name': item.get('unit', {}).get('name', ''),
                    'unit_value_amount': item.get('unit', {}).get('value', {}).get('amount', ''),
                    'unit_value_currency': item.get('unit', {}).get('value', {}).get('currency', '')
                }
                items_list.append(item_data)
        self.df_items = pd.DataFrame(items_list)

    def process_parties(self):
        parties_list = []
        for entry in self.data:
            ocid = entry.get('ocid', '')
            for party in entry.get('parties', []):
                roles = ", ".join(party.get('roles', []))
                party_data = {
                    'ocid': ocid,
                    'state': self.state_name,
                    'party_id': party.get('id', ''),
                    'name': party.get('name', ''),
                    'roles': roles,
                    'identifier_legalName': party.get('identifier', {}).get('legalName', ''),
                    'contact_name': party.get('contactPoint', {}).get('name', ''),
                    'contact_email': party.get('contactPoint', {}).get('email', ''),
                    'contact_phone': party.get('contactPoint', {}).get('telephone', ''),
                    'address_region': party.get('address', {}).get('region', ''),
                    'address_locality': party.get('address', {}).get('locality', '')
                }
                parties_list.append(party_data)
        self.df_parties = pd.DataFrame(parties_list)

    def process_awards(self):
        awards_list = []
        for entry in self.data:
            ocid = entry.get('ocid', '')
            for award in entry.get('awards', []):
                award_data = {
                    'ocid': ocid,
                    'state': self.state_name,
                    'award_id': award.get('id', ''),
                    'title': award.get('title', ''),
                    'status': award.get('status', ''),
                    'date': award.get('date', ''),
                    'value_amount': award.get('value', {}).get('amount', ''),
                    'value_currency': award.get('value', {}).get('currency', ''),
                    'suppliers': ", ".join([s.get('name', '') for s in award.get('suppliers', [])])
                }
                awards_list.append(award_data)
        self.df_awards = pd.DataFrame(awards_list)

    def process_contracts(self):
        contracts_list = []
        for entry in self.data:
            ocid = entry.get('ocid', '')
            for contract in entry.get('contracts', []):
                contract_data = {
                    'ocid': ocid,
                    'state': self.state_name,
                    'contract_id': contract.get('id', ''),
                    'awardID': contract.get('awardID', ''),
                    'title': contract.get('title', ''),
                    'status': contract.get('status', ''),
                    'value_amount': contract.get('value', {}).get('amount', ''),
                    'value_currency': contract.get('value', {}).get('currency', ''),
                    'dateSigned': contract.get('dateSigned', ''),
                    'period_startDate': contract.get('period', {}).get('startDate', ''),
                    'period_endDate': contract.get('period', {}).get('endDate', '')
                }
                contracts_list.append(contract_data)
        self.df_contracts = pd.DataFrame(contracts_list)

    def extract_all(self):
        if self.load_data():
            self.process_general()
            self.process_items()
            self.process_parties()
            self.process_awards()
            self.process_contracts()
            self.save_to_csv()

    def save_to_csv(self):
        files_map = {
            'general': self.df_resumen,
            'items': self.df_items,
            'parties': self.df_parties,
            'awards': self.df_awards,
            'contracts': self.df_contracts
        }

        for name, df in files_map.items():
            if not df.empty:
                # Nombre estandarizado: general.csv, items.csv, etc.
                filename = f"{name}.csv"
                path = os.path.join(self.output_dir, filename)
                df.to_csv(path, index=False, encoding='utf-8')
        print(f"[{self.state_name}] ✅ Archivos CSV generados en {self.output_dir}")

if __name__ == "__main__":
    # Configuración de directorios relativos
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    BASE_DIR = os.path.join(CURRENT_DIR, '../PDN_S6')
    OUTPUT_DIR = os.path.join(CURRENT_DIR, '../csv_outputs')
    
    # Asegurar que existan los directorios
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    # Mapeo automático de archivos json en el directorio
    files = [f for f in os.listdir(BASE_DIR) if f.endswith('_releases.json')]
    
    print(f"--- Iniciando Procesamiento Masivo de {len(files)} Archivos ---")
    
    for filename in files:
        # Extraer nombre del estado del archivo (ej: 'puebla_releases.json' -> 'puebla')
        state_name = filename.replace('_releases.json', '')
        file_path = os.path.join(BASE_DIR, filename)
        
        extractor = OCDSExtractor(file_path, OUTPUT_DIR, state_name)
        extractor.extract_all()
        
    print("\n--- Procesamiento Completado ---")
