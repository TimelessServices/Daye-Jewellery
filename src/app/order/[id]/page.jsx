'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/Button';
import { cachedFetch } from '@/utils/RequestCache';
import ReviewItem from '@/components/checkout/ReviewItem';

function statusColor(status) {
    switch (status) {
        case "pending": return "bg-orange/15 text-orange";
        case "processing": return "bg-blue/15 text-blue"; 
        case "shipped": return "bg-purple/15 text-purple";
        case "delivered": return "bg-green/15 text-green";
        case "cancelled": return "bg-red/15 text-red";
        default: return "bg-blue/15 text-blue";
    }
}

export default function Order() {
    const router = useRouter();
    const params = useParams();
    const orderNumber = params.id;
    
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const params = new URLSearchParams({ orderID: orderNumber });
                const data = await cachedFetch(`/api/orders/get?${params}`);
                setOrderData(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderNumber]);

    if (loading) return <div className="section"><div>Loading order...</div></div>;
    if (!orderData || !orderData.success) return <div className="section"><div>Order not found</div></div>;

    const { order, items } = orderData;

    // Map API data to ReviewItem expected format
    const mappedItems = items.map(item => ({
        type: item.Type,
        desc: item.Desc,
        size: item.Size,
        quantity: item.Quantity,
        price: parseFloat(item.EffectivePrice)
    }));

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="section">
                <h1 className="text-2xl font-title">Order Details</h1>
                <p className="text-lg font-medium">#{orderNumber.slice(-8)}</p>
                <div className={`px-4 py-2 rounded ${statusColor(order.Status)}`}>
                    {order.Status.charAt(0).toUpperCase() + order.Status.slice(1)}
                </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded p-6 border border-light">
                    <h3 className="font-medium mb-4">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                        <p><span className="text-dark/70">Name:</span> {order.CustomerName}</p>
                        <p><span className="text-dark/70">Email:</span> {order.CustomerEmail}</p>
                        <p><span className="text-dark/70">Phone:</span> {order.Phone}</p>
                    </div>
                </div>

                <div className="bg-white shadow rounded p-6 border border-light">
                    <h3 className="font-medium mb-4">Shipping Address</h3>
                    <div className="text-sm">
                        <p>{order.ShippingAddress}</p>
                        <p>{order.ShippingCity}, {order.ShippingState} {order.ShippingZip}</p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white shadow rounded p-6 border border-light">
                <h3 className="font-medium mb-4">Order Items ({items.length})</h3>
                <div className="divide-y divide-light">
                    {mappedItems.map((item, index) => (
                        <ReviewItem key={index} item={item} />
                    ))}
                </div>
            </div>

            {/* Order Total */}
            <div className="md:w-2/3 mx-auto flex justify-center text-center text-lg lg:text-xl">
                <span className="w-1/3 py-2 bg-dark text-white rounded-l-lg">Order Total</span>
                <span className="w-2/3 py-2 text-dark border-2 border-dark rounded-r-lg">${parseFloat(order.TotalAmount).toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="gap-4 flex flex-col md:flex-row">
                <Button text="Continue Shopping" onClick={() => router.push("/shop")} />
                <Button text="Back to Home" onClick={() => router.push("/")} />
            </div>
        </div>
    );
}