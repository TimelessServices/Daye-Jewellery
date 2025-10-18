"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import FilterStorage from '@/utils/FilterStorage';
import URLFilterManager from '@/utils/URLFilterManager';

const FilterContext = createContext();
const filterStorage = new FilterStorage();

export function FilterProvider({ children }) {
    const [filters, setFilters] = useState(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        
        const urlFilters = URLFilterManager.parseUrlParams(searchParams);
        const storedFilters = filterStorage.getFilters();
        
        // URL params take priority over stored filters
        const initialFilters = { ...storedFilters, ...urlFilters };
        setFilters(initialFilters);
        
        // If URL had filters, save them to storage
        if (Object.keys(urlFilters).length > 0) {
            filterStorage.saveFilters(initialFilters);
        }
    }, [isHydrated, searchParams]);

    // Main update function - updates filters and URL
    const updateFilters = useCallback((newFilters, updateUrl = true) => {
        setFilters(newFilters);
        filterStorage.saveFilters(newFilters);
        
        if (updateUrl) {
            const urlParams = URLFilterManager.buildUrlParams(newFilters);
            const newUrl = urlParams ? `/shop?${urlParams}` : '/shop';
            router.replace(newUrl, { scroll: false });
        }
    }, [router]);

    // Generate filter updaters dynamically instead of manually
    const filterUpdaters = useMemo(() => {
        if (!filters) return {};
        
        const createUpdater = (key, transformer) => (value) => {
            const newFilters = { ...filters };
            if (transformer) {
                transformer(newFilters, value);
            } else {
                newFilters[key] = value;
            }
            updateFilters(newFilters);
        };
        
        return {
            updateSearch: createUpdater('search'),
            updateSort: createUpdater('sort'),
            updateTypes: createUpdater('types'),
            updateOnSale: createUpdater('onSale'),

            updatePrice: (min, max) => {
                const newFilters = { ...filters };
                newFilters.price = { min, max };
                updateFilters(newFilters);
            },
            
            updateMaterial: createUpdater('material', (filters, material) => {
                filters.material = material;
                filters.materialQuery = material.length > 0;
            }),
            updateGem: createUpdater('gem', (filters, gem) => {
                filters.gem = gem;
                filters.gemQuery = gem.length > 0;
            })
        };
    }, [filters, updateFilters]);

    // External navigation helper
    const navigateWithFilters = useCallback((targetFilters, resetExisting = false) => {
        const baseFilters = resetExisting ? filterStorage.getDefaultFilters : filterStorage.getFilters();
        const newFilters = { ...baseFilters, ...targetFilters };
        
        setFilters(newFilters);
        filterStorage.saveFilters(newFilters);
        
        const urlParams = URLFilterManager.buildUrlParams(newFilters);
        const newUrl = urlParams ? `/shop?${urlParams}` : '/shop';
        router.push(newUrl);
    }, [router]);

    // Reset filters to defaults
    const resetFilters = useCallback(() => {
        const defaultFilters = filterStorage.resetFilters();
        setFilters(defaultFilters);
        router.replace('/shop', { scroll: false });
    }, [router]);

    // Simplified preset filters
    const presetFilters = useMemo(() => ({
        filterByType: (type) => navigateWithFilters({ types: [type] }, true),
        filterOnSale: () => navigateWithFilters({ onSale: true }, true),
        filterBestSellers: () => navigateWithFilters({ sort: "bestsellers" }, true),
    }), [navigateWithFilters]);

    const value = useMemo(() => ({
        filters,
        filterUpdaters,
        presetFilters,
        navigateWithFilters,
        resetFilters,
        updateFilters,
        isHydrated
    }), [filters, filterUpdaters, presetFilters, navigateWithFilters, resetFilters, updateFilters, isHydrated]);

    return (
        <FilterContext.Provider value={value}>
            {isHydrated ? children : <div style={{opacity: 0}}>{children}</div>}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) throw new Error('useFilters must be used within a FilterProvider');
    return context;
}