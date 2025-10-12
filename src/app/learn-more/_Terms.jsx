"use client";

const headers = [
  ["general", "General Information"],
  ["eligibility", "Eligibility"],
  ["orders", "Orders and Payment"],
  ["shipping", "Shipping and Delivery"],
  ["returns", "Returns and Exchanges"],
  ["product", "Product Information"],
  ["ip", "Intellectual Property"],
  ["privacy", "Privacy"],
  ["liability", "Limitation of Liability"],
  ["changes", "Changes to Terms"],
  ["contact", "Contact Us"],
];

function HeaderNav() {
    return (
        <nav className="w-full lg:w-1/4 h-full p-4 bg-light rounded-lg" aria-label="Quick links">
            <h2 className="mb-4 p-2 text-xl font-title font-bold border-b-2 border-dark">Quick Links</h2>
            <ul className="w-full gap-4 flex flex-col list-disc">
                {headers.map((h) => (
                    <a key={h[0]} className="w-full text-dark p-2 underline" href={`#${h[0]}`}>
                        {h[1]}
                    </a>
                ))}
            </ul>
        </nav>
    );
}

export default function TermsPolicy() {
    return (
        <section className="w-full mx-auto p-5 gap-5 text-dark flex flex-col lg:flex-row">
            <HeaderNav />
            
            <section className="w-full lg:w-3/4 flex flex-col px-8 gap-6 leading-relaxed">
                <p>
                    The terms and conditions govern your use of Daye Jewellery's
                    website and purchase of goods for our team. By using our
                    site or making a purchase, you agree to commit by these
                    terms.
                </p>

                <h4 id="general" className="text-xl font-semibold mt-8">
                    General Information
                </h4>
                <p>
                    Daye Jewellery is a retailer of handcrafted and curated
                    jewellery. Our website furnishes information and enables you
                    to purchase our products online.
                </p>

                <h4 id="eligibility" className="text-xl font-semibold mt-8">
                    Eligibility
                </h4>
                <p>
                    To use Daye Jewellery's website and purchase goods, you must
                    be atleast 18 years of age or have the permission of a legal
                    guardian. By placing an order, you confirm that you meet
                    this requirement.
                </p>

                <h4 id="orders" className="text-xl font-semibold mt-8">
                    Orders and Payment
                </h4>
                <ul className="list-disc ml-10 space-y-1">
                    <li>
                        All orders are subject to availability and acceptance.
                    </li>
                    <li>Price may change without notice.</li>
                    <li>We accept payment via (apple pay, paypal, visa).</li>
                    <li>
                        A confirmation email will be sent once your order is
                        placed.
                    </li>
                    <li>
                        We reserve the right to cancel any order for reasons
                        including fraud, errors, or stock availability.
                    </li>
                </ul>

                <h4 id="shipping" className="text-xl font-semibold mt-8">
                    Shipping and Delivery
                </h4>
                <ul className="list-disc ml-10 space-y-1">
                    <li>
                        Shipping cost and estimated delivery time are included
                        at checkout.
                    </li>
                    <li>
                        Delivery times may vary depending on location and
                        carrier performance.
                    </li>
                    <li>
                        We are not responsible for delays caused by customs or
                        unforeseen circumstances.
                    </li>
                </ul>

                <h4 id="returns" className="text-xl font-semibold mt-8">
                    Returns and Exchanges
                </h4>
                <ul className="list-disc ml-10 space-y-1">
                    <li>Returns and exchanges within 14 days of delivery.</li>
                    <li>
                        Items must be returned in their original, unworn
                        condition and packaging.
                    </li>
                    <li>
                        Custom or engraved items are non-refundable unless
                        faulty.
                    </li>
                    <li>
                        Regarding any returns, please contact us at{" "}
                        <span className="underline">
                            dayejewelleryhelp@gmail.com{" "}
                        </span>
                    </li>
                </ul>

                <h4 id="product" className="text-xl font-semibold mt-8">
                    Product Information
                </h4>
                <p>
                    We strive to project accuracy in product descriptions,
                    images, and pricing. However, slight variations in colour,
                    finish, or texture may occur due to handmade nature of our
                    jewellery.
                </p>

                <h4 id="ip" className="text-xl font-semibold mt-8">
                    Intellectual Property
                </h4>
                <p>
                    All content on Daye Jewellery's website, including logos,
                    designs, images and text, is the property of Daye Jewellery
                    or its licensors. Use of our content without written
                    permission is prohibited.
                </p>

                <h4 id="privacy" className="text-xl font-semibold mt-8">
                    Privacy
                </h4>
                <p>
                    We collect and process your personal data in accordance with
                    our privacy policy. By using our website, you consent to the
                    collection and use.
                </p>

                <h4 id="liability" className="text-xl font-semibold mt-8">
                    Limitation of Liability
                </h4>
                <p>
                    We are not liable for any indirect, incidental, or
                    consequential damages arising from the use of our products
                    or website, to the fullest extent permitted by law.
                </p>

                <h4 id="changes" className="text-xl font-semibold mt-8">
                    Changes to Terms
                </h4>
                <p>
                    We reserve the right to update or modify these terms at any
                    given time.
                </p>

                <h4 id="contact" className="text-xl font-semibold mt-8">
                    Contact Us
                </h4>
                <p>
                    If you have any questions about the terms, please contact us
                    at{" "}
                    <span className="underline">
                        dayejewelleryhelp@gmail.com{" "}
                    </span>
                </p>
            </section>
        </section>
    );
}