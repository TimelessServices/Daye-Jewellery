import { ShopItem } from "./Item";

export default function ShopGrid({ items }) {
    return (
        <div className="w-full px-4 flex-1 overflow-y-auto">
            <div className="w-full gap-4 sm:gap-6 lg:gap-8 xl:gap-10 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 
                md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((item, index) => ( 
                    <ShopItem key={`${item.JewelleryID}-${index}`} item={item} /> 
                ))}
            </div>
        </div>
    );
}