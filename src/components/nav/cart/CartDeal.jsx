import { memo, useMemo } from "react";
import { Trash2, Gift } from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";

export const CartDeal = memo(function CartDeal({ deal, onRemove }) {
    const quantity = (() => {
        const parsed = Number(deal?.quantity);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 1;
        }
        return parsed;
    })();

    const unitPrice = (() => {
        const raw = deal?.totalPrice ?? deal?.TotalPrice ?? deal?.price ?? 0;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
            return 0;
        }
        return parsed;
    })();

    const buyItems = useMemo(() => {
        if (Array.isArray(deal?.buyItems)) { return deal.buyItems; }
        if (Array.isArray(deal?.BuyItems)) { return deal.BuyItems; }
        if (deal?.buyItems && typeof deal.buyItems === "object") { return Object.values(deal.buyItems); }
        if (deal?.BuyItems && typeof deal.BuyItems === "object") { return Object.values(deal.BuyItems); }
        return [];
    }, [deal]);

    const getItems = useMemo(() => {
        if (Array.isArray(deal?.getItems)) { return deal.getItems; }
        if (Array.isArray(deal?.GetItems)) { return deal.GetItems; }
        if (deal?.getItems && typeof deal.getItems === "object") { return Object.values(deal.getItems); }
        if (deal?.GetItems && typeof deal.GetItems === "object") { return Object.values(deal.GetItems); }
        return [];
    }, [deal]);

    const buyQty = Number(deal?.buyQty ?? deal?.BuyQty ?? buyItems.length) || 0;
    const getQty = Number(deal?.getQty ?? deal?.GetQty ?? getItems.length) || 0;

    const name = deal?.collectionName ?? deal?.Name ?? deal?.name ?? "Deal";

    const renderLine = (item, idx, accentClass = "") => {
        const descriptor = item?.desc ?? item?.name ?? `Item ${idx + 1}`;
        const type = item?.type ?? item?.Type ?? null;
        const size = item?.size ?? item?.Size ?? null;
        const quantityLabel = Number(item?.quantity) > 1 ? ` × ${Number(item.quantity)}` : "";
        const price = item?.discountPrice ?? item?.price ?? null;
        const hasPrice = price !== null && price !== undefined;
        const parsedPrice = Number(price);
        return (
            <li key={item?.jewelleryID ?? item?.jewelleryId ?? idx} className={accentClass}>
                <span className="font-medium text-dark/80">{descriptor}</span>
                {type && <span className="text-dark/60"> {`(${type})`}</span>}
                {size && <span className="text-dark/60"> {`• Size ${size}`}</span>}
                {quantityLabel && <span className="text-dark/50">{quantityLabel}</span>}
                {hasPrice && Number.isFinite(parsedPrice) && (
                    <span className="text-dark/50"> {formatCurrency(parsedPrice)}</span>
                )}
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