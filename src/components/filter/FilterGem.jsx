import { useState, useEffect } from 'react';
import { Diamond } from 'lucide-react';

import gemData from '@/data/gem.json';
import { FilterHead } from '@/components/filter/FilterHead';
import { SelectedItem } from '@/components/filter/SelectedItem';
import { SelectButton } from '@/components/filter/SelectButton';
import { PropertySelector } from '@/components/filter/PropertySelector';

export default function FilterGem({ filters, updaters }) {
    const [selectedGems, setSelectedGems] = useState([]);
    const [expandedGem, setExpandedGem] = useState(null);

    // Sync with filters
    useEffect(() => {
        if (filters.gem) {
            setSelectedGems(filters.gem);
        }
    }, [filters.gem]);

    const addGem = (gemType) => {
        if (selectedGems.length >= 3) return;
        
        const newGem = {
            type: gemType,
            cut: null,
            clarity: null
        };
        
        const updated = [...selectedGems, newGem];
        setSelectedGems(updated);
        updaters.updateGem(updated);
        setExpandedGem(updated.length - 1);
    };

    const removeGem = (index) => {
        const updated = selectedGems.filter((_, i) => i !== index);
        setSelectedGems(updated);
        updaters.updateGem(updated);
        if (expandedGem === index) {
            setExpandedGem(null);
        }
    };

    const updateGemProperty = (index, property, value) => {
        const updated = [...selectedGems];
        updated[index] = { ...updated[index], [property]: value };
        setSelectedGems(updated);
        updaters.updateGem(updated);
    };

    const clearGemProperty = (index, property) => {
        updateGemProperty(index, property, null);
    };

    if (!gemData) {
        return <div className='p-2'>Loading gem data...</div>;
    }

    const availableGems = gemData.types.filter(type => 
        !selectedGems.some(g => g.type === type)
    );

    return (
        <div className='p-2 gap-6 flex flex-col'>
            <FilterHead title="Gemstones" icon={Diamond} />
            
            {/* Selected Gems */}
            {selectedGems.length > 0 && (
                <div className='space-y-3'>
                    {selectedGems.map((gem, index) => {
                        const isExpanded = expandedGem === index;
                        
                        return (
                            <SelectedItem
                                key={index}
                                title={gem.type}
                                index={index}
                                isExpanded={isExpanded}
                                onToggleExpand={setExpandedGem}
                                onRemove={removeGem}
                            >
                                {/* Cut Selector */}
                                <PropertySelector
                                    label="Cut (Optional)"
                                    options={gemData.cuts}
                                    selectedValue={gem.cut}
                                    onSelect={(value) => updateGemProperty(index, 'cut', value)}
                                    onClear={() => clearGemProperty(index, 'cut')}
                                />

                                {/* Clarity Selector */}
                                <PropertySelector
                                    label="Clarity (Optional)"
                                    options={gemData.clarities}
                                    selectedValue={gem.clarity}
                                    onSelect={(value) => updateGemProperty(index, 'clarity', value)}
                                    onClear={() => clearGemProperty(index, 'clarity')}
                                />
                            </SelectedItem>
                        );
                    })}
                </div>
            )}

            {/* Add Gem Buttons */}
            {selectedGems.length < 3 && availableGems.length > 0 && (
                <div>
                    <label className='text-sm text-dark mb-3 block'>
                        Add Gemstone ({selectedGems.length}/3)
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                        {availableGems.map(gemType => (
                            <SelectButton
                                key={gemType}
                                onClick={() => addGem(gemType)}
                            >
                                {gemType}
                            </SelectButton>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}