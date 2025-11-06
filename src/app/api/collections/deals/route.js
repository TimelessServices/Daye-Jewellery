import { queryDB } from "@/utils/Database";

function parseLimit(searchParams, defaultLimit = 15, maxLimit = 15) {
    const limitParam = searchParams.get('limit');
    const parsed = limitParam ? parseInt(limitParam, 10) : defaultLimit;
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return defaultLimit;
    }
    return Math.min(parsed, maxLimit);
}

function coerceNumber(...values) {
    for (const value of values) {
        if (value === undefined || value === null) continue;
        const parsed = typeof value === 'number' ? value : Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return null;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseLimit(searchParams);

        const deals = await queryDB(`SELECT * FROM vw_ActiveDeals LIMIT ${limit}`);

        const collectionIds = Array.from(new Set(
            deals
                .map((deal) => deal?.CollectionID ?? deal?.collectionId ?? deal?.collectionID)
                .filter((id) => id !== undefined && id !== null)
                .map((id) => String(id))
        ));

        let collectionMap = new Map();
        if (collectionIds.length > 0) {
            const placeholders = collectionIds.map(() => '?').join(',');
            const collectionRows = await queryDB(
                `SELECT CollectionID, Name, CollectionPrice, TotalPrice, SetPrice FROM vw_CollectionsList WHERE CollectionID IN (${placeholders})`,
                collectionIds
            );

            collectionMap = new Map(
                collectionRows.map((row) => [String(row.CollectionID), row])
            );
        }

        const normalizedDeals = deals.map((deal) => {
            const collectionIdRaw = deal?.CollectionID ?? deal?.collectionId ?? deal?.collectionID ?? null;
            const collectionKey = collectionIdRaw !== null && collectionIdRaw !== undefined
                ? String(collectionIdRaw)
                : null;
            const collectionInfo = collectionKey ? collectionMap.get(collectionKey) : undefined;
            const resolvedCollectionId = collectionIdRaw ?? collectionInfo?.CollectionID ?? null;

            const fallbackName = collectionInfo?.Name
                ?? collectionInfo?.CollectionName
                ?? null;
            const resolvedName = deal?.Name
                ?? deal?.collectionName
                ?? deal?.CollectionName
                ?? fallbackName
                ?? (resolvedCollectionId !== null ? `Deal ${resolvedCollectionId}` : 'Deal');

            const totalPrice = coerceNumber(
                deal?.totalPrice,
                deal?.TotalPrice,
                deal?.Price,
                deal?.price,
                deal?.DealPrice,
                deal?.dealPrice,
                collectionInfo?.CollectionPrice,
                collectionInfo?.TotalPrice,
                collectionInfo?.SetPrice
            );

            const buyQty = coerceNumber(
                deal?.BuyQty,
                deal?.BuyQuantity,
                deal?.buyQty,
                deal?.buyQuantity
            );

            const getQty = coerceNumber(
                deal?.GetQty,
                deal?.GetQuantity,
                deal?.getQty,
                deal?.getQuantity
            );

            const discount = coerceNumber(
                deal?.DealDiscount,
                deal?.Discount,
                deal?.dealDiscount
            );

            const normalized = { ...deal };
            if (resolvedCollectionId !== null) {
                normalized.CollectionID = resolvedCollectionId;
                normalized.collectionID = resolvedCollectionId;
                normalized.collectionId = resolvedCollectionId;
            }

            normalized.Name = resolvedName;
            normalized.name = resolvedName;
            normalized.collectionName = resolvedName;
            normalized.CollectionName = resolvedName;

            if (totalPrice !== null) {
                normalized.totalPrice = totalPrice;
                normalized.TotalPrice = totalPrice;
                normalized.Price = totalPrice;
                normalized.price = totalPrice;
                normalized.DealPrice = coerceNumber(deal?.DealPrice, deal?.dealPrice, totalPrice) ?? totalPrice;
            }

            if (buyQty !== null) {
                normalized.BuyQty = buyQty;
                normalized.buyQty = buyQty;
                normalized.BuyQuantity = buyQty;
                normalized.buyQuantity = buyQty;
            }

            if (getQty !== null) {
                normalized.GetQty = getQty;
                normalized.getQty = getQty;
                normalized.GetQuantity = getQty;
                normalized.getQuantity = getQty;
            }

            if (discount !== null) {
                normalized.DealDiscount = discount;
                normalized.Discount = discount;
                normalized.dealDiscount = discount;
            }

            return normalized;
        });

        return Response.json({ success: true, results: normalizedDeals });
    } catch (error) {
        console.error("Collections query failed:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}