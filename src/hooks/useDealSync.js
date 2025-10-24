"use client";

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { loadDeals, syncCartDeals } from '@/utils/dealConfigService';

const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function extractDeals(payload) {
    if (Array.isArray(payload)) {
        return { deals: payload, updatedAt: null, source: 'legacy' };
    }

    if (payload && Array.isArray(payload.deals)) {
        return payload;
    }

    return { deals: [], updatedAt: null, source: 'unknown' };
}

export function useDealSync({
    cart,
    addToCart,
    removeFromCart,
    addToast,
    hydrationVersion,
    refreshInterval = DEFAULT_REFRESH_INTERVAL
} = {}) {
    const latestContextRef = useRef({ cart, addToCart, removeFromCart, addToast });

    useEffect(() => {
        latestContextRef.current = { cart, addToCart, removeFromCart, addToast };
    }, [cart, addToCart, removeFromCart, addToast]);

    const isHydrated = typeof hydrationVersion === 'number' && hydrationVersion > 0;

    const inFlightRef = useRef(false);

    const runSync = useCallback(async (options = {}) => {
        if (inFlightRef.current) { return null; }
        inFlightRef.current = true;

        try {
            const payload = await loadDeals(options);
            const { deals } = extractDeals(payload);

            if (Array.isArray(deals)) {
                const context = latestContextRef.current;
                syncCartDeals(deals, context);
            }

            return payload;
        } finally {
            inFlightRef.current = false;
        }
    }, []);

    const processedVersionRef = useRef(0);

    useEffect(() => {
        if (!isHydrated || hydrationVersion <= processedVersionRef.current) { return; }

        let cancelled = false;

        (async () => {
            try {
                await runSync();
                if (!cancelled) {
                    processedVersionRef.current = hydrationVersion;
                }
            } catch (error) {
                console.error('Failed to synchronize deals:', error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [hydrationVersion, isHydrated, runSync]);

    useEffect(() => {
        if (!isHydrated || !refreshInterval) { return; }
        if (typeof window === 'undefined') { return; }

        const intervalId = window.setInterval(() => {
            runSync({ forceRefresh: true });
        }, refreshInterval);

        return () => window.clearInterval(intervalId);
    }, [isHydrated, refreshInterval, runSync]);

    const refreshDeals = useCallback(() => {
        if (!isHydrated) { return Promise.resolve(null); }
        return runSync({ forceRefresh: true });
    }, [isHydrated, runSync]);

    return useMemo(() => ({ refreshDeals }), [refreshDeals]);
}
