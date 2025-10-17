import { useMenu } from "@/contexts/MenuContext";
import { MenuList } from "./MenuList";
import { CartContent } from "../cart/CartContent";
import { SubMenuContent } from "./SubMenuContent";
import { WishlistContent } from "../wishlist/WishlistContent";

export function ContentSwitcher() {
    const { menuState, setActiveSubmenu, setContent, menuData } = useMenu();

    const handleMenuClick = (menuItem) => {
        setActiveSubmenu(menuItem);
        setContent(`submenu-${menuItem.id}`);
    };

    switch (menuState.content) {
        case "links-main": 
            return (
                <MenuList 
                    menuItems={menuData?.mainNavigation} 
                    variant="mobile" 
                    onMenuClick={handleMenuClick}
                />
            );
        case "cart": 
            return <CartContent />;
        case "wishlist":
            return <WishlistContent />;
        default:
            if (menuState.content.startsWith('submenu-')) {
                return (
                    <SubMenuContent 
                        submenu={menuState.activeSubmenu} 
                        onBack={() => setContent("links-main")}
                    />
                );
            }
            return (
                <MenuList 
                    menuItems={menuData?.mainNavigation} 
                    variant="mobile" 
                    onMenuClick={handleMenuClick}
                />
            );
    }
}