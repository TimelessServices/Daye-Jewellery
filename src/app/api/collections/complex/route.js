import { queryDB } from "@/utils/Database";

function parseLimit(searchParams, defaultLimit = 15, maxLimit = 15) {
    const limitParam = searchParams.get('limit');
    const parsed = limitParam ? parseInt(limitParam, 10) : defaultLimit;
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return defaultLimit;
    }
    return Math.min(parsed, maxLimit);
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseLimit(searchParams);
        const collections = await queryDB(
            "SELECT * FROM vw_CollectionsList LIMIT ?",
            [limit]
        );

        return Response.json({
            success: true,
            results: collections
        });
    } catch (error) {
        console.error("Collections query failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
