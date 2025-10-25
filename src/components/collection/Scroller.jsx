import { useState, useEffect, useId, useMemo } from 'react';
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

    const loadCollections = async () => {
        if (loading[loadingKey]) return;
        setLoading(loadingKey, true);

        try {
            const data = await cachedFetch('/api/collections/complex');
            if (data.success) { setItems(data.results); }
        } 
        catch (error) { addToast({ message: 'Failed to load collections', type: 'error' }); } 
        finally { setLoading(loadingKey, false); }
    };

    useEffect(() => { loadCollections(); }, []);

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