import { useState } from "react";

import { Button } from "../Button";
import InputField from "./InputField";
import PhoneInput from "./PhoneInput";
import { useToasts } from "@/contexts/UIProvider";
import { useCustomerValidation } from "@/hooks/useCustomerValidation";

export default function CustomerDetails({ customer, onChange, onValidation, onBulkUpdate }) {
    const { addToast } = useToasts();
    const [touched, setTouched] = useState({});
    const [showErrors, setShowErrors] = useState(false);
    const [phoneCountry, setPhoneCountry] = useState('au');

    const { validateCustomer } = useCustomerValidation(customer, phoneCountry);

    function handleChange(e) {
        onValidation(false);
        const { name, value } = e.target;
        onChange(name, value);
    }

    function handleBlur(e) { setTouched(prev => ({ ...prev, [e.target.name]: true })); }

    function handleConfirm() {
        const { errors, isValid, normalized } = validateCustomer();
        setShowErrors(true);

        if (isValid) {
            onBulkUpdate(normalized);
            onValidation(true);
            
            addToast({ message: "Details confirmed successfully!", type: 'success' });
        } else {
            const errorMessages = Object.values(errors).filter(Boolean);
            addToast({ message: `Customer validation failed: ${errorMessages.join(', ')}`, type: 'error' });
        }
    }

    const { errors } = validateCustomer();
    const getFieldError = (field) => { return errors[field] && (touched[field] || showErrors) ? errors[field] : null; };

    return (
        <div className="bg-white p-4 gap-8 flex flex-col rounded-lg shadow">
            <h2 className="text-xl font-semibold self-start">Customer Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="First Name" name="firstName" value={customer.firstName} onChange={handleChange}
                    onBlur={handleBlur} error={getFieldError('firstName')} required />
                
                <InputField label="Last Name" name="lastName" value={customer.lastName} onChange={handleChange}
                    onBlur={handleBlur} error={getFieldError('lastName')} required />

                <InputField label="Email Address" name="email" type="email" value={customer.email} onChange={handleChange}
                    onBlur={handleBlur} error={getFieldError('email')} required />
                
                <PhoneInput value={customer.phone} onChange={handleChange} onBlur={handleBlur} 
                    error={getFieldError('phone')} phoneCountry={phoneCountry} onCountryChange={setPhoneCountry} />
            </div>

            <Button text="Confirm Details" onClick={handleConfirm} className="w-full lg:w-1/2 self-center" />
        </div>
    );
}