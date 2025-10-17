'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { cachedFetch } from '@/utils/RequestCache';
import { useCart, useWishlist } from '@/contexts/AppProvider';
import { useToasts, useLoading, useModal } from '@/contexts/UIProvider';

import CollectionHead from '@/components/collection/Header';
import CollectionGrid from '@/components/collection/ItemGrid';

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

    useEffect(() => {
        async function fetchCollectionItems() {
            if (!CollectionID || loading.collectionItems) return;
            setLoading('collectionItems', true)
            
            try {
                const params = new URLSearchParams({ collectionID: CollectionID });
                const data = await cachedFetch(`/api/collections/items?${params}`);

                if (data.success) { 
                    console.log("-- collection:", data.collection);
                    setCollection(data.collection[0]);
                    setItems(data.items); 
                }
                else { console.log("-- CRAAAAAAAP"); }
            } catch (error) {
                console.error('Failed to load collection items:', error);
            } finally {
                setLoading('collectionItems', false)
            }
        }

        fetchCollectionItems();
    }, [CollectionID]);

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

    if (loading.collectionItems) return <div className="section">Loading Collection...</div>;
    if (!collection) return <div className='section'>No Collection Found</div>;
    if (items.length === 0) return <div className='section'>No Items Found</div>;

    return (
        <section className="w-full h-7/8 p-8">
            <CollectionHead item={collection} itemsLength={items.length} toCart={handleToCart} toFave={handleToFave} />

            {loading.collectionItems ? ( <p className="text-center py-8 text-dark">Loading collection items...</p> ) : (
                <CollectionGrid items={items} /> )}

            {!loading.collectionItems && items.length === 0 && (
                <p className="text-center py-8 text-dark">No items found in this collection</p>
            )}
        </section>
    );
}