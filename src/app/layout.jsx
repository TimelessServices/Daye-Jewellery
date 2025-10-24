import { Montserrat, Sofia_Sans } from "next/font/google";
import "../styles/globals.css";

import { Suspense } from "react";
import { UIProvider } from "@/contexts/UIProvider";
import { AppProvider } from "@/contexts/AppProvider";
import { ToastContainer } from '@/components/ToastContainer';
import { GlobalModal } from "@/components/modals/GlobalModal";

import Footer from "@/components/foot/Footer";
import NavController from "@/components/nav/NavController";

const montserrat = Montserrat({
	variable: "--font-montserrat", subsets: ["latin"]
});

const sofiaSans = Sofia_Sans({
  	variable: "--font-sofia-sans", subsets: ["latin"]
});

export const metadata = {
	title: "Daye Jewellery",
	description: "Handcrafted, everyday pieces designed for effortless style. Unique, modern, and made to last — find jewellery that tells your story."
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" className="scroll-smooth scroll-p-[120px]">
			<body className={`${montserrat.variable} ${sofiaSans.variable} antialiased min-h-screen flex flex-col`}>
				<Suspense fallback={
					<div className="w-full h-dvh flex flex-col items-center justify-center text-center text-bold">
						<h1 className="text-3xl">Loading Content</h1>
						<p className="text-lg">Please Be Patient</p>
					</div>
				}>
                                        <UIProvider>
                                                <AppProvider>
                                                        <NavController />
                                                        <main className="flex-1"> {children} </main>
                                                        <Footer />

                                                        <GlobalModal />
                                                        <ToastContainer />
                                                </AppProvider>
                                        </UIProvider>
                                </Suspense>
			</body>
		</html>
	);
}
