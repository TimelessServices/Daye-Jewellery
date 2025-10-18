export class JewelleryItem {
    constructor(rawData, queryType) {
        // Copy all base properties
        Object.assign(this, rawData);
        
        // Parse pipe-delimited data based on query type
        this.materials = queryType === 'Q1' || queryType === 'Q3' ? [] : 
                        MaterialParser.parse(rawData.MaterialData);
        
        this.gems = queryType === 'Q1' || queryType === 'Q2' ? [] : 
                   GemParser.parse(rawData.GemData);
        
        // Parse pricing options
        this.pricing = new PricingInfo(rawData);
        
        // Clean up raw pipe-delimited fields (optional)
        delete this.MaterialData;
        delete this.GemData;
    }
    
    // Utility methods
    get isOnSale() { return this.OnSale === 1; }
    get hasDiscount() { return this.DiscountPercent > 0; }
    get inStock() { return this.InStock > 0; }
}

export class PricingInfo {
    constructor(rawData) {
        this.basePrice = rawData.Price;
        this.salePrice = rawData.BestSalePrice;
        this.effectivePrice = rawData.EffectivePrice;
        this.discountPercent = rawData.DiscountPercent || 0;
        
        // Parse options
        this.setOptions = SetOptionsParser.parse(rawData.SetOptions);
        this.dealOptions = DealOptionsParser.parse(rawData.DealOptions);
    }
    
    get savings() { 
        return this.salePrice ? this.basePrice - this.salePrice : 0; 
    }
}

// Lightweight parsers
export class MaterialParser {
    static parse(materialData) {
        if (!materialData) return [];
        
        return materialData.split(',').map(item => {
            const [type, purity, color] = item.split('|');
            return { type, purity: purity || null, color: color || null };
        });
    }
}

export class GemParser {
    static parse(gemData) {
        if (!gemData) return [];
        
        return gemData.split(',').map(item => {
            const [type, cut, clarity] = item.split('|');
            return { type, cut: cut || null, clarity: clarity || null };
        });
    }
}

export class SetOptionsParser {
    static parse(setOptions) {
        if (!setOptions) return [];
        
        return setOptions.split(',').map(option => {
            const [collectionId, name, totalPrice] = option.split(':');
            return { 
                collectionId, 
                name, 
                totalPrice: parseFloat(totalPrice) 
            };
        });
    }
}

export class DealOptionsParser {
    static parse(dealOptions) {
        if (!dealOptions) return [];
        
        return dealOptions.split(',').map(option => {
            const [collectionId, deal] = option.split(':');
            const [quantities, discount] = deal.split('@');
            const [buyQty, getQty] = quantities.split('x');
            
            return {
                collectionId,
                buyQuantity: parseInt(buyQty),
                getQuantity: parseInt(getQty),
                discountPercent: parseFloat(discount.replace('%', ''))
            };
        });
    }
}
