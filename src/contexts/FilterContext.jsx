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

        const applyChanges = (changes, updateUrl = true) => {
            if (!changes || Object.keys(changes).length === 0) return;

            const newFilters = { ...filters };

            Object.entries(changes).forEach(([key, value]) => {
                switch (key) {
                    case 'price':
                        newFilters.price = { ...value };
                        break;
                    case 'material':
                        newFilters.material = Array.isArray(value) ? [...value] : value;
                        newFilters.materialQuery = Array.isArray(newFilters.material) && newFilters.material.length > 0;
                        break;
                    case 'gem':
                        newFilters.gem = Array.isArray(value) ? [...value] : value;
                        newFilters.gemQuery = Array.isArray(newFilters.gem) && newFilters.gem.length > 0;
                        break;
                    default:
                        newFilters[key] = value;
                        break;
                }
            });

            updateFilters(newFilters, updateUrl);
        };

        return {
            updateSearch: createUpdater('search'),
            updateSort: createUpdater('sort'),
            updateTypes: createUpdater('types'),
            updateOnSale: createUpdater('onSale'),
            applyChanges,

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
        let baseFilters;
        if (resetExisting) {
            baseFilters = filterStorage.getDefaultFilters;
        } else {
            baseFilters = filterStorage.getFilters();
        }
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
    const presetFilters = useMemo(() => {
        const allTypes = ["Necklace", "Bracelet", "Ring", "Earring"];

        const filterByType = (type) => {
            if (!type) return navigateWithFilters({ types: allTypes }, true);
            return navigateWithFilters({ types: [type] }, true);
        };

        const filterSaleByType = (type) => {
            const types = type ? [type] : allTypes;
            return navigateWithFilters({ types, onSale: true, sort: "sale_first" }, true);
        };

        return {
            filterByType,
            filterAllTypes: () => navigateWithFilters({ types: allTypes }, true),
            filterOnSale: () => navigateWithFilters({ onSale: true, sort: "sale_first" }, true),
            filterBestSellers: () => navigateWithFilters({ sort: "bestsellers" }, true),
            filterNecklaces: () => filterByType("Necklace"),
            filterBracelets: () => filterByType("Bracelet"),
            filterRings: () => filterByType("Ring"),
            filterEarrings: () => filterByType("Earring"),
            filterSaleNecklaces: () => filterSaleByType("Necklace"),
            filterSaleBracelets: () => filterSaleByType("Bracelet"),
            filterSaleRings: () => filterSaleByType("Ring"),
            filterSaleEarrings: () => filterSaleByType("Earring"),
        };
    }, [navigateWithFilters]);

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