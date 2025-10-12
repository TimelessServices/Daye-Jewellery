'use client';
import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

import { useToasts } from '@/contexts/UIProvider';

const toastIcons = {
    success: CheckCircle, error: AlertCircle,
    warning: AlertTriangle, info: Info
};

const toastColors = {
    success: 'bg-green text-white', error: 'bg-red text-white', 
    warning: 'bg-orange text-white', info: 'bg-blue text-white'
};

export function ToastContainer() {
    const { toasts, removeToast } = useToasts();
    const [slidingOut, setSlidingOut] = useState(new Set());

    const handleRemove = (toastId) => {
        setSlidingOut(prev => new Set(prev.add(toastId)));
        
        setTimeout(() => {
            removeToast(toastId);
            setSlidingOut(prev => {
                const newSet = new Set(prev);
                newSet.delete(toastId);
                return newSet;
            });
        }, 500);
    };

    useEffect(() => {
        toasts.forEach(toast => {
            const duration = toast.type === 'error' ? 5000 : toast.type === 'warning' ? 2500 : 1000;

            if (duration) {
                const timer = setTimeout(() => { 
                    handleRemove(toast.id); 
                }, duration); 
                return () => clearTimeout(timer);
            }
        });
    }, [toasts]);

    return (
        <div className="fixed top-4 right-4 z-[2000] space-y-4">
            {toasts.map(toast => {
                const isSliding = slidingOut.has(toast.id);
                const Icon = toastIcons[toast.type] || Info;
                const colorClass = toastColors[toast.type] || toastColors.info;
                
                return (
                    <div key={toast.id} className={`${colorClass} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 
                        max-w-sm ${isSliding ? 'animate-slide-out' : 'animate-slide-in'}`}>
                        <Icon size={20} />
                        <span className="flex-1 text-sm">{toast.message}</span>
                        <button onClick={() => handleRemove(toast.id)}>  <X size={16} /> </button>
                    </div>
                );
            })}
        </div>
    );
}