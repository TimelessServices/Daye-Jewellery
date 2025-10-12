import { useState, useEffect } from "react";
import { ChevronDown, Menu, User, X } from "lucide-react";

import { NavLink } from "./NavLink";
import { useMenu } from "@/hooks/useMenu";
import { CartIcon } from "./cart/CartIcon";
import { usePathname } from "next/navigation";
import { ContentSwitcher } from "./ContentSwitcher";
import { WishlistIcon } from "./wishlist/WishlistIcon";

export default function NavMobile() {
    const { menuData } = useMenu();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState("links-main");
    const [currentSubmenu, setCurrentSubmenu] = useState(null);

    useEffect(() => {
        setIsOpen(false);
        setContent("links-main");
        setCurrentSubmenu(null);
    }, [pathname]);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="flex p-4 gap-4 justify-between">
            <NavLink link="/" classes="shrink-0 text-lg font-semibold"> 
                <h1>DAYE JEWELLERY</h1> 
            </NavLink>
            <NavLink link="#" onClick={toggleMenu}>
                <Menu size={24} />
            </NavLink>

            {isOpen && (
                <div className="fixed h-full backdrop-blur-xs bg-dark/25 inset-0 z-[1000]">
                    <div className="h-full w-7/8 flex flex-col p-4 justify-between bg-white border-r-2 border-dark/25">
                        
                        <div className="w-full flex justify-between">  
                            <NavLink link="#" onClick={toggleMenu}>
                                <X size={28} />
                            </NavLink>

                            <NavLink link="#" classes="flex items-center gap-1">
                                <p className="border-b-1 border-dark/50">AUD</p>
                                <ChevronDown size={20} />
                            </NavLink>
                        </div>

                        <div className="overflow-y-auto"> 
                            <ContentSwitcher 
                                content={content}
                                menuData={menuData}
                                currentSubmenu={currentSubmenu}
                                onContentChange={setContent}
                                onSubmenuSelect={setCurrentSubmenu}
                                onMenuClose={() => setIsOpen(false)}
                            />
                        </div>

                        <div className="flex gap-12 items-center justify-center">
                            <NavLink 
                                link="#" 
                                onClick={() => setContent("links-main")}
                                classes={content === "links-main" ? "text-blue" : ""}
                            > 
                                <Menu size={28} /> 
                            </NavLink>
                            <NavLink link="#"> 
                                <User size={28} /> 
                            </NavLink>

                            <WishlistIcon 
                                size={28} 
                                onClick={() => setContent("wishlist")}
                                classes={content === "wishlist" ? "text-blue" : ""} 
                            />

                            <CartIcon 
                                size={28} 
                                onClick={() => setContent("cart")}
                                classes={content === "cart" ? "text-blue" : ""} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}