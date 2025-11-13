// src/components/FormBuilder/fields/FormField.jsx
import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

const FormField = ({ field, value, onChange, isEditing = false }) => {
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    const renderField = () => {
        const commonProps = {
            name: field.name,
            placeholder: field.placeholder,
            required: field.required,
            disabled: isEditing,
            className: "w-full",
            value: value || '',
            onChange: handleChange
        };

        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
                return <Input type={field.type} {...commonProps} />;
            
            case 'number':
                return <Input 
                    type="number" 
                    min={field.min} 
                    max={field.max} 
                    {...commonProps} 
                />;
            
            case 'select':
                return (
                    <select 
                        {...commonProps} 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Pilih {field.label}</option>
                        {(field.options || []).map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            
            case 'textarea':
                return <Textarea rows={field.rows || 4} {...commonProps} />;
            
            case 'date':
                return <Input type="date" {...commonProps} />;
            
            default:
                return <Input type="text" {...commonProps} />;
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField()}
            {field.description && (
                <p className="text-xs text-gray-500">{field.description}</p>
            )}
        </div>
    );
};

export default FormField;