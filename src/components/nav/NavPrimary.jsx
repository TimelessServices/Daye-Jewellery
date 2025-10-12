import { useState, useEffect } from "react";
import { Search, User, ChevronDown } from "lucide-react";

import { NavLink } from "./NavLink";
import { MenuItem } from "./MenuItem";
import { useMenu } from "@/hooks/useMenu";
import { CartIcon } from "./cart/CartIcon";
import { MenuDropdown } from "./MenuDropdown";
import { usePathname } from "next/navigation";
import { useFilters } from "@/contexts/FilterContext";
import { WishlistIcon } from "./wishlist/WishlistIcon";
import { useDropdowns, useLoading, useToasts } from "@/contexts/UIProvider";

export default function NavPrimary() {
    const pathname = usePathname();
    const [query, setQuery] = useState("");
    const { navigateWithFilters } = useFilters();

    const { dropdowns, toggleDropdown, closeAllDropdowns } = useDropdowns();
    const { loading, setLoading } = useLoading();
    const { addToast } = useToasts();
    const { menuData, loading: menuLoading, error } = useMenu();

    useEffect(() => {
        setQuery("");
        closeAllDropdowns();
    }, [pathname]);

    if (menuLoading) return <nav className="flex px-12 py-4 justify-between">Loading...</nav>;
    if (error) return <nav className="flex px-12 py-4 justify-between">Error loading menu</nav>;

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (loading.search || !query.trim()) return;
        
        setLoading('search', true);
        try {
            await navigateWithFilters({ search: query.trim() }, true);
            setQuery("");
            addToast({ message: 'Search completed', type: 'success' });
        } catch (error) {
            console.error('Search failed:', error);
            addToast({ message: 'Search failed. Please try again.', type: 'error' });
        } finally {
            setLoading('search', false);
        }
    };

    const handleMenuHover = (menuId) => {
        const menuKey = `menu-${menuId}`;
        if (!dropdowns[menuKey]) {
            toggleDropdown(menuKey);
        }
    };

    const handleMenuLeave = () => {
        closeAllDropdowns();
    };

    return (
        <nav className="flex px-12 py-4 justify-between">
            {/* LINKS */}
            <div className="flex gap-8 items-center justify-start">
                <NavLink link="/" classes="shrink-0 text-2xl font-semibold"> 
                    <h1>DAYE JEWELLERY</h1> 
                </NavLink>

                <ul className="hidden xl:flex gap-6 items-center">
                    {menuData?.mainNavigation.map((menuItem) => (
                        <li key={menuItem.id} className="relative">
                            <div onMouseEnter={() => handleMenuHover(menuItem.id)} onMouseLeave={handleMenuLeave}>
                                <MenuItem 
                                    menuItem={menuItem}
                                    variant="desktop"
                                />
                                
                                <MenuDropdown 
                                    menuItem={menuItem}
                                    isOpen={dropdowns[`menu-${menuItem.id}`] || false}
                                    onClose={closeAllDropdowns}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* OTHERS */}
            <div className="flex gap-8 items-center justify-end">
                <form onSubmit={handleSearchSubmit} className="hidden w-[200px] xl:flex items-center border-b-2 border-dark/10">
                    <input 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                        placeholder="Search"
                        disabled={loading.search}
                        className={`w-full py-2 outline-none placeholder:text-dark/50 ${loading.search ? 'opacity-50' : ''}`}
                    />
                    <button 
                        type="submit" 
                        disabled={loading.search}
                        className={`ml-2 ${loading.search ? 'opacity-50' : ''}`}
                    >
                        <Search 
                            size={20} 
                            className={`text-dark ${loading.search ? 'animate-pulse' : ''}`} 
                        />
                    </button>
                </form>

                <div className="hidden xl:flex gap-8 items-center">
                    <NavLink link="#"> 
                        <User size={24} className="animate hover:text-blue" /> 
                    </NavLink>
                    <WishlistIcon />
                    <CartIcon />

                    <NavLink link="#" classes="flex items-center gap-1">
                        <p className="border-b-1 border-dark/50">AUD</p>
                        <ChevronDown size={16} />
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}