const requestCache = new Map();

export const cachedFetch = async (url, options = {}) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Return existing promise if request is in flight
    if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey);
    }
    
    // Create new request promise
    const requestPromise = fetch(url, options)
        .then(response => response.json())
        .finally(() => {
            // Remove from cache after completion
            setTimeout(() => requestCache.delete(cacheKey), 1000);
        });
    
    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
};