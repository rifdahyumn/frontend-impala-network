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
    
    const { 
        locationData, 
        loadingLocation,
        handleLocationChange 
    } = useLocationData(formConfig, toast);

    const handleInputChange = useCallback((fieldName, value) => {
        setFormData(prev => {
            const newData = { ...prev, [fieldName]: value };
            return handleLocationChange(fieldName, value, newData);
        });

        if (fieldName === 'disability_status' && value !== 'Lainnya') {
            setFormData(prev => ({ ...prev, disability_type: '' }));
        }
    }, [handleLocationChange]);

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
        handleInputChange,
        handleCategorySelect,
        handleSubmit,
        getSubmitButtonStatus
    };
};

export default useFormData;