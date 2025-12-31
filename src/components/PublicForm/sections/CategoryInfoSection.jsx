import React from 'react';
import FormField from '../../FormBuilder/fields/FormField';

const categoryIcons = {
    'umkm': '🏢',
    'mahasiswa': '🎓',
    'profesional': '💼',
    'komunitas': '👥',
    'umum': '👤'
};

const categoryNames = {
    'umkm': 'UMKM',
    'mahasiswa': 'Mahasiswa',
    'profesional': 'Profesional',
    'komunitas': 'Komunitas',
    'umum': 'Umum'
};

const CategoryInfoSection = ({ selectedCategory, categoryFields, formData, handleInputChange }) => {
    return (
        <div className="space-y-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {categoryIcons[selectedCategory]} Informasi {categoryNames[selectedCategory]}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFields.map((field) => (
                    <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <FormField 
                            field={field}
                            value={formData[field.name] || ''}
                            onChange={(value) => handleInputChange(field.name, value)}
                            isEditing={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryInfoSection;