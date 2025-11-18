// src/components/FormBuilder/fields/FieldSidebar.jsx
import React from 'react';

const FIELD_TYPES = [
    { type: 'text', label: 'Text Input', icon: '📝', description: 'Input teks singkat' },
    { type: 'email', label: 'Email Input', icon: '📧', description: 'Input alamat email' },
    { type: 'tel', label: 'Phone Number', icon: '📱', description: 'Input nomor telepon' },
    { type: 'number', label: 'Number Input', icon: '🔢', description: 'Input angka' },
    { type: 'date', label: 'Date Picker', icon: '📅', description: 'Pemilih tanggal' },
    { type: 'select', label: 'Dropdown Select', icon: '🔽', description: 'Pilihan dropdown' },
    { type: 'textarea', label: 'Text Area', icon: '📄', description: 'Input teks panjang' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️', description: 'Pilihan checkbox' }
];

const FieldSidebar = ({ onAddField }) => {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-3">Field Types</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Drag field ke canvas untuk menambah pertanyaan
                </p>
                
                <div className="space-y-2">
                    {FIELD_TYPES.map((fieldType) => (
                        <button
                            key={fieldType.type}
                            onClick={() => onAddField(fieldType.type)}
                            className="w-full flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                        >
                            <span className="text-xl mt-1">{fieldType.icon}</span>
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">{fieldType.label}</div>
                                <div className="text-sm text-gray-500">{fieldType.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-800 text-sm mb-1">Tips</h4>
                <p className="text-xs text-yellow-700">
                    Klik field type untuk langsung menambahkannya ke form
                </p>
            </div>
        </div>
    );
};

export default FieldSidebar;