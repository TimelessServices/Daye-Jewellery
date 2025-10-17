import Image from "next/image";
import { Heart, ShoppingBag } from 'lucide-react';

import { useModal } from "@/contexts/UIProvider";
import { useWishlist } from "@/contexts/AppProvider";

function getImg(type) {
    switch(type) {
        case 'N': return "NECKLACE";
        case 'B': return 'BRACELET';
        case 'R': return 'RING';
        case 'E': return 'EARRING';
        default: return 'ITEM';
    }
}

export function ShopItem({ id, desc, price, salePrice = null, type = "", sizes = "" }) {
    const { openModal } = useModal();
    const itemData = { id, desc, price, salePrice, type, sizes };
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    
    const isOnSale = salePrice !== null && salePrice !== undefined;
    const isWishlisted = isInWishlist(id);

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        const modalId = `shop-${id}`;
        openModal(modalId, { type: 'item', item: itemData });
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (isWishlisted) { removeFromWishlist(id); } 
        else { addToWishlist(id, desc, price, salePrice, type, sizes); }
    };

    return (
        <div onClick={handleAddToCartClick} className="flex flex-col text-center text-dark animate hover:scale-95 cursor-pointer">
            <div className="relative w-full aspect-square bg-light shadow-lg rounded-lg">
                <Image fill src={`/${getImg(type)}_PLACEHOLDER.png`} className="object-contain"
                    alt={`${desc} - ${getImg(type).toLowerCase()}`} />

                <button onClick={handleWishlistClick} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className="p-3 absolute top-2 right-2 hover:scale-110 animate rounded-full">
                    <Heart size={24} 
                        className={`animate ${ 
                            isWishlisted ? "text-red fill-red" : "text-dark hover:text-red hover:fill-red/20"
                        }`}
                    />
                </button>
            </div>
                
            <div className="w-full h-30 flex text-center items-center justify-center">
                <p className="px-4 py-2 text-sm font-main">{desc}</p>
            </div>

            <div className="w-full h-15 flex flex-row border-b-2 border-dark">
                <div className="w-3/4 text-2xl flex text-center items-center justify-center">
                    {isOnSale ? (
                        <div className="w-full flex flex-col">
                            <p className="text-sm opacity-75 line-through">${price}</p>
                            <p className="text-2xl font-bold">${salePrice}</p>
                        </div>
                    ) : ( <p className="text-2xl">${price}</p> )}
                </div>
                
                <button
                    onClick={handleAddToCartClick}
                    className="w-1/4 text-light bg-dark flex text-center items-center justify-center animate
                        hover:my-1 hover:bg-white hover:text-dark hover:border-2 hover:border-dark hover:rounded-full"
                >
                    <ShoppingBag size={24} />
                </button>
            </div>
        </div>
    );
}