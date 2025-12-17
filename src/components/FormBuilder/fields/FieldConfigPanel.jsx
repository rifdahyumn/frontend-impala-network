import React from 'react';

const FieldConfigPanel = ({ 
    selectedField, 
    onUpdateField, 
    onDeleteField,
    availableFieldTypes = [
        { value: 'text', label: 'Text Input', icon: '📝' },
        { value: 'email', label: 'Email', icon: '📧' },
        { value: 'number', label: 'Number', icon: '🔢' },
        { value: 'tel', label: 'Telepon', icon: '📞' },
        { value: 'textarea', label: 'Text Area', icon: '📄' },
        { value: 'select', label: 'Dropdown', icon: '📋' },
        { value: 'radio', label: 'Radio Button', icon: '⭕' },
        { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
        { value: 'date', label: 'Date', icon: '📅' }
    ] 
}) => {
    if (!selectedField) {
        return (
            <div className="p-6 bg-gray-50 rounded-lg h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">⚙️</div>
                    <p>Pilih field untuk mengkonfigurasi</p>
                </div>
            </div>
        );
    }

    const handleChange = (key, value) => {
        onUpdateField({
            ...selectedField,
            [key]: value
        });
    };

    const handleOptionsChange = (newOptions) => {
        handleChange('options', newOptions);
    };

    const addOption = () => {
        const currentOptions = selectedField.options || [];
        handleOptionsChange([...currentOptions, `Opsi ${currentOptions.length + 1}`]);
    };

    const updateOption = (index, value) => {
        const currentOptions = [...(selectedField.options || [])];
        currentOptions[index] = value;
        handleOptionsChange(currentOptions);
    };

    const removeOption = (index) => {
        const currentOptions = [...(selectedField.options || [])];
        currentOptions.splice(index, 1);
        handleOptionsChange(currentOptions);
    };

    return (
        <div className="p-6 bg-white border-l border-gray-200 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Konfigurasi Field
                </h3>
                <button
                    onClick={onDeleteField}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Hapus field"
                >
                    🗑️
                </button>
            </div>

            <div className="space-y-4">
                {/* Tipe Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Field
                    </label>
                    <select
                        value={selectedField.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {availableFieldTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Label */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Label *
                    </label>
                    <input
                        type="text"
                        value={selectedField.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        placeholder="Masukkan label field"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Placeholder */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder
                    </label>
                    <input
                        type="text"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => handleChange('placeholder', e.target.value)}
                        placeholder="Teks placeholder"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Field Name/ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Name *
                    </label>
                    <input
                        type="text"
                        value={selectedField.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="nama_field (untuk kode)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Gunakan snake_case, contoh: nama_lengkap, email_address
                    </p>
                </div>

                {/* Required */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="required"
                        checked={selectedField.required || false}
                        onChange={(e) => handleChange('required', e.target.checked)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="required" className="text-sm font-medium text-gray-700">
                        Wajib diisi
                    </label>
                </div>

                {/* Options untuk select, radio, checkbox */}
                {(selectedField.type === 'select' || selectedField.type === 'radio') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opsi {selectedField.type === 'select' ? 'Dropdown' : 'Radio'}
                        </label>
                        <div className="space-y-2">
                            {(selectedField.options || []).map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        placeholder={`Opsi ${index + 1}`}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="text-red-500 hover:text-red-700 px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addOption}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            + Tambah Opsi
                        </button>
                    </div>
                )}

                {/* Preview */}
                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {selectedField.label} {selectedField.required && <span className="text-red-500">*</span>}
                        </label>
                        {selectedField.type === 'text' && (
                            <input
                                type="text"
                                placeholder={selectedField.placeholder}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                disabled
                            />
                        )}
                        {selectedField.type === 'select' && (
                            <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm" disabled>
                                <option>Pilih opsi...</option>
                                {(selectedField.options || []).map((option, index) => (
                                    <option key={index}>{option}</option>
                                ))}
                            </select>
                        )}
                        {selectedField.type === 'radio' && (
                            <div className="space-y-1">
                                {(selectedField.options || []).map((option, index) => (
                                    <label key={index} className="flex items-center text-sm">
                                        <input type="radio" name="preview" className="mr-2" disabled />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        )}
                        {selectedField.type === 'checkbox' && (
                            <label className="flex items-center text-sm">
                                <input type="checkbox" className="mr-2" disabled />
                                {selectedField.placeholder || selectedField.label}
                            </label>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldConfigPanel;