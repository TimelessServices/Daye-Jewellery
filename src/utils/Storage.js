export const createStorageManager = (key, storageType = 'localStorage') => {
    const getStorage = () => {
        if (typeof window === 'undefined') return null;
        return storageType === 'localStorage' ? localStorage : sessionStorage;
    };
    
    return {
        get: () => {
            try {
                const storage = getStorage();
                if (!storage) return { success: false, error: `${key} Error: StorageType === NULL` };
                
                const data = storage.getItem(key);
                return data ? { success: true, data: JSON.parse(data) } 
                    : { success: false, error: `${key} Error: No Data Found!` };
            } catch (error) {
                console.warn(`Failed to get ${key} from ${storageType}:`, error);
                return { success: false, error: `${key} Error: ${error}` };
            }
        },
        
        set: (data) => {
            try {
                const storage = getStorage();
                if (!storage) return;
                
                storage.setItem(key, JSON.stringify(data));
            } catch (error) {
                console.warn(`Failed to set ${key} in ${storageType}:`, error);
            }
        },
        
        clear: () => {
            try {
                const storage = getStorage();
                if (!storage) return;
                
                storage.removeItem(key);
            } catch (error) {
                console.warn(`Failed to clear ${key} from ${storageType}:`, error);
            }
        }
    };
};