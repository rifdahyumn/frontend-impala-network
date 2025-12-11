// src/components/FormBuilder/PublicFormPreview.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import FormField from './fields/FormField';

const PublicFormPreview = ({ fields, category, onBack, formConfig }) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDisabilityField, setShowDisabilityField] = useState(false);
    
    // ===== UPDATE DOCUMENT TITLE BASED ON FORM CONFIG =====
    useEffect(() => {
        if (formConfig && formConfig.title) {
            document.title = `${formConfig.title} | Impala Network`;
        } else if (category) {
            document.title = `Pendaftaran Program ${category.name} | Impala Network`;
        } else {
            document.title = 'Form Pendaftaran | Impala Network';
        }
        
        return () => {
            document.title = 'Impala Network';
        };
    }, [formConfig, category]);

    // ===== EFEX UNTUK MENANGANI PERUBAHAN FIELD DISABILITAS =====
    useEffect(() => {
        // Update showDisabilityField berdasarkan pilihan user
        if (formData.is_disability === 'Ya') {
            setShowDisabilityField(true);
        } else {
            setShowDisabilityField(false);
            // Hapus nilai disability_type jika user memilih "Tidak"
            if (formData.disability_type) {
                setFormData(prev => ({
                    ...prev,
                    disability_type: ''
                }));
            }
        }
    }, [formData.is_disability]);

    const handleInputChange = (fieldName, value) => {
        // Jika field is_disability berubah, langsung update formData
        if (fieldName === 'is_disability') {
            setFormData(prev => ({
                ...prev,
                [fieldName]: value,
                // Jika memilih "Tidak", reset disability_type
                ...(value !== 'Ya' && { disability_type: '' })
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [fieldName]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Simpan data dengan format yang benar
            const submissionData = {
                ...formData,
                // Pastikan disability_type hanya ada jika is_disability = 'Ya'
                disability_type: formData.is_disability === 'Ya' ? formData.disability_type || '' : ''
            };
            
            console.log('Form data submitted:', submissionData);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            alert('Form berhasil dikirim! Terima kasih telah mendaftar.');
            
            // Reset form
            setFormData({});
            setShowDisabilityField(false);
        } catch (error) {
            alert('Terjadi error saat mengirim form. Silakan coba lagi.');
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===== FUNGSI UNTUK MENGELOMPOKKAN FIELDS =====
    const organizeFields = () => {
        const personalInfoFields = [];
        const additionalFields = [];
        let foundDisabilitySection = false;
        
        fields.forEach(field => {
            // Field pribadi utama (sebelum disability section)
            if (field.id === 'education' || !foundDisabilitySection) {
                personalInfoFields.push(field);
                
                // Setelah education, kita akan menambahkan is_disability
                if (field.id === 'education') {
                    const disabilityField = fields.find(f => f.id === 'is_disability');
                    if (disabilityField) {
                        personalInfoFields.push(disabilityField);
                        foundDisabilitySection = true;
                    }
                }
            } 
            // Field disability_type akan dihandle secara terpisah
            else if (field.id === 'disability_type') {
                // Tidak ditambahkan ke array, akan dihandle secara conditional
                return;
            }
            // Field setelah disability section
            else if (field.id === 'address' || foundDisabilitySection) {
                if (field.id !== 'is_disability') {
                    additionalFields.push(field);
                }
            }
        });
        
        return { personalInfoFields, additionalFields };
    };

    const { personalInfoFields, additionalFields } = organizeFields();

    const getCategoryTitle = () => {
        switch(category.id) {
            case 'umkm': return 'Usaha';
            case 'mahasiswa': return 'Pendidikan';
            case 'profesional': return 'Profesional';
            case 'komunitas': return 'Komunitas';
            default: return 'Tambahan';
        }
    };

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

    // ===== FUNGSI UNTUK MENDAPATKAN DISABILITY FIELD CONFIG =====
    const getDisabilityTypeField = () => {
        return fields.find(f => f.id === 'disability_type');
    };

    // ===== RENDER DISABILITY TYPE FIELD =====
    const renderDisabilityTypeField = () => {
        if (!showDisabilityField) return null;
        
        const disabilityField = getDisabilityTypeField();
        if (!disabilityField) return null;
        
        return (
            <div key="disability_type" className="mt-2 ml-4 pl-4 border-l-2 border-blue-200 animate-fadeIn">
                <FormField 
                    field={disabilityField}
                    value={formData[disabilityField.name] || ''}
                    onChange={(value) => handleInputChange(disabilityField.name, value)}
                    isEditing={false}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Contoh: Tuna netra, Tuna rungu, Disabilitas fisik, dll.
                </p>
            </div>
        );
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
                        {getFormTitle()}
                    </h1>
                    <p className="text-gray-600">
                        {getFormSubtitle()}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <h2 className="text-xl font-semibold text-center">
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
                                            {/* Render disability_type field setelah is_disability jika dipilih "Ya" */}
                                            {field.id === 'is_disability' && renderDisabilityTypeField()}
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

                            {/* Data Review (optional, untuk debugging) */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hidden">
                                <h4 className="font-medium text-gray-700 mb-2">Data yang akan dikirim:</h4>
                                <pre className="text-xs text-gray-600 overflow-auto">
                                    {JSON.stringify({
                                        ...formData,
                                        disability_type: showDisabilityField ? formData.disability_type : '(tidak diisi)'
                                    }, null, 2)}
                                </pre>
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