export default function TypeSelector({ selectedTypes, onUpdate }) {
    const typeOptions = ["Ring", "Necklace", "Bracelet", "Earring"];
    const allSelected = selectedTypes.length === 4;
    
    const handleAllClick = () => {
        if (allSelected) { onUpdate([typeOptions[0]]); } 
        else { onUpdate([...typeOptions]); }
    };
    
    const handleTypeClick = (type) => {
        const currentTypes = selectedTypes || [];
        
        if (allSelected) { onUpdate([type]); } 
        else {
            if (currentTypes.includes(type)) {
                const newTypes = currentTypes.filter(t => t !== type);
                
                if (newTypes.length === 0) { onUpdate([...typeOptions]); } 
                else { onUpdate(newTypes); }
            } 
            else { onUpdate([...currentTypes, type]); }
        }
    };
    
    return (
        <div className="grid grid-cols-2 gap-2">
            <button onClick={handleAllClick} className={`col-span-2 py-2 px-3 rounded-lg animate ${
                allSelected ? 'bg-dark text-light font-medium' : 'border-2 bg-white text-dark' }`}>All Items</button>

            {typeOptions.map(type => {
                const isSelected = selectedTypes.includes(type) && !allSelected;
                
                return (
                    <button key={type} onClick={() => handleTypeClick(type)} className={`py-2 px-3 rounded-lg animate ${
                        isSelected ? 'bg-dark text-light font-medium' : 'border-2 bg-white text-dark' }`}>{type}</button>
                );
            })}
        </div>
    );
}