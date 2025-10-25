import { memo } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/Button";
import { useCart } from "@/contexts/AppProvider";

import { CartSet } from "./CartSet";
import { CartItem } from "./CartItem";
import { CartDeal } from "./CartDeal";

export const CartContent = memo(function CartContent({ showTitle = false, className = "" }) {
    const router = useRouter();
    const toCheckout = () => { router.push("/checkout"); };
    const { cart, removeFromCart, cartCount, cartTotal, updateCartQuantity } = useCart();

    // Check if cart is empty by checking all object types
    const isEmpty =
        Object.keys(cart.single).length === 0 &&
        Object.keys(cart.set).length === 0 &&
        Object.keys(cart.deal).length === 0;

    if (isEmpty) {
        return (
            <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
                <ShoppingBag size={48} className="text-dark/70 mb-4" />
                <p className="text-dark/70">Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {showTitle && (
                <div className="pb-4 border-b border-dark/10">
                    <h2 className="text-xl font-semibold">Shopping Cart ({cartCount})</h2>
                </div>
            )}
            
            <div className="p-2 flex-1 overflow-y-auto divide-y divide-dark/10">
                {/* Render single items */}
                {Object.entries(cart.single).map(([key, item]) => (
                    <CartItem  key={`single-${key}`}  item={item} onRemove={() => removeFromCart('single', key)}
                        onUpdateQuantity={(newQuantity) => updateCartQuantity('single', key, newQuantity)} />
                ))}

                {/* Render sets */}
                {Object.entries(cart.set).map(([id, set]) => (
                    <CartSet key={`set-${id}`}  set={set} onRemove={() => removeFromCart('set', id)} />
                ))}

                {/* Render deals */}
                {Object.entries(cart.deal).map(([id, deal]) => (
                    <CartDeal key={`deal-${id}`}  deal={deal} onRemove={() => removeFromCart('deal', id)} />
                ))}
            </div>
            
            <div className="mt-2 pt-4 space-y-4 border-t-1 border-dark">
                <p className="text-center">
                    Total: <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </p>
                <Button text="Checkout" onClick={toCheckout} className="w-full" />
            </div>
        </div>
    );
});