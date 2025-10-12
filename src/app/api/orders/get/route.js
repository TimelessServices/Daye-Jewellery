import { queryDB } from "@/utils/Database";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderID = searchParams.get("orderID");

        if (!orderID) {
            return Response.json({
                success: false,
                error: "OrderID is required"
            }, { status: 400 });
        }

        const query = "SELECT * FROM vw_OrderDetails WHERE OrderID = ?";
        const rows = await queryDB(query, [orderID]);

        if (!rows || rows.length === 0) {
            return Response.json({
                success: false,
                error: "Order not found"
            }, { status: 404 });
        }

        const orderHeader = {
            OrderID: rows[0].OrderID,
            Status: rows[0].Status,
            CustomerName: rows[0].CustomerName,
            CustomerEmail: rows[0].CustomerEmail,
            Phone: rows[0].Phone,
            ShippingAddress: rows[0].ShippingAddress,
            ShippingCity: rows[0].ShippingCity,
            ShippingState: rows[0].ShippingState,
            ShippingZip: rows[0].ShippingZip,
            TotalAmount: rows[0].TotalAmount,
            OrderDate: rows[0].OrderDate
        };
        
        const orderItems = rows.map(row => ({
            JewelleryID: row.JewelleryID,
            Size: row.Size,
            Quantity: row.Quantity,
            EffectivePrice: row.EffectivePrice,
            Type: row.Type,
            Desc: row.Desc,
            ImgPrimary: row.ImgPrimary,
            LineTotal: row.LineTotal
        }));

        return Response.json({ success: true, order: orderHeader, items: orderItems});
    }
    catch (error) {
        console.error("Order query failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}