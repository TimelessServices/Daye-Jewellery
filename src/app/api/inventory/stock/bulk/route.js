import { runTransaction } from '@/utils/Database';

export async function PUT(request) {
    try {
        const body = await request.json();
        const { operations } = body;

        // Validation
        if (!operations || !Array.isArray(operations) || operations.length === 0) {
            return Response.json({
                success: false,
                error: "operations array is required and must not be empty"
            }, { status: 400 });
        }

        if (operations.length > 100) {
            return Response.json({
                success: false,
                error: "Maximum 100 operations per batch"
            }, { status: 400 });
        }

        // Validate each operation
        for (let i = 0; i < operations.length; i++) {
            const op = operations[i];
            
            if (!op.jewelleryId || op.adjustment === undefined) {
                return Response.json({
                    success: false,
                    error: `Operation ${i}: jewelleryId and adjustment are required`
                }, { status: 400 });
            }
            
            if (!Number.isInteger(op.adjustment)) {
                return Response.json({
                    success: false,
                    error: `Operation ${i}: adjustment must be an integer`
                }, { status: 400 });
            }

            // Optional: Validate jewelleryId format (UUID)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(op.jewelleryId)) {
                return Response.json({
                    success: false,
                    error: `Operation ${i}: invalid jewelleryId format`
                }, { status: 400 });
            }

            // Optional: Validate operation type if provided
            if (op.operation && !['intake', 'sale', 'adjustment'].includes(op.operation)) {
                return Response.json({
                    success: false,
                    error: `Operation ${i}: operation must be 'intake', 'sale', or 'adjustment'`
                }, { status: 400 });
            }
        }

        // Prepare transaction operations
        const dbOperations = [];
        
        operations.forEach((op, index) => {
            const { jewelleryId, adjustment, operation = 'adjustment' } = op;
            
            // First check current stock for each item
            dbOperations.push({
                sql: 'SELECT JewelleryID, Desc, InStock, AmountSold FROM Jewellery WHERE JewelleryID = ?',
                params: [jewelleryId],
                type: 'get',
                operationIndex: index
            });
            
            // Build update query based on operation type
            if (operation === 'sale' && adjustment < 0) {
                const soldQuantity = Math.abs(adjustment);
                dbOperations.push({
                    sql: `
                        UPDATE Jewellery 
                        SET InStock = InStock + ?, AmountSold = AmountSold + ? 
                        WHERE JewelleryID = ? AND InStock >= ?
                    `,
                    params: [adjustment, soldQuantity, jewelleryId, soldQuantity],
                    type: 'run',
                    operationIndex: index,
                    operation: operation
                });
            } else {
                const minStock = adjustment < 0 ? Math.abs(adjustment) : 0;
                dbOperations.push({
                    sql: `
                        UPDATE Jewellery 
                        SET InStock = InStock + ? 
                        WHERE JewelleryID = ? AND InStock >= ?
                    `,
                    params: [adjustment, jewelleryId, minStock],
                    type: 'run',
                    operationIndex: index,
                    operation: operation
                });
            }
        });

        const results = await runTransaction(dbOperations);

        // Process results to match our expected format
        const processedResults = [];
        for (let i = 0; i < operations.length; i++) {
            const checkResult = results[i * 2]; // Check queries are at even indices
            const updateResult = results[i * 2 + 1]; // Update queries are at odd indices
            
            if (checkResult && updateResult && updateResult.changes > 0) {
                processedResults.push({
                    index: i,
                    jewelleryId: operations[i].jewelleryId,
                    description: checkResult.Desc,
                    previousStock: checkResult.InStock,
                    currentStock: checkResult.InStock + operations[i].adjustment,
                    adjustment: operations[i].adjustment,
                    operation: operations[i].operation || 'adjustment'
                });
            }
        }

        return Response.json({
            success: true,
            processedCount: processedResults.length,
            totalRequested: operations.length,
            results: processedResults
        });

    } catch (error) {
        if (error.errors) {
            // Transaction rolled back due to validation errors
            return Response.json({
                success: false,
                error: "Bulk operation failed - no changes made",
                failedOperations: error.errors,
                totalRequested: operations?.length || 0
            }, { status: 400 });
        }

        console.error("Bulk stock update failed:", error);
        return Response.json({
            success: false,
            error: error.message || "Bulk operation failed"
        }, { status: 500 });
    }
}