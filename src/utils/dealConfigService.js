import { cachedFetch } from '@/utils/RequestCache';
import { createStorageManager } from '@/utils/Storage';

const storage = createStorageManager('deal_data', 'sessionStorage');

function readFromStorage() {
    const stored = storage.get();
    if (stored?.success && Array.isArray(stored.data)) {
        return stored.data;
    }
    return null;
}

function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function readFromStorage() {
    const stored = storage.get();
    if (stored?.success && stored.data) {
        return stored.data;
    }
    return null;
}

function mapDealItems(source, fallbackPrefix) {
    if (!source) {
        return {};
    }

    if (typeof source === 'object' && !Array.isArray(source)) {
        return Object.fromEntries(
            Object.entries(source).map(([key, value]) => {
                const itemKey = value?.itemKey ?? key;
                return [itemKey, { ...value, itemKey }];
            })
        );
    }

    const list = Array.isArray(source) ? source : [];
    const result = {};
    list.forEach((value, index) => {
        const itemKey = value?.itemKey
            ?? (value?.itemId ? `${value.itemId}_${value?.size ?? index}` : `${fallbackPrefix}-${index}`);
        result[itemKey] = { ...value, itemKey };
    });
    return result;
}

function normalizeDealShape(existingDeal = {}, fetchedDeal = {}) {
    const collectionIdRaw = fetchedDeal?.CollectionID
        ?? fetchedDeal?.collectionId
        ?? existingDeal.collectionId
        ?? existingDeal.collectionID
        ?? existingDeal.CollectionID;

    if (!collectionIdRaw) {
        return { ...existingDeal };
    }

    const collectionId = String(collectionIdRaw);
    const name = fetchedDeal?.Name
        ?? fetchedDeal?.collectionName
        ?? existingDeal.collectionName
        ?? existingDeal.Name
        ?? `Deal ${collectionId}`;

    const buyQty = toNumber(
        fetchedDeal?.BuyQuantity
        ?? fetchedDeal?.BuyQty
        ?? fetchedDeal?.buyQty
        ?? existingDeal.buyQty
        ?? existingDeal.BuyQty
        ?? existingDeal.buyQuantity
    );

    const getQty = toNumber(
        fetchedDeal?.GetQuantity
        ?? fetchedDeal?.GetQty
        ?? fetchedDeal?.getQty
        ?? existingDeal.getQty
        ?? existingDeal.GetQty
        ?? existingDeal.getQuantity
    );

    const discount = toNumber(
        fetchedDeal?.DealDiscount
        ?? fetchedDeal?.Discount
        ?? fetchedDeal?.dealDiscount
        ?? existingDeal.discount
        ?? existingDeal.Discount
        ?? existingDeal.dealDiscount
    );

    const totalPrice = toNumber(
        fetchedDeal?.TotalPrice
        ?? fetchedDeal?.DealPrice
        ?? fetchedDeal?.price
        ?? existingDeal.totalPrice
        ?? existingDeal.TotalPrice
        ?? existingDeal.price
    );

    const originalPrice = toNumber(
        fetchedDeal?.OriginalPrice
        ?? fetchedDeal?.originalPrice
        ?? existingDeal.originalPrice,
        0
    );

    const quantity = typeof existingDeal.quantity === 'number' ? existingDeal.quantity : 1;

    const buyItems = mapDealItems(existingDeal.buyItems ?? existingDeal.BuyItems, `${collectionId}-buy`);
    const getItems = mapDealItems(existingDeal.getItems ?? existingDeal.GetItems, `${collectionId}-get`);

    const itemCount = fetchedDeal?.ItemCount
        ?? fetchedDeal?.itemCount
        ?? existingDeal.itemCount
        ?? Object.keys(buyItems).length;

    return {
        ...existingDeal,
        collectionId,
        collectionID: collectionId,
        CollectionID: collectionId,
        collectionName: name,
        Name: name,
        buyQty,
        BuyQty: buyQty,
        buyQuantity: buyQty,
        getQty,
        GetQty: getQty,
        getQuantity: getQty,
        discount,
        Discount: discount,
        dealDiscount: discount,
        quantity,
        totalPrice,
        TotalPrice: totalPrice,
        price: totalPrice,
        originalPrice,
        itemCount,
        ItemCount: itemCount,
        buyItems,
        BuyItems: buyItems,
        getItems,
        GetItems: getItems
    };
}

export async function loadDeals({ forceRefresh = false } = {}) {
    if (!forceRefresh) {
        const cached = readFromStorage();
        if (cached) {
            return cached;
        }
    }

    try {
        const params = new URLSearchParams({ limit: '15' });
        const response = await cachedFetch(`/api/collections/deals?${params.toString()}`);

        if (response.success && Array.isArray(response.results)) {
            const normalized = response.results.map((deal) => normalizeDealShape({}, deal));
            storage.set(normalized);
            return normalized;
        }

        throw new Error('Failed to load deals');
    } catch (error) {
        console.error('Error loading deals:', error);
        const fallback = readFromStorage();
        if (fallback) {
            return fallback;
        }
        return [];
    }
}

export function syncCartDeals(
    fetchedDeals,
    { cart, addToCart, removeFromCart, addToast } = {}
) {
    if (!Array.isArray(fetchedDeals)) {
        console.warn('syncCartDeals called without a valid deals array');
        return;
    }

    const normalizedDeals = fetchedDeals.map((deal) => normalizeDealShape({}, deal));
    const currentDeals = cart?.deal ?? {};
    const fetchedDealMap = new Map(
        normalizedDeals.map((deal) => [String(deal.CollectionID), deal])
    );

    const fetchedDealIds = new Set(fetchedDealMap.keys());
    const currentDealIds = new Set(Object.keys(currentDeals));

    for (const dealId of currentDealIds) {
        if (!fetchedDealIds.has(dealId)) {
            const dealName = currentDeals[dealId]?.Name ?? 'Deal';
            if (typeof removeFromCart === 'function') {
                removeFromCart('deal', dealId);
            }
            if (typeof addToast === 'function') {
                addToast({ message: `${dealName} has expired`, type: 'warning' });
            }
            console.log(`Removed expired deal: ${dealName}`);
        }
    }

    if (typeof addToCart === 'function' && typeof removeFromCart === 'function') {
        for (const [dealId, currentDeal] of Object.entries(currentDeals)) {
            if (!fetchedDealMap.has(dealId)) {
                continue;
            }

            const fetchedDeal = fetchedDealMap.get(dealId);
            const normalized = normalizeDealShape(currentDeal, fetchedDeal);

            const hasValidBuyItems = currentDeal?.buyItems
                && typeof currentDeal.buyItems === 'object'
                && !Array.isArray(currentDeal.buyItems);

            const needsUpdate =
                currentDeal?.collectionName !== normalized.collectionName
                || !hasValidBuyItems
                || typeof currentDeal?.totalPrice !== 'number'
                || currentDeal.totalPrice !== normalized.totalPrice;

            if (needsUpdate) {
                const quantity = normalized.quantity || 1;
                removeFromCart('deal', dealId);
                addToCart('deal', dealId, { ...normalized, quantity });
                console.log(`Normalized deal in cart: ${normalized.collectionName}`);
            }
        }
    }

    for (const deal of normalizedDeals) {
        const dealId = String(deal.CollectionID);
        if (!currentDealIds.has(dealId) && typeof addToCart === 'function') {
            addToCart('deal', dealId, { ...deal, quantity: deal.quantity ?? 1 });
            console.log(`Added new deal: ${deal.Name}`);
        }
    }

    storage.set(normalizedDeals);
    console.log('Deal sync complete');
}
