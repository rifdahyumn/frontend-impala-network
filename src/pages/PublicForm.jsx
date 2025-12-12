// src/pages/PublicForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import FormField from '../components/FormBuilder/fields/FormField';
import formTemplateService from '../services/formTemplateService';
import { useToast } from '../hooks/use-toast';
import impalaService from '../services/impalaService';
import { CheckCircle, Home, UserCheck, Mail, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

const PublicForm = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formConfig, setFormConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [template, setTemplate] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const { toast } = useToast();
    const [isDisabilityChecked, setIsDisabilityChecked] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [hasTimeout, setHasTimeout] = useState(false);

    // Opsi disabilitas untuk dropdown
    const disabilityOptions = [
        { value: 'tidak_ada', label: 'Tidak memiliki disabilitas' },
        { value: 'fisik', label: 'Disabilitas Fisik/Motorik' },
        { value: 'penglihatan', label: 'Disabilitas Penglihatan (Tuna Netra/Low Vision)' },
        { value: 'pendengaran', label: 'Disabilitas Pendengaran (Tuna Rungu/Tuli)' },
        { value: 'bicara', label: 'Disabilitas Bicara/Komunikasi' },
        { value: 'intelektual', label: 'Disabilitas Intelektual' },
        { value: 'mental_psikososial', label: 'Disabilitas Mental/Psikososial' },
        { value: 'ganda', label: 'Disabilitas Ganda/Multiple' },
        { value: 'neurologis', label: 'Disabilitas Neurologis/Perkembangan (Autisme, ADHD, dll)' },
        { value: 'penyakit_kronis', label: 'Penyakit Kronis/Disabilitas Laten' }
    ];

    // ===== UPDATE TAB BROWSER TITLE =====
    useEffect(() => {
        if (template) {
            let tabTitle = 'Impala Network';
            
            if (template.program_name) {
                tabTitle = `${template.program_name} | Impala Network`;
            } 
            else if (template.form_config && template.form_config.title) {
                const fullTitle = template.form_config.title;
                if (fullTitle.includes('Program ')) {
                    const parts = fullTitle.split('Program ');
                    if (parts.length > 1) {
                        tabTitle = `${parts[1]} | Impala Network`;
                    } else {
                        tabTitle = `${fullTitle} | Impala Network`;
                    }
                } else {
                    tabTitle = `${fullTitle} | Impala Network`;
                }
            }
            
            document.title = tabTitle;
        } else {
            document.title = 'Impala Network';
        }
        
        return () => {
            document.title = 'Impala Network';
        };
    }, [template]);

    useEffect(() => {
        if (submissionSuccess && submittedData) {
            document.title = `Pendaftaran Berhasil - ${submittedData.programName} | Impala Network`;
        }
    }, [submissionSuccess, submittedData]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const loadFormFromAPI = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                setHasTimeout(false);

                if (!slug) {
                    throw new Error('Slug tidak ditemukan di URL');
                }
                
                const timeoutId = setTimeout(() => {
                    if (isMounted) {
                        setHasTimeout(true);
                        setLoadError('Waktu memuat formulir habis. Silakan coba lagi.');
                        setIsLoading(false);
                    }
                }, 10000);

                const response = await formTemplateService.getFormTemplateBySlug(slug);
                clearTimeout(timeoutId);
                
                if (isMounted && response.success && response.data) {
                    const templateData = response.data;
                    
                    setTemplate(templateData);
                    setFormConfig(templateData.form_config);
                    
                    
                    toast({
                        title: "Form Dimuat",
                        description: `Form "${templateData.program_name}" berhasil dimuat`,
                        variant: "default"
                    });
                } else if (isMounted) {
                    throw new Error(response.message || 'Form tidak ditemukan di database');
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error loading form from API:', error);

                    if (!hasTimeout) {
                        setLoadError(error.message || 'Gagal memuat form');
                        
                        toast({
                            title: "Form Tidak Ditemukan",
                            description: `Form dengan slug "${slug}" tidak tersedia.`,
                            variant: "destructive"
                        });
                    }
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadFormFromAPI();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [slug, toast]);

    useEffect(() => {
        if (formConfig && formConfig.personalInfo) {
            const hasDisabilityField = formConfig.personalInfo.fields?.some(f => f.id === 'disability_status');
            
            if (!hasDisabilityField) {
                const updatedFormConfig = { ...formConfig };
                const personalFields = [...(formConfig.personalInfo.fields || [])];
                const educationIndex = personalFields.findIndex(f => f.id === 'education');
                
                if (educationIndex !== -1) {
                    const disabilityField = {
                        id: 'disability_status',
                        type: 'select',
                        name: 'disability_status',
                        label: 'Status Disabilitas',
                        required: false,
                        placeholder: 'Pilih status disabilitas Anda',
                        options: disabilityOptions.map(opt => opt.label),
                        locked: true
                    };
                    
                    // Sisipkan field disabilitas tepat setelah pendidikan
                    personalFields.splice(educationIndex + 1, 0, disabilityField);
                    
                    updatedFormConfig.personalInfo = {
                        ...formConfig.personalInfo,
                        fields: personalFields
                    };
                    
                    setFormConfig(updatedFormConfig);
                }
            }
        }
    }, [formConfig]);

    // ===== FUNGSI UNTUK MENGELOMPOKKAN FIELDS PERSONAL INFO =====
    const getPersonalInfoFields = () => {
        if (!formConfig?.personalInfo?.fields) return [];
        
        const fields = [];
        const allFields = formConfig.personalInfo.fields;
        
        const fieldOrder = [
            'full_name',
            'nik', 
            'email',
            'phone',
            'gender',
            'date_of_birth',
            'education',
            'disability_status', // Tambahkan disabilitas dalam urutan
            'address',
            'city',
            'province',
            'postal_code',
            'reason'
        ];
        
        fieldOrder.forEach(fieldId => {
            const field = allFields.find(f => f.id === fieldId);
            if (field) {
                fields.push({
                    ...field,
                    name: field.name || field.id
                });
            }
        });
        
        return fields;
    };

    // ===== FUNGSI RENDER DYNAMIC FIELDS =====
    const renderDynamicFields = () => {
        if (!formConfig) return { personalFields: [], categoryFields: [] };

        try {
            const personalFields = getPersonalInfoFields();
            const categoryFields = [];

            // Show category-specific fields only if category is selected
            if (selectedCategory && formConfig.categories) {
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
            }

            return { personalFields, categoryFields };
            
        } catch (error) {
            console.error('Error rendering dynamic fields:', error);
            return { personalFields: [], categoryFields: [] };
        }
    };

    // ===== FUNGSI RENDER CUSTOM DISABILITY FIELD =====
    const renderCustomDisabilityField = () => {
        return (
            <div className="space-y-2">
                <Label htmlFor="disability_type" className="text-gray-900">
                    Jenis Disabilitas (jika memilih Lainnya)
                </Label>
                <Input
                    id="disability_type"
                    name="disability_type"
                    type="text"
                    value={formData.disability_type || ''}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        disability_type: e.target.value
                    }))}
                    placeholder="Jelaskan jenis disabilitas Anda"
                    className="w-full border-blue-200 focus:border-blue-500"
                />
            </div>
        );
    };

    // ===== FUNGSI GET PROGRAM INFO =====
    const getProgramName = () => {
        if (template) {
            return template.program_name;
        }
        
        if (formConfig?.programName) {
            return formConfig.programName;
        }
        
        return 'Program Impala';
    };

    const getFormTitle = () => {
        if (formConfig && formConfig.title) {
            return formConfig.title;
        }
        
        const programName = getProgramName();
        return `Pendaftaran Program ${programName}`;
    };

    const getFormHeaderTitle = () => {
        if (formConfig && formConfig.title) {
            return `Form ${formConfig.title}`;
        }
        
        const programName = getProgramName();
        return `Form Pendaftaran Program ${programName}`;
    };

    // ===== FUNGSI VALIDASI =====
    const getSubmitButtonStatus = () => {
        if (!selectedCategory) {
            return { disabled: true, tooltip: 'Silakan pilih kategori profil Anda' };
        }
        if (!termsAccepted) {
            return { disabled: true, tooltip: 'Anda harus menyetujui syarat dan ketentuan' };
        }
        
        const requiredPersonalFields = ['full_name', 'email', 'phone', 'gender', 'date_of_birth', 'education', 'address', 'city', 'province', 'postal_code'];
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

        // Validasi jika memilih disabilitas "Lainnya" tapi tidak mengisi detail
        if (formData.disability_status === 'Lainnya' && (!formData.disability_type || formData.disability_type.trim() === '')) {
            return { disabled: true, tooltip: 'Harap jelaskan jenis disabilitas Anda' };
        }

        return { disabled: false, tooltip: 'Kirim formulir pendaftaran' };
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        
        // Reset disability_type jika tidak memilih "Lainnya"
        if (fieldName === 'disability_status' && value !== 'Lainnya') {
            setFormData(prev => ({ ...prev, disability_type: '' }));
        }
    };

    const handleCategorySelect = (categoryType) => {
        setSelectedCategory(categoryType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const buttonStatus = getSubmitButtonStatus();
        if (buttonStatus.disabled) {
            toast({ title: "Form Belum Lengkap", description: buttonStatus.tooltip, variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const programName = getProgramName();
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
                city: formData.city,
                province: formData.province,
                postal_code: formData.postal_code,
                reason_join_program: formData.reason_join_program,
                category: selectedCategory === 'umkm' ? 'UMKM' : 
                         selectedCategory === 'mahasiswa' ? 'Mahasiswa' :
                         selectedCategory === 'profesional' ? 'Profesional' :
                         selectedCategory === 'komunitas' ? 'Komunitas' : 
                         selectedCategory === 'umum' ? 'Umum' : selectedCategory,
            };

            // Tambahkan detail disabilitas jika ada
            if (formData.disability_status && formData.disability_status !== 'Tidak memiliki disabilitas') {
                submissionData.disability_status = formData.disability_status;
                if (formData.disability_type) {
                    submissionData.disability_type = formData.disability_type;
                }
            }

            // Add category-specific fields
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
                Object.entries(submissionData).filter(([_, value]) => value != null && value !== '')
            );

            const response = await impalaService.createImpala(cleanData);
            if (response.success) {
                setSubmittedData({
                    ...cleanData,
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

    const handleShare = async () => {
        const waGroupLink = "https://chat.whatsapp.com/your-actual-group-link";
        window.open(waGroupLink, '_blank');
        toast({
            title: 'Group Whatsapp Dibuka',
            description: 'Bergabung dengan group WhatsApp Program',
            variant: 'default'
        });
    };

    const getCategoryIcon = (categoryId) => {
        const icons = {
            'umkm': '🏢',
            'mahasiswa': '🎓',
            'profesional': '💼',
            'komunitas': '👥',
            'umum': '👤'
        };
        return icons[categoryId] || '📝';
    };

    const categoryOptions = [
        { id: 'umkm', name: 'UMKM', description: 'Pelaku Usaha / UMKM / Wirausaha / StartUp' },
        { id: 'mahasiswa', name: 'Mahasiswa', description: 'Pelajar/Mahasiswa Aktif' },
        { id: 'profesional', name: 'Profesional', description: '(Karyawan Swasta / ASN / BUMN / Profesional)' },
        { id: 'komunitas', name: 'Komunitas', description: 'Organisasi/Komunitas' },
        { id: 'umum', name: 'Umum', description: 'Umum' },
    ];

    // ===== LOADING STATE =====
    if (isLoading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Memuat Formulir...</p>
                    <p className='text-sm text-gray-500 mt-2'>
                        Slug: <strong>{slug}</strong>
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                        {hasTimeout ? 'Mengulang...' : 'Silakan tunggu sebentar'}
                    </p>
                    {hasTimeout && (
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            Klik di sini jika loading terlalu lama
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ===== ERROR STATE =====
    if (loadError || !formConfig || !template) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            {hasTimeout ? 'Waktu Habis' : 'Formulir Tidak Ditemukan'}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {loadError || `Formulir dengan slug "${slug}" tidak tersedia.`}
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-red-700">
                                Slug: <strong>{slug}</strong>
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                                {hasTimeout 
                                    ? 'Server membutuhkan waktu terlalu lama untuk merespons.' 
                                    : 'Pastikan formulir sudah dipublish dan URL benar.'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Button 
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            🔄 Coba Lagi
                        </Button>
                        <Button 
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="w-full"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Kembali ke Beranda
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const { personalFields, categoryFields } = renderDynamicFields();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {!submissionSuccess ? (
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {getFormTitle()}
                            </h1>
                            <p className="text-gray-600">
                                Isi data diri Anda dengan lengkap dan benar
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
                                <h2 className="text-xl font-semibold">
                                    {getFormHeaderTitle()}
                                </h2>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    {/* Informasi Pribadi */}
                                    <div className="space-y-6 mb-8">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                            📝 Informasi Pribadi
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

                                        {/* Field tambahan untuk disabilitas jika memilih Lainnya */}
                                        {formData.disability_status === 'Lainnya' && (
                                            <div className="mt-2 md:col-span-2">
                                                {renderCustomDisabilityField()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pilih Kategori */}
                                    <div className="space-y-6 mb-8">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                            🏷️ Pilih Kategori Profil Anda
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {categoryOptions.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                        selectedCategory === cat.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                                                    }`}
                                                    onClick={() => handleCategorySelect(cat.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{getCategoryIcon(cat.id)}</span>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                                                            <p className="text-sm text-gray-600">{cat.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Informasi Kategori */}
                                    {selectedCategory && categoryFields.length > 0 && (
                                        <div className="space-y-6 mb-8">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                                {getCategoryIcon(selectedCategory)} Informasi {categoryOptions.find(cat => cat.id === selectedCategory)?.name}
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
                                    )}

                                    {/* Terms and Conditions */}
                                    <div className={`p-4 mb-6 rounded-lg border transition-all ${
                                        termsAccepted 
                                            ? 'bg-green-50 border-green-200' 
                                            : 'bg-yellow-50 border-yellow-200'
                                    }`}>
                                        <div className="flex items-start gap-3">
                                            <input 
                                                type="checkbox" 
                                                id="terms"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                                                    <span className="font-medium">Syarat dan Ketentuan:</span>
                                                    <br />
                                                    Saya menyatakan bahwa data yang saya berikan adalah benar dan lengkap.
                                                    Saya bersedia untuk mengikuti semua prosedur dan ketentuan program {getProgramName()}.
                                                    Saya memahami bahwa data yang saya berikan akan digunakan untuk keperluan administrasi program.
                                                </label>
                                            </div>
                                        </div>
                                        
                                        {/* Status terms */}
                                        <div className={`mt-3 ml-7 text-sm ${
                                            termsAccepted ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                            {termsAccepted ? (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Syarat dan ketentuan telah disetujui
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Anda harus menyetujui syarat dan ketentuan untuk melanjutkan
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-6 border-t border-gray-200">
                                        <div className="relative">
                                            <Button 
                                                type="submit" 
                                                disabled={isSubmitting || getSubmitButtonStatus().disabled}
                                                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Menyimpan Data...
                                                    </>
                                                ) : (
                                                    '📨 Kirim Pendaftaran'
                                                )}
                                            </Button>
                                            
                                            {/* Tooltip jika button disabled */}
                                            {getSubmitButtonStatus().disabled && !isSubmitting && (
                                                <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                                                    {getSubmitButtonStatus().tooltip}
                                                    <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
                            <div className="mb-4">
                                <CheckCircle className="h-20 w-20 mx-auto text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Pendaftaran Berhasil! 🎉</h1>
                            <p className="text-green-100 text-lg">
                                Terima kasih telah mendaftar program <strong>{submittedData?.programName || 'Program'}</strong>
                            </p>
                        </div>

                        <div className="p-8">
                            {submittedData && (
                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <UserCheck className="h-5 w-5 text-green-600" />
                                        Ringkasan Pendaftaran
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Nama Lengkap:</span>
                                                <span className="font-semibold">{submittedData.full_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Email:</span>
                                                <span className="font-semibold">{submittedData.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Kategori:</span>
                                                <span className="font-semibold">{submittedData.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status Disabilitas:</span>
                                                <span className="font-semibold">{submittedData.disability_status || 'Tidak memiliki disabilitas'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tanggal Pendaftaran:</span>
                                                <span className="font-semibold">{submittedData.submittedAt}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Program:</span>
                                                <span className="font-semibold">{submittedData.programName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-semibold text-green-600">Terkonfirmasi</span>
                                            </div>
                                        </div>
                                    </div>
                                    {submittedData.disability_type && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Jenis Disabilitas:</span>
                                                <span className="font-semibold">{submittedData.disability_type}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    className="flex items-center gap-2 bg-green-400 hover:bg-green-300"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Gabung Grup WhatsApp
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Kembali ke Beranda
                                </Button>
                            </div>

                            <div className="text-center mt-8 pt-6 border-t border-gray-200">
                                <p className="text-gray-600 mb-2">Butuh bantuan?</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        support@impala.network
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        +62 811-1011-512
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicForm;