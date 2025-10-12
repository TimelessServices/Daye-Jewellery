"use client";
import { useSearchParams } from "next/navigation";

import FAQs from "./_FAQ";
import TermsPolicy from "./_Terms";
import PrivacyPolicy from "./_Privacy";
import WarrantyPolicy from "./_Warranty";
import ShippingPolicy from "./_Shipping";

const policyTitles = {
	faq: "Frequently Asked Questions",
	shipping: "Shipping & Returns",
	terms: "Terms & Conditions",
	warranty: "Warranty Policy",
  	privacy: "Privacy Policy"
};

export default function PoliciesController() {
	const searchParams = useSearchParams();
	const policy = searchParams.get("find") || "";

	const policyComponents = {
		faq: <FAQs />,
		terms: <TermsPolicy />,
		privacy: <PrivacyPolicy />,
		warranty: <WarrantyPolicy />,
		shipping: <ShippingPolicy />
	};

	return (
		<main className="w-full min-h-screen p-4 font-main text-dark">
			<section className="max-w-[1200px] mx-auto flex flex-col gap-6 leading-relaxed">
				<div className="border-b-2 border-dark">
					<h1 className="text-2xl md:text-3xl font-title font-bold text-center mb-8">
						{policyTitles[policy] || "Policies"}
					</h1>
				</div>

				{policyComponents[policy] || (
					<div>
						<p>
							Please select a policy to view. Use the links in the footer or{" "}
							<a href="/policies?policy=privacy" className="underline"> click here </a>{" "}
							to view our Privacy Policy.
						</p>
					</div>
				)}
			</section>
		</main>
	);
}