class URLFilterManager {
    // Parse URL parameters into filter format
    static parseUrlParams(searchParams) {
        const urlFilters = {};
        
        if (searchParams.get('search')) {
            urlFilters.search = searchParams.get('search');
        }
        
        if (searchParams.get('types')) {
            urlFilters.types = searchParams.get('types').split(',');
        }
        
        if (searchParams.get('sale') === 'true') {
            urlFilters.onSale = true;
        }
        
        if (searchParams.get('sort')) {
            urlFilters.sort = searchParams.get('sort');
        }
        
        if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
            urlFilters.price = {
                min: parseInt(searchParams.get('minPrice')) || 0,
                max: parseInt(searchParams.get('maxPrice')) || 5000
            };
        }
        
        return urlFilters;
    }

    // Build URL parameters from filters
    static buildUrlParams(filters) {
        const params = new URLSearchParams();
        
        if (filters.search) {
            params.set('search', filters.search);
        }
        
        if (filters.types && filters.types.length < 4) {
            params.set('types', filters.types.join(','));
        }
        
        if (filters.onSale) {
            params.set('sale', 'true');
        }
        
        if (filters.sort) {
            params.set('sort', filters.sort);
        }
        
        if (filters.price && (filters.price.min > 0 || filters.price.max < 5000)) {
            if (filters.price.min > 0) params.set('minPrice', filters.price.min.toString());
            if (filters.price.max < 5000) params.set('maxPrice', filters.price.max.toString());
        }
        
        return params.toString();
    }
}

export default URLFilterManager;