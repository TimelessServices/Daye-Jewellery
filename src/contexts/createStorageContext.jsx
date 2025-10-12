"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createStorageManager } from '@/utils/Storage';

export function createStorageContext(config) {
    const { 
        contextName, 
        storageKey, 
        storageType,
        itemIdKey = 'itemId',
        operations = {}
    } = config;

    const Context = createContext();
    const storage = createStorageManager(storageKey, storageType);

    function Provider({ children }) {
        const [items, setItems] = useState([]);
        const [isHydrated, setIsHydrated] = useState(false);

        // Generic computed values
        const count = useMemo(() => {
            return operations.count ? operations.count(items) : items.length;
        }, [items]);

        const total = useMemo(() => {
            return operations.total ? operations.total(items) : 0;
        }, [items]);

        useEffect(() => {
            console.log(`[${contextName}Provider] mounted`);
        }, []);

        // Load from storage on mount
        useEffect(() => {
            setIsHydrated(true);
            const saved = storage.get();
            setItems(saved);
        }, []);

        // Cross-tab sync for localStorage
        useEffect(() => {
            if (storageType !== 'localStorage') return;
            
            const handleStorageChange = (e) => {
                if (e.key === storageKey && e.storageArea === localStorage) {
                    try {
                        setItems(JSON.parse(e.newValue || '[]'));
                    } catch { 
                        setItems([]); 
                    }
                }
            };

            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }, []);

        // Generic operations
        const add = useCallback((item) => {
            setItems(prev => {
                const newItems = operations.add ? operations.add(prev, item) : [...prev, item];
                storage.set(newItems);
                return newItems;
            });
        }, []);

        const remove = useCallback((identifier) => {
            setItems(prev => {
                const newItems = operations.remove ? operations.remove(prev, identifier) : 
                    prev.filter(item => item[itemIdKey] !== identifier);
                storage.set(newItems);
                return newItems;
            });
        }, []);

        const update = useCallback((identifier, updateFn) => {
            setItems(prev => {
                const newItems = prev.map(item => 
                    item[itemIdKey] === identifier ? updateFn(item) : item
                );
                storage.set(newItems);
                return newItems;
            });
        }, []);

        const clear = useCallback(() => {
            setItems([]);
            storage.clear();
        }, []);

        const find = useCallback((identifier) => {
            return items.find(item => item[itemIdKey] === identifier);
        }, [items]);

        const exists = useCallback((identifier) => {
            return items.some(item => item[itemIdKey] === identifier);
        }, [items]);

        const customOperations = useMemo(() => 
            Object.keys(operations.custom || {}).reduce((acc, key) => {
                acc[key] = operations.custom[key](items, { add, remove, update, clear });
                return acc;
            }, {}),
            [items, add, remove, update, clear]
        );

        const value = useMemo(() => {
            const baseValue = {
                items,
                count,
                total,
                add, remove, update, clear, find, exists, isHydrated,
                ...customOperations
            };

            if (contextName === 'Cart') {
                baseValue.cart = items;
                baseValue.cartCount = count;
                baseValue.cartTotal = total;
            } else if (contextName === 'Wishlist') {
                baseValue.wishlist = items;
                baseValue.wishlistCount = count;
                baseValue.wishlistTotal = total;
            }
            
            return baseValue;
        }, [items, count, total, add, remove, update, clear, find, exists, isHydrated, customOperations, contextName]);

        if (!isHydrated) return <div style={{display: 'none'}}>{children}</div>;

        return <Context.Provider value={value}>{children}</Context.Provider>;
    }

    function useHook() {
        const context = useContext(Context);
        if (!context) throw new Error(`use${contextName} must be used within a ${contextName}Provider`);
        return context;
    }

    return { Provider, useHook };
}