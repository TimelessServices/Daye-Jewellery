import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useMemo } from 'react';

import { Button } from '../Button';
import FilterGem from '../filter/FilterGem';
import FilterBasic from '../filter/FilterBasic';
import FilterMaterial from '../filter/FilterMaterial';
import TempFilterManager from '@/utils/TempFilterManager';

function getFilters(filterType, tempFilters, tempUpdaters) {
    switch (filterType) {
        case "basic": return <FilterBasic filters={tempFilters} updaters={tempUpdaters} />
        case "material": return <FilterMaterial filters={tempFilters} updaters={tempUpdaters} />
        case "gem": return <FilterGem filters={tempFilters} updaters={tempUpdaters} />
        default: return <FilterBasic filters={tempFilters} updaters={tempUpdaters} />
    }
}

export function FilterModal({ isOpen, filters, updaters, closeModal }) {
    const [filterType, setFilterType] = useState("basic");
    const [tempManager, setTempManager] = useState(null);
    const [tempFilters, setTempFilters] = useState(null);
    const modalRef = useRef(null);

    // Initialize temp manager and subscribe to changes
    useEffect(() => {
        if (isOpen && filters) {
            const manager = new TempFilterManager(filters);
            setTempManager(manager);
            setTempFilters(manager.getTempFilters());
            
            // Subscribe to temp filter changes
            const unsubscribe = manager.subscribe((newTempFilters) => {
                setTempFilters(newTempFilters);
            });
            
            return unsubscribe;
        }
    }, [isOpen, filters]);

    // Create temp updaters that ONLY call the utility methods
    const tempUpdaters = useMemo(() => {
        if (!tempManager) return {};
        
        return {
            updateSearch: (searchTerm) => tempManager.updateSearch(searchTerm),
            updateSort: (sortValue) => tempManager.updateSort(sortValue),
            updatePrice: (min, max) => tempManager.updatePrice(min, max),
            updateTypes: (types) => tempManager.updateTypes(types),
            updateOnSale: (onSale) => tempManager.updateOnSale(onSale),
            updateMaterial: (material) => tempManager.updateMaterial(material),
            updateGem: (gem) => tempManager.updateGem(gem)
        };
    }, [tempManager]);

    // Handle escape key and body scroll
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) closeModal();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, closeModal]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) closeModal();
    };

    // Apply changes using real updaters
    const handleApply = () => {
        if (tempManager) {
            const changes = tempManager.getChanges();

            if (updaters.applyChanges) {
                updaters.applyChanges(changes);
            } else {
                Object.entries(changes).forEach(([key, value]) => {
                    switch (key) {
                        case 'search': updaters.updateSearch(value); break;
                        case 'sort': updaters.updateSort(value); break;
                        case 'price': updaters.updatePrice(value.min, value.max); break;
                        case 'types': updaters.updateTypes(value); break;
                        case 'onSale': updaters.updateOnSale(value); break;
                        case 'material': updaters.updateMaterial(value); break;
                        case 'gem': updaters.updateGem(value); break;
                    }
                });
            }
        }
        closeModal();
    };

    if (!isOpen || !tempManager || !tempFilters) return null;

    const modalContent = (
        <div 
            onClick={handleBackdropClick} 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1500]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <div 
                ref={modalRef} 
                className="bg-white rounded-lg max-w-[500px] w-full mx-4 max-h-[90vh] flex flex-col"
            >
                <div className="w-full h-14 flex justify-between items-center p-8 border-b">
                    <h2 className="text-3xl font-title text-dark">Filters</h2>
                    <button onClick={closeModal} className="text-dark hover:text-red animate"> 
                        <X size={24} /> 
                    </button>
                </div>

                <div className='p-4 gap-4 flex flex-row justify-between'>
                    <button onClick={() => setFilterType("basic")} className={`w-1/3 py-2 rounded-sm cursor-pointer animate
                        ${filterType == "basic" ? "bg-dark text-light" : "border-2 text-dark"}`}>Basic</button>

                    <button onClick={() => setFilterType("material")} className={`w-1/3 py-2 rounded-sm cursor-pointer animate
                        ${filterType == "material" ? "bg-dark text-light" : "border-2 text-dark"}`}>Material</button>

                    <button onClick={() => setFilterType("gem")} className={`w-1/3 py-2 rounded-sm cursor-pointer animate
                        ${filterType == "gem" ? "bg-dark text-light" : "border-2 text-dark"}`}>Gem</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {getFilters(filterType, tempFilters, tempUpdaters)}
                </div>

                <div className='w-full p-4 border-t'>
                    <Button text="Apply Filters" onClick={handleApply} />
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}