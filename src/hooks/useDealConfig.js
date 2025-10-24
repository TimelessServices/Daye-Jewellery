import { useEffect } from 'react';
import { cachedFetch } from '@/utils/RequestCache';
import { createStorageManager } from "@/utils/Storage";

export function useDealConfigure() {
    const storage = createStorageManager("deal_config", "sessionStorage");

    useEffect(() => {
        const loadCollectionData = async () => {
            const storageResponse = storage.get();
            if (storageResponse.success) { if (storageResponse.data) return; }
            else { storage.set(false); }

            try {
                setLoading("collectionSimple", true);
                const response = await cachedFetch('/api/collections/config');

                if (response.success) { 
                    storage.set(true);
                    return { collections: response.collections, deals: response.deals };
                }
                else { throw new Error("Failed to load Collections Data"); }
            }
            catch (error) { console.error("-- Config Error:", error) }
        } 

        loadCollectionData(); 
    }, []);
}