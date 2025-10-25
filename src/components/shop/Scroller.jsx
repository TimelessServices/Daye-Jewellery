import { useState, useEffect, useRef, useCallback } from 'react';

import { ShopItem } from '../shop/Item';
import { Scroller } from "@/components/Scroller";
import { cachedFetch } from "@/utils/RequestCache";
import { useLoading, useToasts } from '@/contexts/UIProvider';
import { JSON_ToJewellery } from '@/utils/JsonToClass';

export default function ShopScroller({ title, view }) {
    const [items, setItems] = useState([]);
    const { loading, setLoading } = useLoading();
    const { addToast } = useToasts();
    const loadingKey = `shopScroller:${view}`;
    const activeRequestRef = useRef(null);

    const loadPreviewItems = useCallback(async () => {
        if (activeRequestRef.current?.status === 'pending') {
            return activeRequestRef.current.promise;
        }

        const requestId = Symbol(loadingKey);
        const requestPromise = (async () => {
            setLoading(loadingKey, true);

            try {
                const params = new URLSearchParams({ view });
                const data = await cachedFetch(`/api/preview?${params}`);
                console.log(`-- ${view} Data: `, data);

                if (data.success && activeRequestRef.current?.id === requestId) {
                    console.log(`-- ${title} ITEMS: `, data.results);
                    setItems(JSON_ToJewellery(data.results));
                }
                else if (activeRequestRef.current?.id === requestId) {
                    throw new Error(data.error);
                }
            }
            catch (error) {
                if (activeRequestRef.current?.id === requestId) {
                    console.error(`-- Preview Error: ${error}`);
                    if (addToast) {
                        addToast({ message: `Failed to load: ${title}`, type: 'error' });
                    }
                }
            }
            finally {
                if (activeRequestRef.current?.id === requestId) {
                    setLoading(loadingKey, false);
                    activeRequestRef.current = null;
                }
            }
        })();

        activeRequestRef.current = {
            id: requestId,
            status: 'pending',
            promise: requestPromise
        };

        return requestPromise;
    }, [addToast, loadingKey, setLoading, title, view]);

    useEffect(() => { loadPreviewItems(); }, [loadPreviewItems]);

    return (
        <div className="p-4 flex text-center items-center justify-center">
            <Scroller title={title}>
                {loading[loadingKey] ? ( <p>Loading Preview...</p> ) : (
                    items.map((item, index) => ( 
                        <ShopItem key={`${item.JewelleryID}-${index}`} item={item} />
                    ))
                )}
            </Scroller>
        </div>
    );
}