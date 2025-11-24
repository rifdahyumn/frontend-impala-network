// src/components/FormBuilder/fields/FormField.jsx
import React from 'react';

const FormField = ({ field, value, onChange, isEditing = false }) => {
    const { type, label, placeholder, required, options, id, name } = field;

    // Jika dalam mode editing (builder), tampilkan field yang bisa di-edit
    if (isEditing) {
        return (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="text-sm text-gray-500 italic">
                    [{type}] {placeholder && `- ${placeholder}`}
                </div>
                {options && (
                    <div className="mt-1 text-xs text-gray-500">
                        Opsi: {options.join(', ')}
                    </div>
                )}
            </div>
        );
    }

    // Render field berdasarkan type untuk mode preview/submit
    const renderField = () => {
        switch (type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
                return (
                    <input
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );
            
            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );
            
            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Pilih {label}</option>
                        {options?.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            
            case 'radio':
                return (
                    <div className="space-y-2">
                        {options?.map((option, index) => (
                            <label key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    name={name || id}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => onChange(e.target.value)}
                                    required={required}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                );
            
            case 'checkbox':
                return (
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => onChange(e.target.checked)}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        {placeholder || label}
                    </label>
                );
            
            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );
            
            default:
                return (
                    <div className="text-red-500 text-sm">
                        Tipe field tidak didukung: {type}
                    </div>
                );
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {renderField()}
        </div>
    );
};

export default FormField;