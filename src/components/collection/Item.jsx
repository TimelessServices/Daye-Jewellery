import Image from "next/image";
import { Package } from 'lucide-react';
import { useRouter } from "next/navigation";

export function CollectionItem({ item }) {
    // Set Router to Shop/Collection Page
    const router = useRouter();
    const setCollection = () => { router.push(`/shop/${item.CollectionID}`); }

    return (
        <div onClick={() => setCollection} className="flex flex-col text-center animate cursor-pointer hover:scale-95 
            hover:bg-dark hover:text-light">

            <div className="relative w-full aspect-square bg-white rounded-t-md shadow-inner-custom">
                <Image src={`/COLLECTION_PLACEHOLDER.png`} fill className="object-contain"alt={`${item.Name} collection`} />
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
                    {item.HasSet && (<p>Get For: ${item.TotalPrice}</p>)}
                    {item.HasSale && (<p>Items at {item.SaleDiscount}% off</p>)}
                    {item.HasDeal && (<p>Buy {item.BuyQuantity}, Get {item.GetQuantity} {item.DealDiscount}% off</p>)}
                </div>
            </div>
        </div>
    );
}