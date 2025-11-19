import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import FormField from '../components/FormBuilder/fields/FormField';

const PublicForm = () => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentStep, setCurrentStep] = useState(1); // 1: Personal, 2: Category, 3: Additional

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleCategorySelect = (categoryType) => {
        setSelectedCategory(categoryType);
        setCurrentStep(3); // Langsung ke step 3
    };

    const nextStep = () => {
        if (currentStep === 1) {
            // Validasi data personal dulu
            if (!formData.full_name || !formData.email || !formData.phone) {
                alert('Harap lengkapi data personal terlebih dahulu!');
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
            const submissionData = {
                personal_info: {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth,
                    address: formData.address
                },
                category: selectedCategory,
                additional_info: getCategoryFormData(),
                submittedAt: new Date().toISOString()
            };
            
            console.log('Form data submitted:', submissionData);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            alert('Pendaftaran berhasil! Terima kasih telah mendaftar program Impala Management.');
            
            // Reset form
            setFormData({});
            setSelectedCategory(null);
            setCurrentStep(1);
        } catch (error) {
            alert('Terjadi error saat mengirim form. Silakan coba lagi.', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCategoryFormData = () => {
        const data = {};
        getCategoryFields().forEach(field => {
            data[field.name] = formData[field.name];
        });
        return data;
    };

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
            id: 'nik', 
            type: 'nik', 
            name: 'nik', 
            label: 'NIK (Nomor Induk Kependudukan)', 
            required: true,
            placeholder: 'Enter your NIK 17 digits',
            minlength:'17',
            maxlength:'17'
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
        },
        { 
            id: 'gender', 
            type: 'select', 
            name: 'gender', 
            label: 'Jenis Kelamin', 
            required: true,
            options: ['Laki-laki', 'Perempuan']
        },
        { 
            id: 'dateOfBirth', 
            type: 'date', 
            name: 'date_of_birth', 
            label: 'Tanggal Lahir', 
            required: true
        },
        {
            id: 'education',
            type: 'select',
            name: 'education',
            label: 'Pendidikan Terakhir',
            required: true,
            options: [ 'Sekolah Menengah Atas (SMA/SMK/MA)', 'Diploma (D3)', 'Sarjana (S1)', 'Magister (S2)', 'Doctor (S3)']
        },
        { 
            id: 'address', 
            type: 'textarea', 
            name: 'address', 
            label: 'Alamat Lengkap',
            rows: 3,
            required: true,
            placeholder: 'Jl. Contoh No. 123, Kota, Provinsi'
        },
        { 
            id: 'district', 
            type: 'text', 
            name: 'district', 
            label: 'Kecamatan', 
            required: true,
        },
        {
            id: 'city', 
            type: 'text', 
            name: 'city', 
            label: 'Kota / Kabupaten', 
            required: true,
        },
        {
            id: 'province', 
            type: 'text', 
            name: 'province', 
            label: 'Provinsi', 
            required: true,
        },
        {
            id: 'postalCode', 
            type: 'text', 
            name: 'postalCode', 
            label: 'Kode Pos', 
            required: true,

            id: 'reason', 
            type: 'textarea', 
            name: 'reason_join_program', 
            label: 'Reason Join Program',
            rows: 3,
            required: true,
            placeholder: 'Ingin menambah wawasan'
        }
    ];

    const getCategoryFields = () => {
        const categoryTemplates = {
            umkm: [
                { 
                    id: 'business_name', 
                    type: 'text', 
                    name: 'business_name', 
                    label: 'Nama Bisnis / Usaha', 
                    required: true,
                    placeholder: 'Masukkan nama bisnis / usaha'
                },
                { 
                    id: 'business', 
                    type: 'select', 
                    name: 'business', 
                    label: 'Jenis Bisnis', 
                    required: true,
                    options: ['Retail', 'Manufacturing', 'Service', 'Food & Beverage', 'Teknologi'] 
                },
                { 
                    id: 'establishedYear', 
                    type: 'number', 
                    name: 'establishedYear', 
                    label: 'Tahun Berdiri',
                    required: true,
                    min: 1900,
                    max: new Date().getFullYear()
                },
                { 
                    id: 'monthlyRevenue', 
                    type: 'select', 
                    name: 'monthlyRevenue', 
                    label: 'Omset Bulanan (Rp)',
                    options: ['Rp 500.000 - Rp 1.000.000', 'Rp 1.000.000 - Rp 5.000.000', 'Rp 5.000.000 - Rp 10.000.000', 'Rp 10.000.000 - Rp 15.000.000', 'Lebih dari Rp 15.000.000']
                },
                { 
                    id: 'total_employee', 
                    type: 'select', 
                    name: 'total_employee', 
                    label: 'Total Karyawan',
                    options: ['1 - 50', '50 - 100', '100 - 500', '500 - 1000', 'Lebih dari 1000']
                }
            ],
            mahasiswa: [
                { 
                    id: 'institution', 
                    type: 'text', 
                    name: 'institution', 
                    label: 'Institusi', 
                    required: true,
                    placeholder: 'Masukkan nama institusi'
                },
                { 
                    id: 'major', 
                    type: 'text', 
                    name: 'major', 
                    label: 'Jurusan', 
                    required: true,
                    placeholder: 'Masukkan nama jurusan'
                },
                { 
                    id: 'enrollmentYear', 
                    type: 'number', 
                    name: 'enrollmentYear', 
                    label: 'Tahun Pendaftaran',
                    required: true,
                    min: 2000,
                    max: new Date().getFullYear()
                },
                { 
                    id: 'semester', 
                    type: 'number', 
                    name: 'semester', 
                    label: 'Semester',
                    min: 1,
                    max: 14
                },
                { 
                    id: 'coreCompetency', 
                    type: 'text', 
                    name: 'CoreCompetency', 
                    label: 'Kompetensi',
                    required: true,
                    placeholder: 'Contoh: Data Analyst, Public Speaking'
                },
                { 
                    id: 'careerInterest', 
                    type: 'text', 
                    name: 'careerInterest', 
                    label: 'Minat Karier',
                    required: true,
                    placeholder: 'Contoh: Data Analyst, Public Speaking'
                }
            ],
            profesional: [
                { 
                    id: 'workplace', 
                    type: 'text', 
                    name: 'workplace', 
                    label: 'Nama Perusahaan / Instansi', 
                    required: true,
                    placeholder: 'Nama perusahaan atau instansi'
                },
                { 
                    id: 'position', 
                    type: 'text', 
                    name: 'position', 
                    label: 'Posisi', 
                    required: true,
                    placeholder: 'Contoh: Software Engineer'
                },
                { 
                    id: 'workDuration', 
                    type: 'text', 
                    name: 'workDuration', 
                    label: 'Lama Bekerja',
                    required: true,
                    placeholder: 'Contoh: 3 tahun 2 bulan'
                },
                { 
                    id: 'industrySector', 
                    type: 'text', 
                    name: 'industrySector', 
                    label: 'Sektor Industri',
                    placeholder: 'Contoh: Pendidikan, Keuangan & Perbankan'
                }
            ],
            komunitas: [
                { 
                    id: 'communityName', 
                    type: 'text', 
                    name: 'communityName', 
                    label: 'Nama Komunitas', 
                    required: true,
                    placeholder: 'Nama resmi komunitas'
                },
                { 
                    id: 'focusArea', 
                    type: 'text', 
                    name: 'focusArea', 
                    label: 'Area Fokus',
                    placeholder: 'Contoh: Pendidikan, Lingkungan, Teknologi'
                },
                { 
                    id: 'totalMembers', 
                    type: 'number', 
                    name: 'totalMembers', 
                    label: 'Jumlah Anggota',
                    required: true
                },
                { 
                    id: 'operationalArea', 
                    type: 'select', 
                    name: 'operationalArea', 
                    label: 'Area Operasional', 
                    options: ['Lokal', 'Nasional', 'Internasional'] 
                }
            ]
        };
        return categoryTemplates[selectedCategory] || [];
    };

    const categoryOptions = [
        { id: 'umkm', name: 'UMKM', description: 'Usaha Mikro, Kecil, dan Menengah', icon: '🏢' },
        { id: 'mahasiswa', name: 'Mahasiswa', description: 'Pelajar/Mahasiswa Aktif', icon: '🎓' },
        { id: 'profesional', name: 'Profesional', description: 'Pekerja/Karyawan/Profesional', icon: '💼' },
        { id: 'komunitas', name: 'Komunitas', description: 'Organisasi/Komunitas', icon: '👥' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🚀 Pendaftaran Program Impala Management
                    </h1>
                    <p className="text-gray-600">
                        1 Form untuk Semua Kategori - Pilih yang Sesuai dengan Profil Anda
                    </p>
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
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <h2 className="text-xl font-semibold text-center">
                            Formulir Pendaftaran Program Impala
                        </h2>
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
                                        {personalInfoFields.map((field) => (
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
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        🏢 Informasi {categoryOptions.find(cat => cat.id === selectedCategory)?.name}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {getCategoryFields().map((field) => (
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

                                    {/* Terms & Submit */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" id="terms" required />
                                            <label htmlFor="terms" className="text-sm text-gray-700">
                                                Saya menyetujui syarat dan ketentuan program Impala Management.
                                            </label>
                                        </div>
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