'use client';

import { useDuckDB } from "@/components/DuckDBProvider";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Briefcase, FileText, Building2, Map as MapIcon, ChevronRight, BarChart3, Flag, X, AlertTriangle, LogIn, CheckCircle2, Users, Search, ThumbsUp, ArrowLeft, PieChart as PieChartIcon } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { cn } from "@/lib/utils";
import MexicoMap from "@/components/Map";

// ... ReportModal Component ...
const ReportModal = ({
    isOpen,
    onClose,
    onSubmit,
    declaration
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<boolean>;
    declaration: Declaration | null;
}) => {
    const { isLoaded, isSignedIn, user } = useUser();
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsSuccess(false);
            setReason("");
        }
    }, [isOpen]);

    if (!isOpen || !declaration) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSubmit(reason);
        if (success) {
            setIsSuccess(true);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Reportar Declaración
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Funcionario</p>
                        <p className="font-medium text-white">
                            {declaration.NOMBRE} {declaration.PRIMER_APELLIDO} {declaration.SEGUNDO_APELLIDO}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">{declaration.PUESTO_NOMBRE}</p>
                    </div>

                    {isSuccess ? (
                        <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
                            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div className="space-y-2 px-4">
                                <h4 className="font-bold text-white text-xl">¡Reporte Enviado!</h4>
                                <p className="text-sm text-gray-400">
                                    Gracias por tu colaboración. Tu reporte ha sido registrado exitosamente y será procesado por nuestro sistema.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full mt-4 py-3 px-4 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors"
                            >
                                Cerrar Ventana
                            </button>
                        </div>
                    ) : !isSignedIn ? (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center space-y-4">
                            <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <LogIn className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-white text-lg">Inicia sesión para reportar</h4>
                                <p className="text-sm text-gray-400">
                                    Para mantener la integridad de los reportes, es necesario que te identifiques con tu cuenta de Google.
                                </p>
                            </div>
                            <SignInButton mode="modal">
                                <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Iniciar Sesión con Google
                                </button>
                            </SignInButton>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Motivo del reporte
                                </label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px]"
                                    placeholder="Describe por qué estás reportando esta declaración (ej. datos inconsistentes, posible conflicto de interés...)"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reason.trim()}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                                    Enviar Reporte
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, '') + ' m';
    }
    return value.toLocaleString();
};

// --- Types ---
interface DashboardProps {
    view: 'explorer' | 'community';
    onViewChange: (view: 'explorer' | 'community') => void;
}
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

interface CitizenReport {
    id: string;
    funcionario: string;
    institucion: string;
    motivo: string;
    timestamp: string;
    user_id: string;
    user_email: string;
    upvotes: number;
}

// --- Constants ---
// Simplified list of entities for prototype
// Removed ENTITIES constant as we use the Map now

export default function Dashboard({ view, onViewChange }: DashboardProps) {
    const { db, conn } = useDuckDB(); // removed loading check here as custom logic handles it

    // -- State --
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
    const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
    const [isMapCollapsed, setIsMapCollapsed] = useState(false);

    // Report Logic
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedDeclForReport, setSelectedDeclForReport] = useState<Declaration | null>(null);

    const handleOpenReport = (decl: Declaration) => {
        setSelectedDeclForReport(decl);
        setIsReportModalOpen(true);
    };

    const [isRefreshingCommunity, setIsRefreshingCommunity] = useState(false);
    const [communityReports, setCommunityReports] = useState<CitizenReport[]>([]);

    const communityStats = useMemo(() => {
        const validated = communityReports.filter(r => (r.upvotes || 0) > 0).length;
        const pending = communityReports.length - validated;
        return [
            { name: 'Validados', value: validated, fill: '#10b981' },
            { name: 'Pendientes', value: pending, fill: '#f59e0b' }
        ];
    }, [communityReports]);

    const fetchCommunityReports = async () => {
        if (!conn) return;
        setIsRefreshingCommunity(true);
        try {
            const res = await conn.query(`
                SELECT * FROM citizen_reports 
                ORDER BY upvotes DESC, timestamp DESC
            `);
            setCommunityReports(res.toArray().map(r => r.toJSON()));
        } catch (e) {
            console.error("Error fetching community reports", e);
        } finally {
            setIsRefreshingCommunity(false);
        }
    };

    useEffect(() => {
        if (view === 'community' && conn) {
            fetchCommunityReports();
        }
    }, [view, conn]);

    const { user, isSignedIn } = useUser();
    const handleUpvote = async (reportId: string) => {
        if (!conn || !isSignedIn) {
            if (!isSignedIn) alert("Inicia sesión para votar");
            return;
        }

        try {
            // Check if already voted (using LocalStorage for prototype simplicity)
            const voted = JSON.parse(localStorage.getItem('voted_reports') || '[]');
            if (voted.includes(reportId)) return;

            // Update DuckDB
            await conn.query(`
                UPDATE citizen_reports 
                SET upvotes = upvotes + 1 
                WHERE id = '${reportId}'
            `);

            // Update LocalStorage for persistent reports (sync)
            const saved = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
            const updated = saved.map((r: CitizenReport) =>
                r.id === reportId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r
            );
            localStorage.setItem('citizen_reports', JSON.stringify(updated));
            localStorage.setItem('voted_reports', JSON.stringify([...voted, reportId]));

            // Refresh UI
            fetchCommunityReports();
        } catch (e) {
            console.error("Error upvoting", e);
        }
    };

    const handleSubmitReport = async (reason: string): Promise<boolean> => {
        if (!selectedDeclForReport || !conn) return false;

        const report = {
            id: selectedDeclForReport.NOMBRE + selectedDeclForReport.PRIMER_APELLIDO + Date.now(),
            funcionario: `${selectedDeclForReport.NOMBRE} ${selectedDeclForReport.PRIMER_APELLIDO} ${selectedDeclForReport.SEGUNDO_APELLIDO}`,
            institucion: selectedDeclForReport.INSTITUCION,
            motivo: reason,
            timestamp: new Date().toISOString(),
            user_id: user?.id || 'anonymous',
            user_email: user?.primaryEmailAddress?.emailAddress || 'anonymous',
            upvotes: 0
        };

        try {
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));

            // Persist in DuckDB
            await conn.query(`
                INSERT INTO citizen_reports 
                VALUES ('${report.id}', '${report.funcionario.replace(/'/g, "''")}', '${report.institucion.replace(/'/g, "''")}', '${report.motivo.replace(/'/g, "''")}', '${report.timestamp}', '${report.user_id}', '${report.user_email}', ${report.upvotes})
            `);

            // Persist in LocalStorage
            const current = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
            localStorage.setItem('citizen_reports', JSON.stringify([...current, report]));

            console.log("Report Persisted:", report);
            return true;
        } catch (e) {
            console.error("Error persisting report", e);
            alert("Error al guardar el reporte.");
            return false;
        }
    };

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

                    // Persistent Reporting Table
                    await conn.query(`
                        CREATE TABLE IF NOT EXISTS citizen_reports (
                            id VARCHAR,
                            funcionario VARCHAR,
                            institucion VARCHAR,
                            motivo TEXT,
                            timestamp TIMESTAMP,
                            user_id VARCHAR,
                            user_email VARCHAR,
                            upvotes INTEGER DEFAULT 0
                        )
                    `);

                    // Sync from LocalStorage
                    const savedReports = JSON.parse(localStorage.getItem('citizen_reports') || '[]');
                    if (savedReports.length > 0) {
                        for (const report of savedReports) {
                            await conn.query(`
                                INSERT INTO citizen_reports 
                                VALUES ('${report.id}', '${report.funcionario.replace(/'/g, "''")}', '${report.institucion.replace(/'/g, "''")}', '${report.motivo.replace(/'/g, "''")}', '${report.timestamp}', '${report.user_id || 'anonymous'}', '${report.user_email || 'anonymous'}', ${report.upvotes || 0})
                            `);
                        }
                    }

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
        <div className="flex flex-col md:flex-row md:h-[calc(100vh-theme(spacing.20))] w-full gap-6 p-4 sm:p-6 overflow-y-auto md:overflow-hidden">
            {/* --- Sidebar: Dashboard Selector / Stats --- */}
            <div className={cn(
                "w-full md:w-1/3 flex-shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden relative bg-black/10 transition-all duration-300",
                view === 'explorer' && isMapCollapsed ? "h-14 min-h-[56px]" : "min-h-[400px] md:min-h-0"
            )}>
                {view === 'explorer' && (
                    <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-white/5 z-[600] relative">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                            <MapIcon className="w-3.5 h-3.5" />
                            {selectedEntityName || 'Selecciona un Estado'}
                        </span>
                        <button
                            onClick={() => setIsMapCollapsed(!isMapCollapsed)}
                            className="p-1 rounded bg-white/10 text-white"
                        >
                            {isMapCollapsed ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4 -rotate-90" />}
                        </button>
                    </div>
                )}

                {view === 'explorer' ? (
                    <div className={cn(
                        "flex-1 transition-all duration-300 relative",
                        isMapCollapsed ? "h-0 opacity-0 pointer-events-none overflow-hidden" : "h-[400px] min-h-[400px] md:h-full opacity-100"
                    )}>
                        <MexicoMap
                            selectedStateCode={selectedEntity}
                            onStateSelect={(name, code) => {
                                setSelectedEntity(code);
                                setSelectedEntityName(name);
                                // Auto collapse on mobile
                                if (window.innerWidth < 768) {
                                    setIsMapCollapsed(true);
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col p-4 sm:p-6 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-white">Voz Ciudadana</h3>
                                <p className="text-[10px] sm:text-xs text-gray-400">Estado de validación comunitaria</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-6 sm:gap-8">
                            <div className="h-48 sm:h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={communityStats}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {communityStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                    <p className="text-emerald-400 font-bold text-2xl">{communityStats[0].value}</p>
                                    <p className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold">Validados</p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                                    <p className="text-amber-400 font-bold text-2xl">{communityStats[1].value}</p>
                                    <p className="text-[10px] text-amber-500/70 uppercase tracking-widest font-bold">Pendientes</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Search className="w-4 h-4" />
                                    <span className="text-sm font-bold">Resumen de Actividad</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed italic">
                                    Se han registrado {communityReports.length} reportes en total.
                                    La comunidad ha validado el {communityReports.length > 0 ? ((communityStats[0].value / communityReports.length) * 100).toFixed(1) : 0}% de las incidencias reportadas.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Middle: Institution List --- */}
            {view === 'explorer' && selectedEntityName && (
                <div className="w-full md:w-80 flex-shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500 h-[300px] md:h-auto min-h-[300px] md:min-h-0">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-400" />
                            Instituciones
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">{selectedEntityName}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 pb-20 md:pb-2">
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
            {view === 'community' ? (
                <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 h-[600px] md:h-auto min-h-[600px] md:min-h-0">
                    <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center bg-white/5 gap-4">
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center sm:justify-start gap-3">
                                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                                Reportes Comunitarios
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                Incidencias reportadas para revisión pública
                            </p>
                        </div>
                        <button
                            onClick={fetchCommunityReports}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors"
                            title="Recargar reportes"
                        >
                            <Loader2 className={cn("w-5 h-5", isRefreshingCommunity && "animate-spin")} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20 pb-24 md:pb-6">
                        {isRefreshingCommunity && communityReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                                <Loader2 className="w-10 h-10 animate-spin" />
                                <p>Cargando reportes comunitarios...</p>
                            </div>
                        ) : communityReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                                <div className="bg-white/5 p-6 rounded-full">
                                    <Search className="w-12 h-12 opacity-20" />
                                </div>
                                <p className="text-lg font-medium">No hay reportes todavía</p>
                                <p className="text-sm max-w-xs text-center">Inicia sesión y reporta una inconsistencia en el Analizador para empezar la conversación.</p>
                                <button
                                    onClick={() => onViewChange('explorer')}
                                    className="mt-2 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors"
                                >
                                    Ir al Analizador
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {communityReports.map((report) => {
                                    const hasVoted = typeof window !== 'undefined' && JSON.parse(localStorage.getItem('voted_reports') || '[]').includes(report.id);
                                    return (
                                        <div key={report.id} className="bg-[#1e293b]/40 border border-white/10 rounded-xl p-4 sm:p-5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 flex gap-2">
                                                <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg">
                                                    <ThumbsUp className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", hasVoted ? "text-purple-400 fill-purple-400" : "text-gray-400")} />
                                                    <span className="text-[10px] sm:text-xs font-bold text-white leading-none">{report.upvotes || 0}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-purple-400 font-bold uppercase tracking-wider">
                                                            <Building2 className="w-3 h-3" />
                                                            {report.institucion}
                                                        </div>
                                                        <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors">
                                                            {report.funcionario}
                                                        </h3>
                                                    </div>

                                                    <div className="bg-black/30 rounded-lg p-3 border border-white/5 italic text-gray-300 text-xs sm:text-sm list-inside">
                                                        "{report.motivo}"
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                                            <div className="bg-white/5 px-2 py-1 rounded text-[9px] sm:text-[10px] text-gray-500 font-mono truncate">
                                                                ID: {report.id.slice(0, 8)}
                                                            </div>
                                                            <span className="text-[9px] sm:text-[10px] text-gray-500 flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                Ciudadano {report.user_id?.slice(-4) || 'Anon'}
                                                            </span>
                                                        </div>

                                                        <button
                                                            disabled={hasVoted}
                                                            onClick={() => handleUpvote(report.id)}
                                                            className={cn(
                                                                "w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                                                hasVoted
                                                                    ? "bg-purple-500/20 text-purple-300 cursor-default"
                                                                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 active:scale-95"
                                                            )}
                                                        >
                                                            <ThumbsUp className={cn("w-4 h-4", hasVoted && "fill-current")} />
                                                            {hasVoted ? 'Votado' : 'Validar Datos'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : selectedInstitution ? (
                <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 h-[500px] md:h-auto min-h-[500px] md:min-h-0">
                    <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start gap-4 bg-white/5">
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
                    <div className="flex-1 overflow-auto bg-black/20 pb-24 md:pb-0">
                        <div className="min-w-full inline-block align-middle">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-gray-400 font-medium sticky top-0 backdrop-blur-md">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-10"></th>
                                            <th className="px-4 sm:px-6 py-3 text-left">Funcionario</th>
                                            <th className="px-4 sm:px-6 py-3 text-left hidden sm:table-cell">Puesto</th>
                                            <th className="px-4 sm:px-6 py-3 text-right">Ingreso</th>
                                            <th className="px-4 sm:px-6 py-3 text-right hidden md:table-cell">Anual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {declarations.map((decl, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleOpenReport(decl)}
                                                        className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors opacity-80 hover:opacity-100"
                                                        title="Reportar inconsistencia"
                                                    >
                                                        <Flag className="w-4 h-4" />
                                                    </button>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3">
                                                    <div className="font-medium text-gray-200 group-hover:text-blue-300 transition-colors whitespace-normal leading-tight py-1">
                                                        {decl.NOMBRE} {decl.PRIMER_APELLIDO} {decl.SEGUNDO_APELLIDO}
                                                    </div>
                                                    <div className="sm:hidden text-[10px] text-gray-500 line-clamp-2 max-w-[200px] mt-1">
                                                        {decl.PUESTO_NOMBRE}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 text-gray-400 max-w-xs whitespace-normal leading-snug hidden sm:table-cell" title={decl.PUESTO_NOMBRE}>
                                                    <div className="line-clamp-2">{decl.PUESTO_NOMBRE}</div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 text-right font-mono text-emerald-400">
                                                    ${formatCurrency(decl.TOTAL_INGRESOS_MENSUALES_NETOS || 0)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 text-right font-mono text-gray-500 hidden md:table-cell">
                                                    ${formatCurrency(decl.REMUNERACION_ANUAL_CARGO_PUBLICO || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleSubmitReport}
                declaration={selectedDeclForReport}
            />
        </div>
    );
}
