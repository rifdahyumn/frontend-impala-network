import { useState, useCallback } from 'react';
import impalaService from '../../services/impalaService';
import useLocationData from './useLocationData';
import { prepareSubmissionData } from './utils/submissionHelper';

const useFormData = (template, formConfig, toast) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false)
    
    const { 
        locationData, 
        loadingLocation,
        handleLocationChange 
    } = useLocationData(formConfig, toast);

    const formatAutoFillData = (apiData) => {
        if (!apiData) return {}

        return {
            full_name: apiData.full_name || '',
            nik: apiData.nik || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            gender: apiData.gender || '',
            date_of_birth: apiData.date_of_birth || '',
            education: apiData.education || '',
            disability_status: apiData.disability_status || '',
            disability_type: apiData.disability_type || '',
            address: apiData.address || '',
            postal_code: apiData.postal_code || '',
            reason_join_program: apiData.reason_join_program || '',

            province_name: apiData.province_name || '',
            regency_name: apiData.regency_name || '',
            district_name: apiData.district_name || '',
            village_name: apiData.village_name || '',

            category: apiData.category || '',

            // business_name: apiData.business_name || '',
            // business_type: apiData.business_type || '',
            // business_form: apiData.business_form || '',
            // business_address: apiData.business_address || '',
            // established_year: apiData.established_year || '',
            // monthly_revenue: apiData.monthly_revenue || '',
            // employee_count: apiData.employee_count || '',
            // certifications: apiData.certifications || '',
            // social_media: apiData.social_media || '',
            // marketplace: apiData.marketplace || '',
            // website: apiData.website || '',

            // institution: apiData.institution || '',
            // major: apiData.major || '',
            // enrollment_year: apiData.enrollment_year || '',
            // semester: apiData.semester || '',
            // career_interest: apiData.career_interest || '',
            // core_competency: apiData.core_competency || '',

            // workplace: apiData.workplace || '',
            // position: apiData.position || '',
            // work_duration: apiData.work_duration || '',
            // industry_sector: apiData.industry_sector || '',
            // skills: apiData.skills || '',

            // community_name: apiData.community_name || '',
            // community_role: apiData.community_role || '',
            // member_count: apiData.member_count || '',
            // focus_area: apiData.focus_area || '',
            // operational_area: apiData.operational_area || '',

            // areas_interest: apiData.areas_interest || '',
            // background: apiData.background || '',
            // experience_level: apiData.experience_level || '',
        }
    }

    const handleAutoFillByNik = useCallback(async (nik) => {
        if (!nik || nik.length !== 16) return false

        setIsAutoFilling(true)
        try {
            const participantData = await impalaService.autoFillByNik(nik)
            if (participantData) {
                const formattedData = formatAutoFillData(participantData)

                setFormData(prev => {
                    const updates = {}
                    Object.keys(formattedData).forEach(key => {
                        if (formattedData[key] && !prev[key]) {
                            updates[key] = formattedData[key]
                        }
                    })

                    // if (formattedData.category && !selectedCategory) {
                    //     setSelectedCategory(formattedData.category)
                    // }

                    return { ...prev, ...updates }
                })

                toast({
                    title: "Data ditemukan",
                    description: 'Form telah diisi otomatis dari database',
                    duration: 3000
                })
                return true
            }
        } catch (error) {
            console.error('Auto fill by NIK error:', error)
        } finally {
            setIsAutoFilling(false)
        }
        return false
    }, [selectedCategory, toast])

    const handleAutoFillByEmail = useCallback(async (email) => {
        if (!email || !email.includes('@')) return false

        setIsAutoFilling(true)
        try {
            const participantData = await impalaService.autoFillByEmail(email)
            if (participantData) {
                const formattedData = formatAutoFillData(participantData)

                setFormData(prev => {
                    const updates = {}
                    Object.keys(formattedData).forEach(key => {
                        if (formattedData[key] && !prev[key]) {
                            updates[key] = formattedData[key]
                        }
                    })

                    if (formattedData.category && !selectedCategory) {
                        setSelectedCategory(formattedData.category)
                    }

                    return { ...prev, ...updates }
                })

                toast({
                    title: 'Data ditemukan',
                    description: 'Form elah diisi otomatis dari database',
                    duration: 3000
                })
                return true
            }
        } catch (error) {
            console.error('Auto-fill by email error:', error)
        } finally {
            setIsAutoFilling(false)
        }
        return false
    }, [selectedCategory, toast])

    const handleInputChange = useCallback(async (fieldName, value) => {
        setFormData(prev => {
            const newData = { ...prev, [fieldName]: value };
            return handleLocationChange(fieldName, value, newData);
        });

        if (fieldName === 'disability_status' && value !== 'Lainnya') {
            setFormData(prev => ({ ...prev, disability_type: '' }));
        }

        if (fieldName === 'nik' && value.length === 16) {
            await handleAutoFillByNik(value)
        }

        if (fieldName === 'email' && value.includes('@')) {
            await handleAutoFillByEmail(value);
        }
    }, [handleLocationChange, handleAutoFillByNik, handleAutoFillByEmail]);

    const handleCategorySelect = useCallback((categoryType) => {
        setSelectedCategory(categoryType);
    }, []);

    const getSubmitButtonStatus = useCallback(() => {
        if (!selectedCategory) {
            return { disabled: true, tooltip: 'Silakan pilih kategori profil Anda' };
        }
        if (!termsAccepted) {
            return { disabled: true, tooltip: 'Anda harus menyetujui syarat dan ketentuan' };
        }
        
        const requiredPersonalFields = ['full_name', 'email', 'phone', 'gender', 'date_of_birth', 'education', 'address', 'province_id', 'regency_id', 'district_id', 'village_id', 'postal_code'];
        const missingFields = requiredPersonalFields.filter(field => {
            const value = formData[field];
            return !value || value.toString().trim() === '';
        });

        if (missingFields.length > 0) {
            const fieldLabels = {
                full_name: 'Nama Lengkap', email: 'Email', phone: 'Nomor WhatsApp',
                gender: 'Jenis Kelamin', date_of_birth: 'Tanggal Lahir', education: 'Pendidikan Terakhir',
                address: 'Alamat Lengkap', city: 'Kota/Kabupaten', province: 'Provinsi', postal_code: 'Kode Pos'
            };
            return { disabled: true, tooltip: `Harap lengkapi: ${missingFields.map(f => fieldLabels[f]).join(', ')}` };
        }

        return { disabled: false, tooltip: 'Kirim formulir pendaftaran' };
    }, [selectedCategory, termsAccepted, formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const buttonStatus = getSubmitButtonStatus();
        if (buttonStatus.disabled) {
            toast({ title: "Form Belum Lengkap", description: buttonStatus.tooltip, variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const programName = template?.program_name || 'Program Impala';
            const submissionData = prepareSubmissionData(
                formData, 
                selectedCategory, 
                locationData, 
                programName
            );

            const response = await impalaService.createImpala(submissionData);
            if (response.success) {
                setSubmittedData({
                    ...submissionData,
                    submissionId: response.data.id,
                    submittedAt: new Date().toLocaleString('id-ID'),
                    programName: programName
                });
                setSubmissionSuccess(true);
                toast({
                    title: 'Pendaftaran Berhasil',
                    description: `Terima kasih telah mendaftar program ${programName}`,
                    variant: 'default'
                });
            } else {
                throw new Error(response.message || 'Gagal mengirim data');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                title: "Error",
                description: error.message || "Terjadi error saat mengirim form",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        setFormData,
        isSubmitting,
        selectedCategory,
        setSelectedCategory,
        submissionSuccess,
        submittedData,
        termsAccepted,
        setTermsAccepted,
        locationData,
        loadingLocation,
        isAutoFilling,
        handleInputChange,
        handleCategorySelect,
        handleSubmit,
        getSubmitButtonStatus,
        handleAutoFillByNik,
        handleAutoFillByEmail
    };
};

export default useFormData;