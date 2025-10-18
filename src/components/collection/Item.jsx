import Image from "next/image";
import { Package } from 'lucide-react';
import { useRouter } from "next/navigation";

export function CollectionItem({ item }) {
    // Set Router to Shop/Collection Page
    const router = useRouter();
    const setCollection = () => { router.push(`/shop/${item.CollectionID}`); }

    return (
        <div onClick={setCollection} className="h-full flex flex-col bg-dark/15 text-center rounded-lg cursor-pointer 
            animate hover:scale-95 hover:bg-dark hover:text-light">

            <div className="relative w-full aspect-square bg-white rounded-t-lg shadow-inner-custom">
                <Image src={`/COLLECTION_PLACEHOLDER.png`} fill className="object-contain rounded-t-lg" alt={`${item.Name} Collection`} />
            </div>

            <div className="w-full h-full p-3 gap-4 flex flex-col justify-between border-t-2 border-dark/50"> 
                <div>
                    <p className="text-lg font-semibold">{item.Name}</p>
                
                    <div className="flex items-center justify-center gap-1 text-sm opacity-75 mb-2">
                        <Package size={16} />
                        <span>{item.ItemCount || 0} items</span>
                    </div>
                </div>

                {/* Pricing Info */}
                <div className="text-center">
                    {item.HasSet ? (<p>Get For: ${item.TotalPrice}</p>) : ""}
                    {item.HasSale ? (<p>Items at {item.SaleDiscount}% off</p>) : ""}
                    {item.HasDeal ? (<p>Buy {item.BuyQuantity}, Get {item.GetQuantity} {item.DealDiscount}% off</p>) : ""}
                </div>
            </div>
        </div>
    );
}