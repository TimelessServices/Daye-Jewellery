import { parsePhoneNumberWithError } from 'libphonenumber-js';

export function useCustomerValidation(customer) {
    function normalizeText(text) {
        if (!text) return '';

        return text.trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function normalizeEmail(email) {
        if (!email) return '';
        return email.trim().toLowerCase();
    }
    
    function normalizePhoneNumber(phoneInput, defaultCountry = 'AU') {
        if (!phoneInput || phoneInput.trim() === '') {
            return { normalized: '', isValid: true };
        }

        try {
            const phoneNumber = parsePhoneNumberWithError(phoneInput, defaultCountry);
            
            if (phoneNumber && phoneNumber.isValid()) {
                return {
                    normalized: phoneNumber.format('E.164'),
                    isValid: true,
                    formatted: phoneNumber.formatInternational(),
                    country: phoneNumber.country
                };
            } else {
                return { normalized: '', isValid: false };
            }
        } catch (error) {
            return { normalized: '', isValid: false };
        }
    }

    function validateCustomer() {
        const phoneResult = normalizePhoneNumber(customer.phone);

        const normalized = {
            firstName: normalizeText(customer.firstName),
            lastName: normalizeText(customer.lastName),
            email: normalizeEmail(customer.email),
            phone: phoneResult.normalized || customer.phone
        };
        
        const errors = {
            firstName: !normalized.firstName ? "First name is required" : null,
            lastName: !normalized.lastName ? "Last name is required" : null,
            email: !normalized.email ? "Email is required" : 
                   (!/\S+@\S+\.\S+/.test(normalized.email) ? "Invalid email format" : null),
            phone: customer.phone && !phoneResult.isValid ? "Please enter a valid phone number" : null
        };

        const isValid = Object.values(errors).every(v => !v);
        return { errors, isValid, normalized };
    }

    return { validateCustomer, normalizePhoneNumber };
}