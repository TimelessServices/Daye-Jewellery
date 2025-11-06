import { queryDB } from "@/utils/Database";

function parseLimit(searchParams, defaultLimit = 15, maxLimit = 15) {
    const limitParam = searchParams.get("limit");
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

        const deals = await queryDB(
            `WITH deal_items AS (
                SELECT
                    CollectionID,
                    COUNT(*) AS ItemCount,
                    SUM(Price) AS OriginalPrice,
                    SUM(EffectivePrice) AS TotalPrice
                FROM vw_CollectionItems
                GROUP BY CollectionID
            )
            SELECT
                d.CollectionID,
                c.Name,
                d.BuyQuantity,
                d.GetQuantity,
                d.ItemDiscount AS DealDiscount,
                COALESCE(di.ItemCount, 0) AS ItemCount,
                COALESCE(di.OriginalPrice, 0) AS OriginalPrice,
                COALESCE(di.TotalPrice, 0) AS TotalPrice
            FROM Deal d
            INNER JOIN Collections c ON c.CollectionID = d.CollectionID
            LEFT JOIN deal_items di ON di.CollectionID = d.CollectionID
            WHERE c.isActive = 1
            ORDER BY c.DateCreated DESC
            LIMIT ?`,
            [limit]
        );

        return Response.json({ success: true, results: deals });
    } catch (error) {
        console.error("Collections query failed:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
