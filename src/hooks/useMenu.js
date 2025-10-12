import { useState, useEffect } from 'react';
import { cachedFetch } from "@/utils/RequestCache";

export function useMenu() {
    const [menuData, setMenuData] = useState(null);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenuAndCollections = async () => {
            try {
                // Fetch static menu data
                const menuResponse = await fetch('/data/menus.json');
                if (!menuResponse.ok) {
                    throw new Error('Failed to fetch menu data');
                }
                const menuData = await menuResponse.json();

                // Fetch dynamic collections data
                const collectionsData = await cachedFetch('/api/collections');
                
                let collectionsArray = [];
                if (collectionsData.success) { collectionsArray = collectionsData.results; }

                // Build dynamic collections submenu
                const dynamicCollectionsSubmenu = collectionsArray.map(collection => ({
                    id: `collection-${collection.CollectionID}`,
                    title: collection.Name,
                    description: `${collection.Type} • ${collection.ItemCount || 0} items`,
                    link: `/shop?collection=${collection.CollectionID}`,
                    action: {
                        type: "collection_view",
                        params: { 
                            collectionId: collection.CollectionID,
                            collection: collection 
                        }
                    },
                    collectionData: collection
                }));

                // Update the collections menu item with dynamic submenu
                const updatedMenuData = {
                    ...menuData,
                    mainNavigation: menuData.mainNavigation.map(item => {
                        if (item.id === 'collections') {
                            return {
                                ...item,
                                link: "/shop",
                                action: {
                                    type: "page",
                                    params: { page: "/shop" }
                                },
                                submenu: [
                                    ...dynamicCollectionsSubmenu
                                ]
                            };
                        }
                        return item;
                    })
                };

                setMenuData(updatedMenuData);
                setCollections(collectionsArray);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuAndCollections();
    }, []);

    return { menuData, collections, loading, error };
}