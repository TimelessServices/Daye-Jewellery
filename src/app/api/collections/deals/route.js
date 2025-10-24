import { queryDB } from "@/utils/Database";

export async function GET() {
    try {
        const deals = await queryDB("SELECR * FROM vw_ActiveDeals");  
        return Response.json({ success: true, results: deals });
    } catch (error) {
        console.error("Collections query failed:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}