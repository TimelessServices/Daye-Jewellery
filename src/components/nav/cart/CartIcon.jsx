import { useRef } from 'react';
import { ShoppingBag } from 'lucide-react';

import { NavLink } from '../NavLink';
import { CartDropdown } from './CartDropdown';
import { useCart } from '@/contexts/AppProvider';
import { useDropdowns } from '@/contexts/UIProvider';

export function CartIcon({ size = 24, onClick = null, classes = "" }) {
    const { cartCount } = useCart();
    const { dropdowns, toggleDropdown } = useDropdowns();
    const triggerRef = useRef(null);
    const isOpen = dropdowns.cart;

    return (
        <div className="relative">            
            <NavLink link="#" onClick={onClick || (() => toggleDropdown('cart'))} ref={triggerRef} classes={classes}> 
                <ShoppingBag size={size} className="animate hover:text-blue" /> 

                {cartCount > 0 && (
                    <span className="absolute -top-3 -right-2 bg-red text-white text-xs font-bold rounded-full p-1 
                        flex items-center justify-center min-w-[20px]"> {cartCount > 99 ? '99+' : cartCount} </span>
                )}
            </NavLink>

            {onClick ? <></> : <CartDropdown isOpen={isOpen} triggerRef={triggerRef} />}
        </div>
    );
}