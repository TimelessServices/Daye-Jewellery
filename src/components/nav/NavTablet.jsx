import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";

import { NavLink } from "./NavLink";
import { useMenu } from "@/contexts/MenuContext";       // Fixed import
import { CartIcon } from "./cart/CartIcon";
import { ContentSwitcher } from "./menu/ContentSwitcher"; // Updated import path
import { useDropdowns } from "@/contexts/UIProvider";
import { useFilters } from "@/contexts/FilterContext";
import { WishlistIcon } from "./wishlist/WishlistIcon";

export default function NavTablet() {
    const pathname = usePathname();
    const { closeAllDropdowns } = useDropdowns();

    const { menuState, toggleMenu, closeMenu } = useMenu();  // Use context state
    const { navigateWithFilters } = useFilters();
    
    const [query, setQuery] = useState("");

    useEffect(() => {
        setQuery("");
        closeAllDropdowns();
        closeMenu();
    }, [pathname, closeAllDropdowns, closeMenu]);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        await navigateWithFilters({ search: query.trim() }, true);
        setQuery("");
    };

    return (
        <nav className="flex px-8 py-4 justify-between items-center">
            {/* Logo */}
            <NavLink link="/" classes="shrink-0 text-xl font-semibold">
                <h1>DAYE JEWELLERY</h1>
            </NavLink>

            {/* Center: Search */}
            <form onSubmit={handleSearchSubmit} className="w-64 lg:w-96 flex items-center border-b border-dark/20">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search"
                    className="w-full py-2 outline-none placeholder:text-dark/50 text-sm" />
                <button type="submit"> <Search size={20} className="text-dark" /> </button>
            </form>

            {/* Right: Icons + Menu */}
            <div className="flex gap-8 items-center">
                <WishlistIcon size={24} />
                <CartIcon size={24} />
                <NavLink link="#" onClick={toggleMenu}>
                    {menuState.isOpen ? <X size={24} /> : <Menu size={24} />}
                </NavLink>
            </div>

            {/* Dropdown Menu */}
            {menuState.isOpen && (
                <div className="absolute top-20 left-0 right-0 bg-white border rounded-xl shadow-lg">
                    <div className="max-w-4xl mx-auto p-6">
                        <ContentSwitcher />  {/* No more prop drilling! */}
                    </div>
                </div>
            )}
        </nav>
    );
}