import Image from "next/image";
import { useState, useEffect } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';

import { Badge } from "./Badge";
import { useModal } from "@/contexts/UIProvider";
import { useWishlist } from "@/contexts/AppProvider";

// Utility Functions
function doesImgExist(src) {
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

function renderSetBadge(item) {
    if (!item.isInSet || item.setTotal <= 0) { return; }
    else if (item.setTotal === 1) { return ( <Badge type="SET" text={item.getSets[0].Name} /> ) }
    else { return ( <Badge type="SET" text={`Find in ${item.setTotal} SETs`} /> ); }
}

function renderDealBadge(item) {
    if (!item.doesHaveDeal || item.dealTotal <= 0) { return; }
    else if (item.dealTotal === 1) { return ( <Badge type="DEAL" text={item.getDealString()} /> ); }
    else { return ( <Badge type="DEAL" text={`Find in ${item.dealTotal} DEALs`} /> ); }
}

export function ShopItem({ item }) {
    const { openModal } = useModal();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const isWishlisted = isInWishlist(item.getID);

    // Check Image
    const imgPrimary = item.getImgPrimary;
    const imgSrc = doesImgExist(imgPrimary) ? imgPrimary : item.getImgDefault();

    // Open Item Modal
    const openItemModal = (e) => {
        e.stopPropagation();
        const modalID = `jewellery-${item.getID}`;
        openModal(modalID, { type: 'item', item });
    };

    // Handle Wishlist
    const handleWishlist = (e) => {
        e.stopPropagation();

        isWishlisted ? removeFromWishlist(item.getID) : 
            addToWishlist(item.getID, item.getDesc, item.getBasePrice, item.getSalePrice, item.getType, item.availableSizes);
    };

    // Item Container
    return (
        <div onClick={openItemModal} className="flex flex-col text-center text-dark animate hover:scale-95 cursor-pointer">
            <div className="relative w-full aspect-square bg-light shadow-lg rounded-lg">
                <Image fill src={imgSrc} className="object-contain" alt={item.getDesc} />

                {renderSetBadge(item)}
                {renderDealBadge(item)}

                <button onClick={handleWishlist} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className="p-3 absolute top-2 right-2 hover:scale-110 animate rounded-full">
                    <Heart size={24} className={`animate ${ isWishlisted ? "text-red fill-red" : 
                        "text-dark hover:text-red hover:fill-red/20"}`}
                    />
                </button>
            </div>
                
            <div className="w-full h-30 flex text-center items-center justify-center">
                <p className="px-4 py-2 text-sm font-main">{item.getDesc}</p>
            </div>

            <div className="w-full h-15 flex flex-row border-b-2 border-dark">
                <div className="w-3/4 text-2xl flex text-center items-center justify-center">
                    {item.isOnSale ? (
                        <div className="w-full flex flex-col">
                            <p className="text-sm opacity-75 line-through">${item.getBasePrice}</p>
                            <p className="text-2xl font-bold">${item.getSalePrice}</p>
                        </div>
                    ) : ( 
                        <p className="text-2xl">${item.getBasePrice}</p> 
                    )}
                </div>
                
                <button onClick={openItemModal} className="w-1/4 text-light bg-dark flex text-center items-center 
                    justify-center animate hover:my-1 hover:bg-white hover:text-dark hover:border-2 hover:border-dark">
                    <ShoppingBag size={24} />
                </button>
            </div>
        </div>
    );
}