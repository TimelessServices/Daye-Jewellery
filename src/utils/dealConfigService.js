import { cachedFetch } from '@/utils/RequestCache';
import { createStorageManager } from '@/utils/Storage';

const storage = createStorageManager("deal_data", "sessionStorage");

const FIELDS_TO_COMPARE = ['Name', 'BuyQty', 'GetQty', 'Discount'];

function normalizeStoredDeals(payload) {
    if (Array.isArray(payload)) {
        const normalized = { deals: payload, updatedAt: null };
        storage.set(normalized);
        return normalized;
    }

    if (payload && Array.isArray(payload.deals)) {
        return {
            deals: payload.deals,
            updatedAt: typeof payload.updatedAt === 'number' ? payload.updatedAt : null
        };
    }

    return { deals: [], updatedAt: null };
}

function buildDealTemplate(deal, previous = {}) {
    return {
        ...previous,
        Name: deal.Name,
        BuyQty: deal.BuyQuantity,
        GetQty: deal.GetQuantity,
        Discount: deal.DealDiscount,
        BuyItems: previous.BuyItems ?? {},
        GetItems: previous.GetItems ?? {}
    };
}

export async function loadDeals({ forceRefresh = false } = {}) {
    const readFromStorage = () => {
        const storageResponse = storage.get();
        if (storageResponse?.success) {
            const normalized = normalizeStoredDeals(storageResponse.data);
            return { ...normalized, source: 'cache' };
        }
        return null;
    };

    if (!forceRefresh) {
        const cached = readFromStorage();
        if (cached) {
            return cached;
        }
    }

    try {
        const response = await cachedFetch('/api/collections/deals');

        if (response.success) {
            const deals = Array.isArray(response.results) ? response.results : [];
            const payload = { deals, updatedAt: Date.now(), source: 'network' };
            storage.set({ deals, updatedAt: payload.updatedAt });
            return payload;
        }

        throw new Error('Failed to load deals');
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
        return { added: [], removed: [], updated: [] };
    }

    const currentDeals = cart?.deal ?? {};
    const fetchedById = new Map(
        fetchedDeals.map((deal) => [String(deal.CollectionID), deal])
    );

    const removed = [];
    const added = [];
    const updated = [];

    for (const dealId of Object.keys(currentDeals)) {
        if (!fetchedById.has(dealId)) {
            const wasRemoved = typeof removeFromCart === 'function';
            if (wasRemoved) {
                removeFromCart('deal', dealId);
            }
            if (wasRemoved && typeof addToast === 'function') {
                const dealName = currentDeals[dealId]?.Name ?? 'Deal';
                addToast({ message: `${dealName} has expired`, type: 'warning' });
            }
            if (wasRemoved) {
                removed.push(dealId);
            }
        }
    }

    for (const [dealId, deal] of fetchedById.entries()) {
        const previous = currentDeals[dealId];
        const template = buildDealTemplate(deal, previous);

        if (!previous) {
            if (typeof addToCart === 'function') {
                addToCart('deal', dealId, template);
                added.push(dealId);
            }
            continue;
        }

        const hasChanged = FIELDS_TO_COMPARE.some((field) => previous[field] !== template[field]);

        if (hasChanged) {
            const canRemove = typeof removeFromCart === 'function';
            const canAdd = typeof addToCart === 'function';

            if (canRemove) {
                removeFromCart('deal', dealId);
            }

            if (canRemove && canAdd) {
                const preserved = {
                    ...template,
                    quantity: previous.quantity ?? 1,
                    totalPrice: previous.totalPrice
                };
                addToCart('deal', dealId, preserved);
                updated.push(dealId);
            }
        }
    }

    if (removed.length || added.length || updated.length) {
        storage.set({ deals: fetchedDeals, updatedAt: Date.now() });
    }

    return { added, removed, updated };
}
