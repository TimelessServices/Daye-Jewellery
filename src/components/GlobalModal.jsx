'use client';
import { ItemModal } from './ItemModal';
import { useModal } from '@/contexts/UIProvider';

export function GlobalModal() {
    const { modals, closeModal } = useModal();
    
    return (
        <>
            {Object.entries(modals).map(([modalId, modalProps]) => {
                if (!modalProps || !modalProps.item) {
                    console.error('Invalid modal props:', modalId, modalProps);
                    return null;
                }
                
                return (
                    <ItemModal 
                        key={modalId}
                        isOpen={true}
                        item={modalProps.item}
                        closeModal={() => closeModal(modalId)}
                        onSuccess={modalProps.onSuccess}
                    />
                );
            })}
        </>
    );
}