import { memo } from "react";
import { Heart } from "lucide-react";

import { WishlistItem } from "./WishlistItem";
import { useWishlist } from "@/contexts/AppProvider";

export const WishlistContent = memo(function WishlistContent({ showTitle = false, className = "" }) {
    const { wishlist, removeFromWishlist, wishlistCount, getWishlistItems } = useWishlist();

    // Check if wishlist is empty
    const isEmpty = Object.keys(wishlist).length === 0;

    if (isEmpty) {
        return (
            <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
                <Heart size={48} className="text-dark/70 mb-4" />
                <p className="text-dark/70">Your wishlist is empty</p>
            </div>
        );
    }

    // Get parsed items
    const items = getWishlistItems();

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {showTitle && (
                <div className="pb-4 border-b border-dark/10">
                    <h2 className="text-xl font-semibold">Wishlist ({wishlistCount})</h2>
                </div>
            )}
            
            <div className="p-2 flex-1 overflow-y-auto divide-y divide-dark/10">
                {items.map(({ id, data }) => (
                    <WishlistItem key={`wishlist-${id}`} id={id} item={data} onRemove={() => removeFromWishlist(id)} />
                ))}
            </div>
        </div>
    );
});