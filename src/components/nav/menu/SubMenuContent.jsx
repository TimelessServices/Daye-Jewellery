import { useMenu } from "@/contexts/MenuContext";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "../NavLink";

export function SubMenuContent({ submenu, onBack }) {
    const { executeAction, closeMenu } = useMenu();
    
    if (!submenu) return <div>No submenu data</div>;

    const handleSubmenuClick = (subItem, e) => {
        e.preventDefault();
        if (subItem.action) { 
            executeAction(subItem.action, closeMenu); 
        }
    };

    return (
        <div className="py-4">
            <div className="flex items-center gap-4 mb-6">
                <NavLink link="#" onClick={onBack} classes="text-dark/70 hover:text-dark">
                    <ArrowLeft size={24} />
                </NavLink>
                <h2 className="text-xl font-semibold">{submenu.title}</h2>
            </div>
            
            <ul className="flex flex-col gap-6">
                {submenu.submenu?.map((subItem) => (
                    <li key={subItem.id}>
                        <NavLink 
                            link={subItem.link} 
                            onClick={(e) => handleSubmenuClick(subItem, e)}
                            classes="block"
                        >
                            <div className="py-2">
                                <h3 className="text-lg font-medium text-dark">{subItem.title}</h3>
                                {subItem.description && (
                                    <p className="text-sm text-dark/70 mt-1">{subItem.description}</p>
                                )}
                            </div>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}