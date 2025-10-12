"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Scroller } from "../Scroller";
import { ShopItem } from "../shop/ShopItem";
import { useToasts } from "@/contexts/UIProvider";
import { cachedFetch } from "@/utils/RequestCache";
import { CollectionItem } from "../shop/CollectionItem";

function addShopItem(key, item) {
    return (
        <ShopItem
            key={key}
            id={item.JewelleryID}
            desc={item.Desc}
            price={item.Price}
            salePrice={item.SalePrice}
            type={item.Type}
            sizes={item.Sizes}
        />
    );
}

function addCollectionItem(key, item, onSelect) {
    return <CollectionItem key={key} item={item} onSelect={onSelect} />;
}

export function SelectionScroller({ title, apiEndpoint, type = "shop" }) {
    const router = useRouter();
    const navToShop = (id) => {
        router.push(`/shop?collection=${id}`);
    };

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const { addToast } = useToasts();

    const loadScrollItems = async () => {
        if (isLoading || hasLoaded) return;
        setIsLoading(true);

        try {
            const data = await cachedFetch(`/api/${apiEndpoint}`);

            if (data.success) {
                setItems(data.results);
                setHasLoaded(true);
            }
        } catch (error) {
            addToast({ message: `Failed to load ${title}`, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadScrollItems();
    }, [apiEndpoint]);

    return (
        <section className="section p-4 lg:p-12">
            <Scroller title={title}>
                {isLoading ? (
                    <div className="flex gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="w-64 h-80 bg-gray-200 animate-pulse rounded"
                            />
                        ))}
                    </div>
                ) : (
                    items.map((item, index) =>
                        type === "shop"
                            ? addShopItem(`${item.JewelleryID}-${index}`, item)
                            : addCollectionItem(
                                  `${item.CollectionID}-${index}`,
                                  item,
                                  () => navToShop(item.CollectionID)
                              )
                    )
                )}
            </Scroller>
        </section>
    );
}
