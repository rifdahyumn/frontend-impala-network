// src/components/FormBuilder/TemplateSelector.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const TemplateSelector = ({ onSelect }) => {
    const categories = [
        { 
            id: 'umkm', 
            name: 'UMKM', 
            description: 'Form untuk usaha mikro, kecil, dan menengah',
            personalFields: ['Nama Lengkap', 'Email', 'Telepon', 'Gender', 'Tanggal Lahir'],
            categoryFields: ['Nama Usaha', 'Jenis Usaha', 'Tahun Berdiri', 'Pendapatan Bulanan', 'Jumlah Karyawan'],
            color: 'blue'
        },
        { 
            id: 'mahasiswa', 
            name: 'Mahasiswa', 
            description: 'Form untuk peserta mahasiswa',
            personalFields: ['Nama Lengkap', 'Email', 'Telepon', 'Gender', 'Tanggal Lahir'],
            categoryFields: ['Institusi Pendidikan', 'Jurusan', 'Tahun Masuk', 'Semester', 'Minat Karir'],
            color: 'green'
        },
        { 
            id: 'profesional', 
            name: 'Profesional', 
            description: 'Form untuk peserta profesional',
            personalFields: ['Nama Lengkap', 'Email', 'Telepon', 'Gender', 'Tanggal Lahir'],
            categoryFields: ['Tempat Kerja', 'Posisi', 'Lama Bekerja', 'Sektor Industri', 'Spesialisasi'],
            color: 'purple'
        },
        { 
            id: 'komunitas', 
            name: 'Komunitas', 
            description: 'Form untuk komunitas',
            personalFields: ['Nama Lengkap', 'Email', 'Telepon', 'Gender', 'Tanggal Lahir'],
            categoryFields: ['Nama Komunitas', 'Area Fokus', 'Jumlah Anggota', 'Area Operasional', 'Tahun Berdiri'],
            color: 'orange'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
        green: 'bg-green-100 text-green-800 border-green-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Form Builder - Impala Management</h3>
                <p className="text-gray-600">
                    Pilih kategori form. Semua form sudah termasuk <strong>Personal Information</strong> (Nama, Email, Telepon, Gender, Tanggal Lahir)
                </p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2">📋 Template Tetap - Personal Information</h4>
                <div className="flex flex-wrap gap-2">
                    {['Full Name', 'Email', 'Phone', 'Gender', 'Date of Birth'].map((field, index) => (
                        <span 
                            key={index}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full border"
                        >
                            {field}
                        </span>
                    ))}
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Pilih Kategori Tambahan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                    <Card 
                        key={category.id} 
                        className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${colorClasses[category.color]}`}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {category.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-3">{category.description}</p>
                            
                            <div className="mb-3">
                                <p className="text-xs font-semibold mb-1">Field Kategori:</p>
                                <div className="flex flex-wrap gap-1">
                                    {category.categoryFields.map((field, index) => (
                                        <span 
                                            key={index}
                                            className="px-2 py-1 bg-white text-xs rounded border"
                                        >
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 mb-3">
                                <strong>Total Fields:</strong> {5 + category.categoryFields.length} fields 
                                (5 Personal + {category.categoryFields.length} {category.name})
                            </div>

                            <Button 
                                onClick={() => onSelect(category)}
                                className="w-full"
                                variant="default"
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