export default function ShippingPolicy() {
    return (
        <section className="max-w-4xl mx-auto flex flex-col gap-6 leading-relaxed">
            {/* Returns and exchanges */}
            <h4 className="text-xl font-semibold mt-8">
                Returns and Exchanges:
            </h4>
            <p>
                We accept returns on regular priced items within 14 days of
                the delivery date. Items must be:
            </p>
            <ul className="list-disc ml-10 space-y-1">
                <li>Unworn and in their original condition</li>
                <li>
                    In the original packaging (including boxes and pouches)
                </li>
            </ul>

            {/* Non refundable items */}
            <h4 className="text-xl font-semibold mt-8">
                Non Refundable Items:
            </h4>
            <p>
                Certain items are not returnable unless defective or damaged
                upon arrival. These include:
            </p>
            <ul className="list-disc ml-10 space-y-1">
                <li>
                    Customer or personalised jewellery (engraved pieces or
                    custom orders)
                </li>
                <li>Sale or clearance items</li>
            </ul>

            {/* How to return or Exchange */}
            <h4 className="text-xl font-semibold mt-8">
                How to Return or Exchange
            </h4>
            <p>
                Certain items are not returnable unless defective or damaged
                upon arrival. These include:
            </p>
            <ul className="list-decimal ml-10 space-y-1">
                <li>
                    Customer or personalised jewellery (engraved pieces or
                    custom orders)
                </li>
                <li>Sale or clearance items</li>
            </ul>
        </section>
    );
}