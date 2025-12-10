// src/pages/PublicForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import FormField from '../components/FormBuilder/fields/FormField';
import formTemplateService from '../services/formTemplateService';
import { useToast } from '../hooks/use-toast';
import impalaService from '../services/impalaService';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, Share2, Download, Home, UserCheck, Calendar, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

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

    // ===== UPDATE TAB BROWSER TITLE =====
    useEffect(() => {
        if (template) {
            let tabTitle = 'Impala Network';
            
            // Prioritaskan program_name langsung dari template
            if (template.program_name) {
                tabTitle = `${template.program_name} | Impala Network`;
            } 
            // Fallback ke form_config.title
            else if (template.form_config && template.form_config.title) {
                const fullTitle = template.form_config.title;
                // Coba ekstrak hanya nama programnya
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

    // ===== UPDATE TITLE PADA SUCCESS PAGE =====
    useEffect(() => {
        if (submissionSuccess && submittedData) {
            document.title = `Pendaftaran Berhasil - ${submittedData.programName} | Impala Network`;
        }
    }, [submissionSuccess, submittedData]);

    useEffect(() => {
        const loadFormFromAPI = async () => {
            try {
                setIsLoading(true);

                if (!slug) {
                    throw new Error('Slug tidak ditemukan di URL');
                }

                const response = await formTemplateService.getFormTemplateBySlug(slug);
                
                if (response.success && response.data) {
                    const templateData = response.data;
                    
                    setTemplate(templateData);
                    setFormConfig(templateData.form_config);
                    
                    // Update tab browser title setelah form loaded
                    if (templateData.program_name) {
                        document.title = `${templateData.program_name} | Impala Network`;
                    }
                    
                    toast({
                        title: "Form Dimuat",
                        description: `Form "${templateData.program_name}" berhasil dimuat`,
                        variant: "default"
                    });
                } else {
                    throw new Error(response.message || 'Form tidak ditemukan di database');
                }
            } catch (error) {
                console.error('Error loading form from API:', error);
                document.title = 'Form Tidak Ditemukan | Impala Network';
                toast({
                    title: "Form Tidak Ditemukan",
                    description: `Form dengan slug "${slug}" tidak tersedia. Pastikan form sudah dipublish.`,
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadFormFromAPI();
    }, [slug, toast]);

    // ===== FUNGSI RENDER DYNAMIC FIELDS =====
    const renderDynamicFields = () => {
        if (!formConfig) return { personalFields: [], categoryFields: [] };

        try {
            const personalFields = [];
            const categoryFields = [];
            
            // Always show personal info fields
            if (formConfig.personalInfo && formConfig.personalInfo.fields) {
                formConfig.personalInfo.fields.forEach(field => {
                    personalFields.push({
                        ...field,
                        name: field.name || field.id
                    });
                });
            }

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

    const getProgramName = () => {
        if (template) {
            return template.program_name;
        }
        
        if (formConfig?.programName) {
            return formConfig.programName;
        }
        
        return 'Loading...';
    };

    const getFormTitle = () => {
        // JUDUL HALAMAN TETAP LENGKAP
        if (formConfig && formConfig.title) {
            return formConfig.title; // "Pendaftaran Program [Nama Program]"
        }
        
        const programName = getProgramName();
        return `Pendaftaran Program ${programName}`;
    };

    const getFormHeaderTitle = () => {
        // HEADER FORM TETAP LENGKAP
        if (formConfig && formConfig.title) {
            return `Form ${formConfig.title}`;
        }
        
        const programName = getProgramName();
        return `Form Pendaftaran Program ${programName}`;
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleCategorySelect = (categoryType) => {
        setSelectedCategory(categoryType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const programName = getProgramName();
            
            // Validasi required fields
            const requiredPersonalFields = ['full_name', 'email', 'phone'];
            const missingPersonalFields = requiredPersonalFields.filter(field => !formData[field]);
            
            if (missingPersonalFields.length > 0) {
                const fieldLabels = {
                    full_name: 'Nama Lengkap',
                    email: 'Email',
                    phone: 'Nomor WhatsApp'
                };
                
                toast({
                    title: "Data Belum Lengkap",
                    description: `Harap lengkapi: ${missingPersonalFields.map(f => fieldLabels[f]).join(', ')}`,
                    variant: "destructive"
                });
                setIsSubmitting(false);
                return;
            }

            if (!selectedCategory) {
                toast({
                    title: "Kategori Belum Dipilih",
                    description: "Silakan pilih kategori profil Anda",
                    variant: "destructive"
                });
                setIsSubmitting(false);
                return;
            }

            const submissionData = {
                program_name: programName,
                full_name: formData.full_name,
                nik: formData.nik,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                date_of_birth: formData.date_of_birth,
                education: formData.education,
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
                    title: 'Pendaftaran Berhasil 🎉',
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
                description: error.message || "Terjadi error saat mengirim form. Silakan coba lagi.",
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

    if (isLoading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Memuat Formulir...</p>
                    <p className='text-sm text-gray-500 mt-2'>
                        Slug: <strong>{slug}</strong>
                    </p>
                </div>
            </div>
        );
    }

    if (!formConfig || !template) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Formulir Tidak Ditemukan</h1>
                    <p className="text-gray-600 mb-4">Formulir dengan slug "{slug}" tidak tersedia.</p>
                    <Button onClick={() => navigate('/')} className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Kembali ke Beranda
                    </Button>
                </div>
            </div>
        );
    }

    const formTitle = getFormTitle();
    const formHeaderTitle = getFormHeaderTitle();
    const { personalFields, categoryFields } = renderDynamicFields();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <AnimatePresence mode="wait">
                    {!submissionSuccess ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {formTitle}
                                </h1>
                                <p className="text-gray-600">
                                    Isi data diri Anda dengan lengkap dan benar
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
                                    <h2 className="text-xl font-semibold">
                                        {formHeaderTitle}
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <form onSubmit={handleSubmit}>
                                        {/* Informasi Pribadi */}
                                        <div className="space-y-6 mb-8">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                                Informasi Pribadi
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {personalFields.map((field) => (
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

                                        {/* Pilih Kategori */}
                                        <div className="space-y-6 mb-8">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                                Pilih Kategori Profil Anda
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
                                                    Informasi {categoryOptions.find(cat => cat.id === selectedCategory)?.name}
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

                                        {/* Submit Button */}
                                        <div className="flex justify-end pt-6 border-t">
                                            <Button 
                                                type="submit" 
                                                disabled={isSubmitting || !selectedCategory}
                                                className="flex items-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Menyimpan Data...
                                                    </>
                                                ) : (
                                                    'Kirim Pendaftaran'
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="mb-4"
                                >
                                    <CheckCircle className="h-20 w-20 mx-auto text-white" />
                                </motion.div>
                                <h1 className="text-3xl font-bold mb-2">Pendaftaran Berhasil! 🎉</h1>
                                <p className="text-green-100 text-lg">
                                    Terima kasih telah mendaftar program <strong>{submittedData?.programName || 'Program'}</strong>
                                </p>
                            </div>

                            <div className="p-8">
                                {/* Registration Summary */}
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
                                    </div>
                                )}

                                {/* Action Buttons */}
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

                                {/* Contact Info */}
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PublicForm;