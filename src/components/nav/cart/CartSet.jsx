import { memo, useMemo } from "react";
import { Trash2, Layers } from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";

export const CartSet = memo(function CartSet({ set, onRemove }) {
    const quantity = (() => {
        const parsed = Number(set?.quantity);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 1;
        }
        return parsed;
    })();

    const unitPrice = (() => {
        const raw = set?.totalPrice ?? set?.SetPrice ?? set?.Price ?? set?.price ?? 0;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
            return 0;
        }
        return parsed;
    })();

    const items = useMemo(() => {
        if (Array.isArray(set?.itemsList)) { return set.itemsList; }
        if (Array.isArray(set?.ItemsList)) { return set.ItemsList; }
        if (Array.isArray(set?.items)) { return set.items; }
        if (set?.itemsList && typeof set.itemsList === "object") { return Object.values(set.itemsList); }
        if (set?.ItemsList && typeof set.ItemsList === "object") { return Object.values(set.ItemsList); }
        return [];
    }, [set]);

    const itemCount = Number.isFinite(Number(set?.itemTotal)) && Number(set.itemTotal) > 0
        ? Number(set.itemTotal)
        : items.length;

    const name = set?.collectionName ?? set?.Name ?? set?.name ?? "Jewelry Set";

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
                        const descriptor = item?.desc ?? item?.name ?? `Item ${idx + 1}`;
                        const type = item?.type ?? item?.Type ?? null;
                        const size = item?.size ?? item?.Size ?? null;
                        const quantityLabel = Number(item?.quantity) > 1 ? ` × ${Number(item.quantity)}` : "";
                        const price = item?.price ?? item?.discountPrice ?? null;
                        const hasPrice = price !== null && price !== undefined;
                        const parsedPrice = Number(price);
                        return (
                            <li key={item?.jewelleryID ?? item?.jewelleryId ?? idx}>
                                <span className="font-medium text-dark/80">{descriptor}</span>
                                {type && <span className="text-dark/60"> {` (${type})`}</span>}
                                {size && <span className="text-dark/60"> {` • Size ${size}`}</span>}
                                {quantityLabel && <span className="text-dark/50">{quantityLabel}</span>}
                                {hasPrice && Number.isFinite(parsedPrice) && (
                                    <span className="text-dark/50"> — {formatCurrency(parsedPrice)}</span>
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