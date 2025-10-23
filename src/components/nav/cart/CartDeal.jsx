import { memo } from "react";
import { Trash2, Gift } from "lucide-react";

export const CartDeal = memo(function CartDeal({ deal, onRemove }) {
    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-semibold text-dark flex items-center gap-1">
                        <Gift size={16} className="text-blue" />
                        {deal.collectionName || "Deal"}
                    </div>
                    <div className="text-xs text-dark/60 mb-1">Deal: Buy + Get</div>
                    <div>
                        <span className="font-semibold text-dark/80">Buy:</span>
                        <ul className="pl-3 text-xs text-dark/70 list-disc">
                            {deal.buyItems?.map((i, idx) => (
                                <li key={i.jewelleryID || idx}>
                                    {i.desc || i.name} ({i.type}) Size {i.size}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-1">
                        <span className="font-semibold text-dark/80">Get:</span>
                        <ul className="pl-3 text-xs text-green-700 list-disc">
                            {deal.getItems?.map((i, idx) => (
                                <li key={i.jewelleryID || idx}>
                                    {i.desc || i.name} ({i.type}) Size {i.size}
                                    {i.discountPrice ? ` ($${i.discountPrice})` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="text-dark/60 hover:text-red transition-colors p-1 ml-2"
                    aria-label="Remove deal"
                >
                    <Trash2 size={20} />
                </button>
            </div>
            <div className="flex items-end justify-between mt-2">
                <div className="text-xs text-dark/50">
                    Quantity: <span className="font-semibold">{deal.quantity}</span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-dark/60">Total</div>
                    <div className="text-lg font-bold text-dark">
                        ${deal.totalPrice ? (deal.totalPrice * deal.quantity).toFixed(2) : "0.00"}
                    </div>
                </div>
            </div>
        </div>
    );
});