import { useState, useEffect } from 'react';
import { ShopItem } from '../shop/ShopItem';
import { Scroller } from "@/components/Scroller";
import { cachedFetch } from "@/utils/RequestCache";
import { useLoading, useToasts } from '@/contexts/UIProvider';

export default function BestSeller() {
    const [items, setItems] = useState([]);

    const { addToast } = useToasts();
    const { loading, setLoading } = useLoading();

    const loadBestSellers = async () => {
        if (loading.bestSellers) return;      
        setLoading('bestSellers', true);

        try {
            const data = await cachedFetch('/api/best-sellers');
            if (data.success) { setItems(data.results); }
        } 
        catch (error) { addToast({ message: 'Failed to load Best Sellers', type: 'error' }); } 
        finally { setLoading('bestSellers', false); }
    };

    useEffect(() => { loadBestSellers(); }, []);

    return (
        <div className="flex text-center items-center justify-center">
            <Scroller title="Best Sellers">
                {loading.collections ? ( <p>Loading collections...</p> ) : (
                    items.map((item, index) => ( 
                        <ShopItem key={`${item.JewelleryID}-${index}`} id={item.JewelleryID} desc={item.Desc} price={item.Price} 
                            type={item.Type} sizes={item.Sizes} />
                    ))
                )}
            </Scroller>
        </div>
    );
}