import { useRef } from 'react';
import { X } from 'lucide-react';

import { WishlistContent } from './WishlistContent';
import { useWishlist } from '@/contexts/AppProvider';
import { useDropdowns } from '@/contexts/UIProvider';

export function WishlistDropdown({ isOpen, triggerRef }) {
    const { wishlistCount } = useWishlist();
    const { toggleDropdown } = useDropdowns();
    const dropdownRef = useRef(null);

    if (!isOpen) return null;

    return (
        <div ref={dropdownRef} className="absolute right-0 top-10 w-90 bg-white border 
            border-dark/10 rounded-lg shadow-lg z-500">
            
            <div className="h-16 flex justify-between items-center p-4 border-b border-dark/10">
                <h3 className="font-semibold text-dark">Wishlist ({wishlistCount})</h3>
                <button onClick={() => toggleDropdown('wishlist')} className="text-dark hover:text-red">
                    <X size={20} />
                </button>
            </div>

            <div className="h-96">
                <WishlistContent className="h-full px-4 py-2" />
            </div>
        </div>
    );
}