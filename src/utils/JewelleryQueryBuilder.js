class JewelryQueryBuilder {
    constructor() {
        this.viewMap = {
            'Q1': 'vw_JewellerySimple',
            'Q2': 'vw_JewelleryWithMaterials', 
            'Q3': 'vw_JewelleryWithGems',
            'Q4': 'vw_JewelleryComplete'
        };
        
        this.typeMap = {
            'Ring': 'R', 
            'Necklace': 'N', 
            'Bracelet': 'B', 
            'Earring': 'E'
        };
    }

    getQueryType(filters) {
        if (filters.materialQuery && filters.gemQuery) return 'Q4';
        if (filters.materialQuery) return 'Q2';
        if (filters.gemQuery) return 'Q3';
        return 'Q1';
    }

    addSearchFilter(whereConditions, params, filters) {
        if (filters.search && filters.search.trim()) {
            whereConditions.push('Desc LIKE ?');
            params.push(`%${filters.search.trim()}%`);
        }
    }

    addPriceFilter(whereConditions, params, filters) {
        if (filters.price && filters.price.min > 0) {
            whereConditions.push('Price >= ?');
            params.push(filters.price.min);
        }

        if (filters.price && filters.price.max < 5000) {
            whereConditions.push('Price <= ?');
            params.push(filters.price.max);
        }
    }

    addTypeFilter(whereConditions, params, filters) {
        if (filters.types && filters.types.length > 0 && filters.types.length < 4) {
            const typeCodes = filters.types.map(type => this.typeMap[type]).filter(Boolean);
            if (typeCodes.length > 0) {
                whereConditions.push(`Type IN (${typeCodes.map(() => '?').join(',')})`);
                params.push(...typeCodes);
            }
        }
    }

    addMaterialFilter(whereConditions, params, filters) {
        if (filters.materialQuery && filters.material && filters.material.length > 0) {
            const materialConditions = [];
            
            filters.material.forEach(material => {
                let pattern = `%${material.type}|%`;
                
                if (material.purity && material.color) {
                    pattern = `%${material.type}|${material.purity}|${material.color}%`;
                } else if (material.purity) {
                    pattern = `%${material.type}|${material.purity}|%`;
                } else if (material.color) {
                    pattern = `%${material.type}|%|${material.color}%`;
                }
                
                materialConditions.push(`MaterialData LIKE ?`);
                params.push(pattern);
            });
            
            if (materialConditions.length > 0) {
                whereConditions.push(`(${materialConditions.join(' OR ')})`);
            }
        }
    }

    addGemFilter(whereConditions, params, filters) {
        if (filters.gemQuery && filters.gem && filters.gem.length > 0) {
            const gemConditions = [];
            
            filters.gem.forEach(gem => {
                let pattern = `%${gem.type}|%`;
                
                if (gem.cut && gem.clarity) {
                    pattern = `%${gem.type}|${gem.cut}|${gem.clarity}%`;
                } else if (gem.cut) {
                    pattern = `%${gem.type}|${gem.cut}|%`;
                } else if (gem.clarity) {
                    pattern = `%${gem.type}|%|${gem.clarity}%`;
                }
                
                gemConditions.push(`GemData LIKE ?`);
                params.push(pattern);
            });
            
            if (gemConditions.length > 0) {
                whereConditions.push(`(${gemConditions.join(' OR ')})`);
            }
        }
    }

    getSortClause(sortValue) {
        switch (sortValue) {
            // Price sorting
            case 'price_asc': 
                return 'ORDER BY Price ASC';
            case 'price_desc': 
                return 'ORDER BY Price DESC';
            
            // Popularity sorting
            case 'bestsellers': 
                return 'ORDER BY AmountSold DESC, DateAdded DESC';
            case 'trending': 
                return 'ORDER BY AmountSold DESC, DateAdded DESC';
            case 'popular_in_stock': 
                return 'ORDER BY AmountSold DESC, InStock DESC';
            case 'hidden_gems': 
                return 'ORDER BY AmountSold ASC, Price ASC';
            
            // Date sorting
            case 'newest_first': 
                return 'ORDER BY DateAdded DESC';
            case 'oldest_first': 
                return 'ORDER BY DateAdded ASC';
            case 'new_arrivals': 
                return 'ORDER BY DateAdded DESC, AmountSold DESC';
            
            // Availability sorting
            case 'in_stock_first': 
                return 'ORDER BY (InStock > 0) DESC, InStock DESC, Price ASC';
            case 'low_stock': 
                return 'ORDER BY InStock ASC, AmountSold DESC';
            case 'last_chance': 
                return 'ORDER BY InStock ASC, DateAdded DESC';
            
            // Category-specific sorting
            case 'engagement_ready': 
                return 'ORDER BY (Type = "R" AND Desc LIKE "%engagement%") DESC, Price DESC';
            case 'gift_ready': 
                return 'ORDER BY AmountSold DESC, Price ASC';
            case 'budget_friendly': 
                return 'ORDER BY Price ASC, AmountSold DESC';
            case 'luxury_items': 
                return 'ORDER BY Price DESC, AmountSold DESC';
            
            // Advanced sorting
            case 'smart_featured': 
                return 'ORDER BY (AmountSold * 0.4 + InStock * 0.3) DESC';
            case 'editor_picks': 
                return 'ORDER BY (AmountSold BETWEEN 10 AND 50) DESC, Price DESC';
            
            // Name sorting
            case 'name_asc': 
                return 'ORDER BY Desc ASC';
            case 'name_desc': 
                return 'ORDER BY Desc DESC';
            
            // Utility
            case 'random': 
                return 'ORDER BY RANDOM()';
            
            // TODO: Sale-related sorting (will be implemented via collections)
            case 'biggest_discount':
            case 'best_value':
            case 'sale_first':
            case 'sale_best_deals':
            case 'clearance':
                return 'ORDER BY AmountSold DESC, DateAdded DESC'; // Fallback
            
            default: 
                return 'ORDER BY AmountSold DESC, DateAdded DESC';
        }
    }

    buildQuery(filters, limit = 20, offset = 0) {
        const queryType = this.getQueryType(filters);
        const viewName = this.viewMap[queryType];
        
        let query = `SELECT * FROM ${viewName}`;
        const whereConditions = [];
        const params = [];

        // Add filters
        this.addSearchFilter(whereConditions, params, filters);
        this.addPriceFilter(whereConditions, params, filters);
        this.addTypeFilter(whereConditions, params, filters);
        this.addMaterialFilter(whereConditions, params, filters);
        this.addGemFilter(whereConditions, params, filters);

        // TODO: Sale filtering will be implemented via collections
        // if (filters.onSale) {
        //     // Will be handled through collections relationship
        // }

        // Build WHERE clause
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Add sorting
        query += ' ' + this.getSortClause(filters.sort);

        // Add pagination
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        return { query, params, queryType, viewName };
    }
}

export default JewelryQueryBuilder;