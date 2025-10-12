import { Coins, DollarSign, SortAsc } from 'lucide-react';
import { FilterHead } from '@/components/filter/FilterHead';
import TypeSelector from '@/components/filter/TypeSelector';

export default function FilterBasic({filters, updaters}) {
    const sortOptions = [
        { value: "", label: "Featured" }, // Changed default
        
        // Price
        { value: "price_asc", label: "Price: Low to High" },
        { value: "price_desc", label: "Price: High to Low" },

        // Alphabetical
        { value: "name_asc", label: "Name: A - Z" },
        { value: "name_desc", label: "Name: Z - A" },

        // Value
        { value: "biggest_discount", label: "Biggest Savings" },
        { value: "best_value", label: "Best Value (% Off)" },
        
        // Popularity & Trending
        { value: "bestsellers", label: "Best Sellers" },
        { value: "trending", label: "Trending Now" },
        { value: "popular_in_stock", label: "Popular & Available" },
        { value: "hidden_gems", label: "Hidden Gems" },
        
        // New & Date-based
        { value: "newest_first", label: "Just Arrived" },
        { value: "new_arrivals", label: "New & Popular" },
        { value: "oldest_first", label: "Classic Collection" },
        
        // Sales & Promotions  
        { value: "sale_first", label: "On Sale" },
        { value: "sale_best_deals", label: "Best Sale Deals" },
        { value: "clearance", label: "Clearance Items" },
        
        // Availability
        { value: "in_stock_first", label: "In Stock First" },
        { value: "low_stock", label: "Limited Availability" },
        { value: "last_chance", label: "Last Chance" },
        
        // Smart Categories
        { value: "engagement_ready", label: "Engagement Rings" },
        { value: "gift_ready", label: "Perfect for Gifts" },
        { value: "budget_friendly", label: "Budget Friendly" },
        { value: "luxury_items", label: "Luxury Collection" },
        
        // Advanced  
        { value: "smart_featured", label: "Editor's Choice" },
        { value: "editor_picks", label: "Curated Selection" },
        
        // Utility
        { value: "random", label: "Surprise Me" }
    ];

    return (
        <>
            {/* SORT */}
            <div className='p-2 gap-6 flex flex-col'>
                <FilterHead title="Sort" icon={SortAsc} />

                <select value={filters.sort || ""} onChange={(e) => updaters.updateSort(e.target.value)}
                    className="p-2 border-b-2 border-light">
                        {sortOptions.map(option => (
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