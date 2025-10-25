import { queryDB } from "@/utils/Database";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const view = searchParams.get("view");

        const items = await queryDB(`SELECT * FROM vw_${view} LIMIT 15`);
        return Response.json({ success: true, results: items });
    } 
    catch (error) {
        console.error("Preview Query Failed:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}