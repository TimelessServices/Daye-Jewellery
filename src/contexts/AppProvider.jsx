"use client";
import { MenuProvider } from './MenuContext';
import { FilterProvider } from './FilterContext';
import { createStorageContext } from './createStorageContext';

const cartConfig = {
    contextName: 'Cart',
    storageKey: 'jewelry_cart',
    storageType: 'sessionStorage',
    itemIdKey: 'entryType',
    operations: {
        count: (items) =>
            items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        total: (items) =>
            items.reduce((sum, item) =>
                item.entryType === 'item'
                    ? sum + item.price * (item.quantity || 1)
                    : sum + item.totalPrice * (item.quantity || 1)
            , 0),
        add: (prev, entry) => {
            if (entry.entryType === 'item') {
                // Match by itemId+size
                const idx = prev.findIndex(
                  x => x.entryType === 'item' &&
                       x.itemId === entry.itemId &&
                       x.size === entry.size
                );
                if (idx >= 0) {
                    return prev.map((item, i) =>
                        i === idx
                            ? { ...item, quantity: item.quantity + (entry.quantity || 1) }
                            : item
                    );
                }
                return [...prev, { ...entry, quantity: entry.quantity || 1, addedAt: Date.now() }];
            } else if (entry.entryType === 'set') {
                const idx = prev.findIndex(
                  x => x.entryType === 'set' && x.collectionID === entry.collectionID
                );
                if (idx >= 0) {
                    return prev.map((item, i) =>
                        i === idx
                            ? { ...item, quantity: item.quantity + (entry.quantity || 1) }
                            : item
                    );
                }
                return [...prev, { ...entry, quantity: entry.quantity || 1, addedAt: Date.now() }];
            } else if (entry.entryType === 'deal') {
                const idx = prev.findIndex(
                  x => x.entryType === 'deal' && x.collectionID === entry.collectionID
                );
                if (idx >= 0) {
                    return prev.map((item, i) =>
                        i === idx
                            ? { ...item, quantity: item.quantity + (entry.quantity || 1) }
                            : item
                    );
                }
                return [...prev, { ...entry, quantity: entry.quantity || 1, addedAt: Date.now() }];
            }
            return prev;
        },
        remove: (prev, identifier) => {
            return prev.filter(item => {
                if (identifier.entryType === 'item')
                    return !(item.entryType === 'item' && item.itemId === identifier.itemId && item.size === identifier.size);
                if (identifier.entryType === 'set')
                    return !(item.entryType === 'set' && item.collectionID === identifier.collectionID);
                if (identifier.entryType === 'deal')
                    return !(item.entryType === 'deal' && item.collectionID === identifier.collectionID);
                return true;
            });
        },
        custom: {
            addToCart: (items, { add }) => (entry) => add(entry),
            removeFromCart: (items, { remove }) => (identifier) => remove(identifier),
            updateQuantity: (items, { add, remove }) => (identifier, newQuantity) => {
                remove(identifier);
                if (newQuantity > 0) {
                    add({ ...identifier, quantity: newQuantity });
                }
            },
            clearCart: (items, { clear }) => () => clear()
        }
    }
};

// Wishlist Configuration
const wishlistConfig = {
    contextName: 'Wishlist',
    storageKey: 'jewelry_wishlist',
    storageType: 'localStorage',
    operations: {
        add: (prev, entry) => {
            if (entry.entryType === 'item')
                return prev.some(x => x.entryType === 'item' && x.itemId === entry.itemId)
                    ? prev
                    : [...prev, { ...entry, addedAt: Date.now() }];
            // Future: add set/deal here if needed
            return prev;
        },
        remove: (prev, identifier) => {
            if (identifier.entryType === 'item')
                return prev.filter(x => !(x.entryType === 'item' && x.itemId === identifier.itemId));
            // Future: add set/deal here if needed
            return prev;
        },
        custom: {
            addToWishlist: (items, { add }) => (entry) => add(entry),
            removeFromWishlist: (items, { remove }) => (identifier) => remove(identifier),
            isInWishlist: (items) => (entry) => items.some(
                x => x.entryType === entry.entryType && x.itemId === entry.itemId
            ),
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