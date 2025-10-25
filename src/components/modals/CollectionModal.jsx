import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ShoppingBag } from 'lucide-react';

import { useToasts, useLoading } from "@/contexts/UIProvider";

const typeLabels = {
    'N': 'NECKLACE',
    'B': 'BRACELET', 
    'R': 'RING',
    'E': 'EARRING'
};

export function CollectionModal({ isOpen, collection, items, closeModal, onAddCollection }) {
    const [sizeSelections, setSizeSelections] = useState({});
    const [bulkSelections, setBulkSelections] = useState({});

    const { loading, setLoading } = useLoading();
    const { addToast } = useToasts();

    const isAdding = loading['collectionModal:addToCart'];
    const modalRef = useRef(null);

    // Group items by type for bulk selection
    const itemsByType = useMemo(() => {
        return items.reduce((acc, item) => {
            if (!acc[item.Type]) acc[item.Type] = [];
            acc[item.Type].push(item);
            return acc;
        }, {});
    }, [items]);

    // Get available sizes for an item
    const getAvailableSizes = (sizesString) => {
        if (!sizesString) return [];
        return sizesString.split('|').filter(s => s.trim());
    };

    // Check if item needs size selection
    const needsSize = (item) => {
        const sizes = getAvailableSizes(item.Sizes);
        return sizes.length > 1;
    };

    // Check if all required sizes are selected
    const allSizesSelected = useMemo(() => {
        return items.every(item => {
            if (!needsSize(item)) return true;
            return sizeSelections[item.JewelleryID];
        });
    }, [items, sizeSelections]);

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

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) closeModal();
    };

    // Handle bulk size selection for a type
    const handleBulkSizeSelect = (type, size) => {
        setBulkSelections(prev => ({ ...prev, [type]: size }));
        
        // Apply to all items of this type that don't have individual selections
        const typeItems = itemsByType[type] || [];
        setSizeSelections(prev => {
            const newSelections = { ...prev };
            typeItems.forEach(item => {
                if (needsSize(item)) {
                    newSelections[item.JewelleryID] = size;
                }
            });
            return newSelections;
        });
    };

    // Handle individual size selection
    const handleIndividualSizeSelect = (itemId, size) => {
        setSizeSelections(prev => ({ ...prev, [itemId]: size }));
    };

    // Handle add collection to cart
    const handleAddCollection = async () => {
        if (!allSizesSelected) {
            addToast({ message: 'Please select sizes for all items', type: 'warning' });
            return;
        }

        setLoading('collectionModal:addToCart', true);
        
        try {
            // Call parent function with selections
            await onAddCollection(collection, items, sizeSelections);
            
            addToast({ 
                message: `Added ${collection.Name} collection to cart!`, 
                type: 'success' 
            });
            closeModal();
        } catch (error) {
            addToast({ 
                message: 'Error adding collection to cart', 
                type: 'error' 
            });
        } finally {
            setLoading('collectionModal:addToCart', false);
        }
    };

    if (!isOpen || !collection || !items) return null;

    const modalContent = (
        <div 
            onClick={handleBackdropClick} 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1500]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <div 
                ref={modalRef} 
                className="bg-white rounded-lg max-w-[500px] w-full mx-4 max-h-[90vh] flex flex-col items-center"
            >
                {/* Header */}
                <div className="w-full h-14 mb-4 flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-dark">Add Collection</h2>
                    <button 
                        onClick={closeModal} 
                        className="text-dark hover:text-red animate" 
                        disabled={isAdding}
                    > 
                        <X size={24} /> 
                    </button>
                </div>

                {/* Content */}
                <div className="w-full flex flex-col px-12 py-4 gap-4 items-center overflow-y-auto">
                    
                    {/* Collection Info */}
                    <div className="w-full text-center mb-4">
                        <h3 className="text-lg font-medium text-dark mb-2">{collection.Name}</h3>
                        <div className="text-xl font-bold text-dark">
                            ${collection.CollectionPrice}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            {items.length} items
                        </div>
                    </div>

                    {/* Bulk Size Selection */}
                    {Object.keys(itemsByType).some(type => 
                        itemsByType[type].some(item => needsSize(item))
                    ) && (
                        <div className="w-full mb-6">
                            <h4 className="text-md font-medium text-dark mb-3">
                                Size Selection for All
                            </h4>
                            
                            {Object.entries(itemsByType).map(([type, typeItems]) => {
                                const hasItemsNeedingSize = typeItems.some(item => needsSize(item));
                                if (!hasItemsNeedingSize) return null;

                                // Get all available sizes for this type
                                const allSizesForType = new Set();
                                typeItems.forEach(item => {
                                    if (needsSize(item)) {
                                        getAvailableSizes(item.Sizes).forEach(size => 
                                            allSizesForType.add(size)
                                        );
                                    }
                                });

                                return (
                                    <div key={type} className="mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-dark min-w-[80px]">
                                                {typeLabels[type]}:
                                            </span>
                                            <select
                                                value={bulkSelections[type] || ''}
                                                onChange={(e) => handleBulkSizeSelect(type, e.target.value)}
                                                className="flex-1 p-2 border border-dark/20 rounded text-sm"
                                                disabled={isAdding}
                                            >
                                                <option value="">Select size for all {typeLabels[type].toLowerCase()}s</option>
                                                {Array.from(allSizesForType).map(size => (
                                                    <option key={size} value={size}>{size}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Individual Items */}
                    <div className="w-full">
                        <h4 className="text-md font-medium text-dark mb-3">Items in Collection</h4>
                        
                        <div className="space-y-3">
                            {items.map(item => {
                                const availableSizes = getAvailableSizes(item.Sizes);
                                const itemNeedsSize = needsSize(item);
                                
                                return (
                                    <div key={item.JewelleryID} className="flex items-center gap-3 p-3 border border-dark/10 rounded">
                                        {/* Description and Type */}
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-dark">
                                                {item.Desc}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {typeLabels[item.Type]}
                                            </div>
                                        </div>

                                        {/* Size Selection */}
                                        <div className="min-w-[120px]">
                                            {itemNeedsSize ? (
                                                <select
                                                    value={sizeSelections[item.JewelleryID] || ''}
                                                    onChange={(e) => handleIndividualSizeSelect(item.JewelleryID, e.target.value)}
                                                    className="w-full p-2 border border-dark/20 rounded text-sm"
                                                    disabled={isAdding}
                                                >
                                                    <option value="">Select size</option>
                                                    {availableSizes.map(size => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm text-gray-500 text-center p-2">
                                                    {availableSizes[0] || 'One Size'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                        onClick={handleAddCollection}
                        disabled={isAdding || !allSizesSelected}
                        className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
                            allSizesSelected 
                                ? 'bg-dark text-white hover:bg-gray-800' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } disabled:opacity-50 flex items-center justify-center space-x-2`}
                    >
                        <ShoppingBag size={20} />
                        {isAdding ? (
                            <span>Adding Collection...</span>
                        ) : (
                            <span>Add Collection to Cart</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}