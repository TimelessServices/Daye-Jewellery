import { memo, useMemo } from "react";
import { Trash2, Gift } from "lucide-react";

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

export const CartDeal = memo(function CartDeal({ deal, onRemove }) {
    const quantity = toQuantity(deal?.quantity, 1);

    const unitPrice = toNumber(
        pickFirst(deal, [
            "TotalPrice",
            "totalPrice",
            "DealPrice",
            "Price",
            "price",
        ]),
        0,
    );

    const buyItems = useMemo(
        () => bucketToArray(pickFirst(deal, ["BuyItems", "buyItems"], [])),
        [deal],
    );

    const getItems = useMemo(
        () => bucketToArray(pickFirst(deal, ["GetItems", "getItems"], [])),
        [deal],
    );

    const buyQty = toNumber(
        pickFirst(deal, ["BuyQuantity", "BuyQty", "buyQty", "buyQuantity"], buyItems.length),
        buyItems.length,
    );
    const getQty = toNumber(
        pickFirst(deal, ["GetQuantity", "GetQty", "getQty", "getQuantity"], getItems.length),
        getItems.length,
    );

    const dealId = pickFirst(deal, ["CollectionID", "collectionId", "collectionID"], "");
    const name = pickFirst(
        deal,
        ["Name", "collectionName", "CollectionName", "name"],
        dealId ? `Deal ${dealId}` : "Bundle Deal",
    );

    const renderLine = (item, idx, accentClass = "") => {
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
            <li key={itemKey} className={accentClass}>
                <span className="font-medium text-dark/80">{descriptor}</span>
                {type && <span className="text-dark/60"> {`(${type})`}</span>}
                {size && <span className="text-dark/60"> {`• Size ${size}`}</span>}
                {quantityLabel && <span className="text-dark/50">{quantityLabel}</span>}
                {hasPrice && <span className="text-dark/50"> {formatCurrency(priceValue)}</span>}
            </li>
        );
    };

    return (
        <div className="p-4 rounded-lg border border-dark/10 bg-green/5 border-l-4 border-green">
            <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-green">
                        <Gift size={16} />
                        <span>Bundle Deal</span>
                    </div>
                    <div className="font-semibold text-dark text-lg leading-snug">{name}</div>
                    <div className="text-xs text-dark/60">
                        Deal: Buy {buyQty || "?"} Get {getQty || "?"}
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="text-dark/60 hover:text-red transition-colors p-1 flex-shrink-0"
                    aria-label="Remove deal"
                >
                    <Trash2 size={20} />
                </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <div className="text-xs font-semibold uppercase text-dark/70 mb-1">Buy Items</div>
                    {buyItems.length > 0 ? (
                        <ul className="pl-4 space-y-1 text-xs text-dark/70 list-disc">
                            {buyItems.map((item, idx) => renderLine(item, idx))}
                        </ul>
                    ) : (
                        <p className="text-xs text-dark/50">No paid items listed.</p>
                    )}
                </div>
                <div>
                    <div className="text-xs font-semibold uppercase text-green-700 mb-1">Get Items</div>
                    {getItems.length > 0 ? (
                        <ul className="pl-4 space-y-1 text-xs text-green-700 list-disc">
                            {getItems.map((item, idx) => renderLine(item, idx, ""))}
                        </ul>
                    ) : (
                        <p className="text-xs text-dark/50">No free items listed.</p>
                    )}
                </div>
            </div>
            <div className="flex items-end justify-between mt-4">
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