// src/pages/PublicForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import FormField from '../components/FormBuilder/fields/FormField';
import formTemplateService from '../services/formTemplateService';
import { useToast } from '../hooks/use-toast';

const PublicForm = () => {
    const { slug } = useParams();
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [formConfig, setFormConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [template, setTemplate] = useState(null); // ✅ SIMPAN DATA TEMPLATE LENGKAP
    const { toast } = useToast();

    // ✅ PERBAIKAN: Load HANYA dari API berdasarkan slug - TANPA FALLBACK KE LOCALSTORAGE
    useEffect(() => {
        const loadFormFromAPI = async () => {
            try {
                setIsLoading(true);
                console.log('🔍 Loading form with slug:', slug);

                if (!slug) {
                    throw new Error('Slug tidak ditemukan di URL');
                }

                // ✅ LOAD DARI API BERDASARKAN SLUG
                const response = await formTemplateService.getFormTemplateBySlug(slug);
                
                console.log('📨 API Response:', response);
                
                if (response.success && response.data) {
                    const templateData = response.data;
                    console.log('✅ Template loaded from API:', templateData);
                    
                    // ✅ SIMPAN DATA TEMPLATE LENGKAP
                    setTemplate(templateData);
                    
                    // ✅ GUNAKAN form_config DARI DATABASE
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
                console.error('❌ Error loading form from API:', error);
                
                // ❌ JANGAN GUNAKAN FALLBACK KE LOCALSTORAGE
                console.log('🚫 Tidak menggunakan fallback ke localStorage');
                
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

    // ✅ PERBAIKAN: Get program name langsung dari template data API
    const getProgramName = () => {
        if (template) {
            return template.program_name; // ✅ LANGSUNG DARI DATABASE
        }
        
        // Fallback hanya jika template belum loaded
        if (formConfig?.programName) {
            return formConfig.programName;
        }
        
        return 'Loading...';
    };

    // ✅ FUNGSI: Get form title
    const getFormTitle = () => {
        const programName = getProgramName();
        return `Pendaftaran Program ${programName}`;
    };

    // ✅ FUNGSI: Render dynamic fields dari formConfig API
    const renderDynamicFields = () => {
        if (!formConfig) return [];

        try {
            const fields = [];
            
            // Render fields dari sections
            if (formConfig.sections) {
                Object.values(formConfig.sections).forEach(section => {
                    if (section.fields && Array.isArray(section.fields)) {
                        section.fields.forEach(field => {
                            // Skip program_name field di public form
                            if (field.id !== 'program_name') {
                                fields.push({
                                    ...field,
                                    name: field.name || field.id
                                });
                            }
                        });
                    }
                });
            }

            // Render fields dari categories jika di step 3
            if (currentStep === 3 && selectedCategory && formConfig.categories) {
                const category = formConfig.categories[selectedCategory];
                if (category && category.fields) {
                    category.fields.forEach(field => {
                        fields.push({
                            ...field,
                            name: field.name || field.id
                        });
                    });
                }
            }

            console.log('🎨 Rendered dynamic fields from API:', fields);
            return fields;
            
        } catch (error) {
            console.error('Error rendering dynamic fields:', error);
            return [];
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
        setCurrentStep(3);
    };

    const nextStep = () => {
        if (currentStep === 1) {
            // Validasi field required
            const requiredFields = renderDynamicFields().filter(field => field.required);
            const missingFields = requiredFields.filter(field => !formData[field.name]);
            
            if (missingFields.length > 0) {
                toast({
                    title: "Data Belum Lengkap",
                    description: `Harap lengkapi ${missingFields.map(f => f.label).join(', ')}`,
                    variant: "destructive"
                });
                return;
            }
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        if (currentStep === 2) setCurrentStep(1);
        if (currentStep === 3) setCurrentStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const programName = getProgramName();
            
            const submissionData = {
                program_name: programName,
                form_slug: slug,
                personal_info: { ...formData },
                category: selectedCategory,
                additional_info: getCategoryFormData(),
                submittedAt: new Date().toISOString(),
                form_config: formConfig
            };
            
            console.log('📨 Form data submitted:', submissionData);
            
            // Simpan data submission
            const submissions = JSON.parse(localStorage.getItem('impalaFormSubmissions') || '[]');
            submissions.push(submissionData);
            localStorage.setItem('impalaFormSubmissions', JSON.stringify(submissions));

            // TODO: Kirim data ke API backend
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            toast({
                title: "Pendaftaran Berhasil! 🎉",
                description: `Terima kasih telah mendaftar program ${programName}. Tim kami akan menghubungi Anda.`,
                variant: "default"
            });
            
            // Reset form
            setFormData({});
            setSelectedCategory(null);
            setCurrentStep(1);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                title: "Error",
                description: "Terjadi error saat mengirim form. Silakan coba lagi.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCategoryFormData = () => {
        const data = {};
        const categoryFields = renderDynamicFields().filter(field => 
            formConfig?.categories?.[selectedCategory]?.fields?.some(f => f.id === field.id)
        );
        
        categoryFields.forEach(field => {
            data[field.name] = formData[field.name];
        });
        return data;
    };

    // Default fields (hanya untuk fallback kosong)
    const personalInfoFields = [
        { 
            id: 'full_name', 
            type: 'text', 
            name: 'full_name', 
            label: 'Nama Lengkap', 
            required: true,
            placeholder: 'Masukkan nama lengkap sesuai KTP'
        },
        { 
            id: 'email', 
            type: 'email', 
            name: 'email', 
            label: 'Email', 
            required: true,
            placeholder: 'email@example.com'
        },
        { 
            id: 'phone', 
            type: 'phone', 
            name: 'phone', 
            label: 'Nomor WhatsApp', 
            required: true,
            placeholder: '+62-xxx-xxxx-xxxx'
        }
    ];

    const categoryOptions = [
        { id: 'umkm', name: 'UMKM', description: 'Usaha Mikro, Kecil, dan Menengah', icon: '🏢' },
        { id: 'mahasiswa', name: 'Mahasiswa', description: 'Pelajar/Mahasiswa Aktif', icon: '🎓' },
        { id: 'profesional', name: 'Profesional', description: 'Pekerja/Karyawan/Profesional', icon: '💼' },
        { id: 'komunitas', name: 'Komunitas', description: 'Organisasi/Komunitas', icon: '👥' }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat formulir...</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Slug: <strong>{slug}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Mengambil data dari database...
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
                    <div className="text-sm text-gray-500 bg-yellow-50 p-4 rounded-lg max-w-md">
                        <p className="font-semibold">Kemungkinan penyebab:</p>
                        <ul className="list-disc list-inside mt-2 text-left">
                            <li>Form belum dipublish dari Form Builder</li>
                            <li>Slug URL tidak sesuai dengan database</li>
                            <li>Form telah dihapus</li>
                            <li>Koneksi database bermasalah</li>
                        </ul>
                        <p className="mt-3 text-blue-600">
                            Slug yang diminta: <strong>{slug}</strong>
                        </p>
                        <p className="mt-2 text-red-600 text-xs">
                            ❌ Data diambil dari API, bukan localStorage
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const programName = getProgramName();
    const formTitle = getFormTitle();
    const currentFields = renderDynamicFields();

    // Jika tidak ada fields, gunakan default
    const displayFields = currentFields.length > 0 ? currentFields : personalInfoFields;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🚀 {formTitle}
                    </h1>
                    <p className="text-gray-600">
                        Isi data diri Anda dengan lengkap dan benar
                    </p>
                    {/* Debug Info */}
                    <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                        <strong>Program:</strong> {programName} | <strong>Slug:</strong> {slug}
                        <br />
                        <span className="text-green-600 text-xs">✅ Data loaded from API | Template: {template.program_name}</span>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    currentStep >= step 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-300 text-gray-600'
                                }`}>
                                    {step}
                                </div>
                                <div className="text-sm mt-2 text-center">
                                    {step === 1 && 'Data Personal'}
                                    {step === 2 && 'Pilih Kategori'}
                                    {step === 3 && 'Data Tambahan'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header Form */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
                        <h2 className="text-xl font-semibold">
                            {formTitle}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            Program: {programName}
                        </p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            {/* STEP 1: Personal Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        📝 Informasi Pribadi
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displayFields.map((field) => (
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
                                    <div className="flex justify-end">
                                        <Button onClick={nextStep} type="button">
                                            Lanjut ke Pilih Kategori →
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Category Selection */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        🏷️ Pilih Kategori Profil Anda
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {categoryOptions.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-25 transition-all"
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
                                    <div className="flex justify-between">
                                        <Button onClick={prevStep} variant="outline">
                                            ← Kembali
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Category-specific Fields */}
                            {currentStep === 3 && selectedCategory && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        🏢 Informasi {categoryOptions.find(cat => cat.id === selectedCategory)?.name}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displayFields.map((field) => (
                                            <div key={field.id}>
                                                <FormField 
                                                    field={field}
                                                    value={formData[field.name] || ''}
                                                    onChange={(value) => handleInputChange(field.name, value)}
                                                    isEditing={false}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between">
                                        <Button onClick={prevStep} variant="outline">
                                            ← Kembali
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Mengirim...' : '📨 Kirim Pendaftaran'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>Butuh bantuan? support@impala.network | +62 811-1011-512</p>
                </div>
            </div>
        </div>
    );
};

export default PublicForm;