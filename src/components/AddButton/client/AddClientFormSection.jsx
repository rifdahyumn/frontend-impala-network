// Import constants untuk business types
import { BUSINESS_TYPES } from "../../Client/constants/businessTypes";

export const formSections = [
    {
        title: "Personal Information",
        fields: [
            {
                name: 'full_name',
                label: 'Full Name',
                type: 'text',
                required: true,
                placeholder: 'Enter full name'
            },
            {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
                placeholder: 'Enter email address'
            },
            {
                name: 'phone',
                label: 'Phone',
                type: 'tel',
                required: true,
                placeholder: 'Enter phone number'
            },
            {
                name: 'gender',
                label: 'Gender',
                type: 'select',
                required: true,
                placeholder: 'Select gender',
                options: [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' }
                ]
            },
        ]
    },
    {
        title: "Company Detail",
        fields: [
            {
                name: 'company',
                label: 'Company',
                type: 'text',
                required: true,
                placeholder: 'Enter company name',
                disabled: false
            },
            {
                name: 'business',
                label: 'Business Type',
                type: 'select',
                required: true,
                placeholder: 'Select business type',
                options: BUSINESS_TYPES // GUNAKAN DARI CONSTANTS
            },
            {
                name: 'total_employee',
                label: 'Total Employee',
                type: 'select',
                required: true,
                placeholder: 'Select total employee',
                options: [
                    { value: '1-50 employees', label: '1-50 employees' },
                    { value: '50-100 employees', label: '50-100 employees' },
                    { value: '100-500 employees', label: '100-500 employees' },
                    { value: '500-1000 employees', label: '500-1000 employees' },
                    { value: '1000+ employees', label: '1000+ employees' }
                ]
            },
            {
                name: 'position',
                label: 'Job Position',
                type: 'text',
                required: true,
                placeholder: 'Enter position'
            },
        ]
    },
    {
        title: "Program",
        fields: [
            {
                name: 'program_name',
                label: 'Program Name',
                type: 'text',
                required: false,
                placeholder: 'Enter Program Name',
                fullWidth: true
            },
        ]
    },
    {
        title: "Location",
        fields: [
            {
                name: 'address',
                label: 'Address',
                type: 'text',
                required: true,
                placeholder: 'Enter address',
                fullWidth: true
            },
            {
                name: 'province_id',
                label: 'Province',
                type: 'select',
                required: true,
                placeholder: 'Select Province',
                options: []
            },
            {
                name: 'regency_id',
                label: 'City / Regency',
                type: 'select',
                required: true,
                placeholder: 'Select Regency',
                options: []
            },
            {
                name: 'district_id',
                label: 'District',
                type: 'select',
                required: true,
                placeholder: 'Select District',
                options: [] 
            },
            {
                name: 'village_id',
                label: 'Village',
                type: 'select',
                required: true,
                placeholder: 'Select Village',
                options: [] 
            },
        ]
    },
    {
        title: "Additional Information",
        fields: [
            {
                name: 'notes',
                label: 'Notes',
                type: 'textarea',
                required: false,
                placeholder: 'Enter notes',
                fullWidth: true
            },
        ]
    }
];