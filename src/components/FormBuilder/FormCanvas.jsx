import React from 'react';

const FormCanvas = ({ 
    formConfig, 
    selectedField, 
    onFieldSelect, 
    // onFieldUpdate,
    onProgramNameUpdate,
    showOnlyProgramInfo = false,
    availablePrograms = []
}) => {
    const handleProgramNameChange = (e) => {
        if (onProgramNameUpdate) {
            onProgramNameUpdate(e.target.value);
        }
    };

    const getProgramName = (program) => {
        if (typeof program === 'string') return program;
        if (program && program.program_name) return program.program_name;
        if (program && program.name) return program.name;
        return String(program); // fallback
    };

    const getCompanyInfo = (program) => {
        if (typeof program === 'string') return '';
        if (program && program.company) return program.company;
        return '';
    };

    const renderField = (field, sectionId) => {
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
                    
                    <select
                        value={formConfig.programName || ''}
                        onChange={handleProgramNameChange}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    >
                        <option value="">Pilih Program</option>
                        {availablePrograms.map((program, index) => {
                            const programName = getProgramName(program);
                            const company = getCompanyInfo(program);
                            
                            return (
                                <option key={index} value={programName}>
                                    {programName}
                                    {company && ` (${company})`}
                                </option>
                            );
                        })}
                    </select>
                    
                    <p className="text-xs text-blue-600 mt-2">
                        Pilih nama program dari daftar yang tersedia
                    </p>
                    
                    {availablePrograms.length === 0 && (
                        <p className="text-xs text-red-600 mt-1">
                            Tidak ada program yang tersedia. Silakan tambah program terlebih dahulu.
                        </p>
                    )}
                </div>
            );
        }

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
                        {field.options && field.options.map((option, index) => {
                            // ✅ PERBAIKI: Handle options yang mungkin object juga
                            const optionValue = typeof option === 'object' ? option.value || option.label : option;
                            const optionLabel = typeof option === 'object' ? option.label || option.value : option;
                            
                            return (
                                <option key={index} value={optionValue}>
                                    {optionLabel}
                                </option>
                            );
                        })}
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
                {/* <h2 className="text-xl font-semibold text-gray-800">Form Builder</h2> */}
                <p className="text-gray-600 mt-1">
                    Tersedia {availablePrograms.length} program untuk dipilih
                </p>
                

            </div>

            <div className="canvas-content">
                {formConfig.sections && Object.values(formConfig.sections).map(section => (
                    <div key={section.id} className="section mb-8">
                        <div className="section-header mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">⚙️</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-blue-800">
                                        {section.name}
                                    </h3>
                                    {section.description && (
                                        <p className="text-sm text-blue-600">
                                            {section.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="section-fields">
                            {section.fields.map(field => renderField(field, section.id))}
                        </div>
                    </div>
                ))}

                {(formConfig.personalInfo || formConfig.categories) && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="text-green-600 mt-0.5">
                                <span className="text-lg">📋</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-green-800 mb-2">
                                    Form Lengkap Tersedia di Public Form
                                </h4>
                                <div className="text-sm text-green-600 space-y-1">
                                    {formConfig.personalInfo && (
                                        <p>✅ <strong>Informasi Pribadi:</strong> {formConfig.personalInfo.fields.length} field</p>
                                    )}
                                    {formConfig.categories && (
                                        <p>✅ <strong>Kategori Peserta:</strong> {Object.keys(formConfig.categories).length} kategori dengan field tambahan</p>
                                    )}
                                    <p className="text-xs mt-2">
                                        Semua field akan ditampilkan saat peserta mengisi form pendaftaran
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Render categories sections */}
                {/* <div className="categories-section">
                    <div className="section-header mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="text-lg font-medium text-purple-800 mb-2">Kategori Peserta</h3>
                        <p className="text-sm text-purple-600">
                            Pilih kategori yang sesuai dengan profil Anda
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {Object.values(formConfig.categories || {}).map(category => (
                            <div key={category.id} className="category-section border border-gray-200 rounded-lg overflow-hidden">
                                <div className="category-header p-4 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{category.icon}</span>
                                        <div>
                                            <h4 className="font-medium text-gray-800">{category.name}</h4>
                                            <p className="text-sm text-gray-600">{category.description}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="category-fields p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.fields.map(field => renderField(field, category.id))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default FormCanvas;