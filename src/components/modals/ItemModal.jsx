import Image from "next/image";
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Minus, Heart, ShoppingBag } from 'lucide-react';

import { SelectButton } from "../filter/SelectButton";
import { useToasts, useLoading } from "@/contexts/UIProvider";
import { useCart, useWishlist } from "@/contexts/AppProvider";

function getImg(type) {
    switch(type) {
        case 'N': return "NECKLACE";
        case 'B': return 'BRACELET';
        case 'R': return 'RING';
        case 'E': return 'EARRING';
        default: return 'ITEM';
    }
}

export function ItemModal({ isOpen, item, closeModal, onSuccess }) {
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    const { loading, setLoading } = useLoading();
    const { addToast } = useToasts();

    const isAdding = loading.addToCart;
    const justAdded = loading.cartSuccess;
    
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(item?.id);
    
    const { addToCart } = useCart();
    const modalRef = useRef(null);

    // Handle escape key
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

    // Handle click outside
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) { 
            closeModal(); 
        }
    };

    const handleAddToCart = async () => {
        if (hasSizes && !selectedSize) {
            addToast({ message: 'Please select a size', type: 'warning' });
            return;
        }

        setLoading('addToCart', true);
        
        try {
            const currentPrice = isOnSale ? item.salePrice : item.price;
            addToCart(item.id, item.desc, item.type, currentPrice, selectedSize || 'N/A', quantity);

            setLoading('cartSuccess', true);
            setLoading('addToCart', false);
            addToast({ message: 'Added to cart successfully!', type: 'success'});

            setTimeout(() => {
                setLoading('cartSuccess', false); 
                if (onSuccess) onSuccess();
                closeModal();
            }, 500)
        } 
        catch (error) { addToast({ message: 'Error adding item to cart', type: 'error' }); } 
        finally { setLoading('addToCart', false); }
    };

    const adjustQuantity = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    // Early return check
    if (!isOpen || !item) return null;

    const isOnSale = item.salePrice !== null && item.salePrice !== undefined;
    const currentPrice = isOnSale ? item.salePrice : item.price;

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (isWishlisted) { removeFromWishlist(item.id); } 
        else { addToWishlist(item.id, item.desc, item.price, item.salePrice, item.type, item.sizes); }
    };

    const modalContent = (
        <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1500]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div ref={modalRef} className="bg-white rounded-lg max-w-[500px] w-full mx-4 max-h-[90vh] flex flex-col items-center">

                {/* Header */}
                <div className="w-full h-14 mb-4 flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-dark">Add to Cart</h2>
                    <button onClick={closeModal} className="text-dark hover:text-red animate" disabled={isAdding}> 
                        <X size={24} /> 
                    </button>
                </div>

                {/* Content */}
                <div className="w-full flex flex-col px-12 py-4 gap-4 items-center overflow-y-auto">
                    {/* Product Image */}
                    <div className="relative w-full aspect-square rounded-lg mb-4">
                        <Image src={`/${getImg(item.type)}_PLACEHOLDER.png`} fill 
                            className="object-contain rounded-lg" alt={item.desc} />
                    </div>

                    {/* Product Info */}
                    <div className="w-full text-center mb-4">
                        <h3 className="text-lg font-medium text-dark mb-2">{item.desc}</h3>
                        <div className="text-xl">
                            {isOnSale ? (
                                <div className='flex flex-col'>
                                    <span className="text-gray-500 line-through text-sm">${item.price}</span>
                                    <span className="text-dark font-bold ml-2">${item.salePrice}</span>
                                </div>
                            ) : ( <span className="text-dark">${item.price}</span> )}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="w-full mb-4">
                        <label className="block text-sm font-medium text-dark mb-2"> Size </label>
                        
                        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 sm:gap-4">
                            {item.sizes.map(size => (
                                <SelectButton key={size} onClick={() => setSelectedSize(size)} disabled={isAdding}
                                    isSelected={selectedSize === size}> {size} </SelectButton>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Selection */}
                    <div className="w-full mb-6">
                        <label className="block text-sm font-medium text-dark mb-2"> Quantity </label>

                        <div className="flex items-center gap-3">
                            <div className="w-full flex items-center border border-dark/20 rounded">
                                <button onClick={() => adjustQuantity(-1)} aria-label="Decrease quantity" 
                                    disabled={quantity <= 1} className="w-1/3 p-3 flex justify-center bg-light 
                                    animate hover:bg-dark/25 disabled:opacity-15">
                                    <Minus size={16} className={quantity <= 1 ? "text-dark/30" : "text-dark"} />
                                </button>
                                
                                <span className="w-1/3 text-center text-md">{quantity}</span>
                                
                                <button onClick={() => adjustQuantity(1)} aria-label="Increase quantity"
                                    className="w-1/3 p-3 flex justify-center bg-light animate hover:bg-dark/25">
                                    <Plus size={16} className="text-dark" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Total Price */}
                    <div className="text-center mb-6">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-2xl font-bold text-dark"> ${(currentPrice * quantity).toFixed(2)} </div>
                    </div>

                    {/* Add to Wishlist Button */}
                    <button onClick={handleWishlistClick} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        className={`w-full py-3 rounded-md font-medium flex items-center justify-center space-x-2 border-2 
                            border-dark animate ${isWishlisted ? "hover:border-red" : "hover:border-green"}`}
                    >
                        <Heart size={20} className={isWishlisted ? "fill-red text-transparent" : ""} />
                        <span>{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</span>
                    </button>

                    {/* Add to Cart Button */}
                    <button onClick={handleAddToCart} disabled={isAdding || justAdded}
                        className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
                            justAdded ? 'bg-green-500 text-white' : 'bg-dark text-white hover:bg-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                    >
                        <ShoppingBag size={20} />
                        {justAdded ? <span>Added to Cart!</span> : 
                            isAdding ? <span>Adding...</span> : <span>Add To Cart</span>}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}