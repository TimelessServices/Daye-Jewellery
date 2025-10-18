import Image from "next/image";
import { useState, useEffect } from 'react';
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

// Simple image existence check
function useImageExists(src) {
    const [exists, setExists] = useState(false);
    
    useEffect(() => {
        if (!src) {
            setExists(false);
            return;
        }
        
        const img = new window.Image();
        img.onload = () => setExists(true);
        img.onerror = () => setExists(false);
        img.src = src;
        
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);
    
    return exists;
}

export function ShopItem({ item }) {
    const { openModal } = useModal();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    
    // Check if primary image exists, fallback to placeholder
    const primaryExists = useImageExists(item.ImgPrimary);
    const imageSrc = primaryExists ? item.ImgPrimary : `/${getImg(item.Type)}_PLACEHOLDER.png`;
    
    // Use the class utility method
    const isOnSale = item.isOnSale;
    const isWishlisted = isInWishlist(item.JewelleryID);

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        const modalId = `shop-${item.JewelleryID}`;
        
        // Keep your exact same modal data structure
        const itemData = { 
            id: item.JewelleryID, 
            desc: item.Desc, 
            price: item.Price, 
            salePrice: item.BestSalePrice, 
            type: item.Type, 
            sizes: item.Sizes 
        };
        
        openModal(modalId, { type: 'item', item: itemData });
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (isWishlisted) { 
            removeFromWishlist(item.JewelleryID); 
        } else { 
            addToWishlist(item.JewelleryID, item.Desc, item.Price, item.BestSalePrice, item.Type, item.Sizes); 
        }
    };

    return (
        <div onClick={handleAddToCartClick} className="flex flex-col text-center text-dark animate hover:scale-95 cursor-pointer">
            <div className="relative w-full aspect-square bg-light shadow-lg rounded-lg">
                <Image 
                    fill 
                    src={imageSrc} 
                    className="object-contain"
                    alt={`${item.Desc} - ${getImg(item.Type).toLowerCase()}`} 
                />

                <button 
                    onClick={handleWishlistClick} 
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className="p-3 absolute top-2 right-2 hover:scale-110 animate rounded-full"
                >
                    <Heart 
                        size={24} 
                        className={`animate ${ 
                            isWishlisted ? "text-red fill-red" : "text-dark hover:text-red hover:fill-red/20"
                        }`}
                    />
                </button>
            </div>
                
            <div className="w-full h-30 flex text-center items-center justify-center">
                <p className="px-4 py-2 text-sm font-main">{item.Desc}</p>
            </div>

            <div className="w-full h-15 flex flex-row border-b-2 border-dark">
                <div className="w-3/4 text-2xl flex text-center items-center justify-center">
                    {isOnSale ? (
                        <div className="w-full flex flex-col">
                            <p className="text-sm opacity-75 line-through">${item.Price}</p>
                            <p className="text-2xl font-bold">${item.BestSalePrice}</p>
                        </div>
                    ) : ( 
                        <p className="text-2xl">${item.Price}</p> 
                    )}
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