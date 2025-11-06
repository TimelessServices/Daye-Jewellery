import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ShoppingBag } from 'lucide-react';

import { useToasts, useLoading } from '@/contexts/UIProvider';
import { useCart } from '@/contexts/AppProvider';
import { formatCurrency } from '@/utils/formatCurrency';

const typeLabels = {
    N: 'NECKLACE',
    B: 'BRACELET',
    R: 'RING',
    E: 'EARRING'
};

function getItemType(item) {
    return item?.getType ?? item?.type ?? item?.Type ?? 'ITEM';
}

function getItemDesc(item) {
    return item?.getDesc ?? item?.desc ?? item?.Desc ?? 'Jewellery item';
}

function getItemId(item) {
    return item?.getID ?? item?.id ?? item?.JewelleryID ?? item?.jewelleryId ?? null;
}

function getAvailableSizes(item) {
    if (Array.isArray(item?.availableSizes)) {
        return item.availableSizes;
    }
    if (typeof item?.Sizes === 'string') {
        return item.Sizes.split('|').filter(Boolean);
    }
    if (Array.isArray(item?.Sizes)) {
        return item.Sizes.filter(Boolean);
    }
    return [];
}

function getUnitPrice(item) {
    const sale = item?.getSalePrice ?? item?.salePrice;
    if (typeof sale === 'number') {
        return sale;
    }
    const base = item?.getBasePrice ?? item?.price ?? item?.Price;
    const parsed = Number(base);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function SetModal({ isOpen, collection, items, closeModal }) {
    const [sizeSelections, setSizeSelections] = useState({});
    const [bulkSelections, setBulkSelections] = useState({});

    const { cart, addToCart } = useCart();
    const { loading, setLoading } = useLoading();
    const { addToast } = useToasts();

    const isAdding = loading['setModal:addToCart'];
    const modalRef = useRef(null);

    const collectionId = String(
        collection?.CollectionID
        ?? collection?.collectionId
        ?? collection?.ID
        ?? collection?.id
        ?? ''
    );
    const collectionName = collection?.Name ?? collection?.collectionName ?? collection?.name ?? 'Jewellery Set';
    const collectionPriceRaw =
        collection?.SetPrice
        ?? collection?.TotalPrice
        ?? collection?.CollectionPrice
        ?? collection?.Price
        ?? 0;
    const collectionPriceParsed = Number(collectionPriceRaw);
    const collectionPrice = Number.isFinite(collectionPriceParsed) ? collectionPriceParsed : 0;

    const itemsByType = useMemo(() => {
        return (Array.isArray(items) ? items : []).reduce((acc, item) => {
            const type = getItemType(item);
            if (!acc[type]) acc[type] = [];
            acc[type].push(item);
            return acc;
        }, {});
    }, [items]);

    const needsSize = (item) => {
        const sizes = getAvailableSizes(item);
        return sizes.length > 1;
    };

    const ensureDefaultSizes = useMemo(() => {
        if (!Array.isArray(items)) return {};
        const defaults = {};
        items.forEach((item) => {
            const itemId = getItemId(item);
            if (!itemId) return;
            const sizes = getAvailableSizes(item);
            if (sizes.length === 1) {
                defaults[itemId] = sizes[0];
            }
        });
        return defaults;
    }, [items]);

    useEffect(() => {
        setSizeSelections((prev) => ({ ...ensureDefaultSizes, ...prev }));
    }, [ensureDefaultSizes]);

    const allSizesSelected = useMemo(() => {
        if (!Array.isArray(items)) return true;
        return items.every((item) => {
            if (!needsSize(item)) return true;
            const itemId = getItemId(item);
            return itemId ? sizeSelections[itemId] : true;
        });
    }, [items, sizeSelections]);

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

    const handleBulkSizeSelect = (type, size) => {
        setBulkSelections((prev) => ({ ...prev, [type]: size }));

        const typeItems = itemsByType[type] || [];
        setSizeSelections((prev) => {
            const next = { ...prev };
            typeItems.forEach((item) => {
                if (!needsSize(item)) return;
                const itemId = getItemId(item);
                if (!itemId) return;
                next[itemId] = size;
            });
            return next;
        });
    };

    const handleIndividualSizeSelect = (itemId, size) => {
        setSizeSelections((prev) => ({ ...prev, [itemId]: size }));
    };

    const handleAddSet = async () => {
        if (!collectionId) {
            addToast({ message: 'Unable to determine set identifier', type: 'error' });
            return;
        }

        if (!allSizesSelected) {
            addToast({ message: 'Please select sizes for all set items', type: 'warning' });
            return;
        }

        setLoading('setModal:addToCart', true);

        try {
            const itemsList = [];
            const itemsMap = {};

            (Array.isArray(items) ? items : []).forEach((item) => {
                const itemId = getItemId(item);
                if (!itemId) return;

                const type = getItemType(item);
                const desc = getItemDesc(item);
                const sizes = getAvailableSizes(item);
                const selectedSize = sizeSelections[itemId]
                    ?? (sizes[0] ?? 'One Size');
                const itemKey = `${itemId}_${selectedSize}`;
                const unitPrice = getUnitPrice(item);

                const entry = {
                    itemKey,
                    itemId,
                    type,
                    desc,
                    size: selectedSize,
                    price: unitPrice,
                    quantity: 1
                };

                itemsList.push(entry);
                itemsMap[itemKey] = entry;
            });

            if (itemsList.length === 0) {
                addToast({ message: 'No items are available for this set', type: 'error' });
                setLoading('setModal:addToCart', false);
                return;
            }

            const existingSet = cart?.set?.[collectionId];
            const quantityDelta = existingSet ? 0 : 1;

            addToCart('set', collectionId, {
                collectionId,
                collectionName,
                totalPrice: collectionPrice,
                TotalPrice: collectionPrice,
                price: collectionPrice,
                SetPrice: collectionPrice,
                itemTotal: itemsList.length,
                itemsList,
                ItemsList: itemsList,
                items: itemsList,
                Items: itemsMap,
                quantity: quantityDelta
            });

            addToast({
                message: `Added ${collectionName} to cart`,
                type: 'success'
            });
            closeModal();
        } catch (error) {
            console.error('Failed to add set to cart:', error);
            addToast({ message: 'Error adding set to cart', type: 'error' });
        } finally {
            setLoading('setModal:addToCart', false);
        }
    };

    if (!isOpen || !collection || !Array.isArray(items)) return null;

    const modalContent = (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1500]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-lg max-w-[520px] w-full mx-4 max-h-[90vh] flex flex-col items-center"
            >
                <div className="w-full h-14 mb-4 flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-dark">Configure Set</h2>
                    <button
                        onClick={closeModal}
                        className="text-dark hover:text-red animate"
                        disabled={isAdding}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="w-full flex flex-col px-12 py-4 gap-4 items-center overflow-y-auto">
                    <div className="w-full text-center mb-4">
                        <h3 className="text-lg font-medium text-dark mb-2">{collectionName}</h3>
                        <div className="text-xl font-bold text-dark">
                            {formatCurrency(collectionPrice)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            {items.length} items included
                        </div>
                    </div>

                    {Object.keys(itemsByType).some((type) =>
                        (itemsByType[type] || []).some((item) => needsSize(item))
                    ) && (
                        <div className="w-full mb-6">
                            <h4 className="text-md font-medium text-dark mb-3">
                                Size selection for each type
                            </h4>

                            {Object.entries(itemsByType).map(([type, typeItems]) => {
                                const requiresSize = (typeItems || []).some((item) => needsSize(item));
                                if (!requiresSize) return null;

                                const sizeOptions = new Set();
                                typeItems.forEach((item) => {
                                    getAvailableSizes(item).forEach((size) => sizeOptions.add(size));
                                });

                                return (
                                    <div key={type} className="mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-dark min-w-[80px]">
                                                {typeLabels[type] ?? type}:
                                            </span>
                                            <select
                                                value={bulkSelections[type] || ''}
                                                onChange={(e) => handleBulkSizeSelect(type, e.target.value)}
                                                className="flex-1 p-2 border border-dark/20 rounded text-sm"
                                                disabled={isAdding}
                                            >
                                                <option value="">Select size for all {typeLabels[type]?.toLowerCase() || 'items'}</option>
                                                {Array.from(sizeOptions).map((size) => (
                                                    <option key={size} value={size}>{size}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="w-full">
                        <h4 className="text-md font-medium text-dark mb-3">Items in this set</h4>

                        <div className="space-y-3">
                            {items.map((item) => {
                                const itemId = getItemId(item);
                                const availableSizes = getAvailableSizes(item);
                                const itemNeedsSize = needsSize(item);
                                const selectedSize = sizeSelections[itemId] ?? availableSizes[0] ?? 'One Size';
                                const type = getItemType(item);

                                return (
                                    <div key={itemId ?? getItemDesc(item)} className="flex items-center gap-3 p-3 border border-dark/10 rounded">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-dark">{getItemDesc(item)}</div>
                                            <div className="text-xs text-gray-600">{typeLabels[type] ?? type}</div>
                                        </div>

                                        <div className="min-w-[140px]">
                                            {itemNeedsSize ? (
                                                <select
                                                    value={selectedSize}
                                                    onChange={(e) => handleIndividualSizeSelect(itemId, e.target.value)}
                                                    className="w-full p-2 border border-dark/20 rounded text-sm"
                                                    disabled={isAdding}
                                                >
                                                    <option value="">Select size</option>
                                                    {availableSizes.map((size) => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm text-gray-500 text-center p-2">
                                                    {availableSizes[0] ?? 'One Size'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleAddSet}
                        disabled={isAdding || !allSizesSelected}
                        className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
                            isAdding || !allSizesSelected
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-dark text-white hover:bg-gray-800'
                        } disabled:opacity-50 flex items-center justify-center space-x-2`}
                    >
                        <ShoppingBag size={20} />
                        <span>{isAdding ? 'Adding Set...' : 'Add Set to Cart'}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

