import { queryDB } from "@/utils/Database";
import JewelryQueryBuilder from "@/utils/JewelleryQueryBuilder";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const filtersParam = searchParams.get('filters');
        const filters = filtersParam ? JSON.parse(filtersParam) : {};
        const page = parseInt(searchParams.get('page') || '0');
        const limit = parseInt(searchParams.get('limit') || '20');

        const queryBuilder = new JewelryQueryBuilder();
        const offset = page * limit;
        const result = queryBuilder.buildQuery(filters, limit, offset);
        const items = await queryDB(result.query, result.params);
        
        return Response.json({
            success: true,
            filters: filters,
            queryType: result.queryType,
            page: page,
            limit: limit,
            resultCount: items.length,
            hasMore: items.length === limit,
            results: items
        });

    } catch (error) {
        console.error("Query failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}