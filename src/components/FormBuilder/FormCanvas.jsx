// src/components/FormBuilder/FormCanvas.jsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent } from '../ui/card';
import FormField from './fields/FormField';

const FormCanvas = ({ fields, onFieldSelect, selectedField, onFieldsUpdate }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: 'form-canvas',
        data: { accepts: ['text', 'email', 'number', 'phone', 'select', 'textarea', 'date'] }
    });

    const handleFieldClick = (field) => {
        onFieldSelect(field);
    };

    const handleFieldChange = (fieldId, updates) => {
        const updatedFields = fields.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        );
        onFieldsUpdate(updatedFields);
    };

    // Pisahkan fields menjadi personal info dan category fields
    const personalInfoFields = fields.slice(0, 5); // 5 field pertama adalah personal info
    const categoryFields = fields.slice(5); // Sisanya adalah category fields

    return (
        <Card className="flex-1">
            <CardContent className="p-6 h-full">
                <div
                    ref={setNodeRef}
                    className={`h-full border-2 border-dashed rounded-lg p-4 transition-colors ${
                        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                >
                    <h3 className="text-lg font-semibold mb-4">Form Canvas</h3>
                    
                    {fields.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Pilih kategori form untuk mulai membangun
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Personal Information Section */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b">
                                    📋 Personal Information
                                </h4>
                                <div className="space-y-4">
                                    {personalInfoFields.map((field) => (
                                        <div
                                            key={field.id}
                                            onClick={() => handleFieldClick(field)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedField?.id === field.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <FormField
                                                field={field}
                                                onChange={(updates) => handleFieldChange(field.id, updates)}
                                                isEditing={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Fields Section */}
                            {categoryFields.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b">
                                        🏷️ Additional Information
                                    </h4>
                                    <div className="space-y-4">
                                        {categoryFields.map((field) => (
                                            <div
                                                key={field.id}
                                                onClick={() => handleFieldClick(field)}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedField?.id === field.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            >
                                                <FormField
                                                    field={field}
                                                    onChange={(updates) => handleFieldChange(field.id, updates)}
                                                    isEditing={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default FormCanvas;