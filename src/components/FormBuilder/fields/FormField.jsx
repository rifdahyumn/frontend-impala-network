// src/components/FormBuilder/fields/FormField.jsx
import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

// Fallback Textarea jika komponen tidak ada
const FallbackTextarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      ref={ref}
      {...props}
    />
  )
});

// Coba import Textarea, jika tidak ada gunakan fallback
let Textarea;
try {
  Textarea = require('../../ui/textarea').Textarea;
} catch (error) {
  Textarea = FallbackTextarea;
  console.warn('Textarea component not found, using fallback');
}

const FormField = ({ field, onChange, isEditing = false }) => {
    const renderField = () => {
        const commonProps = {
            name: field.name,
            placeholder: field.placeholder,
            required: field.required,
            disabled: isEditing,
            className: "w-full"
        };

        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
                return <Input type={field.type} {...commonProps} />;
            
            case 'number':
                return <Input type="number" min={field.min} max={field.max} {...commonProps} />;
            
            case 'select':
                return (
                    <select {...commonProps} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
            {isEditing && field.description && (
                <p className="text-xs text-gray-500">{field.description}</p>
            )}
        </div>
    );
};

export default FormField;