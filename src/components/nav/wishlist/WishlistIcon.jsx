import { useRef } from 'react';
import { Heart } from 'lucide-react';

import { NavLink } from '../NavLink';
import { WishlistDropdown } from './WishlistDropdown';
import { useWishlist } from '@/contexts/AppProvider';
import { useDropdowns } from '@/contexts/UIProvider';

export function WishlistIcon({ size = 24, onClick = null, classes = "" }) {
    const { wishlistCount } = useWishlist();
    const { dropdowns, toggleDropdown } = useDropdowns();
    const triggerRef = useRef(null);
    const isOpen = dropdowns.wishlist;

    return (
        <div className="relative">            
            <NavLink link="#" onClick={onClick || (() => toggleDropdown('wishlist'))} ref={triggerRef} classes={classes}> 
                <Heart size={size} className="animate hover:text-blue" /> 

                {wishlistCount > 0 && (
                    <span className="absolute -top-3 -right-2 bg-red text-white text-xs font-bold rounded-full p-1 
                        flex items-center justify-center min-w-[20px]"> 
                        {wishlistCount > 99 ? '99+' : wishlistCount} 
                    </span>
                )}
            </NavLink>

            {onClick ? <></> : <WishlistDropdown isOpen={isOpen} triggerRef={triggerRef} />}
        </div>
    );
}