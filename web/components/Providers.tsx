'use client';

import { DuckDBProvider } from "@/components/DuckDBProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <DuckDBProvider>
            {children}
        </DuckDBProvider>
    );
}
