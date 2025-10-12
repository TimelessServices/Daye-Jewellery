import { useMemo } from "react";
import { allCountries } from "country-region-data";
import { postcodeValidator, postcodeValidatorExistsForCountry } from "postcode-validator";

export function useAddressValidation(address) {
	const selectedCountry = useMemo(
		() => allCountries.find(c => c[1] === address.country),
		[address.country]
	);

	const regions = selectedCountry?.[2] || [];

	// Normalization functions
	function normalizeText(text) {
		if (!text) return '';
		return text.trim()
			.replace(/\s+/g, ' ') // Replace multiple spaces with single space
			.toLowerCase()
			.split(' ')
			.map(word => {
				// Handle common abbreviations that should stay as-is
				const abbrevs = ['st', 'ave', 'rd', 'ln', 'dr', 'ct', 'blvd', 'pkwy', 'pl', 'way', 'ter', 'cir'];
				const lowerWord = word.toLowerCase();
				
				if (abbrevs.includes(lowerWord)) {
					return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
				}
				
				return word.charAt(0).toUpperCase() + word.slice(1);
			})
			.join(' ');
	}

	function normalizePostalCode(code, country) {
		if (!code) return '';
		
		// Different countries have different postal code formats
		switch (country) {
			case 'AU':
				return code.trim().replace(/\s/g, ''); // Remove spaces for AU postcodes
			case 'CA':
				// Canadian postal codes: A1A 1A1
				return code.trim().toUpperCase().replace(/\s/g, ' ').replace(/(.{3})(.{3})/, '$1 $2');
			case 'GB':
				// UK postal codes: SW1A 1AA
				return code.trim().toUpperCase().replace(/\s+/g, ' ');
			case 'US':
				// US ZIP codes: 12345 or 12345-6789
				return code.trim().replace(/\s/g, '');
			default:
				return code.trim().toUpperCase();
		}
	}

	function validateAddress() {
		const normalized = {
			street: normalizeText(address.street),
			city: normalizeText(address.city),
			country: address.country,
			state: address.state,
			zip: normalizePostalCode(address.zip, address.country)
		};

		let isValidZip = true;

		if (normalized.zip && normalized.country) {
			try {
				if (postcodeValidatorExistsForCountry(normalized.country)) {
					isValidZip = postcodeValidator(normalized.zip, normalized.country);
				} else {
					isValidZip = true;
				}
			} catch (error) { 
				console.log("Postcode validation error:", error);
				isValidZip = false;
			}
		}

		const errors = {
			street: !normalized.street ? "Street address is required" : null,
			city: !normalized.city ? "City is required" : null,
			country: !normalized.country ? "Country is required" : null,
			state: (regions.length > 0 && !normalized.state) ? "State/Province is required" : null,
			zip: !normalized.zip ? "Postal code is required" : (!isValidZip ? "Invalid postal code for selected country" : null)
		};

		const isValid = Object.values(errors).every(v => !v);
		
		return { errors, isValid, normalized };
	}

	return { regions, selectedCountry, validateAddress };
}