'use client';
import ShopGrid from '@/components/shop/ShopGrid';
import CollectionScroller from '@/components/collection/Scroller';

export default function Shop() {
    return (
        <section className='px-12'>
            <CollectionScroller />
            <ShopGrid />
        </section>
    );
}