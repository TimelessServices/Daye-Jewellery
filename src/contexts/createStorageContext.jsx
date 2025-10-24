"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createStorageManager } from '@/utils/Storage';

export function createStorageContext(config) {
    const { contextName, storageKey, storageType, initialValue, operations } = config;

    const Context = createContext();
    const storage = createStorageManager(storageKey, storageType);

    function Provider({ children }) {
        const [items, setItems] = useState(initialValue);
        const [isHydrated, setIsHydrated] = useState(false);
        const [hydrationVersion, setHydrationVersion] = useState(0);

        // Computed values
        const count = useMemo(() => {
            return operations.count ? operations.count(items) : (
                Array.isArray(items) ? items.length : Object.keys(items).length
            );
        }, [items]);

        const total = useMemo(() => {
            return operations.total ? operations.total(items) : 0;
        }, [items]);

        useEffect(() => {
            console.log(`[${contextName}Provider] mounted`);
        }, []);

        // Load from storage on mount
        useEffect(() => {
            let cancelled = false;

            const hydrateFromStorage = () => {
                const result = storage.get();

                if (cancelled) { return; }

                if (result.success) {
                    setItems(result.data);
                } else if (result?.error) {
                    console.error(`-- Load Error: ${result.error}`);
                }

                setIsHydrated(true);
                setHydrationVersion(prev => prev + 1);
            };

            hydrateFromStorage();

            return () => {
                cancelled = true;
            };
        }, []);

        // Cross-tab sync for localStorage
        useEffect(() => {
            if (storageType !== 'localStorage') return;

            const handleStorageChange = (e) => {
                if (e.key === storageKey && e.storageArea === localStorage) {
                    try {
                        setItems(JSON.parse(e.newValue || (typeof initialValue === "object" ? '{}' : '[]')));
                    } catch {
                        setItems(initialValue);
                    }
                    setIsHydrated(true);
                    setHydrationVersion(prev => prev + 1);
                }
            };

            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }, []);

        // Generate all operations from config.operations
        const operationFns = {};
        for (const opName in operations) {
            if (typeof operations[opName] === "function" && opName !== "count" && opName !== "total" && opName !== "custom") {
                operationFns[opName] = useCallback((...args) => {
                    setItems(prev => {
                        const result = operations[opName](prev, ...args);
                        storage.set(result);
                        return result;
                    });
                }, []);
            }
        }

        // Standard clear
        const clear = useCallback(() => {
            setItems(typeof initialValue === "object" && !Array.isArray(initialValue) ? { ...initialValue } : []);
            storage.clear();
        }, []);

        // Find & exists for objects and arrays
        const find = useCallback((identifier) => {
            if (Array.isArray(items)) {
                return items.find(item => item.itemId === identifier);
            } else if (typeof items === "object") {
                return items[identifier] || null;
            }
            return null;
        }, [items]);

        const exists = useCallback((identifier) => {
            if (Array.isArray(items)) {
                return items.some(item => item.itemId === identifier);
            } else if (typeof items === "object") {
                return !!items[identifier];
            }
            return false;
        }, [items]);

        // Custom operations
        const customOperations = useMemo(() =>
            Object.keys(operations.custom || {}).reduce((acc, key) => {
                acc[key] = operations.custom[key](items, { ...operationFns, clear });
                return acc;
            }, {}),
            [items, ...Object.values(operationFns), clear]
        );

        // Compose context value
        const value = useMemo(() => {
            const baseValue = {
                items,
                count,
                total,
                ...operationFns,
                clear,
                find,
                exists,
                isHydrated,
                hydrationVersion,
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
        }, [items, count, total, operationFns, clear, find, exists, isHydrated, customOperations, contextName]);

        if (!isHydrated) {
            return (
                <Context.Provider value={value}>
                    <div style={{ display: 'none' }}>{children}</div>
                </Context.Provider>
            );
        }

        return <Context.Provider value={value}>{children}</Context.Provider>;
    }

    function useHook() {
        const context = useContext(Context);
        if (!context) throw new Error(`use${contextName} must be used within a ${contextName}Provider`);
        return context;
    }

    return { Provider, useHook };
}