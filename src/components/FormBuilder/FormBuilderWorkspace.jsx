import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Plus, Eye, Save, Rocket, FolderOpen, X } from 'lucide-react';
import FormCanvas from './FormCanvas';
import FieldConfigPanel from './fields/FieldConfigPanel';
import FormTemplatesList from './FormTemplateList';
import formBuilderService from '../../services/formBuilderService';
import formTemplateService from '../../services/formTemplateService';
import { useToast } from '../../hooks/use-toast';

const FormBuilderWorkspace = () => {
    const [formConfig, setFormConfig] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [availablePrograms, setAvailablePrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [formTemplates, setFormTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const { toast } = useToast();

    // Load form templates
    // Load form templates
    useEffect(() => {
        const loadFormTemplates = async () => {
            try {
                console.log('🔄 Loading form templates...');
                const response = await formTemplateService.getAllFormTemplates();
                
                // ✅ PERBAIKAN: Validasi response
                if (response.success && Array.isArray(response.data)) {
                    setFormTemplates(response.data);
                    console.log('✅ Templates loaded:', response.data.length);
                } else {
                    console.warn('⚠️ No templates data:', response);
                    setFormTemplates([]);
                }
            } catch (error) {
                console.error('❌ Error loading form templates:', error);
                setFormTemplates([]);
                toast({
                    title: "Error",
                    description: "Gagal memuat template form",
                    variant: "destructive"
                });
            }
        };

        loadFormTemplates();
    }, [toast]);

    // Load available programs dan setup default config
    useEffect(() => {
        const loadAvailablePrograms = async () => {
            try {
                setLoadingPrograms(true);
                const response = await formBuilderService.getProgramNamesToImpala();
                const programs = response.data || [];
                setAvailablePrograms(programs);

                // Auto-select first program if available
                if (programs.length > 0 && (!formConfig?.programName || formConfig.programName === "")) {
                    const firstProgram = programs[0];
                    const firstProgramName = firstProgram.program_name || firstProgram;
                    
                    setFormConfig(prev => ({
                        ...prev,
                        programName: firstProgramName,
                        title: `Pendaftaran Program ${firstProgramName}`
                    }));
                }
            } catch (error) {
                console.error('Error loading programs:', error);
                setAvailablePrograms([]);
                toast({
                    title: "Error",
                    description: "Gagal memuat daftar program",
                    variant: "destructive"
                });
            } finally {
                setLoadingPrograms(false);
            }
        };

        // Initialize default config if no template selected
        if (!selectedTemplate && !formConfig) {
            setFormConfig({
                programName: "",
                title: "Pendaftaran Program",
                sections: {
                    programInfo: {
                        id: "programInfo",
                        name: "Informasi Program",
                        description: "Detail program pendaftaran",
                        locked: true,
                        fields: [
                            {
                                id: 'program_name',
                                type: 'program_dropdown',
                                name: 'program_name',
                                label: 'Nama Program',
                                required: true,
                                placeholder: 'Pilih nama program',
                                options: [],
                                loading: false,
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
                                label: 'Alasan Bergabung Program',
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
                            }
                        ]
                    }
                }
            });
            
            loadAvailablePrograms();
        }
    }, [selectedTemplate, formConfig]);

    // Update form config when available programs change
    useEffect(() => {
        if (formConfig && availablePrograms.length > 0) {
            setFormConfig(prev => {
                const newConfig = { ...prev };
                
                if (newConfig.sections.programInfo) {
                    newConfig.sections.programInfo.fields = newConfig.sections.programInfo.fields.map(field => 
                        field.id === 'program_name' 
                            ? { 
                                ...field, 
                                options: availablePrograms.map(p => p.program_name), 
                                loading: loadingPrograms
                            }
                            : field
                    );
                }
                return newConfig;
            });
        }
    }, [availablePrograms, loadingPrograms]);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setFormConfig(template.form_config);
        setShowTemplates(false);
        toast({
            title: "Template Dimuat",
            description: `Template "${template.program_name}" berhasil dimuat`
        });
    };

    const handleCreateTemplate = async () => {
        if (!formConfig || !formConfig.programName) {
            toast({
                title: "Error",
                description: "Silakan pilih program dan simpan form terlebih dahulu",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsSaving(true);
            console.log('🔄 Creating template with config:', formConfig);
            
            const response = await formTemplateService.createFormTemplate({
                program_name: formConfig.programName,
                form_config: formConfig
            });

            // ✅ PERBAIKAN: Validasi response
            if (!response.success) {
                throw new Error(response.message || 'Gagal membuat template');
            }

            const newTemplate = response.data;
            console.log('✅ Template created:', newTemplate);
            
            // ✅ PERBAIKAN: Pastikan newTemplate ada sebelum update state
            if (newTemplate) {
                setFormTemplates(prev => [newTemplate, ...prev]);
                setSelectedTemplate(newTemplate);
                
                toast({
                    title: "Template Berhasil Dibuat",
                    description: `Template "${formConfig.programName}" berhasil dibuat`
                });
            } else {
                throw new Error('Template data tidak valid');
            }
        } catch (error) {
            console.error('❌ Error creating template:', error);
            toast({
                title: "Error",
                description: error.message || "Gagal membuat form template",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublishTemplate = async () => {
        // ✅ PERBAIKAN: Tambahkan validasi yang lebih ketat
        if (!selectedTemplate || !selectedTemplate.id) {
            toast({
                title: "Error",
                description: "Silakan buat atau pilih template terlebih dahulu",
                variant: "destructive"
            });
            return;
        }

        try {
            console.log('🔄 Publishing template:', selectedTemplate);
            
            const response = await formTemplateService.publishFormTemplate(selectedTemplate.id);
            
            // ✅ PERBAIKAN: Validasi response
            if (!response.success) {
                throw new Error(response.message || 'Gagal mempublish template');
            }

            const updatedTemplate = response.data;
            console.log('✅ Template published:', updatedTemplate);
            
            // ✅ PERBAIKAN: Update state dengan validasi
            setFormTemplates(prev => 
                prev.map(template => 
                    template && template.id === updatedTemplate.id ? updatedTemplate : template
                )
            );
            setSelectedTemplate(updatedTemplate);

            const formLink = `http://localhost:5173/register/${updatedTemplate.unique_slug}`;
            toast({
                title: "Form Berhasil Dipublish!",
                description: (
                    <div>
                        <p>Form "{updatedTemplate.program_name}" sekarang tersedia untuk publik</p>
                        <p className="text-sm mt-1">
                            <strong>Link:</strong> {formLink}
                        </p>
                    </div>
                )
            });
        } catch (error) {
            console.error('❌ Error publishing template:', error);
            toast({
                title: "Error",
                description: error.message || "Gagal mempublish form",
                variant: "destructive"
            });
        }
    };

    const handleProgramSelect = (selectedProgramName) => {
        const selectedProgram = availablePrograms.find(program => 
            program.program_name === selectedProgramName
        );

        if (selectedProgram) {
            const programName = selectedProgram.program_name;
            setFormConfig(prev => ({
                ...prev,
                programName: programName,
                title: `Pendaftaran Program ${programName}`
            }));

            updateField('programInfo', 'program_name', { value: programName });
        }
    };

    const handleProgramSearch = async (query) => {
        try {
            setLoadingPrograms(true);
            const response = await formBuilderService.getProgramNamesToImpala(query);
            setAvailablePrograms(response.data || []);
        } catch (error) {
            console.error('Error searching programs:', error);
            toast({
                title: "Error",
                description: "Gagal mencari program",
                variant: "destructive"
            });
        } finally {
            setLoadingPrograms(false);
        }
    };

    const updateField = (sectionId, fieldId, updates) => {
        if (!formConfig) return;

        setIsSaving(true);
        
        setFormConfig(prev => {
            const newConfig = { ...prev };
            
            if (newConfig.sections[sectionId]) {
                newConfig.sections[sectionId].fields = newConfig.sections[sectionId].fields.map(field => 
                    field.id === fieldId ? { ...field, ...updates } : field
                );
            }
            
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
            toast({
                title: "Form Disimpan",
                description: "Form berhasil disimpan sebagai draft"
            });
        }, 1000);
    };

    const handleResetForm = () => {
        if (confirm('Apakah Anda yakin ingin mereset form ke default? Semua perubahan akan hilang.')) {
            localStorage.removeItem('impalaFormConfig');
            localStorage.removeItem('impalaPublishedForm');
            setSelectedTemplate(null);
            setFormConfig(null);
            window.location.reload();
        }
    };

    const handlePreviewForm = () => {
        if (!formConfig) {
            toast({
                title: "Error",
                description: "Belum ada form yang disimpan",
                variant: "destructive"
            });
            return;
        }

        localStorage.setItem('impalaPublishedForm', JSON.stringify(formConfig));
        window.open('/register', '_blank');
    };

    if (!formConfig) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600">Memuat form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-6 p-6">
            {/* Header Section */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Form Builder</CardTitle>
                            <CardDescription>
                                Buat dan kelola formulir pendaftaran program
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowTemplates(!showTemplates)}
                                className="flex items-center gap-2"
                            >
                                <FolderOpen className="h-4 w-4" />
                                {showTemplates ? 'Tutup Template' : 'Template'}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleResetForm}
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Templates List */}
                    {showTemplates && (
                        <FormTemplatesList
                            templates={formTemplates}
                            selectedTemplate={selectedTemplate}
                            onTemplateSelect={handleTemplateSelect}
                            onClose={() => setShowTemplates(false)}
                        />
                    )}

                    {/* Preview Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center">
                        <h1 className="text-2xl font-bold mb-2">
                            {formConfig.programName 
                                ? `Formulir Pendaftaran ${formConfig.programName}`
                                : 'Formulir Pendaftaran Program'
                            }
                        </h1>
                        <div className="flex justify-center items-center gap-4">
                            {selectedTemplate?.unique_slug && (
                                <Badge variant="secondary" className="text-sm">
                                    Link: /register/{selectedTemplate.unique_slug}
                                </Badge>
                            )}
                            {selectedTemplate?.is_published && (
                                <Badge variant="default" className="bg-green-500">
                                    Published
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Canvas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Form Canvas
                        {loadingPrograms && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                    </CardTitle>
                    <CardDescription>
                        Drag and drop fields untuk membangun formulir
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormCanvas
                        formConfig={formConfig}
                        selectedField={selectedField}
                        onFieldSelect={setSelectedField}
                        onFieldUpdate={updateField}
                        onProgramNameUpdate={handleProgramSelect}
                        onProgramSearch={handleProgramSearch}
                        availablePrograms={availablePrograms}
                        loadingPrograms={loadingPrograms}
                    />
                </CardContent>
            </Card>

            {/* Action Buttons & Status */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                💡 Pilih nama program dari daftar yang tersedia
                            </p>
                            {formConfig.programName && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    ✓ Program: {formConfig.programName}
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                            <Button
                                onClick={handlePreviewForm}
                                disabled={!formConfig}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Preview
                            </Button>
                            
                            <Button
                                onClick={handleSaveForm}
                                disabled={isSaving}
                                className="flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Simpan Draft
                            </Button>
                            
                            <Button
                                onClick={handleCreateTemplate}
                                disabled={!formConfig?.programName}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Template
                            </Button>
                            
                            <Button
                                onClick={handlePublishTemplate}
                                disabled={!selectedTemplate || selectedTemplate.is_published}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                            >
                                <Rocket className="h-4 w-4" />
                                Publish
                            </Button>
                        </div>
                    </div>

                    {/* Status Info */}
                    <Alert className="mt-4">
                        <AlertDescription>
                            <strong>Status Form:</strong>{' '}
                            {selectedTemplate && selectedTemplate.id ? (
                                selectedTemplate.is_published ? (
                                    <span className="text-green-600">
                                        ✅ Published - Link: /register/{selectedTemplate.unique_slug}
                                    </span>
                                ) : (
                                    <span className="text-yellow-600">📝 Draft (belum dipublish)</span>
                                )
                            ) : (
                                <span className="text-gray-600">📝 Belum ada template yang dipilih</span>
                            )}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Field Configuration Panel */}
            {selectedField && (
                <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-50">
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