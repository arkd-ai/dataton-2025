import React, { createContext, useContext, useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

interface DuckDBContextType {
    db: duckdb.AsyncDuckDB | null;
    conn: duckdb.AsyncDuckDBConnection | null;
    loading: boolean;
    error: Error | null;
}

const DuckDBContext = createContext<DuckDBContextType>({
    db: null,
    conn: null,
    loading: true,
    error: null,
});

export const useDuckDB = () => useContext(DuckDBContext);

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

export const DuckDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
    const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initDuckDB = async () => {
            try {
                const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
                const worker = await duckdb.createWorker(bundle.mainWorker!);
                const logger = new duckdb.ConsoleLogger();
                const newDb = new duckdb.AsyncDuckDB(logger, worker);
                await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);

                const newConn = await newDb.connect();

                setDb(newDb);
                setConn(newConn);
            } catch (err) {
                console.error("Failed to initialize DuckDB", err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        initDuckDB();

        return () => {
            // Cleanup if needed? Usually DuckDB worker persists for session
        };
    }, []);

    return (
        <DuckDBContext.Provider value={{ db, conn, loading, error }}>
            {children}
        </DuckDBContext.Provider>
    );
};
