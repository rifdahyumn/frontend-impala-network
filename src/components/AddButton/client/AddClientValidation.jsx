export const validateForm = (formData, formSections, clientExists, setErrors, isEditMode) => {
    const newErrors = {};

    if (!formData.full_name?.trim()) {
        newErrors.full_name = 'Full Name is required';
    }
    
    if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Phone number is too short';
    }
    
    if (!formData.company?.trim()) {
        newErrors.company = 'Company is required';
    }

    const isAddNewMode = !isEditMode && !clientExists;
    
    if (isAddNewMode) {
        if (!formData.address?.trim()) newErrors.address = 'Address is required';
        if (!formData.province_id) newErrors.province_id = 'Province is required';
        if (!formData.regency_id) newErrors.regency_id = 'City/Regency is required';
        if (!formData.district_id) newErrors.district_id = 'District is required';
        if (!formData.village_id) newErrors.village_id = 'Village is required';
    } 

    if (isAddNewMode && !formData.program_name?.trim()) {
        newErrors.program_name = 'Program Name is required for new clients';
    }

    if (!formData.gender?.trim()) newErrors.gender = 'Gender is required';
    if (!formData.business?.trim()) newErrors.business = 'Business Type is required';
    if (!formData.total_employee?.trim()) newErrors.total_employee = 'Total Employee is required';
    if (!formData.position?.trim()) newErrors.position = 'Job Position is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};