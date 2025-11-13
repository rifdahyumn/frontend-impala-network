// src/components/FormBuilder/FormBuilderWorkspace.jsx
import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import FieldSidebar from './FieldSidebar';
import FormCanvas from './FormCanvas';
import FieldConfigPanel from './FieldConfigPanel';
import FormPreview from './FormPreview';
import TemplateSelector from './TemplateSelector';
import PublicFormPreview from './PublicFormPreview'; // Tambahkan ini
import { Button } from '../ui/button';

const FormBuilderWorkspace = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [publicPreviewMode, setPublicPreviewMode] = useState(false); // Mode baru untuk preview public

    // Template tetap untuk Personal Information
    const personalInfoFields = [
        { 
            id: 'full_name', 
            type: 'text', 
            name: 'full_name', 
            label: 'Nama Lengkap', 
            required: true,
            placeholder: 'Masukkan nama lengkap'
        },
        {
            id: 'nik',
            type: 'text',
            name: 'nik',
            label: 'NIK',
            required: true,
            placeholder: 'Enter NIK'
        },
        { 
            id: 'email', 
            type: 'email', 
            name: 'email', 
            label: 'Email', 
            required: true,
            placeholder: 'email@example.com'
        },
        { 
            id: 'phone', 
            type: 'phone', 
            name: 'phone', 
            label: 'Nomor Telepon', 
            required: true,
            placeholder: '+62 812 3456 7890'
        },
        { 
            id: 'gender', 
            type: 'select', 
            name: 'gender', 
            label: 'Jenis Kelamin', 
            required: true,
            options: ['Laki-laki', 'Perempuan']
        },
        { 
            id: 'dateOfBirth', 
            type: 'date', 
            name: 'dateOfBirth', 
            label: 'Tanggal Lahir', 
            required: true
        }
    ];

    const handleTemplateSelect = (category) => {
        setSelectedCategory(category);
        // Gabungkan personal info dengan template kategori
        const categoryFields = getTemplateFields(category.id);
        setFields([...personalInfoFields, ...categoryFields]);
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
                },
                { 
                    id: 'businessType', 
                    type: 'select', 
                    name: 'businessType', 
                    label: 'Jenis Usaha', 
                    options: ['Retail', 'Manufacturing', 'Service', 'Food & Beverage', 'Technology'] 
                },
                { 
                    id: 'establishedYear', 
                    type: 'number', 
                    name: 'establishedYear', 
                    label: 'Tahun Berdiri',
                    min: 1900,
                    max: new Date().getFullYear()
                },
                { 
                    id: 'monthlyRevenue', 
                    type: 'number', 
                    name: 'monthlyRevenue', 
                    label: 'Pendapatan Bulanan (Rp)' 
                },
                { 
                    id: 'totalEmployees', 
                    type: 'number', 
                    name: 'totalEmployees', 
                    label: 'Jumlah Karyawan' 
                }
            ],
            mahasiswa: [
                { 
                    id: 'institution', 
                    type: 'text', 
                    name: 'institution', 
                    label: 'Institusi Pendidikan', 
                    required: true 
                },
                { 
                    id: 'major', 
                    type: 'text', 
                    name: 'major', 
                    label: 'Jurusan', 
                    required: true 
                },
                { 
                    id: 'enrollmentYear', 
                    type: 'number', 
                    name: 'enrollmentYear', 
                    label: 'Tahun Masuk' 
                },
                { 
                    id: 'semester', 
                    type: 'number', 
                    name: 'semester', 
                    label: 'Semester' 
                },
                { 
                    id: 'careerInterest', 
                    type: 'text', 
                    name: 'careerInterest', 
                    label: 'Minat Karir' 
                }
            ],
            profesional: [
                { 
                    id: 'workplace', 
                    type: 'text', 
                    name: 'workplace', 
                    label: 'Tempat Kerja', 
                    required: true 
                },
                { 
                    id: 'position', 
                    type: 'text', 
                    name: 'position', 
                    label: 'Posisi', 
                    required: true 
                },
                { 
                    id: 'workDuration', 
                    type: 'text', 
                    name: 'workDuration', 
                    label: 'Lama Bekerja' 
                },
                { 
                    id: 'industrySector', 
                    type: 'text', 
                    name: 'industrySector', 
                    label: 'Sektor Industri' 
                },
                { 
                    id: 'specialization', 
                    type: 'text', 
                    name: 'specialization', 
                    label: 'Spesialisasi' 
                }
            ],
            komunitas: [
                { 
                    id: 'communityName', 
                    type: 'text', 
                    name: 'communityName', 
                    label: 'Nama Komunitas', 
                    required: true 
                },
                { 
                    id: 'focusArea', 
                    type: 'text', 
                    name: 'focusArea', 
                    label: 'Area Fokus' 
                },
                { 
                    id: 'totalMembers', 
                    type: 'number', 
                    name: 'totalMembers', 
                    label: 'Jumlah Anggota' 
                },
                { 
                    id: 'operationalArea', 
                    type: 'select', 
                    name: 'operationalArea', 
                    label: 'Area Operasional', 
                    options: ['Lokal', 'Nasional', 'Internasional'] 
                },
                { 
                    id: 'communitySince', 
                    type: 'number', 
                    name: 'communitySince', 
                    label: 'Tahun Berdiri Komunitas' 
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

    if (publicPreviewMode) {
        return (
            <PublicFormPreview
                fields={fields}
                category={selectedCategory}
                onBack={() => setPublicPreviewMode(false)}
            />
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">
                        Building Form untuk: {selectedCategory.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                        Personal Information + {selectedCategory.name} Fields
                    </p>
                </div>
                <Button 
                    onClick={() => {
                        setSelectedCategory(null);
                        setFields([]);
                    }}
                    variant="outline"
                >
                    Ganti Kategori
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

            // Di bagian button, update teks tombol:
<div className="flex gap-2 mt-4 justify-end">
    <Button onClick={() => setPreviewMode(true)} variant="outline">
        Preview Form (Admin)
    </Button>
    <Button onClick={() => setPublicPreviewMode(true)} variant="default">
        Preview Form (User Eksternal) - Dengan Pilihan Kategori
    </Button>
    <Button onClick={handleSave}>
        Simpan Form
    </Button>
</div>
        </div>
    );
};

export default FormBuilderWorkspace;