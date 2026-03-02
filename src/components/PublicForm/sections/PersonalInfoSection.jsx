import React from 'react';
import FormField from '../../FormBuilder/fields/FormField';

const PersonalInfoSection = ({ 
    personalFields, 
    formData, 
    handleInputChange,
    renderCustomDisabilityField 
}) => {
    return (
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
                Informasi Pribadi
            </h3>
            <p className='text-[10px] md:text-xs pb-8 text-red-500'>
                *Isikan NIK atau Email Anda untuk memuat data secara otomatis jika pernah mengikuti program Impala sebelumnya.
            </p>
            
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