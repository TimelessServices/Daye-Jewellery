'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';

import { ShopItem } from './ShopItem';
import { cachedFetch } from "@/utils/RequestCache";
import { useCart, useWishlist } from '@/contexts/AppProvider';
import { useToasts, useLoading, useModal } from '@/contexts/UIProvider';

export default function CollectionGrid({ collection, onBack }) {
    const [items, setItems] = useState([]);
    const { addToast } = useToasts();
    const { openModal } = useModal();

    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const { loading, setLoading } = useLoading();

    const loadCollectionItems = async () => {
        if (!collection?.CollectionID) return;
        setLoading('collectionItems', true)
        
        try {
            const data = await cachedFetch(`/api/collection-items?collectionID=${collection.CollectionID}`);
            if (data.success) { setItems(data.results); }
        } catch (error) {
            console.error('Failed to load collection items:', error);
        } finally {
            setLoading('collectionItems', false)
        }
    };

    useEffect(() => { loadCollectionItems(); }, [collection]);

    // Handle adding collection to cart via modal
    const handleGetAll = () => {
        if (loading.bagAll || items.length === 0) return;
        
        // Open collection modal instead of direct cart add
        openModal(`collection-${collection.CollectionID}`, {
            type: 'collection',
            collection: collection,
            items: items,
            onAddCollection: handleAddCollectionToCart
        });
    };

    // The actual cart addition function (called by CollectionModal)
    const handleAddCollectionToCart = async (collection, items, sizeSelections) => {
        setLoading('bagAll', true);
        
        try {
            // Add each item with selected size
            for (const item of items) {
                const selectedSize = sizeSelections[item.JewelleryID] || 'OS';
                addToCart(
                    item.JewelleryID, 
                    item.Desc, 
                    item.Type, 
                    item.CollectionPrice || item.Price, 
                    selectedSize, 
                    1
                );
            }
            
            addToast({ 
                message: `Added ${collection.Name} collection to cart!`, 
                type: 'success' 
            });
        } catch (error) {
            addToast({ 
                message: 'Failed to add collection to cart', 
                type: 'error' 
            });
            throw error; // Re-throw so CollectionModal can handle it
        } finally {
            setLoading('bagAll', false);
        }
    };

    const handleFavoriteAll = async () => {
        if (loading.favoriteAll) return;
        
        setLoading('favoriteAll', true);
        
        try {
            for (const item of items) {
                addToWishlist(item.JewelleryID, item.Desc, item.Price, item.CollectionPrice, item.Type, item.Sizes);
            }
            addToast({ message: `Added ${items.length} items to wishlist!`, type: 'success' });
        } 
        catch (error) { addToast({ message: 'Failed to add items to favourites', type: 'error' }); } 
        finally { setLoading('favoriteAll', false); }
    };

    if (!collection) return null;

    return (
        <div className="w-full h-7/8 p-4">
            <div className="w-full mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Breadcrumbs & Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <button onClick={onBack} className="flex items-center gap-2 text-dark hover:text-dark/70 
                        text-sm sm:text-base">
                        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                        <span>Back to Shop</span>
                    </button>
                    <div className="text-dark/60 text-xs sm:text-sm">
                        Collections / <span className="text-dark font-semibold">{collection.Name}</span>
                    </div>
                </div>

                {/* Collection Actions - Mobile Responsive */}
                <div className="flex flex-row sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <button onClick={handleGetAll} disabled={loading.bagAll || items.length === 0} className={`flex-1 sm:flex-none flex 
                        items-center justify-center gap-2 p-2 sm:p-3 border-2 border-dark rounded-lg text-sm sm:text-base 
                        animate hover:bg-dark hover:text-light min-h-[44px] ${loading.bagAll ? 'opacity-50' : ''}`}>
                        <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                        {loading.bagAll ? 'Adding...' : 'Bag All'}
                    </button>

                    <button onClick={handleFavoriteAll} disabled={loading.favoriteAll} className={`flex-1 sm:flex-none flex 
                        items-center justify-center gap-2 p-2 sm:p-3 border-2 border-dark rounded-lg text-sm sm:text-base 
                        animate hover:bg-dark hover:text-light min-h-[44px] ${loading.favoriteAll ? 'opacity-50' : ''}`}>
                        <Heart size={18} className="sm:w-5 sm:h-5" />
                        {loading.favoriteAll ? 'Adding...' : 'Favorite All'}
                    </button>
                </div>
            </div>

            {/* Mobile-Optimized Collection Info */}
            <div className="w-full p-4 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{collection.Name}</h1>
                        <p className="text-sm text-dark/70"> {collection.Type} | {collection.ItemCount} items </p>
                        
                        {collection.CollectionPrice && (
                            <p className="text-lg font-semibold text-dark pt-1">
                                Collection Price: ${collection.CollectionPrice}
                            </p>
                        )}

                        {collection.DiscountType && (
                            <p className="text-sm text-green-600 font-medium">
                                {collection.DiscountType === 'PERCENTAGE' && `${collection.DiscountAmount}% off individual items`}
                                {collection.DiscountType === 'GET-FREE' && `Buy items, get ${collection.DiscountAmount} free`}
                                {collection.DiscountType === 'GET-HALF' && `Buy items, get ${collection.DiscountAmount} half off`}
                                {['GET-1-QUART', 'GET-3-QUART'].includes(collection.DiscountType) && 'Special bulk discount'}
                                {collection.DiscountType === 'REPLACE' && `Items priced at $${collection.DiscountAmount} each`}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile-Optimized Items Grid */}
            <div className="w-full flex-1 overflow-y-auto">
                {loading.collectionItems ? ( 
                    <p className="text-center py-8 text-dark">Loading collection items...</p> 
                ) : (
                    <div className="w-full gap-4 sm:gap-6 lg:gap-8 xl:gap-10 
                        grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 
                        lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {items.map((item, index) => (
                            <ShopItem 
                                key={`${item.JewelleryID}-${index}`} 
                                id={item.JewelleryID} 
                                desc={item.Desc} 
                                price={item.Price} 
                                salePrice={item.CollectionPrice} 
                                type={item.Type} 
                                sizes={item.Sizes} 
                            />
                        ))}
                    </div>
                )}

                {/* No Items Found */}
                {!loading.collectionItems && items.length === 0 && (
                    <p className="text-center py-8 text-dark">No items found in this collection</p>
                )}
            </div>
        </div>
    );
}