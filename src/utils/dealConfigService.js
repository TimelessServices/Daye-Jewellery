import { cachedFetch } from '@/utils/RequestCache';
import { createStorageManager } from '@/utils/Storage';

const storage = createStorageManager("deal_data", "sessionStorage");

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
    const fetchedDealIds = new Set(
        fetchedDeals.map((deal) => String(deal.CollectionID))
    );
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

    // Add new deals (in fetched but not in cart)
    for (const deal of fetchedDeals) {
        const dealId = String(deal.CollectionID);
        if (!currentDealIds.has(dealId)) {
            const dealTemplate = {
                Name: deal.Name,
                BuyQty: deal.BuyQuantity,
                GetQty: deal.GetQuantity,
                Discount: deal.DealDiscount,
                BuyItems: {},
                GetItems: {}
            };

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
