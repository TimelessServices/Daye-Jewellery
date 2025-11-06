const pickFirst = (source, keys, fallback) => {
    for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return fallback;
};

const toNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toQuantity = (value, fallback = 1) => {
    const parsed = toNumber(value, NaN);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    return fallback;
};

const bucketToArray = (bucket) => {
    if (Array.isArray(bucket)) {
        return bucket;
    }
    if (bucket && typeof bucket === "object") {
        return Object.values(bucket);
    }
    return [];
};

export function flattenCartEntries(cart) {
    if (!cart || typeof cart !== "object") {
        return [];
    }

    const entries = [];

    const singles = Object.entries(cart.single || {});
    for (const [key, item] of singles) {
        const quantity = toQuantity(item?.quantity, 1);
        const unitPrice = toNumber(
            pickFirst(item, ["Price", "price", "EffectivePrice", "effectivePrice"], item?.price),
            0,
        );
        const desc = pickFirst(item, ["Desc", "desc", "Name", "name"], `Item ${key}`);
        const size = pickFirst(item, ["Size", "size", "selectedSize"], "—");
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
        const quantity = toQuantity(set?.quantity, 1);
        const unitPrice = toNumber(
            pickFirst(set, ["SetPrice", "TotalPrice", "totalPrice", "Price", "price"], 0),
            0,
        );
        const itemsList = bucketToArray(pickFirst(set, ["itemsList", "ItemsList", "items"], []));
        const itemCount = toNumber(
            pickFirst(set, ["ItemCount", "itemCount", "ItemTotal", "itemTotal"], itemsList.length),
            itemsList.length,
        );
        const desc = pickFirst(
            set,
            ["Name", "collectionName", "CollectionName", "name"],
            `Set ${key}`,
        );
        const size = itemCount > 0 ? `${itemCount} pcs` : pickFirst(set, ["size"], "Set");
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
            data: { ...set, ItemsList: itemsList, itemsList }
        });
    }

    const deals = Object.entries(cart.deal || {});
    for (const [key, deal] of deals) {
        const quantity = toQuantity(deal?.quantity, 1);
        const unitPrice = toNumber(
            pickFirst(deal, ["TotalPrice", "totalPrice", "DealPrice", "Price", "price"], 0),
            0,
        );
        const desc = pickFirst(
            deal,
            ["Name", "collectionName", "CollectionName", "name"],
            `Deal ${key}`,
        );
        const buyQty = toNumber(
            pickFirst(deal, ["BuyQuantity", "BuyQty", "buyQty", "buyQuantity"], null),
            null,
        );
        const getQty = toNumber(
            pickFirst(deal, ["GetQuantity", "GetQty", "getQty", "getQuantity"], null),
            null,
        );
        const discount = toNumber(
            pickFirst(deal, ["DealDiscount", "Discount", "dealDiscount"], null),
            null,
        );
        let subtitle;
        if (buyQty !== null || getQty !== null) {
            const buyText = buyQty !== null ? buyQty : "?";
            const getText = getQty !== null ? getQty : "?";
            subtitle = `Deal: Buy ${buyText}, Get ${getText}`;
            if (discount !== null && discount > 0) {
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
            const itemsList = bucketToArray(pickFirst(data, ["ItemsList", "itemsList", "items"], []));
            if (itemsList.length > 0) {
                const divisor = itemsList.length || 1;
                for (let idx = 0; idx < itemsList.length; idx += 1) {
                    const item = itemsList[idx];
                    const itemQuantity = toQuantity(item?.quantity, 1);
                    orderItems.push({
                        jewelleryId: pickFirst(item, ["JewelleryID", "jewelleryID", "jewelleryId", "itemId"], `${id}-${idx}`),
                        size: pickFirst(item, ["Size", "size"], "SET"),
                        quantity: quantity * itemQuantity,
                        effectivePrice: (() => {
                            const explicit = pickFirst(item, ["price", "Price"], null);
                            const effective = pickFirst(item, ["EffectivePrice", "effectivePrice"], null);
                            if (typeof explicit === "number") {
                                return explicit;
                            }
                            if (typeof effective === "number") {
                                return effective;
                            }
                            const numericExplicit = toNumber(explicit, NaN);
                            if (Number.isFinite(numericExplicit)) {
                                return numericExplicit;
                            }
                            const numericEffective = toNumber(effective, NaN);
                            if (Number.isFinite(numericEffective)) {
                                return numericEffective;
                            }
                            return unitPrice / divisor;
                        })()
                    });
                }
            } else {
                orderItems.push({
                    jewelleryId: pickFirst(data, ["CollectionID", "collectionID", "collectionId"], id),
                    size: pickFirst(data, ["size"], "SET"),
                    quantity,
                    effectivePrice: unitPrice
                });
            }
            continue;
        }

        if (bucket === "deal") {
            const buyItems = bucketToArray(pickFirst(data, ["BuyItems", "buyItems"], []));
            const getItems = bucketToArray(pickFirst(data, ["GetItems", "getItems"], []));
            const dealItems = [...buyItems, ...getItems];
            if (dealItems.length > 0) {
                for (let idx = 0; idx < dealItems.length; idx += 1) {
                    const item = dealItems[idx];
                    const itemQuantity = toQuantity(item?.quantity, 1);
                    orderItems.push({
                        jewelleryId: pickFirst(item, ["JewelleryID", "jewelleryID", "jewelleryId", "itemId"], `${id}-${idx}`),
                        size: pickFirst(item, ["Size", "size"], "DEAL"),
                        quantity: quantity * itemQuantity,
                        effectivePrice: (() => {
                            const explicit = pickFirst(item, ["price", "Price"], null);
                            const discountPrice = pickFirst(item, ["DiscountPrice", "discountPrice"], null);
                            const effective = pickFirst(item, ["EffectivePrice", "effectivePrice"], null);
                            if (typeof explicit === "number") { return explicit; }
                            if (typeof discountPrice === "number") { return discountPrice; }
                            if (typeof effective === "number") { return effective; }
                            const numericExplicit = toNumber(explicit, NaN);
                            if (Number.isFinite(numericExplicit)) { return numericExplicit; }
                            const numericDiscount = toNumber(discountPrice, NaN);
                            if (Number.isFinite(numericDiscount)) { return numericDiscount; }
                            const numericEffective = toNumber(effective, NaN);
                            if (Number.isFinite(numericEffective)) { return numericEffective; }
                            return unitPrice;
                        })()
                    });
                }
            } else {
                orderItems.push({
                    jewelleryId: pickFirst(data, ["CollectionID", "collectionID", "collectionId"], id),
                    size: "DEAL",
                    quantity,
                    effectivePrice: unitPrice
                });
            }
        }
    }

    return orderItems;
}
