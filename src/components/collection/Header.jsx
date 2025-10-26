import { useRouter } from "next/navigation";
import { useLoading } from '@/contexts/UIProvider';
import { ArrowLeft, BadgePercent, ShoppingBag } from 'lucide-react';
import { formatCurrency } from "@/utils/formatCurrency";

function ColType(hasSet, hasSale, hasDeal) {
    const types = [
        hasSet ? "SET" : null,
        hasSale ? "SALE" : null,
        hasDeal ? "DEAL" : null
    ].filter(Boolean);

    return types.join(" | ");
}

function ActionButton({ type, onClick, loadType, itemsLength }) {
    const clickTxt = type === "set" ? "Buy Set" : "Configure Deal";

    return (
        <button onClick={onClick} disabled={loadType || itemsLength === 0}
            className={`gap-2 p-2 flex items-center justify-center border-2 border-dark rounded-lg text-sm animate
                hover:bg-dark hover:text-light ${loadType ? 'opacity-50' : ''}`}>
            {type === "set" ? <ShoppingBag size={18} /> : <BadgePercent size={18} />}
            {loadType ? 'Adding...' : clickTxt}
        </button>
    );
}

export default function CollectionHead({ item, itemsLength, onConfigureSet, onConfigureDeal }) {
    const { loading, setLoading } = useLoading();

    // Set Router to Shop/Collection Page
    const router = useRouter();
    const toShopMain = () => { router.push("/shop"); }

    return (
        <div className="w-full h-7/8 p-4">
            <div className="w-full mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">            
                {/* Breadcrumbs & Back Button */}
                <div className="flex flex-col sm:items-center gap-2 sm:gap-4">
                    <button onClick={toShopMain} className="w-full flex items-center gap-2 text-dark hover:text-dark/70 
                        text-sm sm:text-base">
                        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                        <span>Back to Shop</span>
                    </button>
                    
                    <div className="text-dark/60 text-xs sm:text-sm">
                        Collections / <span className="text-dark font-semibold">{item.Name}</span>
                    </div>
                </div>

                {/* Collection Actions */}
                <div className='flex flex-row items-center gap-4'>
                    <ActionButton
                        type="set"
                        onClick={toCart}
                        loadType={loading['collectionHeader:addSetToCart']}
                        itemsLength={itemsLength}
                    />
                    <ActionButton
                        type="deal"
                        onClick={toFave}
                        loadType={loading['collectionHeader:addDealToWishlist']}
                        itemsLength={itemsLength}
                    />
                </div>
            </div>

            {/* Collection Info */}
            <div className="w-full p-4 gap-4 flex flex-col">
                <div>
                    <h1 className="text-3xl font-bold">{item.Name}</h1>
                    <p className="text-sm text-dark/70"> {ColType(item.HasSet, item.HasSale, item.HasDeal)} | {itemsLength} items </p>
                </div>
                
                <div>
                    {item.HasSet ? (
                        <p className="text-md font-semibold text-dark pt-1">
                            Collection Price: {formatCurrency(item.TotalPrice)}
                        </p>
                    ) : ""}

                    {item.HasSale ? (<p className="text-sm text-green-600 font-medium">
                            Individual Items at {item.SaleDiscount}% off</p>) : ""}

                    {item.HasDeal ? (<p className="text-sm text-green-600 font-medium">
                            Buy {item.BuyQuantity}, Get {item.GetQuantity} {item.DealDiscount}% off</p>) : ""}
                </div>
            </div>
        </div>
    );
}