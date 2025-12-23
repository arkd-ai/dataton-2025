'use client';

import { DuckDBProvider } from "@/components/DuckDBProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <DuckDBProvider>
                {children}
            </DuckDBProvider>
        </ClerkProvider>
    );
}
