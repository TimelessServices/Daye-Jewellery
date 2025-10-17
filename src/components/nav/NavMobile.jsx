import { useEffect } from "react";
import { ChevronDown, Menu, User, X } from "lucide-react";

import { NavLink } from "./NavLink";
import { useMenu } from "@/contexts/MenuContext";      // Fixed import
import { CartIcon } from "./cart/CartIcon";
import { usePathname } from "next/navigation";
import { ContentSwitcher } from "./menu/ContentSwitcher"; // Updated import path
import { WishlistIcon } from "./wishlist/WishlistIcon";

export default function NavMobile() {
    const { menuState, toggleMenu, closeMenu, setContent } = useMenu();  // Use context state
    const pathname = usePathname();

    useEffect(() => {
        closeMenu();  // Reset all menu state on route change
    }, [pathname, closeMenu]);

    return (
        <nav className="flex p-4 gap-4 justify-between">
            <NavLink link="/" classes="shrink-0 text-lg font-semibold"> 
                <h1>DAYE JEWELLERY</h1> 
            </NavLink>
            <NavLink link="#" onClick={toggleMenu}>
                <Menu size={24} />
            </NavLink>

            {menuState.isOpen && (
                <div className="fixed h-full backdrop-blur-xs bg-dark/25 inset-0 z-[1000]">
                    <div className="h-full w-7/8 flex flex-col p-4 justify-between bg-white border-r-2 border-dark/25">
                        
                        <div className="w-full flex justify-between">  
                            <NavLink link="#" onClick={closeMenu}>
                                <X size={28} />
                            </NavLink>

                            <NavLink link="#" classes="flex items-center gap-1">
                                <p className="border-b-1 border-dark/50">AUD</p>
                                <ChevronDown size={20} />
                            </NavLink>
                        </div>

                        <div className="overflow-y-auto"> 
                            <ContentSwitcher />  {/* No more prop drilling! */}
                        </div>

                        <div className="flex gap-12 items-center justify-center">
                            <NavLink 
                                link="#" 
                                onClick={() => setContent("links-main")}
                                classes={menuState.content === "links-main" ? "text-blue" : ""}
                            > 
                                <Menu size={28} /> 
                            </NavLink>
                            <NavLink link="#"> 
                                <User size={28} /> 
                            </NavLink>

                            <WishlistIcon 
                                size={28} 
                                onClick={() => setContent("wishlist")}
                                classes={menuState.content === "wishlist" ? "text-blue" : ""} 
                            />

                            <CartIcon 
                                size={28} 
                                onClick={() => setContent("cart")}
                                classes={menuState.content === "cart" ? "text-blue" : ""} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}