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
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function coerceItemArray(source) {
    if (!source) {
        return [];
    }

    if (Array.isArray(source)) {
        return source;
    }

    if (typeof source === 'object') {
        return Object.values(source);
    }

    return [];
}

function mapDealItems(sources, fallbackPrefix) {
    const result = new Map();
    let offset = 0;

    const sourceList = Array.isArray(sources) ? sources : [sources];

    sourceList.forEach((source) => {
        const items = coerceItemArray(source);
        items.forEach((value) => {
            if (!value) {
                return;
            }

            const itemKey = value?.itemKey
                ?? value?.itemId
                ?? value?.jewelleryID
                ?? value?.jewelleryId
                ?? value?.JewelleryID
                ?? `${fallbackPrefix}-${offset}`;

            offset += 1;

            if (!result.has(itemKey)) {
                result.set(itemKey, { ...value, itemKey });
            }
        });
    });

    return Array.from(result.values());
}

export function normalizeDealShape(existingDeal = {}, fetchedDeal = {}) {
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
        ?? fetchedDeal?.name
        ?? existingDeal.Name
        ?? existingDeal.collectionName
        ?? existingDeal.name
        ?? `Deal ${collectionId}`;

    const buyQty = toNumber(
        fetchedDeal?.BuyQuantity
        ?? fetchedDeal?.BuyQty
        ?? fetchedDeal?.buyQty
        ?? existingDeal.BuyQuantity
        ?? existingDeal.BuyQty
        ?? existingDeal.buyQty
        ?? existingDeal.buyQuantity
    );

    const getQty = toNumber(
        fetchedDeal?.GetQuantity
        ?? fetchedDeal?.GetQty
        ?? fetchedDeal?.getQty
        ?? existingDeal.GetQuantity
        ?? existingDeal.GetQty
        ?? existingDeal.getQty
        ?? existingDeal.getQuantity
    );

    const discount = toNumber(
        fetchedDeal?.DealDiscount
        ?? fetchedDeal?.Discount
        ?? fetchedDeal?.dealDiscount
        ?? existingDeal.DealDiscount
        ?? existingDeal.Discount
        ?? existingDeal.dealDiscount
        ?? existingDeal.discount
    );

    const totalPrice = toNumber(
        fetchedDeal?.TotalPrice
        ?? fetchedDeal?.DealPrice
        ?? fetchedDeal?.price
        ?? fetchedDeal?.Price
        ?? existingDeal.TotalPrice
        ?? existingDeal.totalPrice
        ?? existingDeal.price
        ?? existingDeal.Price
    );

    const originalPrice = toNumber(
        fetchedDeal?.OriginalPrice
        ?? fetchedDeal?.originalPrice
        ?? existingDeal.OriginalPrice
        ?? existingDeal.originalPrice,
        totalPrice
    );

    const quantity = Number.isFinite(existingDeal.quantity) && existingDeal.quantity > 0
        ? existingDeal.quantity
        : 1;

    const buyItems = mapDealItems([
        fetchedDeal?.BuyItems,
        fetchedDeal?.buyItems,
        existingDeal.buyItems,
        existingDeal.BuyItems,
    ], `${collectionId}-buy`);
    const getItems = mapDealItems([
        fetchedDeal?.GetItems,
        fetchedDeal?.getItems,
        existingDeal.getItems,
        existingDeal.GetItems,
    ], `${collectionId}-get`);

    const itemCount = toNumber(
        fetchedDeal?.ItemCount
        ?? fetchedDeal?.itemCount
        ?? existingDeal.ItemCount
        ?? existingDeal.itemCount,
        buyItems.length + getItems.length,
    );

    const normalized = {
        ...existingDeal,
        CollectionID: collectionId,
        collectionId,
        collectionID: collectionId,
        Name: name,
        collectionName: name,
        name,
        BuyQuantity: buyQty,
        BuyQty: buyQty,
        buyQty,
        buyQuantity: buyQty,
        GetQuantity: getQty,
        GetQty: getQty,
        getQty,
        getQuantity: getQty,
        DealDiscount: discount,
        Discount: discount,
        dealDiscount: discount,
        TotalPrice: totalPrice,
        totalPrice,
        price: totalPrice,
        Price: totalPrice,
        OriginalPrice: originalPrice,
        originalPrice,
        ItemCount: itemCount,
        itemCount,
        BuyItems: buyItems,
        buyItems,
        GetItems: getItems,
        getItems,
        quantity,
    };

    return normalized;
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

            const existingBuyBucket = currentDeal?.BuyItems ?? currentDeal?.buyItems;
            const hasValidBuyItems = Array.isArray(existingBuyBucket)
                || (existingBuyBucket && typeof existingBuyBucket === 'object');

            const needsUpdate =
                currentDeal?.Name !== normalized.Name
                || !Array.isArray(normalized.BuyItems)
                || !hasValidBuyItems
                || !Number.isFinite(currentDeal?.TotalPrice ?? currentDeal?.totalPrice)
                || toNumber(currentDeal?.TotalPrice ?? currentDeal?.totalPrice) !== normalized.TotalPrice;

            if (needsUpdate) {
                const quantity = normalized.quantity || 1;
                removeFromCart('deal', dealId);
                addToCart('deal', dealId, { ...normalized, quantity });
                console.log(`Normalized deal in cart: ${normalized.Name}`);
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
