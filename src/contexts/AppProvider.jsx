"use client";
import { useEffect } from 'react';

import { MenuProvider } from './MenuContext';
import { FilterProvider } from './FilterContext';
import { createStorageContext } from './createStorageContext';

import { cartConfig } from './config/cartConfig';
import { wishlistConfig } from './config/wishlistConfig';
import { loadDeals, syncCartDeals } from '@/utils/dealConfigService';

const { Provider: WishlistProvider, useHook: useWishlist } = createStorageContext(wishlistConfig);
const { Provider: CartProvider, useHook: useCart } = createStorageContext(cartConfig);

export function AppProvider({ children }) {
    useEffect(() => {
        async function initializeDeals() {
            const deals = await loadDeals();
            if (deals && deals.length > 0) { syncCartDeals(deals); }
        }
        
        initializeDeals();
    }, []);

    return (
        <CartProvider>
            <WishlistProvider>
                <FilterProvider>
                    <MenuProvider>
                        {children}
                    </MenuProvider>
                </FilterProvider>
            </WishlistProvider>
        </CartProvider>
    );
}

export { useCart, useWishlist };
export { useMenu } from './MenuContext';
export { useFilters } from './FilterContext';