"use client";

const headers = [
  ["info-we-collect", "Information we collect"],
  ["info-we-use", "How we use your Information"],
  ["info-we-share", "Sharing your information"],
  ["marketing", "Marketing & Communications"],
  ["rights", "Your Rights"],
  ["cookies", "Cookies Policy"],
  ["retention", "Data Retention"],
  ["security", "Security"],
  ["3rd-party", "Third Party Links"],
  ["international", "International Users"],
  ["changes", "Changes to this Policy"],
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

export default function PrivacyPolicy() {
  return (
    <section className="w-full mx-auto p-5 gap-5 text-dark flex flex-col lg:flex-row">
        <HeaderNav />

        <section className="w-full lg:w-3/4 flex flex-col px-8 gap-6 leading-relaxed">
            <p> 
                Your privacy matters. This privacy policy outlines how we collect, 
                use, disclose and protect your personal information.
            </p>

            <p> By using our website, you agree to the following practices: </p>

            <h4 id="info-we-collect" className="text-xl font-semibold mt-8">Information we collect</h4>

            <ol className="ml-6 mt-2 space-y-1">Information you provide:</ol>
            <ul className="list-disc ml-10 space-y-1">
                <li>Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Shipping and Billing Address</li>
                <li>Payment Information (processes securely by third parties)</li>
                <li>Account and Login Details</li>
                <li>Inquiries You Submit</li>
            </ul>

            <ol className="ml-6 mt-4 space-y-1">Information we automatically collect:</ol>
            <ul className="list-disc ml-10 space-y-1">
                <li>IP Address</li>
                <li>Browser type, device type and operating system</li>
                <li>Pages visited and time spent on site</li>
                <li>Reffering website or search</li>
                <li>Cookies</li>
            </ul>

            <h4 id="info-we-use" className="text-xl font-semibold mt-8">How we use your Information</h4>
            <ul className="list-disc ml-10 space-y-1">
                <li>Process your orders and manage your account</li>
                <li>Deliver customer service and respond to inquiries</li>
                <li>Send transactional and promotional emails (with consent)</li>
                <li>Analyse website usage and improve user experience</li>
                <li>Detect fraud, comply with legal obligations, or enforce our policies</li>
            </ul>

            <h4 id="info-we-share" className="text-xl font-semibold mt-8">Sharing your information</h4>

            <ol className="ml-6 mt-2 space-y-1">
                We do not sell your personal data by no means. However, we may share with
            </ol>
            <ul className="list-disc ml-10 space-y-1">
                <li>Service providers: payment gatewats, shipping partners, marketing tools, IT support</li>
                <li>Deliver customer service and respond to inquiries</li>
                <li>Send transactional and promotional emails (with consent)</li>
                <li>Analyse website usage and improve user experience</li>
                <li>Detect fraud, comply with legal obligations, or enforce our policies</li>
            </ul>

            <h4 id="marketing" className="text-xl font-semibold mt-8">Marketing and Communication</h4>
            <p>
                If you opt-in to receive our marketing emails, we may send
                updates, promotions, and product news. You can unsubscribe
                at any time using the link in our emails or by contacting
                us.
            </p>

            <h4 id="rights" className="text-xl font-semibold mt-8">Your Rights</h4>

            <ol className="ml-6 mt-2 space-y-1">Depending on your country or region, you may have the right to:</ol>
            <ul className="list-disc ml-10 space-y-1">
                <li>Access your personal data</li>
                <li>Correct or update inaccurate information</li>
                <li>Delete your data</li>
                <li>Withdraw consent or object to processing</li>
                <li>Request data portability</li>
            </ul>

            <p>
                To exercise the rights, please email us at{" "}
                <span className="underline"> dayejewelleryhelp@gmail.com </span>
            </p>

            <h4 id="cookies" className="text-xl font-semibold mt-8">Cookies Policy</h4>
            <p>
                The cookies policy explains that cookies are small text
                files stored on your device to enhance your browsing
                experience by understanding user behaviour, improving site
                functionality, and personalising content.
            </p>

            <ol className="ml-6 mt-2 space-y-1">The site uses four types of cookies:</ol>
            <ul className="list-disc ml-10 space-y-1">
                <li>Strictly necessary cookies for essential navigation through basic functions like checkout</li>
                <li>Performance/analytics cookies to monitor and improve site usage</li>
                <li>Functional cookies to remember user preferences</li>
                <li>Withdraw consent or object to processing</li>
                <li>and Targeting/advertising cookies to deliver relevant ads and track performance</li>
            </ul>
                
            <p>
                Users can manage or disable cookies via
                browser settings, with options to delete, block, or clear
                cookies, or browse in private mode. Though disabling certain
                cookies may impact site functionality.
            </p>

            <h4 id="retention" className="text-xl font-semibold mt-8">Data Retention</h4>
            <p>
                We retain your personal data only as long as necessary for
                the purposes outlined above or as required by law.
            </p>

            <h4 id="security" className="text-xl font-semibold mt-8">Security</h4>
            <p>
                We implement reasonable security measures to protect your
                information. However, no internet transmission is completely
                secure. Use our services at your own risk.
            </p>

            <h4 id="3rd-party" className="text-xl font-semibold mt-8">Third Party Links</h4>
            <p>
                Our website may contain links to third-party websites. We
                are not responsible for their privacy practices. Please
                review their policies before submitting any personal data.
            </p>

            <h4 id="international" className="text-xl font-semibold mt-8">International Users</h4>
            <p>
                If you are accessing our website from outside Australia, you
                understand that your information may be transferred to and
                processed in Australia, which may have different data
                protection laws than your own.
            </p>

            <h4 id="changes" className="text-xl font-semibold mt-8">Changes to This Policy</h4>
            <p>
                We may update this Privacy Policy occasionally - Changes
                will be posted on this page with the effective date updated
                above.
            </p>

            <h4 id="contact" className="text-xl font-semibold mt-8">Contact Us</h4>
            <p>
                For any questions about this policy or your personal data, please contact:
                <span className="underline">dayejewelleryhelp@gmail.com</span>
            </p>
        </section>
    </section>
  );
}