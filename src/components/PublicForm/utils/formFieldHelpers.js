export const getPersonalInfoFields = (formConfig, formData, locationData) => {
    if (!formConfig?.personalInfo?.fields) return [];
    
    const fields = [];
    const allFields = formConfig.personalInfo.fields;
    
    const fieldOrder = [
        'full_name', 'nik', 'email', 'phone', 'gender', 
        'date_of_birth', 'education', 'disability_status', 
        'address', 'province_id', 'regency_id', 'district_id', 
        'village_id', 'postal_code', 'reason'
    ];
    
    fieldOrder.forEach(fieldId => {
        const field = allFields.find(f => f.id === fieldId);
        if (field) {
            const enhancedField = {
                ...field,
                name: field.name || field.id
            };
            
            if (fieldId === 'province_id') {
                enhancedField.options = locationData.provinces;
            } else if (fieldId === 'regency_id') {
                enhancedField.options = locationData.regencies;
                enhancedField.disabled = !formData.province_id || locationData.regencies.length === 0;
            } else if (fieldId === 'district_id') {
                enhancedField.options = locationData.districts;
                enhancedField.disabled = !formData.regency_id || locationData.districts.length === 0;
            } else if (fieldId === 'village_id') {
                enhancedField.options = locationData.villages;
                enhancedField.disabled = !formData.district_id || locationData.villages.length === 0;
            }
            
            fields.push(enhancedField);
        }
    });
    
    return fields;
};

export const getCategoryFields = (formConfig, selectedCategory) => {
    if (!selectedCategory || !formConfig?.categories) return [];
    
    const categoryFields = [];
    const categoryKey = Object.keys(formConfig.categories).find(
        key => key.toLowerCase() === selectedCategory.toLowerCase()
    );
    
    if (categoryKey) {
        const category = formConfig.categories[categoryKey];
        if (category && category.fields) {
            category.fields.forEach(field => {
                categoryFields.push({
                    ...field,
                    name: field.name || field.id
                });
            });
        }
    }
    
    return categoryFields;
};