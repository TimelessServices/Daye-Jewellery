import { useState, useEffect } from 'react';
import { Gem } from 'lucide-react';

import materialData from '@/data/material.json';
import { FilterHead } from '@/components/filter/FilterHead';
import { SelectedItem } from '@/components/filter/SelectedItem';
import { SelectButton } from '@/components/filter/SelectButton';
import { PropertySelector } from '@/components/filter/PropertySelector';

export default function FilterMaterial({ filters, updaters }) {
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [expandedMaterial, setExpandedMaterial] = useState(null);

    // Sync with filters
    useEffect(() => {
        if (filters.material) {
            setSelectedMaterials(filters.material);
        }
    }, [filters.material]);

    const addMaterial = (materialName) => {
        if (selectedMaterials.length >= 3) return;
        
        const newMaterial = {
            type: materialName,
            purity: null,
            color: null
        };
        
        const updated = [...selectedMaterials, newMaterial];
        setSelectedMaterials(updated);
        updaters.updateMaterial(updated);
        setExpandedMaterial(updated.length - 1);
    };

    const removeMaterial = (index) => {
        const updated = selectedMaterials.filter((_, i) => i !== index);
        setSelectedMaterials(updated);
        updaters.updateMaterial(updated);
        if (expandedMaterial === index) {
            setExpandedMaterial(null);
        }
    };

    const updateMaterialProperty = (index, property, value) => {
        const updated = [...selectedMaterials];
        updated[index] = { ...updated[index], [property]: value };
        setSelectedMaterials(updated);
        updaters.updateMaterial(updated);
    };

    const clearMaterialProperty = (index, property) => {
        updateMaterialProperty(index, property, null);
    };

    if (!materialData) {
        return <div className='p-2'>Loading material data...</div>;
    }

    const availableMaterials = Object.keys(materialData)
        .filter(name => !selectedMaterials.some(m => m.type === name));

    return (
        <div className='p-2 gap-6 flex flex-col'>
            <FilterHead title="Materials" icon={Gem} />
            
            {/* Selected Materials */}
            {selectedMaterials.length > 0 && (
                <div className='space-y-3'>
                    {selectedMaterials.map((material, index) => {
                        const materialInfo = materialData[material.type];
                        const isExpanded = expandedMaterial === index;
                        
                        return (
                            <SelectedItem
                                key={index}
                                title={material.type}
                                index={index}
                                isExpanded={isExpanded}
                                onToggleExpand={setExpandedMaterial}
                                onRemove={removeMaterial}
                            >
                                {/* Purity Selector */}
                                {materialInfo && materialInfo.purities.length > 1 && (
                                    <PropertySelector
                                        label="Purity"
                                        options={materialInfo.purities}
                                        selectedValue={material.purity}
                                        onSelect={(value) => updateMaterialProperty(index, 'purity', value)}
                                        onClear={() => clearMaterialProperty(index, 'purity')}
                                        renderOption={(purity) => purity.label}
                                    />
                                )}
                                
                                {/* Color Selector */}
                                {materialInfo && materialInfo.colors.length > 1 && (
                                    <PropertySelector
                                        label="Color"
                                        options={materialInfo.colors}
                                        selectedValue={material.color}
                                        onSelect={(colorObj) => updateMaterialProperty(index, 'color', colorObj.name || colorObj)}
                                        onClear={() => clearMaterialProperty(index, 'color')}
                                        renderOption={(color) => (
                                            <div className='flex items-center gap-2'>
                                                <div className='w-3 h-3 rounded-full border border-light'
                                                    style={{ backgroundColor: color.hex }}></div>
                                                {color.name}
                                            </div>
                                        )}
                                    />
                                )}
                            </SelectedItem>
                        );
                    })}
                </div>
            )}

            {/* Add Material Buttons */}
            {selectedMaterials.length < 3 && availableMaterials.length > 0 && (
                <div>
                    <label className='text-sm text-dark mb-3 block'>
                        Add Material ({selectedMaterials.length}/3)
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                        {availableMaterials.map(materialName => (
                            <SelectButton
                                key={materialName}
                                onClick={() => addMaterial(materialName)}
                            >
                                {materialName}
                            </SelectButton>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}