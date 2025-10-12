import { useState, useEffect } from 'react';
import { Scroller } from "@/components/Scroller";

import { cachedFetch } from "@/utils/RequestCache";
import { CollectionItem } from './shop/CollectionItem';
import { useLoading, useToasts } from '@/contexts/UIProvider';

export default function CollectionScroller({ onCollectionSelect, selectedCollectionId = null }) {
    const [items, setItems] = useState([]);

    const { addToast } = useToasts();
    const { loading, setLoading } = useLoading();

    const loadCollections = async () => {
        if (loading.collections) return;      
        setLoading('collections', true);

        try {
            const data = await cachedFetch('/api/collections');
            if (data.success) { setItems(data.results); }
        } 
        catch (error) { addToast({ message: 'Failed to load collections', type: 'error' }); } 
        finally { setLoading('collections', false); }
    };

    const handleCollectionSelect = (collection) => {
        if (onCollectionSelect) { onCollectionSelect(collection); }
    };

    useEffect(() => { loadCollections(); }, []);

    return (
        <div className="flex text-center items-center justify-center">
            <Scroller title="Our Collections">
                {loading.collections ? ( <p>Loading collections...</p> ) : (
                    items.map((item, index) => (
                        <CollectionItem key={`${item.CollectionID}-${index}`} item={item} 
                            onSelect={handleCollectionSelect} isSelected={selectedCollectionId === item.CollectionID} />
                    ))
                )}
            </Scroller>
        </div>
    );
}