import { useState } from "react";

import { Button } from "../Button";
import InputField from "./InputField";
import { useToasts } from "@/contexts/UIProvider";
import { allCountries } from "country-region-data";
import { useAddressValidation } from "@/hooks/useAddressValidation";

export default function ShippingDetails({ shipping, onChange, onValidation, onBulkUpdate }) {
	const { addToast } = useToasts(); 
	const [touched, setTouched] = useState({});
	const [showErrors, setShowErrors] = useState(false);

	const { regions, validateAddress } = useAddressValidation(shipping);

	function handleChange(e) {
		onValidation(false);
		const { name, value } = e.target;
		onChange(name, value);
	}

	function handleBlur(e) { setTouched(prev => ({ ...prev, [e.target.name]: true })); }

	function handleConfirm() {
		const { errors, isValid, normalized } = validateAddress();
		
		setShowErrors(true);
		setTouched({ street: true, city: true, country: true, state: true, zip: true });

		if (isValid) {
			onBulkUpdate(normalized);
			onValidation(true);
			
			addToast({ message: "Address confirmed successfully!", type: 'success' });
		} else {
			const errorMessages = Object.values(errors).filter(Boolean);
            addToast({ message: `Address validation failed: ${errorMessages.join(', ')}`, type: 'error' });
		}
	}

	const { errors } = validateAddress();
	const getFieldError = (field) => { return errors[field] && (touched[field] || showErrors) ? errors[field] : null; };

	const countryOptions = allCountries.map((country, idx) => ({
		value: country[1], label: country[0] }));

	const regionOptions = regions.map((region, idx) => ({
		value: region[1] || region[0], label: region[0] }));

	return (
		<div className="bg-white p-4 gap-8 flex flex-col rounded-lg shadow">
			<h2 className="text-xl font-semibold self-start">Shipping Details</h2>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<InputField label="Street Address" name="street" value={shipping.street} onChange={handleChange} 
					onBlur={handleBlur} error={getFieldError('street')} required classes="md:col-span-2" />
				
				<InputField label="City" name="city" value={shipping.city} onChange={handleChange} onBlur={handleBlur} 
					error={getFieldError('city')} required />
				
				<InputField label="Country" name="country" type="select" value={shipping.country} onChange={handleChange} 
					onBlur={handleBlur} error={getFieldError('country')} options={countryOptions} />
				
				<InputField label="State/Province" name="state" type={regions.length > 0 ? "select" : "text"} 
					value={shipping.state} onChange={handleChange} onBlur={handleBlur} error={getFieldError('state')} 
					options={regionOptions} disabled={regions.length === 0} placeholder={regions.length === 0 ? "N/A" : ""} />
				
				<InputField label="ZIP / Post Code" name="zip" value={shipping.zip} onChange={handleChange} onBlur={handleBlur} 
					error={getFieldError('zip')} required />
			</div>
			
			<Button text="Confirm Address" onClick={handleConfirm} className="w-full lg:w-1/2 self-center" />
		</div>
	);
}