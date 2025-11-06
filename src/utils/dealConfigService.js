import { cachedFetch } from '@/utils/RequestCache';
import { createStorageManager } from '@/utils/Storage';

const storage = createStorageManager("deal_data", "sessionStorage");

let inMemoryDeals = null;

function readFromStorage() {
    try {
        const stored = storage.get();
        if (!stored?.success || !stored.data) { return null; }
        if (Array.isArray(stored.data)) { return stored.data; }
        if (Array.isArray(stored.data.deals)) { return stored.data.deals; }
        return null;
    } catch (error) {
        console.warn('Unable to read deal data from storage:', error);
        return null;
    }
}

function buildDealDirectory(list = []) {
    const directory = new Map();
    (Array.isArray(list) ? list : []).forEach((deal) => {
        const id = String(
            deal?.CollectionID
            ?? deal?.collectionId
            ?? deal?.DealID
            ?? deal?.ID
            ?? ''
        );
        if (!id) { return; }
        directory.set(id, deal);
    });
    return directory;
}

function mapDealItems(source, fallbackPrefix) {
    const map = {};
    if (source && typeof source === 'object' && !Array.isArray(source)) {
        for (const [key, value] of Object.entries(source)) {
            const itemKey = value?.itemKey ?? key;
            map[itemKey] = { ...value, itemKey };
        }
        return map;
    }

    (Array.isArray(source) ? source : []).forEach((value, index) => {
        const itemKey = value?.itemKey
            ?? (value?.itemId ? `${value.itemId}_${value?.size ?? index}` : `${fallbackPrefix}-${index}`);
        map[itemKey] = { ...value, itemKey };
    });

    return map;
}

function normalizeDealEntries(bucket) {
    if (!bucket) { return []; }
    if (Array.isArray(bucket)) { return bucket; }
    if (typeof bucket === 'object') { return Object.values(bucket); }
    return [];
}

function sumDealBucket(bucket) {
    return normalizeDealEntries(bucket).reduce((total, entry) => {
        const price = Number(entry?.price ?? entry?.Price ?? entry?.discountPrice ?? 0);
        const quantity = Number(entry?.quantity ?? entry?.Quantity ?? 1);
        if (!Number.isFinite(price) || price < 0) { return total; }
        const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
        return total + price * normalizedQuantity;
    }, 0);
}

export function calculateDealTotal({ buyItems, getItems, discount } = {}) {
    const buySubtotal = sumDealBucket(buyItems);
    const getSubtotal = sumDealBucket(getItems);
    const parsedDiscount = Number(discount);
    const normalizedDiscount = Number.isFinite(parsedDiscount)
        ? Math.min(Math.max(parsedDiscount, 0), 100)
        : 0;
    const discountMultiplier = 1 - normalizedDiscount / 100;
    const discountedGetSubtotal = getSubtotal * discountMultiplier;
    const total = buySubtotal + discountedGetSubtotal;
    return Math.round(total * 100) / 100;
}

function normalizeDealShape(existingDeal = {}, fetchedDeal) {
    const collectionId = fetchedDeal?.CollectionID
        ?? existingDeal.collectionId
        ?? existingDeal.collectionID
        ?? existingDeal.CollectionID
        ?? null;

    const name = fetchedDeal?.Name
        ?? existingDeal.collectionName
        ?? existingDeal.Name
        ?? existingDeal.name
        ?? `Deal ${collectionId ?? ''}`.trim();

    const buyQtyRaw = fetchedDeal?.BuyQuantity
        ?? existingDeal.buyQty
        ?? existingDeal.BuyQty
        ?? existingDeal.buyQuantity
        ?? 0;
    const getQtyRaw = fetchedDeal?.GetQuantity
        ?? existingDeal.getQty
        ?? existingDeal.GetQty
        ?? existingDeal.getQuantity
        ?? 0;
    const discountRaw = fetchedDeal?.DealDiscount
        ?? existingDeal.discount
        ?? existingDeal.Discount
        ?? existingDeal.dealDiscount
        ?? 0;

    const buyQty = Number(buyQtyRaw) || 0;
    const getQty = Number(getQtyRaw) || 0;
    const discount = Number(discountRaw) || 0;

    const quantity = typeof existingDeal?.quantity === 'number' ? existingDeal.quantity : 1;
    const totalPriceRaw = existingDeal?.totalPrice ?? existingDeal?.TotalPrice ?? existingDeal?.price ?? 0;

    const buyItemsMap = mapDealItems(
        existingDeal?.buyItems
        ?? existingDeal?.BuyItems
        ?? fetchedDeal?.BuyItems,
        `${collectionId || 'deal'}-buy`
    );

    const getItemsMap = mapDealItems(
        existingDeal?.getItems
        ?? existingDeal?.GetItems
        ?? fetchedDeal?.GetItems,
        `${collectionId || 'deal'}-get`
    );

    const computedTotal = calculateDealTotal({
        buyItems: buyItemsMap,
        getItems: getItemsMap,
        discount
    });

    const totalPriceCandidate = Number(totalPriceRaw);
    const totalPrice = Number.isFinite(computedTotal)
        ? computedTotal
        : (Number.isFinite(totalPriceCandidate) ? totalPriceCandidate : 0);

    return {
        ...existingDeal,
        collectionId,
        collectionID: collectionId,
        CollectionID: collectionId,
        collectionName: name,
        name,
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
        buyItems: buyItemsMap,
        BuyItems: buyItemsMap,
        getItems: getItemsMap,
        GetItems: getItemsMap
    };
}

export async function loadDeals(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && Array.isArray(inMemoryDeals)) {
        return inMemoryDeals;
    }

    if (!forceRefresh) {
        const storedDeals = readFromStorage();
        if (storedDeals) {
            inMemoryDeals = storedDeals;
            return storedDeals;
        }
    }

    try {
        const response = await cachedFetch('/api/collections/deals');

        if (response.success) {
            const results = Array.isArray(response.results) ? response.results : [];
            inMemoryDeals = results;
            storage.set(results);
            return results;
        }

        throw new Error('Failed to load deals');
    } catch (error) {
        console.error('Error loading deals:', error);
        const fallback = readFromStorage();
        if (fallback) {
            inMemoryDeals = fallback;
            return fallback;
        }
        return { deals: [], updatedAt: null, source: 'error', error };
    }
}

export function getDealDirectory() {
    if (Array.isArray(inMemoryDeals)) {
        return buildDealDirectory(inMemoryDeals);
    }

    const storedDeals = readFromStorage();
    if (storedDeals) {
        return buildDealDirectory(storedDeals);
    }

    return new Map();
}

export function syncCartDeals(
    fetchedDeals,
    { cart, addToCart, removeFromCart, addToast } = {}
) {
    if (!Array.isArray(fetchedDeals)) {
        console.warn('syncCartDeals called without a valid deals array');
        return;
    }

    const currentDeals = cart?.deal ?? {};
    const fetchedDealMap = new Map(
        fetchedDeals.map((deal) => [String(deal.CollectionID), deal])
    );
    const fetchedDealIds = new Set(fetchedDealMap.keys());
    const currentDealIds = new Set(Object.keys(currentDeals));

    // Remove expired deals (in cart but not in fetched)
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

    // Normalize existing deals to the expected shape
    if (typeof addToCart === 'function' && typeof removeFromCart === 'function') {
        for (const [dealId, currentDeal] of Object.entries(currentDeals)) {
            if (!fetchedDealMap.has(dealId)) { continue; }

            const fetchedDeal = fetchedDealMap.get(dealId);
            const normalized = normalizeDealShape(currentDeal, fetchedDeal);
            const buyItemsValid = currentDeal?.buyItems
                && typeof currentDeal.buyItems === 'object'
                && !Array.isArray(currentDeal.buyItems);
            const needsNormalization =
                currentDeal?.collectionName !== normalized.collectionName
                || !buyItemsValid
                || typeof currentDeal?.totalPrice !== 'number';

            if (needsNormalization) {
                const quantity = normalized.quantity || 1;
                removeFromCart('deal', dealId);
                addToCart('deal', dealId, { ...normalized, quantity });
                console.log(`Normalized deal in cart: ${normalized.collectionName}`);
            }
        }
    }

    // Add new deals (in fetched but not in cart)
    for (const deal of fetchedDeals) {
        const dealId = String(deal.CollectionID);
        if (!currentDealIds.has(dealId)) {
            const dealTemplate = normalizeDealShape({ quantity: 1 }, deal);

            if (typeof addToCart === 'function') {
                addToCart('deal', dealId, dealTemplate);
            }
            console.log(`Added new deal: ${deal.Name}`);
        }
    }

    inMemoryDeals = Array.isArray(fetchedDeals) ? fetchedDeals : inMemoryDeals;
    // Update storage to match cart's final state
    storage.set(fetchedDeals);
    console.log("Deal sync complete");
}
