import { memo } from "react";
import { Trash2, ShoppingBag } from "lucide-react";

import { useModal } from "@/contexts/UIProvider";
import { useWishlist } from "@/contexts/AppProvider";

export const WishlistItem = memo(function WishlistItem({ item, onRemove = null }) {
    const { openModal } = useModal();
    const { removeFromWishlist } = useWishlist();

    const handleMoveToCart = () => {
        const modalId = `wishlist-${item.itemId}`;
        const itemData = { id: item.itemId, desc: item.desc, price: item.price, salePrice: item.salePrice || null, type: item.type, sizes: item.sizes };
        const handleSuccess = () => removeFromWishlist(item.itemId);
        openModal(modalId, { item: itemData, onSuccess: handleSuccess });
    };

    return (
        <div className="p-4">
            <h4 className="font-medium text-dark leading-relaxed mb-2">{item.desc}</h4>

            <div className="flex gap-2 items-center">
                <div className="flex-1">
                    <p className="text-lg font-bold text-dark">${item.price}</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleMoveToCart} aria-label="Select size & add to cart"
                        title="Select size & add to cart" className="text-dark hover:text-blue"> 
                        <ShoppingBag size={20} /> 
                    </button>
                    
                    <button onClick={onRemove} aria-label="Remove item" className="text-dark hover:text-red"> 
                        <Trash2 size={20} /> 
                    </button>
                </div>
            </div>
        </div>
    );
});