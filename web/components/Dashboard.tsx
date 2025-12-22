'use client';

import { useDuckDB } from "@/components/DuckDBProvider";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Briefcase, FileText, Building2, Map as MapIcon, ChevronRight, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from "@/lib/utils";
import MexicoMap from "@/components/Map";

// --- Types ---
interface InstitutionSummary {
    INSTITUCION: string;
    total_declaraciones: number;
}

interface Declaration {
    NOMBRE: string;
    PRIMER_APELLIDO: string;
    SEGUNDO_APELLIDO: string;
    INSTITUCION: string;
    PUESTO_NOMBRE: string;
    TOTAL_INGRESOS_MENSUALES_NETOS: number;
    REMUNERACION_ANUAL_CARGO_PUBLICO: number;
    diferencia_ingresos?: number; // Calculated on fly if missing
}

// --- Constants ---
// Simplified list of entities for prototype
// Removed ENTITIES constant as we use the Map now

export default function Dashboard() {
    const { db, conn } = useDuckDB(); // removed loading check here as custom logic handles it

    // -- State --
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
    const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    const [isReady, setIsReady] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    // -- Data --
    const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
    const [declarations, setDeclarations] = useState<Declaration[]>([]);
    const [totalDeclarations, setTotalDeclarations] = useState(0);
    const [isQuerying, setIsQuerying] = useState(false);

    // -- Load S1 Main Table --
    useEffect(() => {
        const initTable = async () => {
            if (db && conn) {
                try {
                    // Register both files
                    const urlMaestro = new URL('/data/system_1/s1_dataset_maestro.parquet', window.location.origin).href;
                    const urlStg = new URL('/data/system_1/stg_s1_declaraciones.parquet', window.location.origin).href;

                    console.log("Registering files:", urlMaestro, urlStg);

                    await db.registerFileURL('s1_dataset_maestro.parquet', urlMaestro, 4, false);
                    await db.registerFileURL('stg_s1_declaraciones.parquet', urlStg, 4, false);

                    console.log("Files registered. Creating view...");

                    // Create Unified View
                    // Note: Joining on ID. Adjust column names to match what the UI expects or what is available.
                    await conn.query(`
                        CREATE OR REPLACE VIEW s1_unified AS
                        SELECT 
                            m.id,
                            m.estado as ENTIDAD_CD,
                            m.institucion as INSTITUCION,
                            s.nombre as NOMBRE,
                            s.primer_apellido as PRIMER_APELLIDO,
                            s.segundo_apellido as SEGUNDO_APELLIDO,
                            s.empleo_cargo as PUESTO_NOMBRE,
                            m.ingreso_mensual_neto as TOTAL_INGRESOS_MENSUALES_NETOS,
                            m.ingreso_anual_neto as REMUNERACION_ANUAL_CARGO_PUBLICO
                        FROM 's1_dataset_maestro.parquet' m
                        JOIN 'stg_s1_declaraciones.parquet' s ON m.id = s.id
                    `);

                    // Fix: Check if view works
                    await conn.query("SELECT 1 FROM s1_unified LIMIT 1");
                    console.log("View created successfully");

                    setIsReady(true);

                } catch (e) {
                    console.error("Error registering tables", e);
                    setInitError((e as Error).message);
                }
            }
        };
        initTable();
    }, [db, conn]);

    // Reset pagination when institution changes
    useEffect(() => {
        setPage(0);
    }, [selectedInstitution]);

    // -- Fetch Institutions when Entity Selected --
    useEffect(() => {
        const fetchInstitutions = async () => {
            // Use selectedEntity which is now the code (e.g. "MX-BCN")

            if (!conn || !selectedEntity) return;
            setIsQuerying(true);
            try {
                // Mapping from GeoJSON Code (ISO 3166-2ish) to Database ENUM
                const codeMap: Record<string, string> = {
                    'MX-AGU': 'AGUASCALIENTES',
                    'MX-BCN': 'BAJACALIFORNIA', // Note DB spacing/no-space
                    'MX-BCS': 'BAJACALIFORNIASUR',
                    'MX-CAM': 'CAMPECHE',
                    'MX-COA': 'COAHUILA', // Verify if present in DB
                    'MX-COL': 'COLIMA',
                    'MX-CHP': 'CHIAPAS',
                    'MX-CHH': 'CHIHUAHUA',
                    'MX-CMX': 'CDMX', // Need to verify if CDMX or Ciudad de Mexico in DB
                    'MX-DUR': 'DURANGO',
                    'MX-GUA': 'GUANAJUATO',
                    'MX-GRO': 'GUERRERO',
                    'MX-HID': 'HIDALGO',
                    'MX-JAL': 'JALISCO',
                    'MX-MEX': 'EDOMEX',
                    'MX-MIC': 'MICHOACAN',
                    'MX-MOR': 'MORELOS',
                    'MX-NAY': 'NAYARIT',
                    'MX-NLE': 'NUEVOLEON',
                    'MX-OAX': 'OAXACA',
                    'MX-PUE': 'PUEBLA',
                    'MX-QUE': 'QUERETARO',
                    'MX-ROO': 'QUINTANAROO',
                    'MX-SLP': 'SANLUISPOTOSI',
                    'MX-SIN': 'SINALOA',
                    'MX-SON': 'SONORA',
                    'MX-TAB': 'TABASCO',
                    'MX-TAM': 'TAMAULIPAS',
                    'MX-TLA': 'TLAXCALA',
                    'MX-VER': 'VERACRUZ',
                    'MX-YUC': 'YUCATAN',
                    'MX-ZAC': 'ZACATECAS'
                };

                const dbName = codeMap[selectedEntity];

                if (!dbName) {
                    console.warn(`No mapping found for state code: ${selectedEntity}`);
                    setInstitutions([]); // or handle error
                    setIsQuerying(false);
                    return;
                }

                console.log(`Querying for state code: ${selectedEntity} -> DB Name: ${dbName}`);

                // Exact match on cleaned column or ILIKE if slightly off, but now we have exact target names.
                // Let's use ILIKE to be safe against case differences in DB.

                const q = `
            SELECT INSTITUCION, COUNT(*) as total_declaraciones 
            FROM s1_unified 
            WHERE 
                upper(ENTIDAD_CD) = '${dbName}'
            GROUP BY INSTITUCION 
            ORDER BY total_declaraciones DESC
        `;

                const res = await conn.query(q);
                setInstitutions(res.toArray().map(r => r.toJSON()));
            } catch (e) {
                console.error("Error fetching institutions", e);
            } finally {
                setIsQuerying(false);
            }
        };

        if (selectedEntity) {
            setInstitutions([]);
            setSelectedInstitution(null);
            fetchInstitutions();
        }
    }, [conn, selectedEntity]);

    // -- Fetch Declarations when Institution Selected --
    useEffect(() => {
        const fetchDeclarations = async () => {
            if (!conn || !selectedInstitution) return;
            setIsQuerying(true);
            try {
                // Get Total Count first for pagination
                const countQ = `
                    SELECT COUNT(*) as total
                    FROM s1_unified 
                    WHERE INSTITUCION = '${selectedInstitution}'
                    AND REMUNERACION_ANUAL_CARGO_PUBLICO > 0
                `;
                const countRes = await conn.query(countQ);
                const total = Number(countRes.toArray()[0].total);
                setTotalDeclarations(total);
                setTotalPages(Math.ceil(total / PAGE_SIZE));

                // Get Paginated Data
                // Fix: Use Annual Remuneration / 12 if Monthly Income is 0
                const q = `
                    SELECT 
                        NOMBRE, PRIMER_APELLIDO, SEGUNDO_APELLIDO, 
                        INSTITUCION, PUESTO_NOMBRE,
                        CASE 
                            WHEN TOTAL_INGRESOS_MENSUALES_NETOS > 0 THEN TOTAL_INGRESOS_MENSUALES_NETOS 
                            ELSE REMUNERACION_ANUAL_CARGO_PUBLICO / 12 
                        END as TOTAL_INGRESOS_MENSUALES_NETOS,
                        REMUNERACION_ANUAL_CARGO_PUBLICO
                    FROM s1_unified 
                    WHERE INSTITUCION = '${selectedInstitution}'
                    AND REMUNERACION_ANUAL_CARGO_PUBLICO > 0
                    ORDER BY TOTAL_INGRESOS_MENSUALES_NETOS DESC
                    LIMIT ${PAGE_SIZE} OFFSET ${page * PAGE_SIZE}
                `;
                const res = await conn.query(q);
                setDeclarations(res.toArray().map(r => r.toJSON()));
            } catch (e) {
                console.error("Error fetching declarations", e);
            } finally {
                setIsQuerying(false);
            }
        };

        if (selectedInstitution) {
            fetchDeclarations();
        }
    }, [conn, selectedInstitution, page]);

    if (initError) {
        return (
            <div className="flex items-center justify-center h-96 w-full text-red-400 bg-red-900/20 p-8 rounded-xl border border-red-500/50">
                <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Error de Inicialización</h3>
                    <p className="font-mono text-sm">{initError}</p>
                </div>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="flex flex-col items-center gap-4 text-blue-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-semibold tracking-wider">PREPARANDO DUCKDB...</p>
                </div>
            </div>
        );
    }

    // Pagination Controls Component
    const PaginationControls = () => (
        <div className="flex items-center justify-between px-2 py-4 border-t border-white/10 mt-auto">
            <span className="text-xs text-gray-400">
                Mostrando {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, totalDeclarations)} de {totalDeclarations}
            </span>
            <div className="flex gap-2">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors"
                >
                    Anterior
                </button>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-theme(spacing.20))] w-full gap-6 p-6">
            {/* --- Sidebar: Map Selector --- */}
            <div className="w-1/3 flex-shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden relative">
                <div className="absolute top-4 left-4 z-[500] bg-black/50 backdrop-blur text-white p-2 rounded shadow text-xs font-bold border border-white/10">
                    Mapa Interactivo
                </div>
                <MexicoMap
                    selectedStateCode={selectedEntity}
                    onStateSelect={(name, code) => {
                        setSelectedEntity(code);
                        setSelectedEntityName(name); // Store name for SQL query
                    }}
                />
            </div>

            {/* --- Middle: Institution List --- */}
            {selectedEntityName && (
                <div className="w-80 flex-shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-400" />
                            Instituciones
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">{selectedEntityName}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {isQuerying && institutions.length === 0 ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-400" /></div>
                        ) : institutions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No se encontraron instituciones con declaraciones en este estado.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {institutions.map((inst, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedInstitution(inst.INSTITUCION)}
                                        className={cn(
                                            "w-full text-left px-3 py-3 rounded-lg text-sm transition-all border border-transparent",
                                            selectedInstitution === inst.INSTITUCION
                                                ? "bg-purple-600/20 border-purple-500/50 text-white"
                                                : "hover:bg-white/5 text-gray-300 hover:text-white"
                                        )}
                                    >
                                        <div className="font-medium truncate" title={inst.INSTITUCION}>{inst.INSTITUCION}</div>
                                        <div className="text-xs text-gray-500 mt-1">{inst.total_declaraciones.toLocaleString()} declaraciones</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- Main: Detail View --- */}
            {selectedInstitution ? (
                <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                        <div>
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                {selectedInstitution}
                            </h2>
                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Declaraciones Patrimoniales
                            </p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="h-64 p-6 border-b border-white/10 bg-black/20">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={declarations}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="PUESTO_NOMBRE" hide />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                    formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, "Ingreso Mensual"]}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Bar dataKey="TOTAL_INGRESOS_MENSUALES_NETOS" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {declarations.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={(entry.TOTAL_INGRESOS_MENSUALES_NETOS || 0) > 100000 ? '#ef4444' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Data Table */}
                    <div className="flex-1 overflow-auto bg-black/20">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 text-gray-400 font-medium sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-3 text-left">Funcionario</th>
                                    <th className="px-6 py-3 text-left">Puesto</th>
                                    <th className="px-6 py-3 text-right">Ingreso Mensual</th>
                                    <th className="px-6 py-3 text-right">Remuneración Anual Cargo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {declarations.map((decl, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-gray-200 group-hover:text-blue-300 transition-colors">
                                                {decl.NOMBRE} {decl.PRIMER_APELLIDO} {decl.SEGUNDO_APELLIDO}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-400 max-w-xs truncate" title={decl.PUESTO_NOMBRE}>
                                            {decl.PUESTO_NOMBRE}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-emerald-400">
                                            ${(decl.TOTAL_INGRESOS_MENSUALES_NETOS || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-gray-500">
                                            ${(decl.REMUNERACION_ANUAL_CARGO_PUBLICO || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <PaginationControls />
                </div>
            ) : (
                <div className="flex-1 glass-panel rounded-xl flex items-center justify-center text-gray-500 flex-col gap-4">
                    <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                    <p>Selecciona una entidad e institución para ver el análisis</p>
                </div>
            )}
        </div>
    );
}
