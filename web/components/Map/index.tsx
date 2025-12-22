'use client';

import dynamic from 'next/dynamic';

const MexicoMap = dynamic(() => import('./MexicoMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-gray-500 bg-slate-900/50 animate-pulse rounded-xl">Cargando Mapa...</div>
});

export default MexicoMap;
