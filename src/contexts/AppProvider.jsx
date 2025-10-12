"use client";
import { FilterProvider } from './FilterContext';
import { createStorageContext } from './createStorageContext';

// Cart Configuration
const cartConfig = {
    contextName: 'Cart',
    storageKey: 'jewelry_cart',
    storageType: 'sessionStorage',
    itemIdKey: 'itemId',
    operations: {
        count: (items) => items.reduce((total, item) => total + item.quantity, 0),
        total: (items) => items.reduce((total, item) => total + (item.price * item.quantity), 0),
        add: (prev, { itemId, desc, type, price, size, quantity = 1 }) => {
            const existingIndex = prev.findIndex(item => item.itemId === itemId && item.size === size);
            if (existingIndex >= 0) {
                return prev.map((item, index) => 
                    index === existingIndex 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { itemId, desc, type, price, size, quantity, addedAt: Date.now() }];
        },
        remove: (prev, { itemId, size }) => prev.filter(item => !(item.itemId === itemId && item.size === size)),
        custom: {
            addToCart: (items, { add }) => (itemId, desc, type, price, size, quantity = 1) => {
                add({ itemId, desc, type, price, size, quantity });
            },
            removeFromCart: (items, { remove }) => (itemId, size) => {
                remove({ itemId, size });
            },
            updateQuantity: (items, { add, remove }) => (itemId, size, newQuantity) => {
                const quantity = Math.max(0, Math.floor(Number(newQuantity) || 0));
                const existingItem = items.find(item => item.itemId === itemId && item.size === size);
                
                if (!existingItem) return; 
                remove({ itemId, size });
                if (quantity > 0) { add({ ...existingItem, quantity }); }
            },
            clearCart: (items, { clear }) => () => {
                clear();
            }
        }
    }
};

// Wishlist Configuration  
const wishlistConfig = {
    contextName: 'Wishlist',
    storageKey: 'jewelry_wishlist', 
    storageType: 'localStorage',
    operations: {
        add: (prev, { itemId, desc, price, salePrice, type, sizes }) => {
            const exists = prev.some(item => item.itemId === itemId);
            if (exists) return prev;
            return [...prev, { itemId, desc, price, salePrice, type, sizes, addedAt: Date.now() }];
        },
        custom: {
            addToWishlist: (items, { add }) => (itemId, desc, price, salePrice, type, sizes) => {
                add({ itemId, desc, price, salePrice, type, sizes });
            },
            removeFromWishlist: (items, { remove }) => (itemId) => {
                remove(itemId);
            },
            isInWishlist: (items) => (itemId) => {
                return items.some(item => item.itemId === itemId);
            }
        }
    }
};

// Create contexts
const { Provider: CartProvider, useHook: useCart } = createStorageContext(cartConfig);
const { Provider: WishlistProvider, useHook: useWishlist } = createStorageContext(wishlistConfig);

// Unified App Provider
export function AppProvider({ children }) {
    return (
        <CartProvider>
            <WishlistProvider>
                <FilterProvider>
                    {children}
                </FilterProvider>
            </WishlistProvider>
        </CartProvider>
    );
}

export { useCart, useWishlist };
export { useFilters } from './FilterContext';