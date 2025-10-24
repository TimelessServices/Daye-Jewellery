"use client";
import { MenuProvider } from './MenuContext';
import { FilterProvider } from './FilterContext';
import { useDealConfigure } from '@/hooks/useDealConfig';
import { createStorageContext } from './createStorageContext';

const data = useDealConfigure();

function setDealInitial() {
    const deals = {};
    
    // Check if data and data.deals exist
    if (!data || !data.deals || !Array.isArray(data.deals)) {
        console.warn('No deal data available or data.deals is not an array');
        return deals;
    }
    
    data.deals.forEach(deal => {
        if (!deal.CollectionID) {
            console.warn('Deal missing CollectionID:', deal);
            return; 
        }
        
        deals[deal.CollectionID] = {
            Name: deal.Name, BuyQty: deal.BuyQuantity, GetQty: deal.GetQuantity,
            Discount: deal.DealDiscount, BuyItems: [], GetItems: [] 
        };
    });
    
    return deals;
}

function add(cart, type, key, value) {
    const prev = cart[type][key];
    return {
        ...cart,
        [type]: {
            ...cart[type],
            [key]: {
                ...value,
                quantity: (prev?.quantity || 0) + (value.quantity || 1),
                addedAt: Date.now()
            }
        }
    }
}

function remove(cart, type, key) {
    const next = { ...cart[type] };
    delete next[key];
    return { ...cart, [type]: next };
}

function update(cart, type, key, newQuantity) {
    if (!cart[type][key]) return cart;
    return {
        ...cart,
        [type]: {
            ...cart[type],
            [key]: {
                ...cart[type][key],
                quantity: newQuantity
            }
        }
    }
}


// Cart Configuration: object-based, split ops for single, set, deal
const cartConfig = {
    contextName: 'Cart',
    storageKey: 'jewelry_cart',
    storageType: 'sessionStorage',
    initialValue: { single: {}, set: {}, deal: setDealInitial() },
    operations: {
        count: (cart) =>
            Object.values(cart.single).reduce((sum, item) => sum + (item.quantity || 1), 0)
            + Object.values(cart.set).reduce((sum, item) => sum + (item.quantity || 1), 0)
            + Object.values(cart.deals).reduce((sum, item) => sum + (item.quantity || 1), 0),
        total: (cart) => {
            let sum = 0;
            for (const item of Object.values(cart.single)) {
                sum += item.price * (item.quantity || 1);
            }
            for (const set of Object.values(cart.set)) {
                sum += set.totalPrice * (set.quantity || 1);
            }
            for (const deal of Object.values(cart.deals)) {
                sum += deal.totalPrice * (deal.quantity || 1);
            }
            return sum;
        },
        add: (cart, type, key, value) => add(cart, type, key, value),
        remove: (cart, type, key) => remove(cart, type, key),
        update: (cart, type, key, newQuantity) => update(cart, type, key, newQuantity),
        clear: () => ({ single: {}, set: {}, deals: {} }),
        custom: {
            addToCart: (cart, ops) => (type, key, value) => ops.add(cart, type, key, value),
            removeFromCart: (cart, ops) => (type, key) => ops.remove(cart, type, key),
            updateCartQuantity: (cart, ops) => (type, key, qty) => ops.update(cart, type, key, qty),
            clearCart: (cart, ops) => () => ops.clear()
        }
    }
};

// Wishlist: object keyed by itemID, only single items
const wishlistConfig = {
    contextName: 'Wishlist',
    storageKey: 'jewelry_wishlist',
    storageType: 'localStorage',
    initialValue: {},
    operations: {
        addSingle: (wishlist, entry) => {
            if (wishlist[entry.itemID]) return wishlist;
            return {
                ...wishlist,
                [entry.itemID]: { ...entry, addedAt: Date.now() }
            }
        },
        removeSingle: (wishlist, { itemID }) => {
            const next = { ...wishlist };
            delete next[itemID];
            return next;
        },
        clear: () => ({}),
        custom: {
            addToWishlist: (wishlist, ops) => (entry) => ops.addSingle(entry),
            removeFromWishlist: (wishlist, ops) => (identifier) => ops.removeSingle(identifier),
            isInWishlist: (wishlist) => (entry) => !!wishlist[entry.itemID],
        }
    }
};

// Create contexts
const { Provider: CartProvider, useHook: useCart } = createStorageContext(cartConfig);
const { Provider: WishlistProvider, useHook: useWishlist } = createStorageContext(wishlistConfig);

// Unified App Provider (unchanged)
export function AppProvider({ children }) {
    return (
        <CartProvider>
            <WishlistProvider>
                <FilterProvider>
                    <MenuProvider collections={data.collections} >
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