'use client';
import { ItemModal } from './ItemModal';
import { CollectionModal } from './CollectionModal';
import { useModal } from '@/contexts/UIProvider';

export function GlobalModal() {
    const { modals, closeModal } = useModal();
    
    return (
        <>
            {Object.entries(modals).map(([modalId, modalProps]) => {
                if (!modalProps) {
                    console.error('Invalid modal props:', modalId, modalProps);
                    return null;
                }

                // Handle different modal types
                switch (modalProps.type) {
                    case 'item':
                        if (!modalProps.item) {
                            console.error('ItemModal missing item prop:', modalId, modalProps);
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

                    case 'collection':
                        if (!modalProps.collection || !modalProps.items) {
                            console.error('CollectionModal missing collection/items props:', modalId, modalProps);
                            return null;
                        }
                        return (
                            <CollectionModal 
                                key={modalId}
                                isOpen={true}
                                collection={modalProps.collection}
                                items={modalProps.items}
                                closeModal={() => closeModal(modalId)}
                                onAddCollection={modalProps.onAddCollection}
                            />
                        );

                    default:
                        console.error('Unknown modal type:', modalProps.type, modalId, modalProps);
                        return null;
                }
            })}
        </>
    );
}