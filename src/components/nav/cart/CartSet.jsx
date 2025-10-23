import { memo } from "react";
import { Trash2 } from "lucide-react";

export const CartSet = memo(function CartSet({ set, onRemove }) {
    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-semibold text-dark">{set.collectionName || "Jewelry Set"}</div>
                    <div className="text-xs text-dark/60 mb-1">
                        Set of {set.itemsList?.length || 0} pieces
                    </div>
                    <ul className="pl-3 text-xs text-dark/70 list-disc">
                        {set.itemsList?.map((i, idx) => (
                            <li key={i.jewelleryID || idx}>
                                {i.desc || i.name} ({i.type}) Size {i.size}
                            </li>
                        ))}
                    </ul>
                </div>
                <button
                    onClick={onRemove}
                    className="text-dark/60 hover:text-red transition-colors p-1 ml-2"
                    aria-label="Remove set"
                >
                    <Trash2 size={20} />
                </button>
            </div>
            <div className="flex items-end justify-between mt-2">
                <div className="text-xs text-dark/50">
                    Quantity: <span className="font-semibold">{set.quantity}</span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-dark/60">Total</div>
                    <div className="text-lg font-bold text-dark">
                        ${set.totalPrice ? (set.totalPrice * set.quantity).toFixed(2) : "0.00"}
                    </div>
                </div>
            </div>
        </div>
    );
});