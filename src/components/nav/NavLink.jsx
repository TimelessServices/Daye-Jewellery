import Link from "next/link";

export function NavLink({ link, classes = "", onClick = null, ref = null, children }) {
    const handleClick = (e) => {
        if (onClick) {
            if (link === "#") { e.preventDefault(); }
            onClick(e);
        }
    };

    return (
        <Link href={link} ref={ref} onClick={handleClick} className={`${classes} font-title tracking-wide animate hover:scale-95`}>
            {children}
        </Link>
    );
}