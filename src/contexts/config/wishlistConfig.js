export const wishlistConfig = {
    contextName: 'Wishlist',
    storageKey: 'jewelry_wishlist',
    storageType: 'localStorage',
    initialValue: {},
    operations: {
        count: (wishlist) => Object.keys(wishlist).length,
        add: (wishlist, id, item) => {
            if (wishlist[id]) return wishlist;
            return { ...wishlist, [id]: JSON.stringify(item) };
        },
        remove: (wishlist, id) => {
            const next = { ...wishlist };
            delete next[id];
            return next;
        },
        clear: () => ({}),
        custom: {
            addToWishlist: (wishlist, ops) => (id, item) => ops.add(wishlist, id, item),
            removeFromWishlist: (wishlist, ops) => (id) => ops.remove(wishlist, id),
            isInWishlist: (wishlist) => (id) => !!wishlist[id],
            wishlistCount: (wishlist) => Object.keys(wishlist).length,
            getWishlistItems: (wishlist) => () => {
                return Object.entries(wishlist).map(([id, stringifiedData]) => ({
                    id, data: JSON.parse(stringifiedData)
                }));
            }
        }
    }
};