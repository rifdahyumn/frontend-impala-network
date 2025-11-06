// src/components/FormBuilder/FormCanvas.jsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent } from '../ui/card'; // Diperbaiki
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
                            Drag fields here to build your form
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((field) => (
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
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default FormCanvas;