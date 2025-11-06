// src/components/FormBuilder/TemplateSelector.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Diperbaiki
import { Button } from '../ui/button'; // Diperbaiki

const TemplateSelector = ({ onSelect }) => {
    const categories = [
        { 
            id: 'umkm', 
            name: 'UMKM', 
            description: 'Form untuk usaha mikro, kecil, dan menengah',
            fields: ['Nama Usaha', 'Email', 'Telepon', 'Jenis Usaha', 'Pendapatan Bulanan']
        },
        { 
            id: 'mahasiswa', 
            name: 'Mahasiswa', 
            description: 'Form untuk peserta mahasiswa',
            fields: ['Institusi', 'Jurusan', 'Tahun Masuk', 'Minat Karir']
        },
        { 
            id: 'profesional', 
            name: 'Profesional', 
            description: 'Form untuk peserta profesional',
            fields: ['Tempat Kerja', 'Posisi', 'Lama Bekerja', 'Sektor Industri']
        },
        { 
            id: 'komunitas', 
            name: 'Komunitas', 
            description: 'Form untuk komunitas',
            fields: ['Nama Komunitas', 'Area Fokus', 'Jumlah Anggota', 'Area Operasional']
        }
    ];

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Pilih Kategori Form</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                    <Card 
                        key={category.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                    >
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {category.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Field Included:</p>
                                <div className="flex flex-wrap gap-1">
                                    {category.fields.map((field, index) => (
                                        <span 
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Button 
                                onClick={() => onSelect(category)}
                                className="w-full"
                            >
                                Pilih Template {category.name}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;