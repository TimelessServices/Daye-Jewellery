import { memo, useMemo, useState, useCallback } from "react";
import { Trash2, Plus, Minus } from "lucide-react";

export const CartItem = memo(function CartItem({ item, onRemove = null, onUpdateQuantity = null }) {
    const [inputValue, setInputValue] = useState(item.quantity.toString());
    
    const itemTotal = useMemo(() => 
        (item.price * item.quantity).toFixed(2), 
        [item.price, item.quantity]
    );

    useMemo(() => {
        setInputValue(item.quantity.toString());
    }, [item.quantity]);

    const handleQuantityChange = useCallback((newQuantity) => {
        if (onUpdateQuantity) {
            onUpdateQuantity(newQuantity);
        }
    }, [onUpdateQuantity]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setInputValue(value);
        
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            handleQuantityChange(numValue);
        }
    }, [handleQuantityChange]);

    const handleInputBlur = useCallback(() => {
        const numValue = parseInt(inputValue);
        if (isNaN(numValue) || numValue < 1) {
            setInputValue("1");
            handleQuantityChange(1);
        }
    }, [inputValue, handleQuantityChange]);

    const incrementQuantity = useCallback(() => {
        handleQuantityChange(item.quantity + 1);
    }, [item.quantity, handleQuantityChange]);

    const decrementQuantity = useCallback(() => {
        handleQuantityChange(Math.max(1, item.quantity - 1));
    }, [item.quantity, handleQuantityChange]);

    return (
        <div className="p-4">
            {/* Product Header - Clean and spacious */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-3">
                    <h4 className="font-medium text-dark leading-relaxed mb-2">{item.desc}</h4>
                    <div className="text-sm text-dark/60">
                        Size {item.size} • ${item.price} each
                    </div>
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
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} className={item.quantity <= 1 ? "text-dark/30" : "text-dark"} />
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
                    <div className="text-xl font-bold text-dark">${itemTotal}</div>
                </div>
            </div>
        </div>
    );
});