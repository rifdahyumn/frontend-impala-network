import React, { useState, useEffect } from 'react';
import FormCanvas from './FormCanvas';
import FieldConfigPanel from './fields/FieldConfigPanel';
import { getProgramNames } from '../../utils/programData';

const FormBuilderWorkspace = () => {
    const [formConfig, setFormConfig] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [availablePrograms, setAvailablePrograms] = useState([]);

    // Load dari localStorage saat component mount
    useEffect(() => {
        const savedConfig = localStorage.getItem('impalaFormConfig');
        
        const loadAvailablePrograms = () => {
            try {
                // Gunakan utility function yang sudah dibuat
                const programNames = getProgramNames();
                if (programNames.length > 0) {
                    setAvailablePrograms(programNames);
                    console.log('📋 Loaded programs for dropdown:', programNames);
                } else {
                    // Fallback ke default programs
                    setAvailablePrograms(["Impala Management"]);
                    console.log('⚠️ No programs found, using default');
                }
            } catch (error) {
                console.error('❌ Error loading programs:', error);
                setAvailablePrograms(["Impala Management"]);
            }
        };

        if (savedConfig) {
            setFormConfig(JSON.parse(savedConfig));
        } else {
            // Default config dengan programName dan data lengkap
            setFormConfig({
                programName: "Impala Management",
                title: "Pendaftaran Program Impala Management",
                sections: {
                    programInfo: {
                        id: "programInfo",
                        name: "Informasi Program",
                        description: "Detail program pendaftaran",
                        locked: true,
                        fields: [
                            {
                                id: 'program_name',
                                type: 'select',
                                name: 'program_name',
                                label: 'Nama Program',
                                required: true,
                                placeholder: 'Pilih nama program',
                                options: [], // Akan diisi nanti
                                locked: true
                            }
                        ]
                    },
                    personalInfo: {
                        id: "personalInfo",
                        name: "Informasi Pribadi",
                        description: "Data diri peserta",
                        locked: true,
                        fields: [
                            {
                                id: 'full_name',
                                type: 'text',
                                name: 'full_name',
                                label: 'Nama Lengkap',
                                required: true,
                                placeholder: 'Masukkan nama lengkap sesuai KTP',
                                locked: true
                            },
                            { 
                                id: 'nik', 
                                type: 'number', 
                                name: 'nik', 
                                label: 'NIK (Nomor Induk Kependudukan)', 
                                required: true,
                                placeholder: 'Masukkan NIK 17 digit',
                                locked: true
                            },
                            {
                                id: 'email',
                                type: 'email',
                                name: 'email',
                                label: 'Email',
                                required: true,
                                placeholder: 'email@example.com',
                                locked: true
                            },
                            {
                                id: 'phone',
                                type: 'number',
                                name: 'phone',
                                label: 'Nomor WhatsApp',
                                required: true,
                                placeholder: '+62-xxx-xxxx-xxxx',
                                locked: true
                            },
                            {
                                id: 'gender',
                                type: 'select',
                                name: 'gender',
                                label: 'Jenis Kelamin',
                                required: true,
                                options: ['Laki-laki', 'Perempuan'],
                                locked: true
                            },
                            {
                                id: 'dateOfBirth',
                                type: 'date',
                                name: 'dateOfBirth',
                                label: 'Tanggal Lahir',
                                required: true,
                                locked: true
                            },
                            {
                                id: 'education',
                                type: 'select',
                                name: 'education',
                                label: 'Pendidikan Terakhir',
                                required: true,
                                options: [ 'Sekolah Menengah Atas (SMA/SMK/MA)', 'Diploma (D3)', 'Sarjana (S1)', 'Magister (S2)', 'Doctor (S3)'],
                                locked: true
                            },
                            {
                                id: 'address',
                                type: 'textarea',
                                name: 'address',
                                label: 'Alamat Lengkap',
                                required: true,
                                placeholder: 'Jl. Contoh No. 123, Kota, Provinsi',
                                locked: true
                            },
                            { 
                                id: 'district', 
                                type: 'text', 
                                name: 'district', 
                                label: 'Kecamatan', 
                                required: true,
                                locked: true
                            },
                            {
                                id: 'city',
                                type: 'text',
                                name: 'city',
                                label: 'Kota / Kabupaten',
                                required: true,
                                locked: true
                            },
                            {
                                id: 'province', 
                                type: 'text', 
                                name: 'province', 
                                label: 'Provinsi', 
                                required: true,
                                locked: true
                            },
                            {
                                id: 'postal_code',
                                type: 'text',
                                name: 'postal_code',
                                label: 'Kode Pos',
                                required: true,
                                locked: true
                            },
                            {
                                id: 'reason', 
                                type: 'textarea', 
                                name: 'reason_join_program', 
                                label: 'Reason Join Program',
                                rows: 3,
                                required: true,
                                placeholder: 'Ingin menambah wawasan',
                                locked: true
                            }
                        ]
                    }
                },
                categories: {
                    umkm: {
                        id: "umkm",
                        name: "UMKM",
                        description: "Usaha Mikro, Kecil, dan Menengah",
                        icon: "🏢",
                        locked: true,
                        fields: [
                            {
                                id: 'business_name',
                                type: 'text',
                                name: 'business_name',
                                label: 'Nama Bisnis / Usaha',
                                required: true,
                                placeholder: 'Masukkan nama bisnis / usaha',
                                locked: true
                            },
                            {
                                id: 'business_type',
                                type: 'select',
                                name: 'business_type',
                                label: 'Jenis Bisnis',
                                required: true,
                                options: ['Retail', 'Manufacturing', 'Service', 'Food & Beverage', 'Teknologi'],
                                locked: true
                            },
                            {
                                id: 'established_year',
                                type: 'number',
                                name: 'established_year',
                                label: 'Tahun Berdiri',
                                required: true,
                                placeholder: 'Masukkan tahun berdiri usaha',
                                locked: true
                            },
                            {
                                id: 'monthly_revenue',
                                type: 'select',
                                name: 'monthly_revenue',
                                label: 'Pendapatan Bulanan',
                                required: true,
                                options: ['< Rp 5 juta', 'Rp 5-10 juta', 'Rp 10-50 juta', '> Rp 50 juta'],
                                locked: true
                            },
                            {
                                id: 'employee_count',
                                type: 'number',
                                name: 'employee_count',
                                label: 'Jumlah Karyawan',
                                required: true,
                                placeholder: 'Masukkan jumlah karyawan',
                                locked: true
                            }
                        ]
                    },
                    mahasiswa: {
                        id: "mahasiswa",
                        name: "Mahasiswa",
                        description: "Pelajar/Mahasiswa Aktif", 
                        icon: "🎓",
                        locked: true,
                        fields: [
                            {
                                id: 'institution',
                                type: 'text',
                                name: 'institution',
                                label: 'Institusi Pendidikan',
                                required: true,
                                placeholder: 'Masukkan nama institusi',
                                locked: true
                            },
                            {
                                id: 'major',
                                type: 'text', 
                                name: 'major',
                                label: 'Jurusan',
                                required: true,
                                placeholder: 'Masukkan nama jurusan',
                                locked: true
                            },
                            {
                                id: 'enrollment_year',
                                type: 'number',
                                name: 'enrollment_year',
                                label: 'Tahun Masuk',
                                required: true,
                                placeholder: 'Masukkan tahun masuk',
                                locked: true
                            },
                            {
                                id: 'semester',
                                type: 'number',
                                name: 'semester',
                                label: 'Semester',
                                required: true,
                                placeholder: 'Masukkan semester saat ini',
                                locked: true
                            },
                            {
                                id: 'career_interest',
                                type: 'text',
                                name: 'career_interest',
                                label: 'Minat Karir',
                                required: true,
                                placeholder: 'Contoh: Data Analyst, Marketing',
                                locked: true
                            }
                        ]
                    },
                    profesional: {
                        id: "profesional",
                        name: "Profesional",
                        description: "Pekerja/Karyawan/Profesional",
                        icon: "💼",
                        locked: true,
                        fields: [
                            {
                                id: 'company',
                                type: 'text',
                                name: 'company',
                                label: 'Nama Perusahaan',
                                required: true,
                                placeholder: 'Masukkan nama perusahaan',
                                locked: true
                            },
                            {
                                id: 'position',
                                type: 'text',
                                name: 'position',
                                label: 'Posisi/Jabatan',
                                required: true,
                                placeholder: 'Masukkan posisi/jabatan',
                                locked: true
                            },
                            {
                                id: 'work_experience',
                                type: 'number',
                                name: 'work_experience',
                                label: 'Pengalaman Kerja (tahun)',
                                required: true,
                                placeholder: 'Masukkan lama pengalaman kerja',
                                locked: true
                            },
                            {
                                id: 'industry_sector',
                                type: 'text',
                                name: 'industry_sector',
                                label: 'Sektor Industri',
                                required: true,
                                placeholder: 'Contoh: Pendidikan, Keuangan & Perbankan',
                                locked: true
                            },
                            {
                                id: 'skills',
                                type: 'text',
                                name: 'skills',
                                label: 'Keahlian Utama',
                                required: true,
                                placeholder: 'Jelaskan keahlian utama Anda',
                                locked: true
                            }
                        ]
                    },
                    komunitas: {
                        id: "komunitas", 
                        name: "Komunitas",
                        description: "Organisasi/Komunitas",
                        icon: "👥",
                        locked: true,
                        fields: [
                            {
                                id: 'community_name',
                                type: 'text',
                                name: 'community_name',
                                label: 'Nama Komunitas',
                                required: true,
                                placeholder: 'Masukkan nama komunitas',
                                locked: true
                            },
                            {
                                id: 'community_role',
                                type: 'text',
                                name: 'community_role',
                                label: 'Peran dalam Komunitas',
                                required: true,
                                placeholder: 'Masukkan peran Anda',
                                locked: true
                            },
                            {
                                id: 'member_count',
                                type: 'number',
                                name: 'member_count',
                                label: 'Jumlah Anggota',
                                required: true,
                                placeholder: 'Masukkan jumlah anggota',
                                locked: true
                            },
                            {
                                id: 'focus_area',
                                type: 'text',
                                name: 'focus_area',
                                label: 'Area Fokus',
                                required: true,
                                placeholder: 'Contoh: Pendidikan, Lingkungan, Teknologi',
                                locked: true
                            },
                            {
                                id: 'operational_area',
                                type: 'select',
                                name: 'operational_area',
                                label: 'Area Operasional',
                                required: true,
                                options: ['Lokal', 'Nasional', 'Internasional'],
                                locked: true
                            },
                        ]
                    }
                }
            });
        }

        loadAvailablePrograms(); // PANGGIL FUNGSI DI SINI
    }, []);

    // Update formConfig ketika availablePrograms berubah
    useEffect(() => {
        if (formConfig && availablePrograms.length > 0) {
            // Update options untuk field program_name
            setFormConfig(prev => {
                const newConfig = { ...prev };
                if (newConfig.sections.programInfo) {
                    newConfig.sections.programInfo.fields = newConfig.sections.programInfo.fields.map(field => 
                        field.id === 'program_name' 
                            ? { ...field, options: availablePrograms }
                            : field
                    );
                }
                return newConfig;
            });
        }
    }, [availablePrograms, formConfig]);

    // Debug: Log struktur formConfig
    useEffect(() => {
        if (formConfig) {
            console.log('FormConfig loaded:', formConfig);
            console.log('Program Name:', formConfig.programName);
        }
    }, [formConfig]);

    // Auto-save ketika formConfig berubah
    useEffect(() => {
        if (formConfig) {
            localStorage.setItem('impalaFormConfig', JSON.stringify(formConfig));
        }
    }, [formConfig]);

    // Fungsi untuk update nama program
    const updateProgramName = (newProgramName) => {
        if (!formConfig) return;
        
        setFormConfig(prev => ({
            ...prev,
            programName: newProgramName
        }));
    };

    const updateField = (sectionId, fieldId, updates) => {
        if (!formConfig) return;

        setIsSaving(true);
        
        setFormConfig(prev => {
            const newConfig = { ...prev };
            
            // Cek apakah field ada di sections
            if (newConfig.sections[sectionId]) {
                newConfig.sections[sectionId].fields = newConfig.sections[sectionId].fields.map(field => 
                    field.id === fieldId ? { ...field, ...updates } : field
                );
            }
            
            // Cek apakah field ada di categories
            if (newConfig.categories[sectionId]) {
                newConfig.categories[sectionId].fields = newConfig.categories[sectionId].fields.map(field => 
                    field.id === fieldId ? { ...field, ...updates } : field
                );
            }
            
            return newConfig;
        });

        setTimeout(() => {
            setIsSaving(false);
        }, 500);
    };

    const handleSaveForm = () => {
        if (!formConfig) return;
        
        setIsSaving(true);
        localStorage.setItem('impalaFormConfig', JSON.stringify(formConfig));
        
        setTimeout(() => {
            setIsSaving(false);
            alert('Form berhasil disimpan!');
        }, 1000);
    };

    // Reset form untuk testing (opsional)
    const handleResetForm = () => {
        if (confirm('Apakah Anda yakin ingin mereset form ke default? Semua perubahan akan hilang.')) {
            localStorage.removeItem('impalaFormConfig');
            window.location.reload();
        }
    };

    if (!formConfig) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Memuat form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[600px]">
            {/* Header dengan preview mode dan judul dinamis */}
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleResetForm}
                            className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                        >
                            Reset Form
                        </button>
                    </div>
                </div>
                
                {/* Preview judul formulir yang dinamis */}
                <div className="preview-header-section">
                    <div className="preview-container bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg overflow-hidden">
                        <div className="preview-header p-6 text-center">
                            <h1 className="text-2xl font-bold">
                                {formConfig?.programName 
                                    ? `Formulir Pendaftaran ${formConfig.programName}`
                                    : 'Formulir Pendaftaran Program'
                                }
                            </h1>
                            <p className="text-lg opacity-90 mt-2">
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                <FormCanvas
                    formConfig={formConfig}
                    selectedField={selectedField}
                    onFieldSelect={setSelectedField}
                    onFieldUpdate={updateField}
                    onProgramNameUpdate={updateProgramName}
                    availablePrograms={availablePrograms}
                />
            </div>
            
            {/* Save Button */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    💡 Pilih nama program dari daftar yang tersedia
                </div>
                <button 
                    onClick={handleSaveForm}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                        isSaving 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                    } text-white transition-colors`}
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            💾 Simpan Perubahan
                        </>
                    )}
                </button>
            </div>

            {/* Field Configuration Panel */}
            {selectedField && (
                <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50">
                    <div className="p-4 h-full overflow-auto">
                        <FieldConfigPanel
                            field={selectedField}
                            onUpdate={(updates) => {
                                let sectionId = Object.keys(formConfig.sections).find(id =>
                                    formConfig.sections[id].fields.some(f => f.id === selectedField.id)
                                );
                                
                                if (!sectionId) {
                                    sectionId = Object.keys(formConfig.categories).find(id =>
                                        formConfig.categories[id].fields.some(f => f.id === selectedField.id)
                                    );
                                }
                                
                                if (sectionId) {
                                    updateField(sectionId, selectedField.id, updates);
                                }
                            }}
                            onClose={() => setSelectedField(null)}
                            isLocked={selectedField.locked}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormBuilderWorkspace;