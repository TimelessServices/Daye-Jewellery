import { memo, useMemo } from "react";
import { Trash2, Layers } from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";

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

export const CartSet = memo(function CartSet({ set, onRemove }) {
    const quantity = toQuantity(set?.quantity, 1);

    const unitPrice = toNumber(
        pickFirst(set, ["SetPrice", "TotalPrice", "totalPrice", "Price", "price"], 0),
        0,
    );

    const items = useMemo(
        () => bucketToArray(pickFirst(set, ["itemsList", "ItemsList", "items"], [])),
        [set],
    );

    const itemCount = toNumber(
        pickFirst(set, ["ItemCount", "itemCount", "ItemTotal", "itemTotal"], items.length),
        items.length,
    );

    const collectionId = pickFirst(set, ["CollectionID", "collectionId", "collectionID"], "");
    const name = pickFirst(
        set,
        ["Name", "collectionName", "CollectionName", "name"],
        collectionId ? `Set ${collectionId}` : "Curated Set",
    );

    return (
        <div className="p-4 rounded-lg border border-dark/10 bg-light/40 border-l-4 border-blue">
            <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-blue">
                        <Layers size={14} />
                        <span>Set Collection</span>
                    </div>
                    <div className="font-semibold text-dark text-lg leading-snug">{name}</div>
                    <div className="text-xs text-dark/60">
                        {itemCount > 0 ? `Set of ${itemCount} pieces` : "Curated assortment"}
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="text-dark/60 hover:text-red transition-colors p-1 flex-shrink-0"
                    aria-label="Remove set"
                >
                    <Trash2 size={20} />
                </button>
            </div>
            {items.length > 0 && (
                <ul className="pl-4 mb-4 space-y-1 text-xs text-dark/70 list-disc">
                    {items.map((item, idx) => {
                        const descriptor = pickFirst(
                            item,
                            [
                                "Desc",
                                "Name",
                                "desc",
                                "name",
                                "CollectionName",
                                "collectionName",
                                "JewelleryName",
                                "jewelleryName",
                            ],
                            `Item ${idx + 1}`,
                        );
                        const type = pickFirst(item, ["Type", "type"], null);
                        const size = pickFirst(item, ["Size", "size"], null);
                        const quantityNumber = toQuantity(pickFirst(item, ["Quantity", "quantity"], 1), 1);
                        const quantityLabel = quantityNumber > 1 ? ` × ${quantityNumber}` : "";
                        const priceValue = toNumber(
                            pickFirst(
                                item,
                                [
                                    "EffectivePrice",
                                    "DiscountPrice",
                                    "Price",
                                    "price",
                                    "effectivePrice",
                                    "discountPrice",
                                ],
                                null,
                            ),
                            NaN,
                        );
                        const hasPrice = Number.isFinite(priceValue);
                        const itemKey = pickFirst(
                            item,
                            ["jewelleryID", "JewelleryID", "jewelleryId", "itemId", "itemKey"],
                            `${descriptor}-${idx}`,
                        );
                        return (
                            <li key={itemKey}>
                                <span className="font-medium text-dark/80">{descriptor}</span>
                                {type && <span className="text-dark/60"> {` (${type})`}</span>}
                                {size && <span className="text-dark/60"> {` • Size ${size}`}</span>}
                                {quantityLabel && <span className="text-dark/50">{quantityLabel}</span>}
                                {hasPrice && (
                                    <span className="text-dark/50"> — {formatCurrency(priceValue)}</span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            <div className="flex items-end justify-between">
                <div className="text-xs text-dark/60">
                    Quantity: <span className="font-semibold text-dark">{quantity}</span>
                    <div className="text-dark/50">{formatCurrency(unitPrice)} each</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-dark/60">Total</div>
                    <div className="text-lg font-bold text-dark">{formatCurrency(unitPrice * quantity)}</div>
                </div>
            </div>
        </div>
    );
});