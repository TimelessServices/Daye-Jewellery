export function SelectButton({ children, onClick, isSelected = false, disabled = false }) {
    return (
        <button onClick={onClick} disabled={disabled} className={`py-2 px-3 text-sm rounded-lg animate 
                ${ isSelected ? 'bg-dark text-light' : 'border-2 text-dark' } 
                ${ disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer' }`}>
            {children}
        </button>
    );
}
