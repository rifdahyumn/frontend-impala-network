// src/components/FormBuilder/FormBuilderWorkspace.jsx
import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import FieldSidebar from './FieldSidebar';
import FormCanvas from './FormCanvas';
import FieldConfigPanel from './FieldConfigPanel';
import FormPreview from './FormPreview';
import TemplateSelector from './TemplateSelector';
import { Button } from '../ui/button'; // Diperbaiki dari ../../ ke ../

const FormBuilderWorkspace = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    const handleTemplateSelect = (category) => {
        setSelectedCategory(category);
        const templateFields = getTemplateFields(category.id);
        setFields(templateFields);
    };

    const getTemplateFields = (categoryId) => {
        const templates = {
            umkm: [
                { 
                    id: 'businessName', 
                    type: 'text', 
                    name: 'businessName', 
                    label: 'Nama Usaha', 
                    required: true,
                    placeholder: 'Masukkan nama usaha'
                }
            ],
            mahasiswa: [
                { 
                    id: 'institution', 
                    type: 'text', 
                    name: 'institution', 
                    label: 'Institusi', 
                    required: true 
                }
            ],
            profesional: [
                { 
                    id: 'workplace', 
                    type: 'text', 
                    name: 'workplace', 
                    label: 'Tempat Kerja', 
                    required: true 
                }
            ],
            komunitas: [
                { 
                    id: 'name_community', 
                    type: 'text', 
                    name: 'name_community', 
                    label: 'Nama Komunitas', 
                    required: true 
                }
            ]
        };
        return templates[categoryId] || [];
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        if (over && over.data.current?.accepts) {
            const fieldType = active.data.current?.type;
            const newField = {
                id: `field-${Date.now()}`,
                type: fieldType,
                name: `field_${fields.length + 1}`,
                label: `Field ${fields.length + 1}`,
                required: false
            };
            setFields([...fields, newField]);
        }
    };

    const handleFieldUpdate = (updatedField) => {
        setFields(fields.map(field => 
            field.id === updatedField.id ? updatedField : field
        ));
        setSelectedField(updatedField);
    };

    const handleSave = () => {
        const formConfig = {
            category: selectedCategory?.id,
            fields: fields,
            createdAt: new Date().toISOString()
        };
        console.log('Form saved:', formConfig);
        alert('Form berhasil disimpan!');
    };

    if (!selectedCategory) {
        return <TemplateSelector onSelect={handleTemplateSelect} />;
    }

    if (previewMode) {
        return (
            <FormPreview
                fields={fields}
                onBack={() => setPreviewMode(false)}
                category={selectedCategory}
            />
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                    Building Form untuk: {selectedCategory.name}
                </h3>
                <Button 
                    onClick={() => setSelectedCategory(null)}
                    variant="outline"
                >
                    Ganti Template
                </Button>
            </div>

            <div className="flex gap-4 h-[600px]">
                <DndContext onDragEnd={handleDragEnd}>
                    <FieldSidebar />
                    <FormCanvas
                        fields={fields}
                        onFieldSelect={setSelectedField}
                        selectedField={selectedField}
                        onFieldsUpdate={setFields}
                    />
                </DndContext>

                <FieldConfigPanel
                    field={selectedField}
                    onFieldUpdate={handleFieldUpdate}
                />
            </div>

            <div className="flex gap-2 mt-4 justify-end">
                <Button onClick={() => setPreviewMode(true)} variant="outline">
                    Preview Form
                </Button>
                <Button onClick={handleSave}>
                    Simpan Form
                </Button>
            </div>
        </div>
    );
};

export default FormBuilderWorkspace;