import { memo, useState, useCallback, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";

import { formatCurrency } from "@/utils/formatCurrency";

export const CartItem = memo(function CartItem({ item, onRemove = null, onUpdateQuantity = null }) {
    const quantity = (() => {
        const parsed = Number(item?.quantity);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 1;
        }
        return parsed;
    })();

    const unitPrice = (() => {
        const raw = item?.price ?? item?.unitPrice ?? item?.salePrice ?? item?.basePrice ?? 0;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
            return 0;
        }
        return parsed;
    })();

    const itemTotal = unitPrice * quantity;

    const [inputValue, setInputValue] = useState(quantity.toString());

    useEffect(() => {
        setInputValue(quantity.toString());
    }, [quantity]);

    const descriptor = item?.desc ?? item?.description ?? item?.name ?? "Item";
    const typeLabel = item?.type ?? item?.Type ?? null;
    const sizeLabel = item?.size ?? item?.selectedSize ?? item?.Size ?? null;

    const handleQuantityChange = useCallback((newQuantity) => {
        if (onUpdateQuantity) {
            onUpdateQuantity(newQuantity);
        }
    }, [onUpdateQuantity]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setInputValue(value);
        
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            handleQuantityChange(numValue);
        }
    }, [handleQuantityChange]);

    const handleInputBlur = useCallback(() => {
        const numValue = parseInt(inputValue, 10);
        if (isNaN(numValue) || numValue < 1) {
            const fallback = quantity.toString();
            setInputValue(fallback);
            handleQuantityChange(quantity);
        }
    }, [inputValue, handleQuantityChange, quantity]);

    const incrementQuantity = useCallback(() => {
        handleQuantityChange(quantity + 1);
    }, [quantity, handleQuantityChange]);

    const decrementQuantity = useCallback(() => {
        handleQuantityChange(Math.max(1, quantity - 1));
    }, [quantity, handleQuantityChange]);

    return (
        <div className="p-4 rounded-lg border border-dark/10 bg-white shadow-sm">
            <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-dark/70 uppercase tracking-wide">
                        {typeLabel && (
                            <span className="px-2 py-0.5 rounded-full bg-light/60 border border-dark/10">
                                {typeLabel}
                            </span>
                        )}
                        {sizeLabel && (
                            <span className="px-2 py-0.5 rounded-full bg-light/60 border border-dark/10">
                                Size {sizeLabel}
                            </span>
                        )}
                    </div>
                    <h4 className="font-medium text-dark leading-relaxed">{descriptor}</h4>
                    <div className="text-sm text-dark/60">{formatCurrency(unitPrice)} each</div>
                </div>
                <button
                    onClick={onRemove}
                    className="text-dark/60 hover:text-red transition-colors p-1 flex-shrink-0"
                    aria-label="Remove item"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Quantity and Total Row - Generous spacing */}
            <div className="flex items-center justify-between">
                {/* Quantity Controls - Larger touch targets */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-dark/20 rounded overflow-hidden">
                        <button
                            onClick={decrementQuantity}
                            className="p-2 hover:bg-dark/5 transition-colors"
                            aria-label="Decrease quantity"
                            disabled={quantity <= 1}
                        >
                            <Minus size={14} className={quantity <= 1 ? "text-dark/30" : "text-dark"} />
                        </button>

                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className="w-12 text-center text-sm border-0 focus:outline-none focus:bg-dark/5"
                            min="1"
                            aria-label="Quantity"
                        />
                        
                        <button
                            onClick={incrementQuantity}
                            className="p-2 hover:bg-dark/5 transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus size={14} className="text-dark" />
                        </button>
                    </div>
                </div>

                {/* Price Display - Prominent */}
                    <div className="text-right">
                        <div className="text-sm text-dark/60 mb-1">Total</div>
                        <div className="text-xl font-bold text-dark">{formatCurrency(itemTotal)}</div>
                    </div>
            </div>
        </div>
    );
});