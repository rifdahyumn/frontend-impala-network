// src/components/FormBuilder/FormCanvas.jsx
import React from 'react';

const FormCanvas = ({ 
    formConfig, 
    selectedField, 
    onFieldSelect, 
    onFieldUpdate,
    onProgramNameUpdate
}) => {
    
    const handleProgramNameChange = (e) => {
        if (onProgramNameUpdate) {
            onProgramNameUpdate(e.target.value);
        }
    };

    const renderField = (field, sectionId) => {
        // Render khusus untuk field nama program
        if (field.id === 'program_name') {
            return (
                <div 
                    key={field.id}
                    className={`field-item p-4 border-2 border-blue-200 bg-blue-50 rounded-lg mb-4 ${
                        selectedField?.id === field.id ? 'border-blue-500 bg-blue-100' : 'border-blue-200'
                    } ${field.locked ? 'opacity-75' : ''}`}
                >
                    <div className="field-header mb-3">
                        <label className="block text-sm font-bold text-blue-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    </div>
                    
                    <input
                        type="text"
                        value={formConfig.programName || ''}
                        onChange={handleProgramNameChange}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    />
                    
                    <p className="text-xs text-blue-600 mt-2">
                        💡 Nama program ini akan menjadi judul formulir pendaftaran
                    </p>
                </div>
            );
        }

        // Render field biasa
        return (
            <div 
                key={field.id}
                className={`field-item p-4 border rounded-lg mb-4 ${
                    selectedField?.id === field.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } ${field.locked ? 'opacity-75' : ''}`}
                onClick={() => !field.locked && onFieldSelect(field)}
            >
                <div className="field-header mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                </div>
                
                {/* Preview field berdasarkan type */}
                {field.type === 'text' && (
                    <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                    />
                )}
                
                {field.type === 'email' && (
                    <input
                        type="email"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                    />
                )}
                
                {field.type === 'select' && (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                        <option>Pilih {field.label.toLowerCase()}</option>
                    </select>
                )}
                
                {field.type === 'textarea' && (
                    <textarea
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                    />
                )}
                
                {field.type === 'number' && (
                    <input
                        type="number"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                    />
                )}
                
                {field.type === 'date' && (
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                    />
                )}
                
                {field.description && (
                    <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                )}
            </div>
        );
    };

    return (
        <div className="form-canvas">
            <div className="canvas-header mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Form Builder</h2>
            </div>

            <div className="canvas-content">
                {/* Section Program Info - HANYA untuk Builder, tidak untuk Preview */}
                {formConfig.sections.programInfo && (
                    <div key={formConfig.sections.programInfo.id} className="section mb-8">
                        <div className="section-header mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">⚙️</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-blue-800">
                                        {formConfig.sections.programInfo.name}
                                    </h3>
                                    {formConfig.sections.programInfo.description && (
                                        <p className="text-sm text-blue-600">
                                            {formConfig.sections.programInfo.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="section-fields">
                            {/* HANYA render field program_name, tidak ada program_description */}
                            {formConfig.sections.programInfo.fields
                                .filter(field => field.id === 'program_name') // FILTER: hanya tampilkan program_name
                                .map(field => renderField(field, formConfig.sections.programInfo.id)
                            )}
                        </div>
                    </div>
                )}

                {/* Render section personalInfo */}
                {formConfig.sections.personalInfo && (
                    <div key={formConfig.sections.personalInfo.id} className="section mb-8">
                        <div className="section-header mb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                                {formConfig.sections.personalInfo.name}
                            </h3>
                            {formConfig.sections.personalInfo.description && (
                                <p className="text-sm text-gray-600">
                                    {formConfig.sections.personalInfo.description}
                                </p>
                            )}
                        </div>
                        
                        <div className="section-fields">
                            {formConfig.sections.personalInfo.fields.map(field => 
                                renderField(field, formConfig.sections.personalInfo.id)
                            )}
                        </div>
                    </div>
                )}

                {/* Render categories sections */}
                <div className="categories-section">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Kategori Peserta</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Pilih kategori yang sesuai dengan profil Anda
                    </p>
                    
                    {Object.values(formConfig.categories || {}).map(category => (
                        <div key={category.id} className="category-section mb-8">
                            <div className="category-header mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{category.icon}</span>
                                    <div>
                                        <h4 className="font-medium text-gray-800">{category.name}</h4>
                                        <p className="text-sm text-gray-600">{category.description}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="category-fields pl-4">
                                {category.fields.map(field => renderField(field, category.id))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FormCanvas;