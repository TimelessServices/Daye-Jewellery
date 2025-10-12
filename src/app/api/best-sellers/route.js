import { queryDB } from "@/utils/Database";

export async function GET(request) {
    try {
        const query = `SELECT * FROM vw_BestSellers LIMIT 15`;
        const bestSellers = await queryDB(query);
        
        return Response.json({
            success: true,
            results: bestSellers
        });

    } catch (error) {
        console.error("Best sellers query failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
