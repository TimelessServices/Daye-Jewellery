"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

import menuData from '@/data/menus.json';
import { useRouter } from "next/navigation";
import { useFilters } from './FilterContext';
import { cachedFetch } from '@/utils/RequestCache';

const MenuContext = createContext();

export function MenuProvider({ children }) {
    const [collections, setCollections] = useState([]);
    const [menuState, setMenuState] = useState({
        isOpen: false,
        activeSubmenu: null,
        content: "links-main"
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { navigateWithFilters } = useFilters();
    const router = useRouter();

    // Fetch collections on mount
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setError(null);
                const response = await cachedFetch('/api/collections/simple');
                if (response.success) {
                    setCollections(response.results);
                } else {
                    throw new Error('Failed to fetch collections');
                }
            } catch (error) {
                console.error('Failed to fetch collections:', error);
                setError(error.message);
                setCollections([]);  // Fallback to empty array
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCollections();
    }, []);

    // Action execution - centralized logic
    const executeAction = useCallback((action, onComplete) => {
        if (!action) return;

        switch (action.type) {
            case 'filter':
                navigateWithFilters(action.params, true);
                break;
            case 'collection_view':
                router.push(`/shop/${action.collection}`);
                break;
            case 'page':
                router.push(action.params.page);
                break;
            default:
                if (action.link) router.push(action.link);
        }
        
        if (onComplete) onComplete();
    }, [navigateWithFilters, router]);

    // Process menu data with collections injected
    const processedMenuData = useMemo(() => {
        if (error) return menuData;  // Return base menu on error
        const processedMenu = JSON.parse(JSON.stringify(menuData)); // Deep copy
        
        // Find collections menu item and inject dynamic collections
        const collectionsMenuItem = processedMenu.mainNavigation?.find(item => item.id === 'collections');
        if (collectionsMenuItem && collections.length > 0) {
            // Create submenu from collections
            collectionsMenuItem.submenu = collections.map(collection => ({
                id: collection.CollectionID,
                title: collection.Name,
                description: `${collection.ItemCount || 0} items`,
                link: `/shop`,
                action: { type: 'collection_view', collection: collection.CollectionID }
            }));
            collectionsMenuItem.hasSubmenu = true;
        }

        return processedMenu;
    }, [collections, error]);

    // Centralized menu state management
    const openMenu = useCallback(() => {
        setMenuState(prev => ({ ...prev, isOpen: true }));
    }, []);

    const closeMenu = useCallback(() => {
        setMenuState({ isOpen: false, activeSubmenu: null, content: "links-main" });
    }, []);

    const toggleMenu = useCallback(() => {
        setMenuState(prev => ({ 
            ...prev, 
            isOpen: !prev.isOpen,
            activeSubmenu: prev.isOpen ? null : prev.activeSubmenu,
            content: prev.isOpen ? "links-main" : prev.content
        }));
    }, []);

    const setActiveSubmenu = useCallback((submenu) => {
        setMenuState(prev => ({ ...prev, activeSubmenu: submenu }));
    }, []);

    const setContent = useCallback((content) => {
        setMenuState(prev => ({ ...prev, content }));
    }, []);

    const value = useMemo(() => ({
        collections,
        menuData: processedMenuData,
        loading: isLoading,
        error,
        menuState,
        executeAction,
        openMenu,
        closeMenu,
        toggleMenu,
        setActiveSubmenu,
        setContent
    }), [collections, processedMenuData, isLoading, error, menuState]);

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const context = useContext(MenuContext);
    if (!context) throw new Error('useMenu must be used within a MenuProvider');
    return context;
}