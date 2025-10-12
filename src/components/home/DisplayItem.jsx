import Image from "next/image";

export function DisplayItem({ title, text, onClick = null }) {
    return (
        <div onClick={onClick} className="flex flex-col text-center text-dark animate rounded-xl 
            hover:outline hover:outline-black/70 hover:scale-90" >
            <div className="relative w-full aspect-square ">
                <Image
                    src={`/${title}_PLACEHOLDER.png`}
                    fill
                    className="object-contain rounded-xl"
                    alt="Image representing one of the many link items in the grid"
                />
            </div>

            <p className="w-full py-2 font-main font-bold text-sm sm:text-base">
                {text}
            </p>
        </div>
    );
}
