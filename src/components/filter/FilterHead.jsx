export function FilterHead({title, icon: Icon}) {
    return (
        <div className="w-full flex flex-row text-dark">
            <div className="w-1/5 p-2 flex items-center justify-center bg-dark rounded-lg rounded-br-none">
                {Icon && (<Icon className="pointer-events-none w-6 h-6 text-light" />)}
            </div>
            <h2 className="w-4/5 p-2 text-lg font-title border-b-2 border-dark">{title}</h2>
        </div>
    );
}