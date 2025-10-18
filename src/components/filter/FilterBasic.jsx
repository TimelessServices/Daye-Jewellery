import { Coins, DollarSign, SortAsc } from 'lucide-react';
import { FilterHead } from '@/components/filter/FilterHead';

import sortOptions from '@/data/sort-options.json';
import TypeSelector from '@/components/filter/TypeSelector';

export default function FilterBasic({filters, updaters}) {
    return (
        <>
            {/* SORT */}
            <div className='p-2 gap-6 flex flex-col'>
                <FilterHead title="Sort" icon={SortAsc} />

                <select value={filters.sort || ""} onChange={(e) => updaters.updateSort(e.target.value)}
                    className="p-2 border-b-2 border-light">
                        {sortOptions.options.map(option => (
                            <option key={option.value} value={option.value} className='p-1'>{option.label}</option>
                        ))}
                </select>
            </div>

            {/* PRICE */}
            <div className='p-2 gap-6 flex flex-col'>
                <FilterHead title="Price" icon={DollarSign} />

                <div className='p-2 gap-4 flex flex-row text-center justify-between'>
                    <input type='number' placeholder='Min' value={filters.price?.min || ""} className='w-2/5 border-b-2 border-light'
                        onChange={(e) => updaters.updatePrice(parseInt(e.target.value) || 0, filters.price?.max || 5000)} />

                    <p className='w-1/5 text-lg text-dark'>-</p>

                    <input type='number' placeholder='Max' value={filters.price?.max || ""} className='w-2/5 border-b-2 border-light'
                        onChange={(e) => updaters.updatePrice(filters.price?.min || 0, parseInt(e.target.value) || 5000)} />
                </div>
            </div>
            
            {/* TYPE */}
            <div className='p-2 gap-6 flex flex-col'>
                <FilterHead title="Type" icon={Coins} />

                <TypeSelector selectedTypes={filters.types || ["Ring", "Necklace", "Bracelet", "Earring"]}
                    onUpdate={updaters.updateTypes} />
            </div>
        </>
    );
}