import { cachedFetch } from '@/utils/RequestCache';
import { runTransaction } from '@/utils/Database';
import { v4 as uuid } from 'uuid';

export async function POST(request) {
    const baseUrl = `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;
    console.log("-- Base URL: ", baseUrl);

    try {
        const { customer, shipping, items, totalAmount, paymentMethod, notes } = await request.json();

        // Validation
        if (!customer || !shipping || !items || items.length === 0) {
            return Response.json({
                success: false,
                error: "Missing required order data"
            }, { status: 400 });
        }

        // Prepare transaction operations
        const orderID = uuid();
        const operations = [];
        
        // 1. Create Order record
        operations.push({
            sql: `INSERT INTO Orders ( OrderID, CustomerEmail, FirstName, LastName, Phone, ShippingAddress, ShippingCity, 
                ShippingState, ShippingZip, TotalAmount ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
                orderID,
                customer.email,
                customer.firstName,
                customer.lastName,
                customer.phone,
                shipping.street,
                shipping.city,
                shipping.state,
                shipping.zip,
                totalAmount
            ],
            type: 'run'
        });

        console.log("[1] Creating Order...");
        await runTransaction([operations[0]]);

        // 2. Create OrderItems
        const itemOperations = [];
        const stockUpdates = [];
        
        for (const item of items) {
            itemOperations.push({
                sql: `INSERT INTO OrderItems ( OrderID, JewelleryID, Size, Quantity, EffectivePrice ) VALUES (?, ?, ?, ?, ?)`,
                params: [
                    orderID,
                    item.jewelleryId,
                    item.size,
                    item.quantity,
                    item.effectivePrice || item.price
                ],
                type: 'run'
            });

            // Prepare stock update
            stockUpdates.push({
                jewelleryId: item.jewelleryId,
                adjustment: -item.quantity,
                operation: 'sale'
            });
        }

        // Execute order items creation
        console.log("[2] Creating Order Items...");
        await runTransaction(itemOperations);

        // Update stock levels
        console.log("[3] Updating Stock...");
        const stockResult = await cachedFetch(`${baseUrl}/api/inventory/stock/bulk`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operations: stockUpdates })
        });

        let stockUpdated = false;
        if (stockResult.success) {
            stockUpdated = stockResult.success;
            console.log('Stock update result: ', stockResult);
        } else {
            console.error('Stock update failed: ', stockResult);
        }

        return Response.json({
            success: true,
            orderNumber: orderID,
            orderId: orderID,
            stockUpdated,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error("Order creation failed:", error);
        return Response.json({
            success: false,
            error: error.message || 'Order creation failed'
        }, { status: 500 });
    }
}