import { ShopItem } from "../shop/ShopItem";

export default function CollectionGrid({ items }) {
    return (
        <div className="w-full px-4 flex-1 overflow-y-auto">
            <div className="w-full gap-4 sm:gap-6 lg:gap-8 xl:gap-10 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 
                md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((item, index) => (
                    <ShopItem key={`${item.JewelleryID}-${index}`} id={item.JewelleryID} desc={item.Desc} 
                        price={item.Price} type={item.Type} sizes={item.Sizes} />
                ))}
            </div>
        </div>
    );
}