export function Badge({ type, text }) {
    if (type !== 'SET' && type !== 'DEAL') { return null; }

    const badgeConfig = {
        SET: { color: 'bg-orange', position: 'top-2 left-2' },
        DEAL: { color: 'bg-blue', position: 'bottom-2 right-2' }
    };

    const config = badgeConfig[type];

    return (
        <div className={`absolute ${config.position} p-1 lg:px-3 lg:py-2 rounded-full text-xs font-bold text-light ${config.color}
            uppercase shadow-lg tracking-wide z-10 animate hover:scale-105`}> {text} </div>
    );
}