export const BUSINESS_TYPES = [
    { value: 'Aerospace & Defense', label: 'Aerospace & Defense' },
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Architecture & Design', label: 'Architecture & Design' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Biotechnology', label: 'Biotechnology' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'E-Commerce', label: 'E-Commerce' },
    { value: 'Education', label: 'Education' },
    { value: 'Energy & Utilities', label: 'Energy & Utilities' },
    { value: 'Fashion & Apparel', label: 'Fashion & Apparel' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Food & Beverage', label: 'Food & Beverage' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Legal Services', label: 'Legal Services' },
    { value: 'Logistics / Transportation', label: 'Logistics / Transportation' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Media & Entertainment', label: 'Media & Entertainment' },
    { value: 'Mining & Metals', label: 'Mining & Metals' },
    { value: 'Non-Profit / NGO', label: 'Non-Profit / NGO' },
    { value: 'Pharmaceutical', label: 'Pharmaceutical' },
    { value: 'Professional Service', label: 'Professional Service' },
    { value: 'Public Sector / Government', label: 'Public Sector / Government' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Sports & Recreation', label: 'Sports & Recreation' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Telecommunications', label: 'Telecommunications' },
    { value: 'Waste Management', label: 'Waste Management' }
];

export const BUSINESS_TYPES_FOR_FILTER = BUSINESS_TYPES.map(type => ({
    value: type.value,
    original: type.label 
}));