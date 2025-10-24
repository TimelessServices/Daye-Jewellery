import { cachedFetch } from '@/utils/RequestCache';
import { createStorageManager } from '@/utils/Storage';
import { useCart } from '@/contexts/AppProvider';
import { useToasts } from '@/contexts/UIProvider';

const storage = createStorageManager("deal_data", "sessionStorage");

export async function loadDeals() {
    // Check sessionStorage first
    const storageResponse = storage.get();
    if (storageResponse) {
        console.log("Found deals in storage: ", storageResponse);
        return storageResponse;
    }

    // Fetch from API
    try {
        const response = await cachedFetch('/api/collections/deals');

        if (response.success) {
            console.log("Deals fetched successfully");
            storage.set(response.results);
            return response.results;
        }
        else { throw new Error("Failed to load deals"); }
    } catch (error) {
        console.error("Error loading deals:", error);
        return [];
    }
}

export function syncCartDeals(fetchedDeals) {
    const { addToast } = useToasts();
    const { addToCart, removeFromCart } = useCart();
    
    const currentDeals = cart.deal;
    const fetchedDealIds = new Set(fetchedDeals.map(d => d.CollectionID));
    const currentDealIds = new Set(Object.keys(currentDeals));
    
    // Remove expired deals (in cart but not in fetched)
    for (const dealId of currentDealIds) {
        if (!fetchedDealIds.has(dealId)) {
            const dealName = currentDeals[dealId].Name;
            removeFromCart('deal', dealId);
            addToast({ message: `${dealName} has expired`, type: 'warning' });
            console.log(`Removed expired deal: ${dealName}`);
        }
    }
    
    // Add new deals (in fetched but not in cart)
    for (const deal of fetchedDeals) {
        if (!currentDealIds.has(deal.CollectionID)) {
            const dealTemplate = {
                Name: deal.Name,
                BuyQty: deal.BuyQuantity,
                GetQty: deal.GetQuantity,
                Discount: deal.DealDiscount,
                BuyItems: {},
                GetItems: {}
            };
            addToCart('deal', deal.CollectionID, dealTemplate);
            console.log(`Added new deal: ${deal.Name}`);
        }
    }
    
    // Update storage to match cart's final state
    storage.set(fetchedDeals);
    console.log("Deal sync complete");
}