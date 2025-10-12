'use client';
import { useState, useEffect } from 'react';

export function Toggle({ checked = false, onChange, label, disabled = false, size = 'md', id }) {
    const [isChecked, setIsChecked] = useState(checked);
    useEffect(() => { setIsChecked(checked); }, [checked]);

    const handleToggle = () => {
        if (disabled) return;
        
        const newState = !isChecked;
        setIsChecked(newState);
        
        if (onChange) {
            onChange(newState);
        }
    };

    // Size variants
    const sizeClasses = {
        sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
        md: { track: 'w-12 h-6', thumb: 'w-7 h-7', translate: 'translate-x-5' },
        lg: { track: 'w-14 h-7', thumb: 'w-8 h-8', translate: 'translate-x-7' }
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className="flex items-center space-x-3">
            {label && (
                <label htmlFor={id} className={`text-sm font-medium ${disabled ? 'text-light' : 'text-dark'} cursor-pointer`}>
                    {label} </label>
            )}
            
            <button type="button" role="switch" aria-checked={isChecked}
                aria-labelledby={id} disabled={disabled} onClick={handleToggle}
                className={`relative inline-flex items-center ${currentSize.track} rounded-full animate focus:outline-none 
                    ${ disabled ? 'cursor-not-allowed opacity-50 bg-light' : 'bg-dark' } `}
            >
                <span className="sr-only">{label || 'Toggle switch'}</span>
                <span className={`${currentSize.thumb} rounded-md animate 
                    ${isChecked ? `${currentSize.translate} bg-green` : 'bg-red'} `} />
            </button>
        </div>
    );
}