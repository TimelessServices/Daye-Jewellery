import { queryDB } from "@/utils/Database";

export async function GET() {
    try {
        const collections = await queryDB('SELECT * FROM vw_CollectionsListSimple');
        
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