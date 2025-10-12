import { MenuList } from "./MenuList";
import { CartContent } from "./cart/CartContent";
import { SubMenuContent } from "./SubMenuContent";
import { WishlistContent } from "./wishlist/WishlistContent";

export function ContentSwitcher({ content, menuData, currentSubmenu, onContentChange, onSubmenuSelect, onMenuClose }) {
    const handleMenuClick = (menuItem) => {
        onSubmenuSelect(menuItem);
        onContentChange(`submenu-${menuItem.id}`);
    };

    switch (content) {
        case "links-main": 
            return (
                <MenuList 
                    menuItems={menuData?.mainNavigation} 
                    variant="mobile" 
                    onMenuClick={handleMenuClick}
                    onMenuClose={onMenuClose} // Pass menu close handler
                />
            );
        case "cart": 
            return <CartContent />;
        case "wishlist":
            return <WishlistContent />;
        default:
            if (content.startsWith('submenu-')) {
                return (
                    <SubMenuContent 
                        submenu={currentSubmenu} 
                        onBack={() => onContentChange("links-main")}
                        onMenuClose={onMenuClose} // Pass menu close handler
                    />
                );
            }
            return (
                <MenuList 
                    menuItems={menuData?.mainNavigation} 
                    variant="mobile" 
                    onMenuClick={handleMenuClick}
                    onMenuClose={onMenuClose} // Pass menu close handler
                />
            );
    }
}