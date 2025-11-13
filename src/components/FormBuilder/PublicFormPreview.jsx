// src/components/FormBuilder/PublicFormPreview.jsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import FormField from './fields/FormField';

const PublicFormPreview = ({ fields, category, onBack }) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryFields, setShowCategoryFields] = useState(false);

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleCategorySelect = (categoryType) => {
        setSelectedCategory(categoryType);
        setShowCategoryFields(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Validasi: pastikan kategori sudah dipilih
            if (!selectedCategory) {
                alert('Silakan pilih kategori terlebih dahulu!');
                setIsSubmitting(false);
                return;
            }

            // Simulasi API call
            console.log('Form data submitted:', {
                ...formData,
                category: selectedCategory
            });
            
            // Tunggu 2 detik untuk simulasi
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            alert('Form berhasil dikirim! Terima kasih telah mendaftar.');
            setFormData({});
            setSelectedCategory(null);
            setShowCategoryFields(false);
        } catch (error) {
            alert('Terjadi error saat mengirim form. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pisahkan fields menjadi personal info dan category fields
    const personalInfoFields = fields.slice(0, 5);
    const categoryFields = fields.slice(5);

    // Template fields untuk setiap kategori
    const getCategoryFields = () => {
        const categoryTemplates = {
            umkm: [
                { 
                    id: 'businessName', 
                    type: 'text', 
                    name: 'businessName', 
                    label: 'Nama Usaha', 
                    required: true,
                    placeholder: 'Masukkan nama usaha'
                },
                { 
                    id: 'businessType', 
                    type: 'select', 
                    name: 'businessType', 
                    label: 'Jenis Usaha', 
                    required: true,
                    options: ['Retail', 'Manufacturing', 'Service', 'Food & Beverage', 'Technology', 'Fashion', 'Agriculture'] 
                },
                { 
                    id: 'establishedYear', 
                    type: 'number', 
                    name: 'establishedYear', 
                    label: 'Tahun Berdiri',
                    min: 1900,
                    max: new Date().getFullYear(),
                    required: true
                },
                { 
                    id: 'monthlyRevenue', 
                    type: 'number', 
                    name: 'monthlyRevenue', 
                    label: 'Pendapatan Bulanan (Rp)',
                    placeholder: 'Contoh: 5000000'
                },
                { 
                    id: 'totalEmployees', 
                    type: 'number', 
                    name: 'totalEmployees', 
                    label: 'Jumlah Karyawan' 
                },
                { 
                    id: 'businessAddress', 
                    type: 'text', 
                    name: 'businessAddress', 
                    label: 'Alamat Usaha' 
                }
            ],
            mahasiswa: [
                { 
                    id: 'institution', 
                    type: 'text', 
                    name: 'institution', 
                    label: 'Nama Institusi Pendidikan', 
                    required: true,
                    placeholder: 'Nama universitas atau kampus'
                },
                { 
                    id: 'major', 
                    type: 'text', 
                    name: 'major', 
                    label: 'Jurusan', 
                    required: true,
                    placeholder: 'Contoh: Teknik Informatika'
                },
                { 
                    id: 'enrollmentYear', 
                    type: 'number', 
                    name: 'enrollmentYear', 
                    label: 'Tahun Masuk',
                    required: true,
                    min: 2000,
                    max: new Date().getFullYear()
                },
                { 
                    id: 'semester', 
                    type: 'number', 
                    name: 'semester', 
                    label: 'Semester Saat Ini',
                    min: 1,
                    max: 14
                },
                { 
                    id: 'studentId', 
                    type: 'text', 
                    name: 'studentId', 
                    label: 'NIM/NIS' 
                },
                { 
                    id: 'careerInterest', 
                    type: 'text', 
                    name: 'careerInterest', 
                    label: 'Minat Karir Setelah Lulus' 
                }
            ],
            profesional: [
                { 
                    id: 'workplace', 
                    type: 'text', 
                    name: 'workplace', 
                    label: 'Nama Perusahaan/Tempat Kerja', 
                    required: true 
                },
                { 
                    id: 'position', 
                    type: 'text', 
                    name: 'position', 
                    label: 'Posisi/Jabatan', 
                    required: true 
                },
                { 
                    id: 'workDuration', 
                    type: 'text', 
                    name: 'workDuration', 
                    label: 'Lama Bekerja',
                    placeholder: 'Contoh: 3 tahun 2 bulan'
                },
                { 
                    id: 'industrySector', 
                    type: 'select', 
                    name: 'industrySector', 
                    label: 'Sektor Industri',
                    options: ['Teknologi', 'Keuangan', 'Pendidikan', 'Kesehatan', 'Manufaktur', 'Retail', 'Lainnya'] 
                },
                { 
                    id: 'specialization', 
                    type: 'text', 
                    name: 'specialization', 
                    label: 'Spesialisasi/Keahlian' 
                },
                { 
                    id: 'currentSalary', 
                    type: 'number', 
                    name: 'currentSalary', 
                    label: 'Gaji Saat Ini (Rp) (Opsional)' 
                }
            ],
            komunitas: [
                { 
                    id: 'communityName', 
                    type: 'text', 
                    name: 'communityName', 
                    label: 'Nama Komunitas', 
                    required: true 
                },
                { 
                    id: 'focusArea', 
                    type: 'text', 
                    name: 'focusArea', 
                    label: 'Bidang/Kegiatan Komunitas',
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
                    options: ['Lokal', 'Regional', 'Nasional', 'Internasional'] 
                },
                { 
                    id: 'communitySince', 
                    type: 'number', 
                    name: 'communitySince', 
                    label: 'Tahun Berdiri Komunitas' 
                },
                { 
                    id: 'communityActivities', 
                    type: 'textarea', 
                    name: 'communityActivities', 
                    label: 'Kegiatan Rutin Komunitas',
                    rows: 3
                }
            ]
        };

        return categoryTemplates[selectedCategory] || [];
    };

    const getCategoryTitle = () => {
        switch(selectedCategory) {
            case 'umkm': return 'UMKM';
            case 'mahasiswa': return 'Mahasiswa';
            case 'profesional': return 'Profesional';
            case 'komunitas': return 'Komunitas';
            default: return '';
        }
    };

    const categoryOptions = [
        { id: 'umkm', name: 'UMKM', description: 'Usaha Mikro, Kecil, dan Menengah', icon: '🏢' },
        { id: 'mahasiswa', name: 'Mahasiswa', description: 'Pelajar/Mahasiswa Aktif', icon: '🎓' },
        { id: 'profesional', name: 'Profesional', description: 'Pekerja/Karyawan/Profesional', icon: '💼' },
        { id: 'komunitas', name: 'Komunitas', description: 'Organisasi/Komunitas', icon: '👥' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Back Button */}
                <div className="mb-4">
                    <Button onClick={onBack} variant="outline" className="mb-4">
                        ← Kembali ke Form Builder
                    </Button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Pendaftaran Program Impala
                    </h1>
                    <p className="text-gray-600">
                        Isi informasi pribadi terlebih dahulu, lalu pilih kategori yang sesuai
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <h2 className="text-xl font-semibold text-center">
                            Form Pendaftaran Peserta Program
                        </h2>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                    📝 Informasi Pribadi
                                </h3>
                                <div className="space-y-4">
                                    {personalInfoFields.map((field) => (
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
                            </div>

                            {/* Category Selection Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                    🏷️ Pilih Kategori
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Silakan pilih kategori yang paling sesuai dengan profil Anda:
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categoryOptions.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                                selectedCategory === cat.id
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
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

                                {selectedCategory && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 text-sm">
                                            ✅ Anda memilih: <strong>{getCategoryTitle()}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Category-specific Fields */}
                            {showCategoryFields && selectedCategory && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                        🏢 Informasi {getCategoryTitle()}
                                    </h3>
                                    <div className="space-y-4">
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
                                </div>
                            )}

                            {/* Terms and Conditions */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <input 
                                        type="checkbox" 
                                        id="terms"
                                        className="mt-1"
                                        required
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-700">
                                        Saya menyetujui syarat dan ketentuan yang berlaku dan memastikan 
                                        data yang saya berikan adalah benar. Data ini akan digunakan untuk 
                                        keperluan program Impala Management.
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || !selectedCategory}
                                    className="px-8 py-3 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mengirim Pendaftaran...
                                        </div>
                                    ) : (
                                        '📨 Kirim Pendaftaran'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center mt-6 text-gray-500 text-sm">
                    <p>📞 Untuk pertanyaan, hubungi: support@impala-management.com | 📱 0812-3456-7890</p>
                    <p>⏰ Form ini akan diproses dalam 1-2 hari kerja</p>
                </div>

                {/* Preview Notice */}
                <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-center">
                    <p className="text-blue-700 text-sm">
                        <strong>Preview Mode:</strong> Ini adalah tampilan form untuk user eksternal. 
                        Data yang diisi tidak akan benar-benar tersimpan.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicFormPreview;