import { cachedFetch } from "./RequestCache";

export async function fetchCollections() {
    try {
        const data = await cachedFetch('/api/collections');     
        if (data.success) { return data.results; }
        return [];
    } catch (error) {
        console.error('Failed to fetch collections:', error);
        return [];
    }
}

export async function fetchCollectionById(collectionId) {
    try {
        const collections = await fetchCollections();
        
        const collection = collections.find(c => 
            c.CollectionID == collectionId ||
            String(c.CollectionID) === String(collectionId)
        );
        
        return collection || null;
    } catch (error) {
        console.error('Failed to fetch collection by ID:', error);
        return null;
    }
}