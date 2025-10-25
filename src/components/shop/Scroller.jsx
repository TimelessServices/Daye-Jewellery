import { useState, useEffect } from 'react';

import { ShopItem } from '../shop/Item';
import { Scroller } from "@/components/Scroller";
import { cachedFetch } from "@/utils/RequestCache";
import { useLoading } from '@/contexts/UIProvider';
import { JSON_ToJewellery } from '@/utils/JsonToClass';

export default function ShopScroller({ title, view }) {
    const [items, setItems] = useState([]);
    const { loading, setLoading } = useLoading();

    const loadPreviewItems = async () => {
        if (loading.shopScroller) return;
        setLoading("shopScroller", true);

        try {
            const params = new URLSearchParams({ view });
            const data = await cachedFetch(`/api/preview?${params}`);
            console.log(`-- ${view} Data: `, data);

            if (data.success) { 
                console.log(`-- ${title} ITEMS: `, data.results);
                setItems(JSON_ToJewellery(data.results)); 
            }
            else { throw new Error(data.error); }
        } 
        catch (error) { 
            console.error(`-- Preview Error: ${error}`);
            addToast({ message: `Failed to load: ${title}`, type: 'error' }); 
        } 
        finally { setLoading("shopScroller", false); }
    }

    useEffect(() => { loadPreviewItems(); }, []);

    return (
        <div className="p-4 flex text-center items-center justify-center">
            <Scroller title={title}>
                {loading.shopScroller ? ( <p>Loading Preview...</p> ) : (
                    items.map((item, index) => ( 
                        <ShopItem key={`${item.JewelleryID}-${index}`} item={item} />
                    ))
                )}
            </Scroller>
        </div>
    );
}