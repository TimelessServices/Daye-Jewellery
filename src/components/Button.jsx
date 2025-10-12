import { Loader2 } from 'lucide-react';

export function Button({wd = "w-full", text, onClick = null, disabled = null, loading = false, className = ""}) {
    return ( 
        <button onClick={onClick} disabled={disabled || loading} className={`${wd} py-4 text-xl text-light bg-dark 
            rounded-sm font-title  animate hover:bg-black hover:scale-95 hover:drop-shadow-2xl disabled:opacity-75 
            ${className}`}>
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Loading...</span>
                    </div>
                ) : text}
            </button> 
    );
}