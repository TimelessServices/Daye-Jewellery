"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterStorage from '@/utils/FilterStorage';

const FilterContext = createContext();
const filterStorage = new FilterStorage();

export function FilterProvider({ children }) {
    const [filters, setFilters] = useState(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Helper to parse URL parameters into filter format
    const parseUrlParams = useCallback((searchParams) => {
        const urlFilters = {};
        
        if (searchParams.get('search')) {
            urlFilters.search = searchParams.get('search');
        }
        
        if (searchParams.get('types')) {
            urlFilters.types = searchParams.get('types').split(',');
        }
        
        if (searchParams.get('sale') === 'true') {
            urlFilters.onSale = true;
        }
        
        if (searchParams.get('sort')) {
            urlFilters.sort = searchParams.get('sort');
        }
        
        if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
            urlFilters.price = {
                min: parseInt(searchParams.get('minPrice')) || 0,
                max: parseInt(searchParams.get('maxPrice')) || 5000
            };
        }
        
        return urlFilters;
    }, []);

    // Helper to build URL parameters from filters
    const buildUrlParams = useCallback((filters) => {
        const params = new URLSearchParams();
        
        if (filters.search) {
            params.set('search', filters.search);
        }
        
        if (filters.types && filters.types.length < 4) {
            params.set('types', filters.types.join(','));
        }
        
        if (filters.onSale) {
            params.set('sale', 'true');
        }
        
        if (filters.sort) {
            params.set('sort', filters.sort);
        }
        
        if (filters.price && (filters.price.min > 0 || filters.price.max < 5000)) {
            if (filters.price.min > 0) params.set('minPrice', filters.price.min.toString());
            if (filters.price.max < 5000) params.set('maxPrice', filters.price.max.toString());
        }
        
        return params.toString();
    }, []);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        
        const urlFilters = parseUrlParams(searchParams);
        const storedFilters = filterStorage.getFilters();
        
        // URL params take priority over stored filters
        const initialFilters = { ...storedFilters, ...urlFilters };
        setFilters(initialFilters);
        
        // If URL had filters, save them to storage
        if (Object.keys(urlFilters).length > 0) {
            filterStorage.saveFilters(initialFilters);
        }
    }, [isHydrated, searchParams, parseUrlParams]);

    // Main update function - updates filters and URL
    const updateFilters = useCallback((newFilters, updateUrl = true) => {
        setFilters(newFilters);
        filterStorage.saveFilters(newFilters);
        
        if (updateUrl) {
            const urlParams = buildUrlParams(newFilters);
            const newUrl = urlParams ? `/shop?${urlParams}` : '/shop';
            router.replace(newUrl, { scroll: false });
        }
    }, [router, buildUrlParams]);

    // External navigation helper for Home page / Navigation menus
    const navigateWithFilters = useCallback((targetFilters, resetExisting = false) => {
        const baseFilters = resetExisting ? filterStorage.getDefaultFilters : filterStorage.getFilters();
        const newFilters = { ...baseFilters, ...targetFilters };
        
        setFilters(newFilters);
        filterStorage.saveFilters(newFilters);
        
        const urlParams = buildUrlParams(newFilters);
        const newUrl = urlParams ? `/shop?${urlParams}` : '/shop';
        router.push(newUrl);
    }, [router, buildUrlParams]);

    // Navigate to collection - simple URL navigation
    const navigateToCollection = useCallback((collection) => {
        const url = `/shop?collection=${collection.CollectionID}`;
        router.push(url);
    }, [router]);

    // Reset filters to defaults
    const resetFilters = useCallback(() => {
        const defaultFilters = filterStorage.resetFilters();
        setFilters(defaultFilters);
        router.replace('/shop', { scroll: false });
    }, [router]);

    // Individual filter updater functions
    const filterUpdaters = useMemo(() => {
        if (!filters) return {};
        
        return {
            updateSearch: (searchTerm) => {
                const newFilters = { ...filters, search: searchTerm };
                updateFilters(newFilters);
            },
            
            updateSort: (sortValue) => {
                const newFilters = { ...filters, sort: sortValue };
                updateFilters(newFilters);
            },
            
            updatePrice: (min, max) => {
                const newFilters = { ...filters, price: { min, max } };
                updateFilters(newFilters);
            },
            
            updateTypes: (types) => {
                const newFilters = { ...filters, types };
                updateFilters(newFilters);
            },
            
            updateOnSale: (onSale) => {
                const newFilters = { ...filters, onSale };
                updateFilters(newFilters);
            },
            
            updateMaterial: (material) => {
                const newFilters = { ...filters, material, materialQuery: material.length > 0 };
                updateFilters(newFilters);
            },
            
            updateGem: (gem) => {
                const newFilters = { ...filters, gem, gemQuery: gem.length > 0 };
                updateFilters(newFilters);
            }
        };
    }, [filters, updateFilters]);

    // Helper functions for external components
    const presetFilters = useMemo(() => ({
        // For Home page DisplayItems
        filterByType: (type) => navigateWithFilters({ types: [type] }, true),
        filterByCollection: (collection) => navigateWithFilters({ collection }, true),
        filterBestSellers: () => navigateWithFilters({ sort: "bestsellers" }, true),
        filterOnSale: () => navigateWithFilters({ onSale: true }, true),
        
        // For Navigation menu items
        filterNecklaces: () => navigateWithFilters({ types: ["Necklace"] }, true),
        filterRings: () => navigateWithFilters({ types: ["Ring"] }, true),
        filterEarrings: () => navigateWithFilters({ types: ["Earring"] }, true),
        filterBracelets: () => navigateWithFilters({ types: ["Bracelet"] }, true),
    }), [navigateWithFilters]);

    const value = useMemo(() => ({
        filters,
        filterUpdaters,
        presetFilters,
        navigateWithFilters,
        navigateToCollection, // Simple navigation only
        resetFilters,
        updateFilters,
        isHydrated
    }), [filters, filterUpdaters, presetFilters, navigateWithFilters, navigateToCollection, resetFilters, updateFilters, isHydrated]);

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