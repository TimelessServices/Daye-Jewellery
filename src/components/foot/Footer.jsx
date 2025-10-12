import Link from "next/link";
import { Copyright } from "lucide-react";

export default function Footer() {
    return (
        <div className="w-full mt-8 px-8 py-4 gap-4 flex flex-col bg-black text-light">
            <div className="w-full py-4 gap-10 flex flex-col items-center justify-center border-b-2 border-light lg:flex-row">
                <Link href="/learn-more?find=faq" className="animate hover:text-white hover:scale-110">FAQ</Link>
                <Link href="/learn-more?find=privacy" className="animate hover:text-white hover:scale-110">Privacy Policy</Link>
                <Link href="/learn-more?find=warranty" className="animate hover:text-white hover:scale-110">Warranty Policy</Link>
                <Link href="/learn-more?find=shipping" className="animate hover:text-white hover:scale-110">Shipping & Returns</Link>
                <Link href="/learn-more?find=terms" className="animate hover:text-white hover:scale-110">Terms & Conditions</Link>
            </div>

            <div className="w-full flex flex-col items-center justify-center text-center 
                lg:flex-row lg:text-left lg:justify-between">
                <div className="p-2 flex flex-col gap-1">
                    <h2 className="text-2xl text-bold font-title">DAYE JEWELLERY</h2>
                    <div className="flex gap-2 items-center">
                        <Copyright size={14} /> <p>{new Date().getFullYear()}, All Rights Reserved.</p>
                    </div>
                </div>

                <div className="p-2 flex gap-4">
                    <p>Facebok</p>
                    <p>Insta</p>
                </div>
            </div>
        </div>
    );
}