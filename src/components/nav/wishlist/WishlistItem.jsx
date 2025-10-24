import { memo } from "react";
import { Trash2, ShoppingBag } from "lucide-react";

import { useModal } from "@/contexts/UIProvider";
import { useWishlist } from "@/contexts/AppProvider";

export const WishlistItem = memo(function WishlistItem({ id, item, onRemove = null }) {
    const { openModal } = useModal();
    const { removeFromWishlist } = useWishlist();

    const handleMoveToCart = () => {
        const modalId = `wishlist-${id}`;
        // Pass the entire Jewellery instance data to the modal
        const handleSuccess = () => removeFromWishlist(id);
        openModal(modalId, { item, onSuccess: handleSuccess });
    };

    // Access properties from the parsed Jewellery class data
    const displayPrice = item.salePrice || item.price || item.basePrice;
    const hasDiscount = !!item.salePrice;

    return (
        <div className="p-4">
            <h4 className="font-medium text-dark leading-relaxed mb-2">{item.desc}</h4>

            <div className="flex gap-2 items-center">
                <div className="flex-1">
                    {hasDiscount ? (
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-red">${displayPrice}</p>
                            <p className="text-sm text-dark/60 line-through">${item.price || item.basePrice}</p>
                        </div>
                    ) : (
                        <p className="text-lg font-bold text-dark">${displayPrice}</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={handleMoveToCart} 
                        aria-label="Select size & add to cart"
                        title="Select size & add to cart" 
                        className="text-dark hover:text-blue"
                    > 
                        <ShoppingBag size={20} /> 
                    </button>
                    
                    <button 
                        onClick={onRemove} 
                        aria-label="Remove item" 
                        className="text-dark hover:text-red"
                    > 
                        <Trash2 size={20} /> 
                    </button>
                </div>
            </div>
        </div>
    );
});