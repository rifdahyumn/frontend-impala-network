// src/components/Client/constants/businessTypes.js
export const BUSINESS_TYPES = [
    { value: 'Retail', label: 'Retail' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Food & Beverage', label: 'Food & Beverage' },
    { value: 'Logistics / Transportation', label: 'Logistics / Transportation' },
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Media & Entertainment', label: 'Media & Entertainment' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Non-Profit / NGO', label: 'Non-Profit / NGO' },
    { value: 'Telecomunications', label: 'Telecomunications' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'E-Commerce', label: 'E-Commerce' },
    { value: 'Professional Service', label: 'Professional Service' },
    { value: 'Public Sector / Government', label: 'Public Sector / Government' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Energy & Utilities', label: 'Energy & Utilities' }
];

// Format untuk FilterDropdown
export const BUSINESS_TYPES_FOR_FILTER = BUSINESS_TYPES.map(type => ({
    value: type.value,
    original: type.label // FilterDropdown menggunakan 'original'
}));