class FilterStorage {
    constructor() {
        this.storageKey = 'jewelryFilters';
        this.defaultFilters = {
            sort: "",
            search: "",
            onSale: false,
            price: { min: 0, max: 5000 },
            types: ["Necklace", "Bracelet", "Ring", "Earring"],
            materialQuery: false,
            material: [],
            gemQuery: false,
            gem: []
        };
    }

    get getDefaultFilters() {
        return { ...this.defaultFilters };
    }

    // Helper to check if we're on client side
    isClient() {
        return typeof window !== 'undefined';
    }

    // Get current filters from sessionStorage
    getFilters() {
        if (!this.isClient()) return this.defaultFilters;
        
        try {
            const stored = sessionStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.defaultFilters;
        } catch (error) {
            console.warn('Failed to get filters from sessionStorage:', error);
            return this.defaultFilters;
        }
    }

    // Save filters to sessionStorage
    saveFilters(filters) {
        if (!this.isClient()) return;
        
        try {
            // Update query flags automatically
            filters.materialQuery = filters.material && filters.material.length > 0;
            filters.gemQuery = filters.gem && filters.gem.length > 0;
            
            sessionStorage.setItem(this.storageKey, JSON.stringify(filters));
        } catch (error) {
            console.warn('Failed to save filters to sessionStorage:', error);
        }
    }

    // Update specific filter and save
    updateFilter(key, value) {
        const currentFilters = this.getFilters();
        currentFilters[key] = value;
        this.saveFilters(currentFilters);
        return currentFilters;
    }

    // Reset to defaults
    resetFilters() {
        if (this.isClient()) {
            try {
                sessionStorage.removeItem(this.storageKey);
            } catch (error) {
                console.warn('Failed to clear filters from sessionStorage:', error);
            }
        }
        return { ...this.defaultFilters };
    }
}

export default FilterStorage;