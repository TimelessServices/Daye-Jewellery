'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/Button';
import { useCart } from '@/contexts/AppProvider';
import { useToasts } from '@/contexts/UIProvider';
import { useOrderProcessing } from '@/hooks/useOrderProcessing';

export default function Payment() {
    const router = useRouter();
    const { cart, cartCount, clearCart } = useCart();
    const { addToast } = useToasts();
    const { processOrder, getOrderSummary, isProcessing } = useOrderProcessing();
    
    const [customerData, setCustomerData] = useState(null);
    const [shippingData, setShippingData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    
    const [movingToSuccess, setMovingToSuccess] = useState(false);  
    const [hasShownError, setHasShownError] = useState(false);  
    const orderSummary = getOrderSummary();
    const summaryItems = orderSummary.items || [];

    useEffect(() => {
        if (hasShownError || movingToSuccess) return;

        if (cartCount === 0) {
            addToast({ message: 'Your cart is empty', type: 'error' });
            setHasShownError(true);
            router.push('/shop');
            return;
        }

        const savedCustomer = sessionStorage.getItem('checkout_customer');
        const savedShipping = sessionStorage.getItem('checkout_shipping');
        
        if (!savedCustomer || !savedShipping) {
            addToast({ message: 'Please complete checkout first', type: 'error' });
            setHasShownError(true);
            router.push('/checkout');
            return;
        }

        try {
            setCustomerData(JSON.parse(savedCustomer));
            setShippingData(JSON.parse(savedShipping));
        } catch (error) {
            console.error('Error parsing checkout data:', error);
            addToast({ message: 'Invalid checkout data', type: 'error' });
            setHasShownError(true);
            router.push('/checkout');
        }
    }, [cartCount, router, addToast, hasShownError, movingToSuccess]);

    const handlePayment = async () => {
        if (!customerData || !shippingData || movingToSuccess) return;
        setMovingToSuccess(true);

        const result = await processOrder(customerData, shippingData, paymentMethod);
        
        if (result.success) {
            clearCart();
            sessionStorage.removeItem('checkout_customer');
            sessionStorage.removeItem('checkout_shipping');
            
            if (result.orderNumber) {
                try { 
                    console.log("-- Navigating to:", `/order/${result.orderNumber}`);
                    router.push(`/order/${result.orderNumber}`); 
                } catch (error) { 
                    console.error('Router push failed', error); 
                }
            } else {
                console.error("-- No orderNumber in result!");
                addToast({ message: 'Order Created. Navigation Failed', type: 'warning' });
            }
        } else {
            console.log("-- Something went wrong");
            setMovingToSuccess(false);
        }
    };

    if (!customerData || !shippingData) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4">
                <div className="text-center">Loading payment page...</div>
            </div>
        );
    }

    return (
        <section className="max-w-4xl mx-auto py-10 px-4 gap-8 flex flex-col">
            <div className="border-b-2 border-dark">
                <h1 className="text-3xl font-bold py-4 text-center">Complete Your Order</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                    
                    {/* Items */}
                    <div className="space-y-3 mb-6">
                        {summaryItems.length === 0 ? (
                            <div className="text-sm text-gray-600">Your cart is empty.</div>
                        ) : (
                            summaryItems.map((entry) => (
                                <div key={entry.key} className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{entry.label}</div>
                                        <div className="text-sm text-gray-600 space-y-0.5">
                                            <div>{entry.subtitle || `Size: ${entry.size}`}</div>
                                            <div>Qty: {entry.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="font-medium">
                                        ${entry.totalPrice.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal ({orderSummary.itemCount} items)</span>
                            <span>${orderSummary.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>${orderSummary.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{orderSummary.shipping === 0 ? 'FREE' : `$${orderSummary.shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold border-t pt-2">
                            <span>Total</span>
                            <span>${orderSummary.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-6">
                    {/* Customer Info Review */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Customer Information</h3>
                        <div className="text-sm space-y-1">
                            <div>{customerData.firstName} {customerData.lastName}</div>
                            <div>{customerData.email}</div>
                            {customerData.phone && <div>{customerData.phone}</div>}
                        </div>
                    </div>

                    {/* Shipping Info Review */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                        <div className="text-sm space-y-1">
                            <div>{shippingData.street}</div>
                            <div>{shippingData.city}, {shippingData.state} {shippingData.zip}</div>
                        </div>
                    </div>

                    {/* Mock Payment Methods */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="credit-card"
                                    checked={paymentMethod === 'credit-card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span>Credit Card (Mock)</span>
                            </label>
                            
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="paypal"
                                    checked={paymentMethod === 'paypal'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span>PayPal (Mock)</span>
                            </label>
                        </div>

                        {/* Mock Payment Form */}
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                <strong>Mock Payment:</strong> This is a demonstration. No actual payment will be processed.
                                Click "Complete Order" to simulate a successful payment.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4">
                        <Button text={isProcessing ? "Processing Order..." : "Complete Order"} onClick={handlePayment}
                            disabled={isProcessing} />
                        
                        <Button text="Back to Checkout" onClick={() => router.push('/checkout')}
                            disabled={isProcessing} />
                    </div>
                </div>
            </div>
        </section>
    );
}