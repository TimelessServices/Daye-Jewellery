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
    const { cart, removeFromCart, cartCount, cartTotal, updateQuantity } = useCart();

    if (cart.length === 0) {
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
                {cart.map((cartItem, index) => {
                    if (cartItem.entryType === "item") {
                        return (
                            <CartItem 
                                key={`${cartItem.itemID}-${cartItem.size}-${index}`} 
                                item={cartItem}
                                onRemove={() => removeFromCart(cartItem.itemID, cartItem.size)}
                                onUpdateQuantity={(newQuantity) => updateQuantity(cartItem.itemID, cartItem.size, newQuantity)}
                            />
                        )
                    } 
                    else if (cartItem.entryType === "set") {
                        return (
                            <CartSet key={`set-${cartItem.collectionID}-${index}`} set={cartItem}
                                onRemove={() => removeFromCart({ entryType: "set", collectionID: cartItem.collectionID })} />
                        )
                    }
                    else if (cartItem.entryType === "deal") {
                        return (
                            <CartDeal key={`deal-${cartItem.collectionID}-${index}`} deal={cartItem}
                                onRemove={() => removeFromCart({ entryType: "deal", collectionID: cartItem.collectionID })} />
                        )
                    }
                })}
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