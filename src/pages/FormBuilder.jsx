// src/pages/FormBuilder.jsx
import React, { useState } from 'react';
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import FormBuilderWorkspace from '../components/FormBuilder/FormBuilderWorkspace';
import FormPreview from '../components/FormBuilder/FormPreview';

const FormBuilder = () => {
    const [previewMode, setPreviewMode] = useState(false);
    const [formConfig, setFormConfig] = useState(null);

    // Handler untuk mendapatkan formConfig dari workspace
    const handleGetFormConfig = () => {
        const savedConfig = localStorage.getItem('impalaFormConfig');
        if (savedConfig) {
            setFormConfig(JSON.parse(savedConfig));
            setPreviewMode(true);
        } else {
            alert('Belum ada form yang disimpan. Silakan simpan form terlebih dahulu.');
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
                            <p className="text-gray-600 mt-1">
                                Bangun form pendaftaran dengan drag & drop. Semua form sudah termasuk data personal.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleGetFormConfig}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                            >
                                👁️ Preview
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.setItem('impalaFormConfig', JSON.stringify(formConfig));
                                    alert('Form berhasil disimpan!');
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                            >
                                💾 Save
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.setItem('impalaFormConfig', JSON.stringify(formConfig));
                                    alert('Form berhasil dipublish!');
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                🚀 Publish
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