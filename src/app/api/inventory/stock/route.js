import { queryOne, updateDB } from '@/utils/Database';

export async function PUT(request) {
    try {
        const body = await request.json();
        const { jewelleryId, adjustment, operation = 'adjustment' } = body;

        // Validation
        if (!jewelleryId || adjustment === undefined) {
            return Response.json({
                success: false,
                error: "jewelleryId and adjustment are required"
            }, { status: 400 });
        }

        if (!Number.isInteger(adjustment)) {
            return Response.json({
                success: false,
                error: "adjustment must be an integer"
            }, { status: 400 });
        }

        // Check current stock - using queryOne for single row
        const currentItem = await queryOne(
            'SELECT JewelleryID, Desc, InStock, AmountSold FROM Jewellery WHERE JewelleryID = ?',
            [jewelleryId]
        );

        if (!currentItem) {
            return Response.json({
                success: false,
                error: "Jewellery item not found"
            }, { status: 404 });
        }

        // Calculate new stock
        const newStock = currentItem.InStock + adjustment;
        if (newStock < 0) {
            return Response.json({
                success: false,
                error: `Insufficient stock. Current: ${currentItem.InStock}, Requested: ${Math.abs(adjustment)}`,
                currentStock: currentItem.InStock
            }, { status: 400 });
        }

        // Update stock - using updateDB
        let updateSql, updateParams;
        if (operation === 'sale' && adjustment < 0) {
            const soldQuantity = Math.abs(adjustment);
            updateSql = `
                UPDATE Jewellery 
                SET InStock = InStock + ?, AmountSold = AmountSold + ?
                WHERE JewelleryID = ?
            `;
            updateParams = [adjustment, soldQuantity, jewelleryId];
        } else {
            updateSql = `
                UPDATE Jewellery 
                SET InStock = InStock + ?
                WHERE JewelleryID = ?
            `;
            updateParams = [adjustment, jewelleryId];
        }

        const result = await updateDB(updateSql, updateParams);

        if (result.changes === 0) {
            return Response.json({
                success: false,
                error: "No changes made to inventory"
            }, { status: 400 });
        }

        // Get updated item
        const updatedItem = await queryOne(
            'SELECT JewelleryID, Desc, InStock, AmountSold FROM Jewellery WHERE JewelleryID = ?',
            [jewelleryId]
        );

        return Response.json({
            success: true,
            operation: operation,
            adjustment: adjustment,
            item: {
                jewelleryId: updatedItem.JewelleryID,
                description: updatedItem.Desc,
                previousStock: currentItem.InStock,
                currentStock: updatedItem.InStock,
                totalSold: updatedItem.AmountSold
            }
        });

    } catch (error) {
        console.error("Stock update failed:", error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}