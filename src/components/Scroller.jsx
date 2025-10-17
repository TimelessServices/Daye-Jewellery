import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Scroller({ title, children }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        slidesToScroll: 1, containScroll: 'trimSnaps',
        breakpoints: {
            '(min-width: 640px)': { slidesToScroll: 1 },
            '(min-width: 1024px)': { slidesToScroll: 1 }
        }
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // Track if we can scroll (for button states)
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="w-full mx-8 my-4">
            {/* Title and Navigation Header */}
            <div className="flex justify-between items-center border-b-2 border-dark pb-2">
                <h2 className="pl-2 text-2xl text-dark font-title">{title}</h2>
                
                <div className="flex gap-2">
                    <button onClick={scrollPrev} disabled={!canScrollPrev}
                        className={`p-2 rounded transition-colors text-dark ${
                            canScrollPrev ? 'hover:bg-dark hover:text-light' : 'cursor-not-allowed opacity-50'
                        }`}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button onClick={scrollNext} disabled={!canScrollNext}
                        className={`p-2 rounded transition-colors text-dark ${
                            canScrollNext ? 'hover:bg-dark hover:text-light' : 'cursor-not-allowed opacity-50'
                        }`}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Embla Container */}
            <div className="p-4 overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                    {React.Children.map(children, (child, i) => (
                        <div key={i} className="flex-[0_0_100%] sm:flex-[0_0_35%] lg:flex-[0_0_20%] min-w-0">
                            {child}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
