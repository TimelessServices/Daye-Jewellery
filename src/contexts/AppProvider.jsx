"use client";
import { MenuProvider } from './MenuContext';
import { FilterProvider } from './FilterContext';
import { createStorageContext } from './createStorageContext';

import { cartConfig } from './config/cartConfig';
import { wishlistConfig } from './config/wishlistConfig';
import { useToasts } from '@/contexts/UIProvider';
import { useDealSync } from '@/hooks/useDealSync';

const { Provider: WishlistProvider, useHook: useWishlist } = createStorageContext(wishlistConfig);
const { Provider: CartProvider, useHook: useCart } = createStorageContext(cartConfig);

function DealSyncInitializer({ children }) {
    const { cart, addToCart, removeFromCart, hydrationVersion } = useCart();
    const { addToast } = useToasts();

    useDealSync({
        cart,
        addToCart,
        removeFromCart,
        addToast,
        hydrationVersion
    });

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