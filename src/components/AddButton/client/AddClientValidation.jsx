export const validateForm = (formData, formSections, clientExists, setErrors, isEditMode = false, updateAllFields = false) => {
    const newErrors = {};

    if (!Array.isArray(formSections)) {
        console.error('Form sections is not an array:', formSections)
        setErrors({ general: 'Form Configuration error' })
        return false
    }

    formSections.forEach(section => {
        if (!section.fields || !Array.isArray(section.fields)) {
            console.warn(`Section "${section.title}" has no fields array`)
            return
        }

        section.fields.forEach(field => {
            if (field.disabled) {
                return;
            }

            if (field.required) {
                const value = formData[field.name]

                if (isEditMode && clientExists && !updateAllFields && isLocationField(field.name)) {
                    return
                }

                if (!value || value.toString().trim() === '') {
                    newErrors[field.name] = `${field.label} is required`;
                }
            }
        });
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
    }

    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Phone number is too short';
    }

    if ((!isEditMode && !clientExists) || (isEditMode && updateAllFields)) {
        if (!formData.province_id) {
            newErrors.province_id = 'Province is required';
        }
        if (!formData.regency_id) {
            newErrors.regency_id = 'City/Regency is required';
        }
        if (!formData.district_id) {
            newErrors.district_id = 'District is required';
        }
        if (!formData.village_id) {
            newErrors.village_id = 'Village is required';
        }
    }

    if (!clientExists && !formData.program_name?.trim()) {
        newErrors.program_name = 'Program Name is required for new clients';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const isLocationField = (fieldName) => {
    const locationFields = [
        'address', 'province_id', 'province_name',
        'regency_id', 'regency_name', 'district_id',
        'district_name', 'village_id', 'village_name'
    ];
    return locationFields.includes(fieldName);
};