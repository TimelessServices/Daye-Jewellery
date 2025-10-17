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

        const q1 = "SELECT * FROM vw_CollectionsList WHERE CollectionID = ?";
        const q2 = `SELECT * FROM vw_CollectionItems WHERE CollectionID = ?`;

        const collection = await queryDB(q1, [collectionID]);
        const collectionItems = await queryDB(q2, [collectionID]);
        
        return Response.json({
            success: true,
            collection: collection,
            items: collectionItems
        });

    } catch (error) {
        console.error("Collection items query failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}