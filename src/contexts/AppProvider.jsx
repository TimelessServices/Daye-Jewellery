"use client";
import { useEffect, useRef } from 'react';

import { MenuProvider } from './MenuContext';
import { FilterProvider } from './FilterContext';
import { createStorageContext } from './createStorageContext';

import { cartConfig } from './config/cartConfig';
import { wishlistConfig } from './config/wishlistConfig';
import { loadDeals, syncCartDeals } from '@/utils/dealConfigService';
import { useToasts } from '@/contexts/UIProvider';

const { Provider: WishlistProvider, useHook: useWishlist } = createStorageContext(wishlistConfig);
const { Provider: CartProvider, useHook: useCart } = createStorageContext(cartConfig);

function DealSyncInitializer({ children }) {
    const { cart, addToCart, removeFromCart, isHydrated } = useCart();
    const { addToast } = useToasts();
    const hasSyncedRef = useRef(false);

    useEffect(() => {
        if (!isHydrated || hasSyncedRef.current) { return; }
        hasSyncedRef.current = true;

        let isSubscribed = true;

        async function initializeDeals() {
            const deals = await loadDeals();
            if (!isSubscribed) { return; }

            if (Array.isArray(deals)) {
                syncCartDeals(deals, {
                    cart,
                    addToCart,
                    removeFromCart,
                    addToast
                });
            }
        }

        initializeDeals();

        return () => {
            isSubscribed = false;
        };
    }, [isHydrated, cart, addToCart, removeFromCart, addToast]);

    return children;
}

export function AppProvider({ children }) {
    return (
        <CartProvider>
            <DealSyncInitializer>
                <WishlistProvider>
                    <FilterProvider>
                        <MenuProvider>
                            {children}
                        </MenuProvider>
                    </FilterProvider>
                </WishlistProvider>
            </DealSyncInitializer>
        </CartProvider>
    );
}

export { useCart, useWishlist };
export { useMenu } from './MenuContext';
export { useFilters } from './FilterContext';