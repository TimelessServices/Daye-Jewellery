'use client';
import { Search, Filter } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/Button';
import { cachedFetch } from "@/utils/RequestCache";
import { Toggle } from '@/components/filter/Toggle';
import { useFilters } from '@/contexts/FilterContext';
import { useToasts, useLoading, useModal } from '@/contexts/UIProvider';

import ShopGrid from '@/components/shop/ItemGrid';
import CollectionScroller from '@/components/collection/Scroller';

export default function Shop() {
    const [items, setItems] = useState([]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const { addToast } = useToasts();
    const { openModal } = useModal();
    const { loading, setLoading } = useLoading();
    
    const { filters, filterUpdaters, isHydrated } = useFilters();
    const itemsPerPage = 20;

    const loadItems = useCallback(async (loadingKey = "shopGrid", currentPage = 0, clearGrid = false, filtersToUse = null) => {
        if (loading.shopGrid || loading.loadMore) return;
        
        const activeFilters = filtersToUse || filters;
        if (!activeFilters) return;
        
        setLoading(loadingKey, true);
        
        try {
            const params = new URLSearchParams({
                filters: JSON.stringify(activeFilters),
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            });
            const data = await cachedFetch(`/api/jewellery?${params}`)

            if (data.success) {
                if (clearGrid) { setItems(data.results); } 
                else { setItems(prev => [...prev, ...data.results]); }
                setHasMore(data.hasMore);
                setPage(currentPage);
            } 
        } 
        catch (error) { addToast({ message: 'Failed to load items', type: 'error' }); } 
        finally { setLoading(loadingKey, false); }
    }, [loading.shopGrid, loading.loadMore, filters, setLoading, addToast]); 

    useEffect(() => {
        if (filters && isHydrated) {
            setItems([]);
            setPage(0);
            setHasMore(true);
            loadItems("shopGrid", 0, true, filters); 
        }
    }, [filters, isHydrated, loadItems]);

    // Load more items
    const loadMore = useCallback(() => {
        if (!loading.loadMore && hasMore) { loadItems("loadMore", page + 1, false, filters); }
    }, [loading, hasMore, page, loadItems, filters]);

    const openFilterModal = () => {
        openModal('filters', {
            type: 'filter',
            filters: filters,
            updaters: filterUpdaters
        });
    };

    if (!isHydrated || !filters) return <div>Loading...</div>;

    return (
        <section className='lg:px-12'>
            <CollectionScroller />
            
            <div className="w-full p-4">
                <div className="fixed bottom-6 right-6 z-[500]">
                    <button onClick={openFilterModal} className="bg-dark text-white p-5 rounded-full border border-light/70"> 
                        <Filter size={24} /> 
                    </button>
                </div>

                <div className='w-full mb-4 gap-6 flex flex-col sm:flex-row items-center justify-center'>
                    <div className='w-full sm:w-3/4 p-2 gap-2 flex flex-row items-center border-2 border-dark/40 rounded-lg'>
                        <input type="text" placeholder="Search..." defaultValue={filters?.search || ''}
                            onChange={(e) => filterUpdaters.updateSearch(e.target.value)} 
                            className="w-full focus:outline-none" />
                        <Search className='pointer-events-none w-6 h-6' />
                    </div>

                    <Toggle checked={filters?.onSale || false} label="Sale Items Only" id="sale-toggle" onChange={filterUpdaters.updateOnSale} />
                </div>

                {/* Shop Grid */}
                <div className='max-h-full p-8'>
                    <ShopGrid items={items} />

                    {loading.shopGrid && <p>Loading...</p>}

                    {!loading.shopGrid && hasMore && items.length > 0 && ( 
                        <div className='text-center py-8'> 
                            <Button wd="w-full lg:w-1/3" text="Load More" onClick={loadMore} 
                                disabled={loading.loadMore} loading={loading.loadMore} /> 
                        </div>
                    )}

                    {!hasMore && items.length > 0 && ( 
                        <p className="text-center py-8 text-dark">All Items Loaded</p> 
                    )}

                    {items.length === 0 && (
                        <p className="text-center py-8 text-dark">No Items Found</p>
                    )}
                </div>
            </div>
        </section>
    );
}