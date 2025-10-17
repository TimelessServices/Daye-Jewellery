import Image from "next/image";
import { Package } from 'lucide-react';
import { useRouter } from "next/navigation";

function getCollectionTypeColor(type) {
    switch(type) {
        case 'SET': return 'bg-blue';
        case 'THEME': return 'bg-purple'; 
        case 'BUNDLE': return 'bg-green';
        case 'SEASONAL': return 'bg-orange';
        default: return 'bg-light';
    }
}

export function CollectionItem({ item, isSelected = false }) {
    const router = useRouter();
    const setCollection = () => { router.push(`/shop/${item.CollectionID}`); }

    const hasDiscount = item.DiscountType && item.DiscountAmount;
    const hasFixedPrice = item.CollectionPrice !== null && item.CollectionPrice !== undefined;

    return (
        <div id={item.CollectionID} onClick={() => setCollection} className={`flex flex-col text-center animate cursor-pointer 
                hover:scale-95 hover:bg-dark hover:text-light ${isSelected ? 'bg-dark text-light rounded-lg' 
                : 'bg-light text-dark rounded-md'}`}>

            <div className="relative w-full aspect-square bg-white rounded-t-md shadow-inner-custom">
                <Image src={`/COLLECTION_PLACEHOLDER.png`} fill className="object-contain"alt={`${item.Name} collection`} />
                
                {/* Collection Type Badge */}
                <div className={`absolute top-2 left-2 px-4 py-1 text-xs text-light rounded-full 
                    ${getCollectionTypeColor(item.Type)}`}> {item.Type} </div>

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute bottom-2 right-2 px-4 py-1 bg-red text-xs text-light rounded-full">
                        {item.DiscountType === 'PERCENTAGE' ? `${item.DiscountAmount}% OFF` : 'SPECIAL'}
                    </div>
                )}
            </div>

            <div className="w-full border-t-2 border-dark/50 p-3"> 
                <p className="text-lg font-semibold pb-4">{item.Name}</p>
                
                {/* Item Count */}
                <div className="flex items-center justify-center gap-1 text-sm opacity-75 mb-2">
                    <Package size={16} />
                    <span>{item.ItemCount || 0} items</span>
                </div>

                {/* Pricing Info */}
                <div className="text-center">
                    {hasFixedPrice && ( <p className="text-lg font-bold">${item.CollectionPrice}</p> )}

                    {hasDiscount && !hasFixedPrice && (
                        <p className="text-sm text-green-600 font-medium">
                            {item.DiscountType === 'PERCENTAGE' && `Save ${item.DiscountAmount}%`}
                            {item.DiscountType === 'GET-FREE' && `Buy 1, Get ${item.DiscountAmount} FREE`}
                            {item.DiscountType === 'GET-HALF' && `Buy 1, Get ${item.DiscountAmount} Half Off`}
                            {['GET-1-QUART', 'GET-3-QUART'].includes(item.DiscountType) && 'Special Discount'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}