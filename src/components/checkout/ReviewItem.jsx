import Image from "next/image";

function getImg(type) {
    switch(type) {
        case 'N': return "NECKLACE";
        case 'B': return 'BRACELET';
        case 'R': return 'RING';
        case 'E': return 'EARRING';
        default: return 'ITEM';
    }
}

export default function ReviewItem({ item }) {
    const itemTotal = (item.price * item.quantity).toFixed(2);

    return (
        <div className="p-4 gap-4 flex flex-col items-center md:flex-row">
            <div className="relative w-24 aspect-square">
                <Image fill src={`/${getImg(item.type)}_PLACEHOLDER.png`} alt={item.desc} className="object-contain rounded-lg" />
            </div>

            <div className="gap-4 flex-1 flex flex-col">
                <div className="text-lg font-semibold">{item.desc}</div>

                <div className="flex justify-between">
                    <div>
                        <div className="text-sm text-dark/85">Size: {item.size}</div>
                        <div className="text-sm text-dark/85">Qty: {item.quantity}</div>
                    </div>

                    <div className="text-right">
                        <div className="text-md font-bold">${itemTotal}</div>
                        <div className="text-sm text-dark/85">${item.price} each</div>
                    </div>
                </div>
            </div>
        </div>
    );
}