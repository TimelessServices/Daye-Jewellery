import { useRef } from 'react';
import { X } from 'lucide-react';

import { CartContent } from './CartContent';
import { useCart } from '@/contexts/AppProvider';
import { useDropdowns } from '@/contexts/UIProvider';

export function CartDropdown({ isOpen, triggerRef }) {
    const { cartCount } = useCart();
    const { toggleDropdown } = useDropdowns();
    const dropdownRef = useRef(null);

    if (!isOpen) return null;

    return (
        <div ref={dropdownRef} className="absolute right-0 top-10 w-90 bg-white border 
            border-dark/10 rounded-lg shadow-lg z-500">
            
            <div className="h-16 flex justify-between items-center p-4 border-b border-dark/10">
                <h3 className="font-semibold text-dark">Shopping Cart ({cartCount})</h3>
                <button onClick={() => toggleDropdown('cart')} className="text-dark hover:text-red">
                    <X size={20} />
                </button>
            </div>

            <div className="h-96">
                <CartContent className="h-full p-4" />
            </div>
        </div>
    );
}