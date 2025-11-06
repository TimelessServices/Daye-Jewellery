import { useState, useEffect, useId, useMemo, useRef, useCallback } from 'react';
import { Scroller } from "@/components/Scroller";

import { CollectionItem } from './Item';
import { cachedFetch } from "@/utils/RequestCache";
import { useLoading, useToasts } from '@/contexts/UIProvider';

export default function CollectionScroller() {
    const [items, setItems] = useState([]);

    const { addToast } = useToasts();
    const { loading, setLoading } = useLoading();
    const instanceId = useId();
    const loadingKey = useMemo(() => `collectionScroller:${instanceId}`, [instanceId]);
    const activeRequestRef = useRef(null);

    const loadCollections = useCallback(async () => {
        if (activeRequestRef.current?.status === 'pending') {
            return activeRequestRef.current.promise;
        }

        const requestId = Symbol(loadingKey);
        const requestPromise = (async () => {
            setLoading(loadingKey, true);

            try {
                const data = await cachedFetch('/api/collections/complex?limit=15');
                if (data.success && activeRequestRef.current?.id === requestId) { setItems(data.results); }
            }
            catch (error) {
                if (activeRequestRef.current?.id === requestId) {
                    addToast({ message: 'Failed to load collections', type: 'error' });
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
    }, [addToast, loadingKey, setLoading]);

    useEffect(() => { loadCollections(); }, [loadCollections]);

    return (
        <div className="p-4 flex text-center items-center justify-center">
            <Scroller title="Our Collections">
                {loading[loadingKey] ? ( <p>Loading collections...</p> ) : (
                    items.map((item, index) => ( <CollectionItem key={`${item.CollectionID}-${index}`} item={item} /> ))
                )}
            </Scroller>
        </div>
    );
}