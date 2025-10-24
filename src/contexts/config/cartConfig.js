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

export const cartConfig = {
    contextName: 'Cart',
    storageKey: 'jewelry_cart',
    storageType: 'sessionStorage',
    initialValue: { single: {}, set: {}, deal: {} },
    operations: {
        count: (cart) =>
            Object.values(cart.single).reduce((sum, item) => sum + (item.quantity || 1), 0)
            + Object.values(cart.set).reduce((sum, item) => sum + (item.quantity || 1), 0)
            + Object.values(cart.deal).reduce((sum, item) => sum + (item.quantity || 1), 0),
        total: (cart) => {
            let sum = 0;
            for (const item of Object.values(cart.single)) {
                sum += item.price * (item.quantity || 1);
            }
            for (const set of Object.values(cart.set)) {
                sum += set.totalPrice * (set.quantity || 1);
            }
            for (const deal of Object.values(cart.deal)) {
                sum += deal.totalPrice * (deal.quantity || 1);
            }
            return sum;
        },
        add: (cart, type, key, value) => add(cart, type, key, value),
        remove: (cart, type, key) => remove(cart, type, key),
        update: (cart, type, key, newQuantity) => update(cart, type, key, newQuantity),
        clear: () => ({ single: {}, set: {}, deal: {} }),
        custom: {
            addToCart: (cart, ops) => (type, key, value) => ops.add(cart, type, key, value),
            removeFromCart: (cart, ops) => (type, key) => ops.remove(cart, type, key),
            updateCartQuantity: (cart, ops) => (type, key, qty) => ops.update(cart, type, key, qty),
            clearCart: (cart, ops) => () => ops.clear()
        }
    }
}