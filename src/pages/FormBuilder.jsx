// src/pages/FormBuilder.jsx
import React, { useState } from 'react';
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import FormBuilderWorkspace from '../components/FormBuilder/FormBuilderWorkspace';
import FormPreview from '../components/FormBuilder/FormPreview';

const FormBuilder = () => {
    const [previewMode, setPreviewMode] = useState(false);
    const [formConfig, setFormConfig] = useState(null);

    const handleGetFormConfig = () => {
        const savedConfig = localStorage.getItem('impalaFormConfig');
        if (savedConfig) {
            setFormConfig(JSON.parse(savedConfig));
            setPreviewMode(true);
        } else {
            alert('Belum ada form yang disimpan. Silakan simpan form terlebih dahulu.');
        }
    };

    const handlePublishForm = () => {
        const savedConfig = localStorage.getItem('impalaFormConfig');
        if (!savedConfig) {
            alert('Belum ada form yang disimpan. Silakan simpan form terlebih dahulu.');
            return;
        }

        try {
            const config = JSON.parse(savedConfig);

            const formId = `form_${Date.now()}`;
            
            const publishedConfig = {
                ...config,
                id: formId,
                published: true,
                publishedAt: new Date().toISOString(),
                publicUrl: `/public-form/${formId}`
            };

            localStorage.setItem('impalaPublishedForm', JSON.stringify(publishedConfig));
            
            const baseUrl = window.location.origin;
            const publicUrl = `${baseUrl}/public-form/${formId}`;
            window.open(publicUrl, '_blank', 'noopener,noreferrer');
            
            alert('Form berhasil dipublish! Formulir sekarang dapat diakses oleh user eksternal.');
            
        } catch (error) {
            console.error('Error publishing form:', error);
            alert('Terjadi error saat mempublish form.');
        }
    };

    const handleSaveForm = () => {
        const savedConfig = localStorage.getItem('impalaFormConfig');
        if (savedConfig) {
            alert('Form berhasil disimpan!');
        } else {
            alert('Belum ada form yang dibuat. Silakan buat form terlebih dahulu.');
        }
    };

    if (previewMode && formConfig) {
        return (
            <FormPreview 
                formConfig={formConfig} 
                onBack={() => setPreviewMode(false)}
            />
        );
    }

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <Sidebar />
            <div className='flex-1 p-6'>
                <Header />
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Form Builder - Impala Management</h1>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleGetFormConfig}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
                            >
                                Preview
                            </button>
                            <button 
                                onClick={handleSaveForm}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                            >
                                Save
                            </button>
                            <button 
                                onClick={handlePublishForm}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                            >
                                Publish
                            </button>
                        </div>
                    </div>

                    <FormBuilderWorkspace />
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;