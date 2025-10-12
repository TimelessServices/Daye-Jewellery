'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { useCart } from "@/contexts/AppProvider";
import { useToasts } from "@/contexts/UIProvider";
import ReviewItem from "@/components/checkout/ReviewItem";
import MultiSelect from "@/components/checkout/MultiSelect";

import CustomerView from "@/components/checkout/CustomerView";
import ShippingView from "@/components/checkout/ShippingView";
import CustomerDetails from "@/components/checkout/CustomerDetails";
import ShippingDetails from "@/components/checkout/ShippingDetails";

export default function Checkout() {
    const { addToast } = useToasts();

    const router = useRouter();
    const toShopNow = () => { router.push("/shop"); };

    const { cart, cartTotal } = useCart();
    const [notes, setNotes] = useState([]);

    const [customer, setCustomer] = useState({ firstName: "", lastName: "", email: "", phone: "" });
    const [shipping, setShipping] = useState({ street: "", city: "", country: "", state: "", zip: "" });

    const [customerValidated, setCustomerValidated] = useState(false);
    const [shippingValidated, setShippingValidated] = useState(false);

    const updateCustomerDetail = (name, value) => {
        let updated = { ...customer, [name]: value };
        setCustomer(updated);
    }

    const bulkUpdateCustomer = (updates) => {
        setCustomer(prev => ({ ...prev, ...updates }));
    }

    const updateShippingDetail = (name, value) => {
        let updated = { ...shipping, [name]: value };
		if (name === "country") updated.state = "";
        setShipping(updated);
    }

    const bulkUpdateShipping = (updates) => {
        setShipping(prev => ({ ...prev, ...updates }));
    }

    const handleEditCustomer = () => {
        setCustomerValidated(false);
        addToast({ message: "Customer details unlocked for editing", type: 'info' });
    };

    const handleEditShipping = () => {
        setShippingValidated(false);
        addToast({ message: "Shipping address unlocked for editing", type: 'info' });
    };

    function handleProceed() {
        if (!customerValidated || !shippingValidated) {
            addToast({ message: 'Please complete and confirm all details', type: 'error' });
            return;
        }

        // Save data to sessionStorage for payment page
        sessionStorage.setItem('checkout_customer', JSON.stringify(customer));
        sessionStorage.setItem('checkout_shipping', JSON.stringify(shipping));
        
        // Navigate to payment
        router.push('/payment');
    }

    return (
        <section className="max-w-3xl mx-auto py-10 px-4 gap-12 flex flex-col">
            <div className="border-b-2 border-dark">
                  <h1 className="text-3xl font-bold py-4 text-center">Checkout</h1>  
            </div>

            {/* Cart Review */}
            <section className="gap-4 p-4 bg-white flex flex-col rounded-lg shadow">
                <h2 className="text-xl font-semibold">Review Your Items</h2>

                <div className="divide-y">
                    {cart.length === 0 ? ( <div className="p-8 text-center text-dark/70">Your cart is empty.</div> ) : 
                        ( cart.map(item => ( <ReviewItem key={`${item.itemId}-${item.size}`} item={item} /> )) )}
                </div>
            </section>

            {/* Total */}
            <section className="w-3/4 lg:w-2/3 mx-auto flex justify-center text-center text-lg lg:text-xl">
                <span className="w-1/3 py-2 bg-dark text-white rounded-l-lg">Total</span>
                <span className="w-2/3 py-2 text-dark border-2 border-dark rounded-r-lg">${cartTotal.toFixed(2)}</span>
            </section>

            {/* Customer Details */}
            {customerValidated ? (
                <CustomerView customer={customer} onEdit={handleEditCustomer} />
            ) : (
                <CustomerDetails customer={customer} onChange={updateCustomerDetail} onValidation={setCustomerValidated}
                    onBulkUpdate={bulkUpdateCustomer} />
            )}

            {/* Shipping Details */}
            {shippingValidated ? (
                <ShippingView shipping={shipping} onEdit={handleEditShipping} />
            ) : (
                <ShippingDetails shipping={shipping} onChange={updateShippingDetail} onValidation={setShippingValidated}
                    onBulkUpdate={(bulkUpdateShipping)} />
            )}
            
            {/* Order Notes */}
            <MultiSelect title="Order Notes (optional)" storage={notes} onUpdate={setNotes} className="rounded-lg shadow">
                <p>Gift wrapping requested</p>
                <p>Include gift receipt</p>
                <p>Leave at door</p>
                <p>Call on arrival</p>
                <p>Ring doorbell on delivery</p>
            </MultiSelect>

            {/* Process */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Button text="Continue Shopping" onClick={toShopNow} />
                <Button text="Proceed to Payment" disabled={!customerValidated || !shippingValidated} onClick={handleProceed} />
            </section>
        </section>
    );
}