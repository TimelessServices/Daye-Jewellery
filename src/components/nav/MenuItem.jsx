import { ArrowRight, ChevronDown } from "lucide-react";

import { NavLink } from "./NavLink";
import { useRouter } from "next/navigation";
import { useFilters } from "@/contexts/FilterContext";

export function MenuItem({ menuItem, variant = "mobile", onClick = null, className = "", onMenuClose }) {
    const { navigateWithFilters, navigateToCollection } = useFilters();
    const router = useRouter();

    const executeAction = (action, e) => {
        if (action) {
            e?.preventDefault();
            
            switch (action.type) {
                case 'filter':
                    navigateWithFilters(action.params, true);
                    break;
                case 'collection_view':
                    navigateToCollection(action.params.collection);
                    break;
                case 'page':
                    router.push(action.params.page);
                    break;
                default:
                    router.push(menuItem.link);
            }
            
            // Close mobile menu if provided
            if (onMenuClose) onMenuClose();
        }
    };

    const handleClick = (e) => {
        if (variant === "mobile") {
            if (menuItem.hasSubmenu) {
                // Let mobile submenu handler take over
                if (onClick) onClick(menuItem);
            } else {
                // Execute action for non-submenu items
                executeAction(menuItem.action, e);
            }
        } else {
            // Desktop: only execute action if no submenu
            if (!menuItem.hasSubmenu) {
                executeAction(menuItem.action, e);
            }
        }
    };

    if (variant === "mobile") {
        return (
            <NavLink 
                link={menuItem.hasSubmenu ? "#" : menuItem.link}
                onClick={handleClick}
                classes={`flex items-center text-start text-2xl ${className}`}
            >
                <p className="w-2/3">{menuItem.title}</p>
                {menuItem.hasSubmenu && <ArrowRight size={28} />}
            </NavLink>
        );
    }

    return (
        <NavLink 
            link={menuItem.hasSubmenu ? "#" : menuItem.link} 
            onClick={handleClick}
            classes={`text-md flex items-center gap-1 ${menuItem.hasSubmenu ? 'cursor-pointer' : ''} ${className}`}
        >
            <p>{menuItem.title}</p>
            {menuItem.hasSubmenu && <ChevronDown size={16} />}
        </NavLink>
    );
}