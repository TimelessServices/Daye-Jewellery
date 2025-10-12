import { SelectButton } from '@/components/filter/SelectButton';

export function PropertySelector({ label, options, selectedValue, onSelect, onClear, renderOption = (option) => option }) {
    return (
        <div>
            <div className='flex items-center justify-between mb-2'>
                <label className='text-sm text-dark'>{label}</label>
                {selectedValue && (
                    <button onClick={onClear} className='text-xs text-dark hover:text-red underline'> Clear </button>
                )}
            </div>

            <div className='flex flex-wrap gap-2'>
                {options.map((option, index) => (
                    <SelectButton key={index} isSelected={selectedValue === (option.value || option.name || option)}
                        onClick={() => onSelect(option.value || option)}> {renderOption(option)} </SelectButton>
                ))}
            </div>
        </div>
    );
}