'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

import { cachedFetch } from '@/utils/RequestCache';
import { JSON_ToJewellery } from '@/utils/JsonToClass';
import { useCart, useWishlist } from '@/contexts/AppProvider';
import { useToasts, useLoading, useModal } from '@/contexts/UIProvider';

import ShopGrid from '@/components/shop/ItemGrid';
import CollectionHead from '@/components/collection/Header';

export default function ShopCollection() {
    const { addToast } = useToasts();
    const { loading, setLoading } = useLoading();

    // Get CollectionID
    const params = useParams();
    const CollectionID = params.id;

    if (!CollectionID) { 
        addToast({ message: "No Collection Selected", type: "error" }); 
        return null;
    }

    // Set CollectionGrid Variables
    const [collection, setCollection] = useState(null);
    const [items, setItems] = useState([]);
    const activeRequestRef = useRef(null);

    useEffect(() => {
        if (!CollectionID) return;

        const requestId = Symbol('collectionPage:items');
        activeRequestRef.current = requestId;
        setLoading('collectionPage:items', true);
        setCollection(null);
        setItems([]);

        let cancelled = false;

        const fetchCollectionItems = async () => {
            try {
                const params = new URLSearchParams({ collectionID: CollectionID });
                const data = await cachedFetch(`/api/collections/items?${params}`);

                if (!cancelled && activeRequestRef.current === requestId && data.success) {
                    setCollection(data.collection[0]);
                    setItems(JSON_ToJewellery(data.items));
                }
            } catch (error) {
                if (!cancelled && activeRequestRef.current === requestId) {
                    console.error('Failed to load collection items:', error);
                }
            } finally {
                if (!cancelled && activeRequestRef.current === requestId) {
                    setLoading('collectionPage:items', false);
                    activeRequestRef.current = null;
                }
            }
        };

        fetchCollectionItems();

        return () => {
            cancelled = true;
            if (activeRequestRef.current === requestId) {
                activeRequestRef.current = null;
            }
        };
    }, [CollectionID, setLoading]);

    // Set Cart
    const handleToCart = () => {
        addToast({ message: "Adding to Cart. Probably?", type: "success" });
        console.log("--AddToCart: Deal With That");
    }

    // Set Fave
    const handleToFave = () => {
        addToast({ message: "Adding to Favourites. Probably?", type: "success" });
        console.log("--AddToFave: Deal With That");
    }

    if (loading['collectionPage:items']) return <div className="section">Loading Collection...</div>;
    if (!collection) return <div className='section'>No Collection Found</div>;
    if (items.length === 0) return <div className='section'>No Items Found</div>;

    return (
        <section className="w-full h-7/8 p-8">
            <CollectionHead item={collection} itemsLength={items.length} toCart={handleToCart} toFave={handleToFave} />

            {loading['collectionPage:items'] ? ( <p className="text-center py-8 text-dark">Loading collection items...</p> ) : (
                <ShopGrid items={items} /> )}

            {!loading['collectionPage:items'] && items.length === 0 && (
                <p className="text-center py-8 text-dark">No items found in this collection</p>
            )}
        </section>
    );
}