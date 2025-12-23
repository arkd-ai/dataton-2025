'use client';

import { DuckDBProvider } from "@/components/DuckDBProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function Providers({ children }: { children: React.ReactNode }) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            appearance={{ baseTheme: dark }}
        >
            <DuckDBProvider>
                {children}
            </DuckDBProvider>
        </ClerkProvider>
    );
}
