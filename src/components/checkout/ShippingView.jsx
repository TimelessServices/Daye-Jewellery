import { allCountries } from "country-region-data";

export default function ShippingView({ shipping, onEdit }) {
    // Get country name from code
    const getCountryName = (countryCode) => {
        const country = allCountries.find(c => c[1] === countryCode);
        return country ? country[0] : countryCode;
    };

    // Format full address
    const formatFullAddress = () => {
        const parts = [
            shipping.street,
            shipping.city,
            shipping.state,
            shipping.zip,
            getCountryName(shipping.country)
        ].filter(Boolean);
        
        return parts.join(', ');
    };

    return (
        <div className="bg-white p-4 gap-8 flex flex-col rounded-lg shadow">
            <div className="gap-4 flex flex-col justify-between items-center md:flex-row">
                <h2 className="text-xl font-semibold">Shipping Details</h2>
                <div className="gap-4 flex items-center">
                    <span className="text-sm text-green bg-green/10 px-3 py-2 rounded">✓ Confirmed</span>
                    <button onClick={onEdit} className="text-sm bg-dark/10 px-3 py-2 rounded cursor-pointer animate
                        hover:scale-95 hover:bg-dark/35">Edit Details</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-medium text-dark/70">Street Address</label>
                    <div className="text-dark font-medium">{shipping.street}</div>
                </div>
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">City</label>
                    <div className="text-dark font-medium">{shipping.city}</div>
                </div>
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">Country</label>
                    <div className="text-dark font-medium">{getCountryName(shipping.country)}</div>
                </div>
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">State/Province</label>
                    <div className="text-dark font-medium">{shipping.state || 'N/A'}</div>
                </div>
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">ZIP / Post Code</label>
                    <div className="text-dark font-medium">{shipping.zip}</div>
                </div>
            </div>

            {/* Full Address Summary */}
            <div className="mt-4 p-3 bg-light/30 rounded border-l-4 border-blue">
                <label className="block text-sm font-medium text-dark/70 mb-1">Shipping To:</label>
                <div className="text-dark font-medium">{formatFullAddress()}</div>
            </div>
        </div>
    );
}
