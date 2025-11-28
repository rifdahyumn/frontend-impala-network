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
        const programName = getProgramName();
        return `Pendaftaran Program ${programName}`;
    };

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

            // Validasi kategori harus dipilih
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

                // Convert untuk database - lowercase ID ke display name
                category: selectedCategory === 'umkm' ? 'UMKM' : 
                         selectedCategory === 'mahasiswa' ? 'Mahasiswa' :
                         selectedCategory === 'profesional' ? 'Profesional' :
                         selectedCategory === 'komunitas' ? 'Komunitas' : selectedCategory,

                // Category-specific fields
                ...(selectedCategory === 'umkm' && {
                    business_name: formData.business_name,
                    business_type: formData.business_type,
                    business_form: formData.business_form,
                    business_address: formData.business_address,
                    established_year: formData.established_year,
                    monthly_revenue: formData.monthly_revenue,
                    employee_count: formData.employee_count,
                    certifications: formData.certifications ? [formData.certifications] : [],
                    social_media: formData.social_media ? [formData.social_media] : [],
                    marketplace: formData.marketplace ? [formData.marketplace] : [],
                    website: formData.website ? [formData.website] : [],
                }),

                ...(selectedCategory === 'mahasiswa' && {
                    institution: formData.institution,
                    major: formData.major,
                    enrollment_year: formData.enrollment_year,
                    semester: formData.semester,
                    career_interest: formData.career_interest
                }),

                ...(selectedCategory === 'profesional' && {
                    workplace: formData.workplace,
                    position: formData.position,
                    work_duration: formData.work_duration,
                    industry_sector: formData.industry_sector,
                    skills: formData.skills
                }),

                ...(selectedCategory === 'komunitas' && {
                    community_name: formData.community_name,
                    community_role: formData.community_role,
                    member_count: formData.member_count,
                    focus_area: formData.focus_area,
                    operational_area: formData.operational_area
                })
            };

            const cleanData = Object.fromEntries(
                Object.entries(submissionData).filter(([_, value]) => value != null && value !== '')
            );

            const response = await impalaService.createImpala(cleanData)

            if (response.success) {
                // Simpan data yang berhasil dikirim untuk ditampilkan di success page
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

        window.open(waGroupLink, '_blank')

        toast({
            title: 'Group Whatsapp Dibuka',
            description: 'Bergabung dengan group WhatsApp Program',
            variant: 'default'
        })
    };

    const categoryOptions = [
        { id: 'umkm', name: 'UMKM', description: 'Pelaku Usaha / UMKM / Wirausaha / StartUp', icon: '🏢' },
        { id: 'mahasiswa', name: 'Mahasiswa', description: 'Pelajar/Mahasiswa Aktif', icon: '🎓' },
        { id: 'profesional', name: 'Profesional', description: '(Karyawan Swasta / ASN / BUMN / Profesional)', icon: '💼' },
        { id: 'komunitas', name: 'Komunitas', description: 'Organisasi/Komunitas', icon: '👥' }
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
                </div>
            </div>
        );
    }

    const formTitle = getFormTitle();
    const { personalFields, categoryFields } = renderDynamicFields();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <AnimatePresence mode="wait">
                    {!submissionSuccess ? (
                        // FORM SECTION
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
                                        Form {formTitle}
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <form onSubmit={handleSubmit}>
                                        {/* Informasi Pribadi - Selalu Tampil */}
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
                                                            <span className="text-2xl">{cat.icon}</span>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                                                                <p className="text-sm text-gray-600">{cat.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Informasi Kategori - Hanya Tampil jika Kategori Dipilih */}
                                        {selectedCategory && categoryFields.length > 0 && (
                                            <div className="space-y-6 mb-8">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                                    🏢 Informasi {categoryOptions.find(cat => cat.id === selectedCategory)?.name}
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
                        // SUCCESS SECTION
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
                                    Terima kasih telah mendaftar program <strong>{submittedData.programName}</strong>
                                </p>
                            </div>

                            <div className="p-8">
                                {/* Registration Summary */}
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