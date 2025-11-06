const resolveNumber = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined) continue;
        const parsed = typeof value === 'number' ? value : Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return 0;
};

export function flattenCartEntries(cart) {
    if (!cart || typeof cart !== "object") {
        return [];
    }

    const entries = [];

    const singles = Object.entries(cart.single || {});
    for (const [key, item] of singles) {
        const quantity = typeof item?.quantity === "number" ? item.quantity : 1;
        const unitPrice = typeof item?.price === "number" ? item.price : Number(item?.price) || 0;
        const desc = item?.desc || item?.name || `Item ${key}`;
        const size = item?.size || item?.selectedSize || "—";
        entries.push({
            bucket: "single",
            key: `single-${key}`,
            id: key,
            label: desc,
            size,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
            data: item
        });
    }

    const sets = Object.entries(cart.set || {});
    for (const [key, set] of sets) {
        const quantity = typeof set?.quantity === "number" ? set.quantity : 1;
        const unitPrice = resolveNumber(
            set?.totalPrice,
            set?.TotalPrice,
            set?.CollectionPrice,
            set?.Price,
            set?.SetPrice
        );
        const itemCount = Array.isArray(set?.itemsList) ? set.itemsList.length : (set?.itemTotal || 0);
        const desc = set?.collectionName || set?.CollectionName || set?.Name || set?.name || `Set ${key}`;
        const size = itemCount > 0 ? `${itemCount} pcs` : (set?.size || "Set");
        const subtitle = itemCount > 0 ? `Set of ${itemCount} pieces` : undefined;
        entries.push({
            bucket: "set",
            key: `set-${key}`,
            id: key,
            label: desc,
            subtitle,
            size,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
            type: set?.typeLabel || set?.Type || "SET",
            data: set
        });
    }

    const deals = Object.entries(cart.deal || {});
    for (const [key, deal] of deals) {
        const quantity = typeof deal?.quantity === "number" ? deal.quantity : 1;
        const unitPrice = resolveNumber(
            deal?.totalPrice,
            deal?.TotalPrice,
            deal?.Price,
            deal?.price,
            deal?.DealPrice,
            deal?.dealPrice
        );
        const desc = deal?.collectionName
            || deal?.CollectionName
            || deal?.Name
            || deal?.name
            || `Deal ${key}`;
        const buyQty = deal?.buyQty ?? deal?.BuyQty ?? deal?.buyQuantity;
        const getQty = deal?.getQty ?? deal?.GetQty ?? deal?.getQuantity;
        const discount = deal?.dealDiscount ?? deal?.DealDiscount ?? deal?.Discount;
        let subtitle;
        if (typeof buyQty === "number" || typeof getQty === "number") {
            const buyText = typeof buyQty === "number" ? buyQty : "?";
            const getText = typeof getQty === "number" ? getQty : "?";
            subtitle = `Deal: Buy ${buyText}, Get ${getText}`;
            if (typeof discount === "number" && discount > 0) {
                subtitle += ` @ ${discount}% off`;
            }
        }
        entries.push({
            bucket: "deal",
            key: `deal-${key}`,
            id: key,
            label: desc,
            subtitle,
            size: "Deal",
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
            type: deal?.typeLabel || deal?.Type || "DEAL",
            data: deal
        });
    }

    return entries;
}

export function deriveOrderItemsFromEntries(entries) {
    if (!Array.isArray(entries)) {
        return [];
    }

    const orderItems = [];

    for (const entry of entries) {
        const { bucket, id, data, quantity, unitPrice } = entry;
        if (!data) { continue; }

        if (bucket === "single") {
            orderItems.push({
                jewelleryId: data?.itemId || data?.jewelleryID || data?.jewelleryId || id,
                size: data?.size || data?.selectedSize || "N/A",
                quantity,
                effectivePrice: typeof data?.price === "number" ? data.price : unitPrice
            });
            continue;
        }

        if (bucket === "set") {
            const itemsList = Array.isArray(data?.itemsList) ? data.itemsList : [];
            if (itemsList.length > 0) {
                const divisor = itemsList.length || 1;
                for (let idx = 0; idx < itemsList.length; idx += 1) {
                    const item = itemsList[idx];
                    const itemQuantity = typeof item?.quantity === "number" ? item.quantity : 1;
                    orderItems.push({
                        jewelleryId: item?.jewelleryID || item?.jewelleryId || item?.itemId || `${id}-${idx}`,
                        size: item?.size || "SET",
                        quantity: quantity * itemQuantity,
                        effectivePrice: typeof item?.price === "number"
                            ? item.price
                            : (typeof item?.effectivePrice === "number" ? item.effectivePrice : unitPrice / divisor)
                    });
                }
            } else {
                orderItems.push({
                    jewelleryId: data?.collectionId || data?.collectionID || data?.CollectionID || id,
                    size: data?.size || "SET",
                    quantity,
                    effectivePrice: unitPrice
                });
            }
            continue;
        }

        if (bucket === "deal") {
            const buyItems = (() => {
                if (Array.isArray(data?.buyItems)) { return data.buyItems; }
                if (Array.isArray(data?.BuyItems)) { return data.BuyItems; }
                if (data?.buyItems && typeof data.buyItems === 'object') { return Object.values(data.buyItems); }
                if (data?.BuyItems && typeof data.BuyItems === 'object') { return Object.values(data.BuyItems); }
                return [];
            })();
            const getItems = (() => {
                if (Array.isArray(data?.getItems)) { return data.getItems; }
                if (Array.isArray(data?.GetItems)) { return data.GetItems; }
                if (data?.getItems && typeof data.getItems === 'object') { return Object.values(data.getItems); }
                if (data?.GetItems && typeof data.GetItems === 'object') { return Object.values(data.GetItems); }
                return [];
            })();
            const dealItems = [...buyItems, ...getItems];
            if (dealItems.length > 0) {
                for (let idx = 0; idx < dealItems.length; idx += 1) {
                    const item = dealItems[idx];
                    const itemQuantity = typeof item?.quantity === "number" ? item.quantity : 1;
                    orderItems.push({
                        jewelleryId: item?.jewelleryID || item?.jewelleryId || item?.itemId || `${id}-${idx}`,
                        size: item?.size || "DEAL",
                        quantity: quantity * itemQuantity,
                        effectivePrice: typeof item?.price === "number"
                            ? item.price
                            : (typeof item?.discountPrice === "number" ? item.discountPrice : unitPrice)
                    });
                }
            } else {
                orderItems.push({
                    jewelleryId: data?.collectionId || data?.collectionID || data?.CollectionID || id,
                    size: "DEAL",
                    quantity,
                    effectivePrice: unitPrice
                });
            }
        }
    }

    return orderItems;
}
