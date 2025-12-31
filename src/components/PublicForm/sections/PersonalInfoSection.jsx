import React from 'react';
import FormField from '../../FormBuilder/fields/FormField';

const PersonalInfoSection = ({ 
    personalFields, 
    formData, 
    handleInputChange,
    renderCustomDisabilityField 
}) => {
    return (
        <div className="space-y-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Informasi Pribadi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalFields.map((field) => (
                    <div 
                        key={field.id} 
                        className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                    >
                        <FormField 
                            field={field}
                            value={formData[field.name] || ''}
                            onChange={(value) => handleInputChange(field.name, value)}
                            isEditing={false}
                        />
                    </div>
                ))}
            </div>

            {renderCustomDisabilityField && renderCustomDisabilityField()}
        </div>
    );
};

export default PersonalInfoSection;