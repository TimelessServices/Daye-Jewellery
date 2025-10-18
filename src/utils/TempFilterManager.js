class TempFilterManager {
    constructor(initialFilters) {
        this.tempFilters = { ...initialFilters };
        this.originalFilters = { ...initialFilters };
        this.listeners = new Set();
    }

    // Subscribe to changes (returns unsubscribe function)
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Notify all listeners when temp filters change
    notify() {
        this.listeners.forEach(callback => callback(this.getTempFilters()));
    }

    // Get current temporary filters
    getTempFilters() {
        return { ...this.tempFilters };
    }

    // Update methods that notify listeners
    updateSearch(searchTerm) {
        this.tempFilters.search = searchTerm;
        this.notify();
    }

    updateSort(sortValue) {
        this.tempFilters.sort = sortValue;
        this.notify();
    }

    updatePrice(min, max) {
        this.tempFilters.price = { min, max };
        this.notify();
    }

    updateTypes(types) {
        this.tempFilters.types = types;
        this.notify();
    }

    updateOnSale(onSale) {
        this.tempFilters.onSale = onSale;
        this.notify();
    }

    updateMaterial(material) {
        this.tempFilters.material = material;
        this.tempFilters.materialQuery = material.length > 0;
        this.notify();
    }

    updateGem(gem) {
        this.tempFilters.gem = gem;
        this.tempFilters.gemQuery = gem.length > 0;
        this.notify();
    }

    // Get changes that need to be applied
    getChanges() {
        const changes = {};
        
        if (this.tempFilters.search !== this.originalFilters.search) {
            changes.search = this.tempFilters.search;
        }
        if (this.tempFilters.sort !== this.originalFilters.sort) {
            changes.sort = this.tempFilters.sort;
        }
        if (JSON.stringify(this.tempFilters.price) !== JSON.stringify(this.originalFilters.price)) {
            changes.price = this.tempFilters.price;
        }
        if (JSON.stringify(this.tempFilters.types) !== JSON.stringify(this.originalFilters.types)) {
            changes.types = this.tempFilters.types;
        }
        if (this.tempFilters.onSale !== this.originalFilters.onSale) {
            changes.onSale = this.tempFilters.onSale;
        }
        if (JSON.stringify(this.tempFilters.material) !== JSON.stringify(this.originalFilters.material)) {
            changes.material = this.tempFilters.material;
        }
        if (JSON.stringify(this.tempFilters.gem) !== JSON.stringify(this.originalFilters.gem)) {
            changes.gem = this.tempFilters.gem;
        }
        
        return changes;
    }

    // Check if there are any pending changes
    hasChanges() {
        return Object.keys(this.getChanges()).length > 0;
    }

    // Reset temporary filters to original
    reset() {
        this.tempFilters = { ...this.originalFilters };
        this.notify();
    }
}

export default TempFilterManager;