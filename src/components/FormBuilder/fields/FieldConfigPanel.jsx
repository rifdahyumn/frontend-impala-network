// src/components/FormBuilder/fields/FieldConfigPanel.jsx
import React, { useState, useEffect } from 'react';

const FieldConfigPanel = ({ field, onUpdate, onClose, isLocked = false }) => {
    const [settings, setSettings] = useState({
        label: '',
        placeholder: '',
        required: false,
        options: ['']
    });

    // Initialize settings when field changes
    useEffect(() => {
        if (field) {
            setSettings({
                label: field.label || '',
                placeholder: field.placeholder || '',
                required: field.required || false,
                options: field.options || ['']
            });
        }
    }, [field]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(settings);
        }
    };

    const addOption = () => {
        setSettings(prev => ({
            ...prev,
            options: [...prev.options, '']
        }));
    };

    const updateOption = (index, value) => {
        setSettings(prev => ({
            ...prev,
            options: prev.options.map((opt, i) => i === index ? value : opt)
        }));
    };

    const removeOption = (index) => {
        if (settings.options.length > 1) {
            setSettings(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }));
        }
    };

    if (!field) {
        return (
            <div className="p-4 text-center text-gray-500">
                Pilih field untuk mengatur konfigurasi
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h3 className="text-lg font-semibold">Field Settings</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                >
                    ✕
                </button>
            </div>

            {/* Field Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Type:</span>
                    <span className="text-sm text-gray-600 capitalize">{field.type}</span>
                </div>
                {isLocked && (
                    <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                        <span>🔒</span>
                        Field Sistem
                    </div>
                )}
            </div>

            {/* Settings Form */}
            <div className="space-y-4 flex-1 overflow-auto">
                {/* Label Setting */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label Pertanyaan
                    </label>
                    <input
                        type="text"
                        value={settings.label}
                        onChange={(e) => setSettings(prev => ({ ...prev, label: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        disabled={isLocked}
                        placeholder="Masukkan label field"
                    />
                </div>

                {/* Placeholder Setting */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder
                    </label>
                    <input
                        type="text"
                        value={settings.placeholder}
                        onChange={(e) => setSettings(prev => ({ ...prev, placeholder: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Teks petunjuk untuk pengguna"
                    />
                </div>

                {/* Required Setting */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={settings.required}
                        onChange={(e) => setSettings(prev => ({ ...prev, required: e.target.checked }))}
                        className="mr-2"
                        id="required-field"
                    />
                    <label htmlFor="required-field" className="text-sm text-gray-700">
                        Wajib diisi
                    </label>
                </div>

                {/* Options for Select Field */}
                {field.type === 'select' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilihan Options
                        </label>
                        <div className="space-y-2">
                            {settings.options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        placeholder={`Pilihan ${index + 1}`}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <button
                                        onClick={() => removeOption(index)}
                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm"
                                        disabled={settings.options.length <= 1}
                                        type="button"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addOption}
                                className="w-full px-3 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 text-sm"
                                type="button"
                            >
                                + Tambah Pilihan
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t mt-4">
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Simpan Perubahan
                </button>
            </div>
        </div>
    );
};

export default FieldConfigPanel;