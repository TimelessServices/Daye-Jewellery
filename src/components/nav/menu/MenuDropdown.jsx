import { useMenu } from "@/contexts/MenuContext";
import { NavLink } from "../NavLink";

export function MenuDropdown({ menuItem, isOpen }) {
    if (!menuItem.hasSubmenu || !isOpen) return null;
    
    const { executeAction, closeMenu } = useMenu();

    const handleSubmenuClick = (subItem, e) => {
        e.preventDefault();
        if (subItem.action) { 
            executeAction(subItem.action, closeMenu); 
        }
    };

    return (
        <div className="absolute top-full left-0 w-80 bg-white border border-dark/10 rounded-lg shadow-lg z-500">
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-4">{menuItem.title}</h3>
                <ul className="space-y-2">
                    {menuItem.submenu?.map((subItem) => (
                        <li key={subItem.id}>
                            <NavLink 
                                link={subItem.link} 
                                onClick={(e) => handleSubmenuClick(subItem, e)}
                                classes="block py-3 px-2 rounded-md hover:bg-dark/5 transition-colors"
                            >
                                <div>
                                    <h4 className="font-medium text-dark">{subItem.title}</h4>
                                    {subItem.description && (
                                        <p className="text-sm text-dark/70 mt-1">{subItem.description}</p>
                                    )}
                                </div>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}