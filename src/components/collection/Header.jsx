import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';

export default function CollectionHead({ item, itemsLength, toCart, toFave }) {
    // Set Router to Shop/Collection Page
    const router = useRouter();
    const toShopMain = () => { router.push("/shop"); }

    // Set CollectionItem Variables
    const { setData, setSetData } = useState(null);
    const { saleData, setSaleData } = useState(null);
    const { dealData, setDealData } = useState(null);

    useEffect(() => { setSetData({ totalPrice: item.TotalPrice }); }, [item.HasSet]);
    useEffect(() => { setSaleData({ saleDiscount: item.SaleDiscount }); }, [item.HasSale]);
    useEffect(() => { 
        setDealData({
            buyQuantity: item.BuyQuantity,
            getQuantity: item.GetQuantity,
            dealDiscount: item.DealDiscount
        });
    }, [item.HasDeal]);

    return (
        <div className="w-full h-7/8 p-4">
            <div className="w-full mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">            
                {/* Breadcrumbs & Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <button onClick={() => toShopMain} className="flex items-center gap-2 text-dark hover:text-dark/70 
                        text-sm sm:text-base">
                        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                        <span>Back to Shop</span>
                    </button>
                    <div className="text-dark/60 text-xs sm:text-sm">
                        Collections / <span className="text-dark font-semibold">{collection.Name}</span>
                    </div>
                </div>

                {/* Collection Actions */}
                <div className='flex flex-row items-center gap-4'>
                    <button onClick={toCart} disabled={loading.toCart || itemsLength === 0} 
                        className={`gap-2 p-2 flex items-center justify-center border-2 border-dark rounded-lg text-sm animate
                            hover:bg-dark hover:text-light ${loading.toCart ? 'opacity-50' : ''}`}>
                        <ShoppingBag size={18} />
                        {loading.toCart ? 'Adding...' : 'Bag All'}
                    </button>

                    <button onClick={toFave} disabled={loading.toFave || itemsLength === 0} 
                        className={`gap-2 p-2 flex items-center justify-center border-2 border-dark rounded-lg text-sm animate
                            hover:bg-dark hover:text-light ${loading.toFave ? 'opacity-50' : ''}`}>
                        <Heart size={18} />
                        {loading.toFave ? 'Adding...' : 'Fave All'}
                    </button>
                </div>
            </div>

            {/* Collection Info */}
            <div className="w-full p-4 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{collection.Name}</h1>
                        <p className="text-sm text-dark/70"> {collection.Type} | {itemsLength} items </p>
                        
                        {item.HasSet && (
                            <p className="text-lg font-semibold text-dark pt-1">
                                Collection Price: ${setData.totalPrice}</p>
                        )}

                        {item.HasSale && (
                            <p className="text-sm text-green-600 font-medium">
                                Individual Items at {saleData.saleDiscount}% off</p>
                        )}

                        {item.HasDeal && (
                            <p className="text-sm text-green-600 font-medium">
                                Buy {dealData.BuyQuantity}, Get {dealData.getQuantity} {dealData.dealDiscount}% off</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}