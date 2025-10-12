"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import NavMobile from "./NavMobile";
import NavPrimary from "./NavPrimary";
import NavTablet from "./NavTablet";

export default function NavController() {
    const pathname = usePathname();
    const [deviceType, setDeviceType] = useState("desktop");

    const fixedPositionPages = ["/"];
    const isFixedPage = fixedPositionPages.includes(pathname);

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDeviceType('mobile');
            } else if (width <= 1280) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    const getPositionClasses = () => {
        if (isFixedPage) { return "fixed"; } else { return "sticky mb-8"; }
    };

    return (
        <header className={`${getPositionClasses()} mx-4 lg:mx-8 top-5 left-0 right-0 bg-white rounded-lg shadow-lg z-[999]`}>
            { deviceType === 'mobile' && <NavMobile /> }
            { deviceType === 'tablet' && <NavTablet /> }
            { deviceType === 'desktop' && <NavPrimary /> }
        </header>
    );
}
