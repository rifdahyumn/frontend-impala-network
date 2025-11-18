// src/components/FormBuilder/fields/FormField.jsx
import React from 'react';

const FormField = ({ field, value, onChange, isEditing = false }) => {
    const handleChange = (e) => {
        onChange(e.target.value);
    };

    // TAMBAHAN: Handler khusus untuk field nama program di mode preview
    const handleProgramNameChange = (e) => {
        onChange(e.target.value);
    };

    const renderField = () => {
        // TAMBAHAN: Render khusus untuk field nama program di mode preview
        if (field.name === 'program_name' && !isEditing) {
            return (
                <input
                    type="text"
                    value={value}
                    onChange={handleProgramNameChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                />
            );
        }

        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
                return (
                    <input
                        type={field.type}
                        value={value}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isEditing && field.locked}
                    />
                );
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={handleChange}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isEditing && field.locked}
                    >
                        <option value="">Pilih {field.label.toLowerCase()}</option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={handleChange}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isEditing && field.locked}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={field.rows || 3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isEditing && field.locked}
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled={isEditing && field.locked}
                    />
                );
        }
    };

    // TAMBAHAN: Styling khusus untuk field nama program
    const getFieldContainerClass = () => {
        if (field.name === 'program_name') {
            return "program-name-field mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg";
        }
        return "mb-4";
    };

    // TAMBAHAN: Styling khusus untuk label field nama program
    const getLabelClass = () => {
        if (field.name === 'program_name') {
            return "block text-sm font-bold text-blue-700 mb-2";
        }
        return "block text-sm font-medium text-gray-700 mb-1";
    };

    return (
        <div className={getFieldContainerClass()}>
            <label className={getLabelClass()}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField()}
            {field.description && (
                <p className={`text-xs mt-1 ${
                    field.name === 'program_name' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                    {field.description}
                </p>
            )}
            
            {/* TAMBAHAN: Info khusus untuk field nama program */}
            {field.name === 'program_name' && !isEditing && (
                <p className="text-xs text-blue-500 mt-2">
                    💡 Nama program ini akan ditampilkan sebagai judul formulir
                </p>
            )}
        </div>
    );
};

export default FormField;