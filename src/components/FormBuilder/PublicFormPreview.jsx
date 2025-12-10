// src/components/FormBuilder/PublicFormPreview.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import FormField from './fields/FormField';

const PublicFormPreview = ({ fields, category, onBack, formConfig }) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // ===== UPDATE DOCUMENT TITLE BASED ON FORM CONFIG =====
    useEffect(() => {
        if (formConfig && formConfig.title) {
            // Gunakan title dari formConfig yang sudah ada
            document.title = `${formConfig.title} | Impala Network`;
        } else if (category) {
            // Fallback ke category name
            document.title = `Pendaftaran Program ${category.name} | Impala Network`;
        } else {
            document.title = 'Form Pendaftaran | Impala Network';
        }
        
        // Cleanup: kembalikan title default saat komponen unmount
        return () => {
            document.title = 'Impala Network';
        };
    }, [formConfig, category]);

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Simulasi API call
            console.log('Form data submitted:', formData);
            
            // Tunggu 2 detik untuk simulasi
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            alert('Form berhasil dikirim! Terima kasih telah mendaftar.');
            setFormData({}); // Reset form
        } catch (error) {
            alert('Terjadi error saat mengirim form. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pisahkan fields menjadi personal info dan additional info
    const personalInfoFields = fields.slice(0, 5);
    const additionalFields = fields.slice(5);

    const getCategoryTitle = () => {
        switch(category.id) {
            case 'umkm': return 'Usaha';
            case 'mahasiswa': return 'Pendidikan';
            case 'profesional': return 'Profesional';
            case 'komunitas': return 'Komunitas';
            default: return 'Tambahan';
        }
    };

    // ===== FUNGSI UNTUK MENDAPATKAN JUDUL FORM =====
    const getFormTitle = () => {
        if (formConfig && formConfig.title) {
            return formConfig.title;
        }
        return 'Pendaftaran Program Impala';
    };

    const getFormSubtitle = () => {
        if (formConfig && formConfig.title) {
            return `Isi data diri Anda dengan lengkap dan benar`;
        }
        return `Form pendaftaran untuk peserta program Impala Management - ${category?.name || ''}`;
    };

    const getFormHeaderTitle = () => {
        if (formConfig && formConfig.title) {
            return `Form ${formConfig.title}`;
        }
        return `Form Pendaftaran ${category?.name || 'Program'}`;
    };

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
                        {/* ===== JUDUL UTAMA DARI FORM CONFIG ===== */}
                        {getFormTitle()}
                    </h1>
                    <p className="text-gray-600">
                        {/* ===== SUBTITLE ===== */}
                        {getFormSubtitle()}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <h2 className="text-xl font-semibold text-center">
                            {/* ===== JUDUL HEADER FORM ===== */}
                            {getFormHeaderTitle()}
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

                            {/* Additional Information Section */}
                            {additionalFields.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                        🏢 Informasi {getCategoryTitle()}
                                    </h3>
                                    <div className="space-y-4">
                                        {additionalFields.map((field) => (
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
                                        data yang saya berikan adalah benar.
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-8 py-3 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mengirim Pendaftaran...
                                        </div>
                                    ) : (
                                        '📨 Daftar Sekarang'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center mt-6 text-gray-500 text-sm">
                    <p>📞 Untuk pertanyaan, hubungi: support@impala-management.com</p>
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