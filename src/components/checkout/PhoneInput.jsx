import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const customStyles = `
    .react-international-phone-input-container {
        --react-international-phone-border-radius: 6px;
        --react-international-phone-border-color: var(--dark);
        --react-international-phone-text-color: var(--dark);
        --react-international-phone-background-color: var(--white);
        --react-international-phone-height: 42px;
        --react-international-phone-font-size: 14px;
    }

    .react-international-phone-input-container:focus-within {
        --react-international-phone-border-color: var(--blue);
        box-shadow: 0 0 0 3px rgba(0, 85, 238, 0.1);
    }

    .react-international-phone-input-container.error {
        --react-international-phone-border-color: var(--red);
        --react-international-phone-border-width: 2px;
    }

    .react-international-phone-country-selector-button {
        padding: 0 12px;
        border-right: 1px solid var(--react-international-phone-border-color);
    }

    .react-international-phone-country-selector-button:hover {
        background-color: var(--light);
    }

    .react-international-phone-input {
        padding: 0 12px;
    }

    .react-international-phone-dropdown {
        background-color: var(--white);
        border: 1px solid var(--dark);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .react-international-phone-dropdown-item:hover {
        background-color: var(--light);
    }

    .react-international-phone-dropdown-item.selected {
        background-color: var(--blue);
        color: var(--white);
    }
`;

export default function PhoneInput({ value, onChange, onBlur, error, phoneCountry = 'au', onCountryChange, disabled = false }) {

    const handlePhoneChange = (phone, country) => {
        const fakeEvent = { target: { name: 'phone', value: phone } };
        onChange(fakeEvent);
        
        if (onCountryChange && country.iso2 !== phoneCountry) { onCountryChange(country.iso2); }
    };

    const handlePhoneBlur = (e) => {
        if (onBlur) {
            const fakeEvent = {
                target: {
                    name: 'phone',
                    value: value || ''
                }
            };
            onBlur(fakeEvent);
        }
    };

    return (
        <div className="space-y-1">
            <style>{customStyles}</style>
            <label className="block text-sm font-medium mb-1"> Phone Number </label>
            
            <ReactPhoneInput defaultCountry={phoneCountry} value={value} onChange={handlePhoneChange} onBlur={handlePhoneBlur} 
                placeholder="123 456 789" disabled={disabled} inputClassName={error ? 'error' : ''}
                countrySelectorStyleProps={{ buttonClassName: error ? 'error' : '' }}
                inputProps={{
                    className: `w-full react-international-phone-input ${error ? 'error' : ''}`,
                    autoComplete: 'tel',
                    'aria-invalid': error ? 'true' : 'false',
                    'aria-describedby': error ? 'phone-error' : undefined
                }}
            />

            {error && (
                <div id="phone-error" className="text-xs text-red mt-1" role="alert"> {error} </div>
            )}
        </div>
    );
}