import { cachedFetch } from '@/utils/RequestCache';
import { createStorageManager } from '@/utils/Storage';

const storage = createStorageManager("deal_data", "sessionStorage");

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
    const totalPrice = typeof totalPriceRaw === 'number' ? totalPriceRaw : Number(totalPriceRaw) || 0;

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

export async function loadDeals() {
    // Check sessionStorage first
    const storageResponse = storage.get();
    if (storageResponse?.success) {
        console.log("Found deals in storage: ", storageResponse.data);
        return storageResponse.data;
    }

    try {
        const response = await cachedFetch('/api/collections/deals');

        if (response.success) {
            console.log("Deals fetched successfully");
            storage.set(response.results);
            return response.results;
        } else {
            throw new Error("Failed to load deals");
        }
    } catch (error) {
        console.error('Error loading deals:', error);
        const fallback = readFromStorage();
        if (fallback) { return fallback; }
        return { deals: [], updatedAt: null, source: 'error', error };
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

    // Update storage to match cart's final state
    storage.set(fetchedDeals);
    console.log("Deal sync complete");
}
