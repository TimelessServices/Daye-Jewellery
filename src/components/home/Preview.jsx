import { useState, useEffect } from 'react';

import { ShopItem } from '../shop/Item';
import { Scroller } from "@/components/Scroller";
import { cachedFetch } from "@/utils/RequestCache";
import { useLoading } from '@/contexts/UIProvider';

export default function Preview({ title, view }) {
    const [items, setItems] = useState([]);
    const { loading, setLoading } = useLoading();

    const loadPreviewItems = async () => {
        if (loading.preview) return;
        setLoading("preview", true);

        try {
            const params = new URLSearchParams({ view });
            const data = await cachedFetch(`/api/preview?${params}`);

            if (data.success) { setItems(data.results); }
        } 
        catch (error) { addToast({ message: 'Failed to load Best Sellers', type: 'error' }); } 
        finally { setLoading('preview', false); }
    }

    useEffect(() => { loadPreviewItems(); }, []);

    return (
        <div className="p-4 flex text-center items-center justify-center">
            <Scroller title={title}>
                {loading.preview ? ( <p>Loading Preview...</p> ) : (
                    items.map((item, index) => ( 
                        <ShopItem key={`${item.JewelleryID}-${index}`} item={item} />
                    ))
                )}
            </Scroller>
        </div>
    );
}