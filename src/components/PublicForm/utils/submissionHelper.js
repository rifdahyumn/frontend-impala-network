export const prepareSubmissionData = (formData, selectedCategory, locationData, programName) => {
    const provinceName = locationData.provinces.find(p => p.value === formData.province_id)?.label || '';
    const regencyName = locationData.regencies.find(r => r.value === formData.regency_id)?.label || '';
    const districtName = locationData.districts.find(d => d.value === formData.district_id)?.label || '';
    const villageName = locationData.villages.find(v => v.value === formData.village_id)?.label || '';

    const submissionData = {
        program_name: programName,
        full_name: formData.full_name,
        nik: formData.nik,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        education: formData.education,
        disability_status: formData.disability_status || 'Tidak memiliki disabilitas',
        address: formData.address,
        province_id: formData.province_id,
        province_name: provinceName,
        regency_id: formData.regency_id,
        regency_name: regencyName,
        district_id: formData.district_id,
        district_name: districtName,
        village_id: formData.village_id,
        village_name: villageName,
        postal_code: formData.postal_code,
        reason_join_program: formData.reason_join_program,
        category: selectedCategory === 'umkm' ? 'UMKM' : 
                 selectedCategory === 'mahasiswa' ? 'Mahasiswa' :
                 selectedCategory === 'profesional' ? 'Profesional' :
                 selectedCategory === 'komunitas' ? 'Komunitas' : 
                 selectedCategory === 'umum' ? 'Umum' : selectedCategory,
    };

    if (formData.disability_status && formData.disability_status !== 'Tidak memiliki disabilitas') {
        submissionData.disability_status = formData.disability_status;
        if (formData.disability_type) {
            submissionData.disability_type = formData.disability_type;
        }
    }

    if (selectedCategory === 'umkm') {
        submissionData.business_name = formData.business_name;
        submissionData.business_type = formData.business_type;
        submissionData.business_form = formData.business_form;
        submissionData.business_address = formData.business_address;
        submissionData.established_year = formData.established_year;
        submissionData.monthly_revenue = formData.monthly_revenue;
        submissionData.employee_count = formData.employee_count;
        submissionData.certifications = formData.certifications ? [formData.certifications] : [];
        submissionData.social_media = formData.social_media ? [formData.social_media] : [];
        submissionData.marketplace = formData.marketplace ? [formData.marketplace] : [];
        submissionData.website = formData.website ? [formData.website] : [];
    }

    if (selectedCategory === 'mahasiswa') {
        submissionData.institution = formData.institution;
        submissionData.major = formData.major;
        submissionData.enrollment_year = formData.enrollment_year;
        submissionData.career_interest = formData.career_interest;
        submissionData.semester = formData.semester;
        submissionData.core_competency = formData.core_competency ? [formData.core_competency] : [];
    }

    if (selectedCategory === 'profesional') {
        submissionData.workplace = formData.workplace;
        submissionData.position = formData.position;
        submissionData.work_duration = formData.work_duration;
        submissionData.industry_sector = formData.industry_sector;
        submissionData.skills = formData.skills;
    }

    if (selectedCategory === 'komunitas') {
        submissionData.community_name = formData.community_name;
        submissionData.community_role = formData.community_role;
        submissionData.member_count = formData.member_count;
        submissionData.focus_area = formData.focus_area;
        submissionData.operational_area = formData.operational_area;
    }

    if (selectedCategory === 'umum') {
        submissionData.areas_interest = formData.areas_interest;
    }

    const cleanData = Object.fromEntries(
        Object.entries(submissionData).filter(([value]) => value != null && value !== '' && !(Array.isArray(value) && value.length === 0))
    );

    return cleanData;
};