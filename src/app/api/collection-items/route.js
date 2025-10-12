import { queryDB } from "@/utils/Database";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const collectionID = searchParams.get('collectionID');
        
        if (!collectionID) {
            return Response.json({
                success: false,
                error: "CollectionID is required"
            }, { status: 400 });
        }
        
        const query = `SELECT * FROM vw_CollectionItems WHERE CollectionID = ?`;
        const collectionItems = await queryDB(query, [collectionID]);
        
        return Response.json({
            success: true,
            collectionID: collectionID,
            resultCount: collectionItems.length,
            results: collectionItems
        });

    } catch (error) {
        console.error("Collection items query failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}