import { MenuItem } from "./MenuItem";

export function MenuList({ menuItems = [], variant = "mobile", onMenuClick = null, className = "" }) {
    if (!menuItems?.length) return <div>Loading...</div>;

    return (
        <ul className={`flex flex-col gap-8 py-4 ${className}`}>
            {menuItems.map((menuItem) => (
                <li key={menuItem.id}>
                    <MenuItem 
                        menuItem={menuItem} 
                        variant={variant} 
                        onClick={onMenuClick}
                    />
                </li>
            ))}
        </ul>
    );
}
