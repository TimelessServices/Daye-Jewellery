import { queryDB } from "@/utils/Database";

class JewelryQueryBuilder {
    constructor() {
        this.viewMap = {
            'Q1': 'vw_JewellerySimple',
            'Q2': 'vw_JewelleryWithMaterials', 
            'Q3': 'vw_JewelleryWithGems',
            'Q4': 'vw_JewelleryComplete'
        };
        
        this.typeMap = {
            'Ring': 'R', 'Necklace': 'N', 
            'Bracelet': 'B', 'Earring': 'E'
        };
    }

    getQueryType(filters) {
        if (filters.materialQuery && filters.gemQuery) return 'Q4';
        if (filters.materialQuery) return 'Q2';
        if (filters.gemQuery) return 'Q3';
        return 'Q1';
    }

    addMaterialGemFilters(whereConditions, params, filters) {
        // Material filtering
        if (filters.materialQuery && filters.material && filters.material.length > 0) {
            const materialConditions = [];
            
            filters.material.forEach(material => {
                // Build exact pattern matching
                const conditions = [`MaterialData LIKE ?`];
                let pattern = `%${material.type}|%`; // Match material type
                
                if (material.purity && material.color) {
                    // Both specified: "Gold|58|Yellow"
                    pattern = `%${material.type}|${material.purity}|${material.color}%`;
                } else if (material.purity) {
                    // Only purity: "Gold|58|%"
                    pattern = `%${material.type}|${material.purity}|%`;
                } else if (material.color) {
                    // Only color: "Gold|%|Yellow"
                    pattern = `%${material.type}|%|${material.color}%`;
                }
                // Else: just material type "Gold|%"
                
                materialConditions.push(`MaterialData LIKE ?`);
                params.push(pattern);
            });
            
            if (materialConditions.length > 0) {
                whereConditions.push(`(${materialConditions.join(' OR ')})`);
            }
        }

        // Gem filtering (similar pattern-based approach)
        if (filters.gemQuery && filters.gem && filters.gem.length > 0) {
            const gemConditions = [];
            
            filters.gem.forEach(gem => {
                let pattern = `%${gem.type}|%`; // Match gem type
                
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

    buildQuery(filters, limit = 20, offset = 0) {
        const queryType = this.getQueryType(filters);
        const viewName = this.viewMap[queryType];
        
        let query = `SELECT * FROM ${viewName}`;
        const whereConditions = [];
        const params = [];

        if (filters.search && filters.search.trim()) {
            whereConditions.push('Desc LIKE ?');
            params.push(`%${filters.search.trim()}%`);
        }

        if (filters.onSale) {
            whereConditions.push('SalePrice IS NOT NULL');
        }

        if (filters.price && filters.price.min > 0) {
            whereConditions.push('EffectivePrice >= ?');
            params.push(filters.price.min);
        }

        if (filters.price && filters.price.max < 5000) {
            whereConditions.push('EffectivePrice <= ?');
            params.push(filters.price.max);
        }

        if (filters.types && filters.types.length > 0 && filters.types.length < 4) {
            const typeCodes = filters.types.map(type => this.typeMap[type]).filter(Boolean);
            if (typeCodes.length > 0) {
                whereConditions.push(`Type IN (${typeCodes.map(() => '?').join(',')})`);
                params.push(...typeCodes);
            }
        }

        this.addMaterialGemFilters(whereConditions, params, filters);

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        if (filters.sort) {
            switch (filters.sort) {
                // Price-based sorting
                case 'price_asc': query += ' ORDER BY EffectivePrice ASC'; break;
                case 'price_desc': query += ' ORDER BY EffectivePrice DESC'; break;
                case 'biggest_discount': query += ' ORDER BY (Price - SalePrice) DESC, EffectivePrice ASC'; break;
                case 'best_value': query += ' ORDER BY (CASE WHEN SalePrice IS NOT NULL THEN (Price - SalePrice) / Price ELSE 0 END) DESC'; break;
                
                // Popularity & Sales-based sorting
                case 'bestsellers': query += ' ORDER BY AmountSold DESC, DateAdded DESC'; break;
                case 'trending': query += ' ORDER BY AmountSold DESC, (julianday("now") - julianday(DateAdded)) ASC'; break;
                case 'popular_in_stock': query += ' ORDER BY AmountSold DESC, InStock DESC'; break;
                case 'hidden_gems': query += ' ORDER BY AmountSold ASC, EffectivePrice ASC'; break; // Low sales, good price
                
                // Date-based sorting  
                case 'newest_first': query += ' ORDER BY DateAdded DESC'; break;
                case 'oldest_first': query += ' ORDER BY DateAdded ASC'; break;
                case 'new_arrivals': query += ' ORDER BY DateAdded DESC, AmountSold DESC'; break;
                
                // Availability & Inventory
                case 'in_stock_first': query += ' ORDER BY (InStock > 0) DESC, InStock DESC, EffectivePrice ASC'; break;
                case 'low_stock': query += ' ORDER BY InStock ASC, AmountSold DESC'; break;
                case 'last_chance': query += ' ORDER BY InStock ASC, DateAdded DESC'; break; // Low stock, newer items
                case 'well_stocked': query += ' ORDER BY InStock DESC, AmountSold ASC'; break;
                
                // Sales & Promotions
                case 'sale_first': query += ' ORDER BY (SalePrice IS NOT NULL) DESC, EffectivePrice ASC'; break;
                case 'sale_best_deals': query += ' ORDER BY (SalePrice IS NOT NULL) DESC, (Price - SalePrice) DESC'; break;
                case 'clearance': query += ' ORDER BY (SalePrice IS NOT NULL) DESC, InStock ASC, AmountSold ASC'; break;
                
                // Category-specific intelligent sorting
                case 'rings_popular': query += ' ORDER BY (Type = "R") DESC, AmountSold DESC'; break;
                case 'engagement_ready': query += ' ORDER BY (Type = "R" AND Desc LIKE "%engagement%") DESC, EffectivePrice DESC'; break;
                case 'gift_ready': query += ' ORDER BY AmountSold DESC, EffectivePrice ASC'; break;
                
                // Advanced combinations
                case 'smart_featured': query += ' ORDER BY (AmountSold * 0.4 + InStock * 0.3 + (CASE WHEN SalePrice IS NOT NULL THEN 20 ELSE 0 END)) DESC'; break;
                case 'editor_picks': query += ' ORDER BY (AmountSold BETWEEN 10 AND 50) DESC, EffectivePrice DESC'; break; // Moderate sales, quality items
                case 'budget_friendly': query += ' ORDER BY EffectivePrice ASC, AmountSold DESC'; break;
                case 'luxury_items': query += ' ORDER BY EffectivePrice DESC, AmountSold DESC'; break;
                
                // Name-based (keep originals)
                case 'name_asc': query += ' ORDER BY Desc ASC'; break;
                case 'name_desc': query += ' ORDER BY Desc DESC'; break;
                
                // Utility
                case 'random': query += ' ORDER BY RANDOM()'; break;
                case 'in_demand': query += ' ORDER BY InStock ASC, AmountSold DESC'; break; // Updated logic
                
                default: query += ' ORDER BY AmountSold DESC, DateAdded DESC'; // Better default
            }
        } else { 
            query += ' ORDER BY AmountSold DESC, DateAdded DESC'; // Better default than price
        }

        query += ` LIMIT ${limit} OFFSET ${offset}`;

        return { query, params, queryType, viewName };
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Parse filters from search params
        const filtersParam = searchParams.get('filters');
        const filters = filtersParam ? JSON.parse(filtersParam) : {};
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '20');

        const queryBuilder = new JewelryQueryBuilder();
        const offset = page * limit;
        const result = queryBuilder.buildQuery(filters, limit, offset);
        const data = await queryDB(result.query, result.params);
        
        return Response.json({
            success: true,
            filters: filters,
            queryType: result.queryType,
            page: page,
            limit: limit,
            resultCount: data.length,
            hasMore: data.length === limit,
            results: data
        });

    } catch (error) {
        console.error("Query failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}