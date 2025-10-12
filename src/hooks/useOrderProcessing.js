import { useState } from 'react';
import { useCart } from '@/contexts/AppProvider';
import { useToasts } from '@/contexts/UIProvider';

export function useOrderProcessing() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const { cart, cartTotal } = useCart();
    const { addToast } = useToasts();

    const processOrder = async (customerData, shippingData, paymentMethod = 'mock') => {
        if (isProcessing) return;

        if (cart.length === 0) {
            addToast({ message: 'Cart is empty', type: 'error' });
            return { success: false, error: 'Empty cart' };
        }

        setIsProcessing(true);
        
        try {
            const orderData = {
                customer: customerData,
                shipping: shippingData,
                items: cart.map(item => ({
                    jewelleryId: item.itemId,
                    size: item.size,
                    quantity: item.quantity,
                    effectivePrice: item.price
                })),
                totalAmount: cartTotal,
                paymentMethod
            };

            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Order creation failed');
            }

            setOrderResult(result);
            addToast({ message: 'Order placed successfully!', type: 'success' });

            return { success: true, ...result };

        } catch (error) {
            console.error('Order processing failed:', error);
            addToast({ message: 'Order failed. Please try again.', type: 'error' });
            return { success: false, error: error.message };
        } finally {
            setIsProcessing(false);
        }
    };

    const getOrderSummary = () => {
        return {
            items: cart,
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: cartTotal,
            tax: cartTotal * 0.10,
            shipping: cartTotal > 100 ? 0 : 15,
            total: cartTotal + (cartTotal * 0.10) + (cartTotal > 100 ? 0 : 15)
        };
    };

    return { processOrder, getOrderSummary, isProcessing, orderResult };
}