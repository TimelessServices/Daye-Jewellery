import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";

import { NavLink } from "./NavLink";
import { useMenu } from "@/hooks/useMenu";
import { CartIcon } from "./cart/CartIcon";
import { ContentSwitcher } from "./ContentSwitcher";
import { useDropdowns } from "@/contexts/UIProvider";
import { useFilters } from "@/contexts/FilterContext";
import { WishlistIcon } from "./wishlist/WishlistIcon";

export default function NavTablet() {
    const pathname = usePathname();
    const { closeAllDropdowns } = useDropdowns();

    const { menuData } = useMenu();
    const { navigateWithFilters } = useFilters();
    
    const [query, setQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [content, setContent] = useState("links-main");
    const [currentSubmenu, setCurrentSubmenu] = useState(null);

    useEffect(() => {
        setQuery("");
        setIsMenuOpen(false);
        setContent("links-main");
        setCurrentSubmenu(null);
        closeAllDropdowns();
    }, [pathname]);

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
                <NavLink link="#" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </NavLink>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-20 left-0 right-0 bg-white border rounded-xl shadow-lg">
                    <div className="max-w-4xl mx-auto p-6">
                        <ContentSwitcher 
                            content={content}
                            menuData={menuData}
                            currentSubmenu={currentSubmenu}
                            onContentChange={setContent}
                            onSubmenuSelect={setCurrentSubmenu}
                            onMenuClose={() => setIsMenuOpen(false)}
                        />
                    </div>
                </div>
            )}
        </nav>
    );
}