// src/components/FormBuilder/FormPreview.jsx
import React, { useState } from 'react';
import FormField from './fields/FormField';

const FormPreview = ({ formConfig, onBack }) => {
    const [formData, setFormData] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentStep(3);
    };

    const nextStep = () => {
        if (currentStep === 1) {
            // Validasi data personal - HANYA field dari personalInfo, bukan programInfo
            const personalFields = formConfig?.sections?.personalInfo?.fields?.filter(field => field.required) || [];
            const missingFields = personalFields.filter(field => !formData[field.name]);
            
            if (missingFields.length > 0) {
                alert(`Harap lengkapi field berikut: ${missingFields.map(f => f.label).join(', ')}`);
                return;
            }
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        if (currentStep === 2) setCurrentStep(1);
        if (currentStep === 3) setCurrentStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data Submitted:', formData);
        alert('Form berhasil disubmit! (Ini hanya preview)');
    };

    if (!formConfig) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-4">
                        <p>Form configuration tidak ditemukan!</p>
                    </div>
                    <button 
                        onClick={onBack}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Kembali ke Builder
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    {/* HAPUS: Button kembali dari header */}
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {formConfig.programName 
                            ? `Formulir Pendaftaran ${formConfig.programName}`
                            : formConfig.title
                        }
                    </h1>
                    <p className="text-gray-600">
                        {formConfig.description}
                    </p>
                    <div className="mt-2 bg-yellow-100 border border-yellow-300 rounded-lg p-2 inline-block">
                        <p className="text-yellow-800 text-sm">👁️ MODE PREVIEW - Data tidak benar-benar disimpan</p>
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
                                    {step === 3 && 'Data Kategori'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header dengan judul program yang dinamis */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <h2 className="text-xl font-semibold text-center">
                            {formConfig.programName 
                                ? `Formulir Pendaftaran ${formConfig.programName}`
                                : 'Preview Formulir Pendaftaran'
                            }
                        </h2>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        📝 Informasi Pribadi
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                        {formConfig.sections.personalInfo.fields.map((field) => (
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
                                       
                                        <button 
                                            onClick={nextStep}
                                            type="button"
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Lanjut ke Pilih Kategori →
                                        </button>
                                    </div>
                                </div>
                            )}
                                     
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        🏷️ Pilih Kategori Profil Anda
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(formConfig.categories || {}).map(([key, category]) => (
                                            <div
                                                key={key}
                                                className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                                                onClick={() => handleCategorySelect(key)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{category.icon}</span>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                                                        <p className="text-sm text-gray-600">{category.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between">
                                        <button 
                                            onClick={prevStep}
                                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            ← Kembali ke Data Personal
                                        </button>
                                          
                                    </div>
                                </div>
                            )}

                            
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        {formConfig.categories[selectedCategory]?.icon} 
                                        Informasi {formConfig.categories[selectedCategory]?.name}
                                    </h3>
                                    
                                
                                    {formConfig.categories[selectedCategory] && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {formConfig.categories[selectedCategory].fields.map((field) => (
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
                                    )}

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" id="terms" required className="mt-1" />
                                            <label htmlFor="terms" className="text-sm text-gray-700">
                                                Saya menyetujui syarat dan ketentuan program {formConfig.programName || 'Impala Management'}.
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button 
                                            onClick={prevStep}
                                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            ← Kembali ke Pilih Kategori
                                        </button>
                                        <button 
                                            type="submit"
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            📨 Submit Form
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
 
                <div className="mt-8 text-center">
                    <button 
                        onClick={onBack}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                    >
                        ← Kembali ke Form Builder
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormPreview;