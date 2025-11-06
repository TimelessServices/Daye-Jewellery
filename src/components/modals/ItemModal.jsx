import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Minus, Heart, ShoppingBag } from 'lucide-react';

import { SelectButton } from '../filter/SelectButton';
import { DealSelector } from './components/DealSelector';
import { useToasts, useLoading } from '@/contexts/UIProvider';
import { useCart, useWishlist } from '@/contexts/AppProvider';
import { formatCurrency } from '@/utils/formatCurrency';
import { calculateDealTotal, getDealDirectory } from '@/utils/dealConfigService';

function getDealIdentifier(deal) {
    if (!deal) return '';
    return String(deal.ID ?? deal.DealID ?? deal.CollectionID ?? '');
}

function normalizeDealMeta(deal, cartDeals = {}, dealDirectory = new Map()) {
    if (!deal) return null;
    const id = getDealIdentifier(deal);
    if (!id) { return null; }

    const cartEntry = cartDeals?.[id];
    const directoryEntry = typeof dealDirectory.get === 'function' ? dealDirectory.get(id) : undefined;

    const name = deal.Name
        ?? deal.collectionName
        ?? cartEntry?.collectionName
        ?? cartEntry?.Name
        ?? directoryEntry?.Name
        ?? directoryEntry?.collectionName
        ?? `Deal ${id}`;

    const buyQty = Number(
        deal.BuyQty
        ?? deal.BuyQuantity
        ?? deal.buyQty
        ?? cartEntry?.buyQty
        ?? cartEntry?.BuyQty
        ?? directoryEntry?.BuyQuantity
        ?? directoryEntry?.BuyQty
        ?? 0
    ) || 0;

    const getQty = Number(
        deal.GetQty
        ?? deal.GetQuantity
        ?? deal.getQty
        ?? cartEntry?.getQty
        ?? cartEntry?.GetQty
        ?? directoryEntry?.GetQuantity
        ?? directoryEntry?.GetQty
        ?? 0
    ) || 0;

    const discount = Number(
        deal.Discount
        ?? deal.DealDiscount
        ?? deal.discount
        ?? cartEntry?.Discount
        ?? cartEntry?.dealDiscount
        ?? directoryEntry?.DealDiscount
        ?? 0
    ) || 0;

    return { id, name, buyQty, getQty, discount };
}

function mapFromBucket(bucket) {
    if (!bucket) return {};
    if (Array.isArray(bucket)) {
        return bucket.reduce((acc, entry) => {
            const key = entry?.itemKey ?? (entry?.itemId ? `${entry.itemId}_${entry?.size ?? ''}` : null);
            if (key) acc[key] = entry;
            return acc;
        }, {});
    }
    if (typeof bucket === 'object') {
        return { ...bucket };
    }
    return {};
}

function mergeItemEntry(map, entry) {
    const existing = map[entry.itemKey];
    if (existing) {
        const currentQuantity = Number(existing.quantity) || 1;
        map[entry.itemKey] = { ...existing, quantity: currentQuantity + entry.quantity };
    } else {
        map[entry.itemKey] = entry;
    }
    return map;
}

export function ItemModal({ isOpen, item, closeModal, onSuccess }) {
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [purchaseMode, setPurchaseMode] = useState('single');
    const [selectedDealId, setSelectedDealId] = useState('');
    const [dealRole, setDealRole] = useState('buy');

    const { loading, setLoading } = useLoading();
    const { addToast } = useToasts();

    const isAdding = loading['itemModal:addToCart'];
    const justAdded = loading['itemModal:addToCartSuccess'];

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isWishlisted = item ? isInWishlist(item.getID) : false;

    const { cart, addToCart } = useCart();
    const modalRef = useRef(null);

    const hasSizes = item && Array.isArray(item.availableSizes) && item.availableSizes.length > 0;
    const defaultSize = hasSizes ? item.availableSizes[0] : 'One Size';

    const cartDeals = useMemo(() => cart?.deal ?? {}, [cart]);
    const dealDirectory = useMemo(() => getDealDirectory(), [cartDeals]);

    const deals = useMemo(() => {
        if (!item?.getDeals) { return []; }
        return item.getDeals
            .map((deal) => normalizeDealMeta(deal, cartDeals, dealDirectory))
            .filter(Boolean);
    }, [item, cartDeals, dealDirectory]);

    const isOnSale = item ? item.isOnSale && item.getSalePrice !== null : false;
    const currentPrice = isOnSale ? item.getSalePrice : item?.getBasePrice ?? 0;

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeModal();
            }
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

    useEffect(() => {
        if (!isOpen || !item) return;
        setSelectedSize('');
        setQuantity(1);
        setPurchaseMode('single');
        setDealRole('buy');
        const firstDealId = deals[0]?.id ?? '';
        setSelectedDealId(firstDealId);
    }, [isOpen, item, deals]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const handleAddToCart = async () => {
        if (!item) {
            addToast({ message: 'Unable to add this item to the cart', type: 'error' });
            return;
        }

        if (hasSizes && !selectedSize) {
            addToast({ message: 'Please select a size', type: 'warning' });
            return;
        }

        const resolvedSize = hasSizes ? selectedSize : defaultSize;
        const sizeLabel = resolvedSize || 'One Size';
        const itemId = item.getID;
        const itemKey = `${itemId}_${sizeLabel}`;
        const lineItem = {
            itemKey,
            itemId,
            type: item.getType,
            desc: item.getDesc,
            size: sizeLabel,
            price: currentPrice,
            quantity
        };

        setLoading('itemModal:addToCart', true);

        try {
            const shouldAddToDeal = purchaseMode === 'deal' && deals.length > 0;

            if (!shouldAddToDeal) {
                addToCart('single', itemKey, lineItem);
            } else {
                const targetDealId = selectedDealId || deals[0]?.id;

                if (!targetDealId) {
                    addToast({ message: 'Please choose a deal to add this item to', type: 'warning' });
                    setLoading('itemModal:addToCart', false);
                    return;
                }

                const existingDeal = cart?.deal?.[targetDealId];
                const dealMeta = deals.find((deal) => deal.id === targetDealId);

                if (!existingDeal && !dealMeta) {
                    addToast({ message: 'Selected deal is unavailable', type: 'error' });
                    setLoading('itemModal:addToCart', false);
                    return;
                }

                const currentBuyMap = mapFromBucket(existingDeal?.buyItems ?? existingDeal?.BuyItems);
                const currentGetMap = mapFromBucket(existingDeal?.getItems ?? existingDeal?.GetItems);

                const targetMap = dealRole === 'get' ? currentGetMap : currentBuyMap;
                mergeItemEntry(targetMap, lineItem);

                const nextBuyMap = dealRole === 'buy' ? targetMap : currentBuyMap;
                const nextGetMap = dealRole === 'get' ? targetMap : currentGetMap;

                const resolvedName = dealMeta?.name ?? existingDeal?.collectionName ?? `Deal ${targetDealId}`;
                const resolvedBuyQty = dealMeta?.buyQty ?? existingDeal?.buyQty ?? existingDeal?.BuyQty ?? 0;
                const resolvedGetQty = dealMeta?.getQty ?? existingDeal?.getQty ?? existingDeal?.GetQty ?? 0;
                const resolvedDiscount = dealMeta?.discount
                    ?? existingDeal?.discount
                    ?? existingDeal?.Discount
                    ?? existingDeal?.dealDiscount
                    ?? 0;

                const totalPrice = calculateDealTotal({
                    buyItems: nextBuyMap,
                    getItems: nextGetMap,
                    discount: resolvedDiscount
                });
                const normalizedTotalPrice = Number.isFinite(totalPrice) ? totalPrice : 0;
                const quantityDelta = existingDeal ? 0 : 1;

                addToCart('deal', targetDealId, {
                    ...existingDeal,
                    collectionId: targetDealId,
                    collectionID: targetDealId,
                    CollectionID: targetDealId,
                    collectionName: resolvedName,
                    Name: resolvedName,
                    name: resolvedName,
                    buyQty: resolvedBuyQty,
                    BuyQty: resolvedBuyQty,
                    buyQuantity: resolvedBuyQty,
                    getQty: resolvedGetQty,
                    GetQty: resolvedGetQty,
                    getQuantity: resolvedGetQty,
                    discount: resolvedDiscount,
                    Discount: resolvedDiscount,
                    dealDiscount: resolvedDiscount,
                    buyItems: nextBuyMap,
                    BuyItems: nextBuyMap,
                    getItems: nextGetMap,
                    GetItems: nextGetMap,
                    totalPrice: normalizedTotalPrice,
                    TotalPrice: normalizedTotalPrice,
                    price: normalizedTotalPrice,
                    quantity: quantityDelta
                });
            }

            setLoading('itemModal:addToCartSuccess', true);
            setLoading('itemModal:addToCart', false);
            addToast({ message: 'Added to cart successfully!', type: 'success' });

            setTimeout(() => {
                setLoading('itemModal:addToCartSuccess', false);
                if (onSuccess) onSuccess();
                closeModal();
            }, 500);
        } catch (error) {
            console.error('Error adding item to cart:', error);
            addToast({ message: 'Error adding item to cart', type: 'error' });
        } finally {
            setLoading('itemModal:addToCart', false);
        }
    };

    const adjustQuantity = (delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    if (!isOpen || !item) return null;

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(item.getID);
        } else {
            addToWishlist(
                item.getID,
                item.getDesc,
                item.getBasePrice,
                item.getSalePrice,
                item.getType,
                item.availableSizes
            );
        }
    };

    const imageSrc = item.getImgDefault();
    const displayedSize = hasSizes ? selectedSize : defaultSize;
    const lineTotal = Number(currentPrice) * quantity;

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
                    <h2 className="text-lg font-semibold text-dark">Add to Cart</h2>
                    <button onClick={closeModal} className="text-dark hover:text-red animate" disabled={isAdding}>
                        <X size={24} />
                    </button>
                </div>

                <div className="w-full flex flex-col px-12 py-4 gap-4 items-center overflow-y-auto">
                    <div className="relative w-full aspect-square rounded-lg mb-4">
                        <Image src={imageSrc} fill className="object-contain rounded-lg" alt={item.getDesc} />
                    </div>

                    <div className="w-full text-center mb-4 space-y-2">
                        <h3 className="text-lg font-medium text-dark">{item.getDesc}</h3>
                        <div className="text-xl font-semibold text-dark">
                            {isOnSale ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-gray-500 line-through text-sm">
                                        {formatCurrency(item.getBasePrice)}
                                    </span>
                                    <span>{formatCurrency(item.getSalePrice)}</span>
                                </div>
                            ) : (
                                <span>{formatCurrency(item.getBasePrice)}</span>
                            )}
                        </div>
                        {displayedSize && (
                            <div className="text-xs uppercase tracking-wide text-dark/60">
                                Selected size: {displayedSize}
                            </div>
                        )}
                    </div>

                    {hasSizes && (
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-dark mb-2">Size</label>
                            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 sm:gap-4">
                                {item.availableSizes.map((size) => (
                                    <SelectButton
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        disabled={isAdding}
                                        isSelected={selectedSize === size}
                                    >
                                        {size}
                                    </SelectButton>
                                ))}
                            </div>
                        </div>
                    )}

                    <DealSelector
                        deals={deals}
                        mode={purchaseMode}
                        onModeChange={(mode) => {
                            setPurchaseMode(mode);
                            if (mode === 'deal' && !selectedDealId && deals[0]) {
                                setSelectedDealId(deals[0].id);
                            }
                        }}
                        selectedDealId={selectedDealId}
                        onDealChange={(id) => setSelectedDealId(id)}
                        role={dealRole}
                        onRoleChange={(role) => setDealRole(role)}
                        disabled={isAdding}
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-dark mb-2">Quantity</label>
                        <div className="flex items-center gap-3">
                            <div className="w-full flex items-center border border-dark/20 rounded">
                                <button
                                    onClick={() => adjustQuantity(-1)}
                                    aria-label="Decrease quantity"
                                    disabled={quantity <= 1}
                                    className="w-1/3 p-3 flex justify-center bg-light animate hover:bg-dark/25 disabled:opacity-15"
                                >
                                    <Minus size={16} className={quantity <= 1 ? 'text-dark/30' : 'text-dark'} />
                                </button>
                                <span className="w-1/3 text-center text-md">{quantity}</span>
                                <button
                                    onClick={() => adjustQuantity(1)}
                                    aria-label="Increase quantity"
                                    className="w-1/3 p-3 flex justify-center bg-light animate hover:bg-dark/25"
                                >
                                    <Plus size={16} className="text-dark" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-2xl font-bold text-dark">{formatCurrency(lineTotal)}</div>
                    </div>

                    <button
                        onClick={handleWishlistClick}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={`w-full py-3 rounded-md font-medium flex items-center justify-center space-x-2 border-2 border-dark animate ${
                            isWishlisted ? 'hover:border-red' : 'hover:border-green'
                        }`}
                    >
                        <Heart size={20} className={isWishlisted ? 'fill-red text-transparent' : ''} />
                        <span>{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</span>
                    </button>

                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || justAdded}
                        className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
                            justAdded ? 'bg-green-500 text-white' : 'bg-dark text-white hover:bg-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                    >
                        <ShoppingBag size={20} />
                        {justAdded ? <span>Added to Cart!</span> : isAdding ? <span>Adding...</span> : <span>Add to Cart</span>}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

