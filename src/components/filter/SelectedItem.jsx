import { X } from 'lucide-react';

export function SelectedItem({ title, isExpanded, onToggleExpand, onRemove, children, index }) {
    return (
        <div className='border-2 border-light rounded-lg'>
            <div className='flex items-center justify-between p-3 cursor-pointer'
                 onClick={() => onToggleExpand(isExpanded ? null : index)}>
                <span className='font-medium'>{title}</span>
                <button onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                    className='text-red'>
                    <X size={16} />
                </button>
            </div>
            
            {isExpanded && (
                <div className='p-3 border-t border-light space-y-3'>
                    {children}
                </div>
            )}
        </div>
    );
}