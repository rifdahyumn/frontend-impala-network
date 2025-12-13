// components/FormBuilder/FormBuilderWorkspace.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Plus, Rocket } from 'lucide-react';
import FormCanvas from './FormCanvas';
import FormTemplatesList from './FormTemplateList';
// import FormLinksTab from './FormLinkTabs';
import formBuilderService from '../../services/formBuilderService';
import formTemplateService from '../../services/formTemplateService';
import { useToast } from '../../hooks/use-toast';
import { getDefaultFormConfig } from '../../utils/formConfig';
import FormSubmissionsList from './FormSubmissionList';

const FormBuilderWorkspace = () => {
    const [formConfig, setFormConfig] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [availablePrograms, setAvailablePrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [formTemplates, setFormTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [activeTab, setActiveTab] = useState('builder');
    const { toast } = useToast();
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        if (formConfig) {
            if (selectedTemplate) {
                document.title = `Edit "${formConfig.title || selectedTemplate.program_name}" - Form Builder | Impala Network`;
            } else if (formConfig.programName) {
                document.title = `Buat Form "${formConfig.programName}" - Form Builder | Impala Network`;
            } else {
                document.title = 'Form Builder - Impala Network';
            }
        } else {
            document.title = 'Form Builder - Impala Network';
        }
    }, [formConfig, selectedTemplate]);

    useEffect(() => {
        const loadFormTemplates = async () => {
            try {
                const response = await formTemplateService.getAllFormTemplates();
                setFormTemplates(response.data || []);
            } catch (error) {
                console.error('Error loading form templates:', error);
                toast({
                    title: "Error",
                    description: "Gagal memuat template form",
                    variant: "destructive"
                });
            }
        };

        loadFormTemplates();
    }, [toast]);

    useEffect(() => {
        const loadAvailablePrograms = async () => {
            try {
                setLoadingPrograms(true);
                const response = await formBuilderService.getProgramNamesToImpala();
                const programs = response.data || [];
                setAvailablePrograms(programs);

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

        if (!selectedTemplate && !formConfig) {
            setFormConfig(getDefaultFormConfig());
            loadAvailablePrograms();
        }
    }, [selectedTemplate, formConfig]);

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setFormConfig(template.form_config);

        document.title = `Edit "${template.program_name}" - Form Builder | Impala Network`;
        
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
            const response = await formTemplateService.createFormTemplate({
                program_name: formConfig.programName,
                form_config: formConfig
            });

            if (!response.success) {
                throw new Error(response.message || 'Gagal membuat template');
            }

            const newTemplate = response.data;
            if (newTemplate) {
                setFormTemplates(prev => [newTemplate, ...prev]);
                setSelectedTemplate(newTemplate);
                
                document.title = `Edit "${formConfig.programName}" - Form Builder | Impala Network`;
                
                toast({
                    title: "Template Berhasil Dibuat",
                    description: `Template "${formConfig.programName}" berhasil dibuat`
                });
            } else {
                throw new Error('Template data tidak valid');
            }
        } catch (error) {
            console.error('Error creating template:', error);
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
        if (!selectedTemplate || !selectedTemplate.id) {
            toast({
                title: "Error",
                description: "Silakan buat atau pilih template terlebih dahulu",
                variant: "destructive"
            });
            return;
        }

        try {
            const response = await formTemplateService.publishFormTemplate(selectedTemplate.id);
            
            if (!response.success) {
                throw new Error(response.message || 'Gagal mempublish template');
            }

            const updatedTemplate = response.data;
            setFormTemplates(prev => 
                prev.map(template => 
                    template && template.id === updatedTemplate.id ? updatedTemplate : template
                )
            );
            setSelectedTemplate(updatedTemplate);

            const formLink = `http://localhost:5173/register/${updatedTemplate.unique_slug}`;
            navigator.clipboard.writeText(formLink);
            
            document.title = `Form "${updatedTemplate.program_name}" (Published) - Form Builder | Impala Network`;
            
            toast({
                title: "Form Berhasil Dipublish!",
                description: (
                    <div>
                        <p>Form "<strong>{updatedTemplate.program_name}</strong>" sekarang live!</p>
                        <p className="text-sm mt-2">
                            <strong>Link Public:</strong>
                            <br />
                            <a 
                                href={formLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 underline break-all'
                            >
                                {formLink}
                            </a>
                        </p>
                        <p className='text-xs text-green-600 mt-1'>
                            Link sudah disalin ke clipboard
                        </p>
                    </div>
                ),
                duration: 5000
            });

        } catch (error) {
            console.error('Error publishing template:', error);
            toast({
                title: "Error",
                description: error.message || "Gagal mempublish form",
                variant: "destructive"
            });
        }
    };

    const handleProgramSelect = (selectedProgramName) => {
        if (!formConfig) return;

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
            
            document.title = `Buat Form "${programName}" - Form Builder | Impala Network`;
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

    const handleDeleteTemplate = async (templateId) => {
        try {
            const response = await formTemplateService.deleteFormTemplate(templateId);

            if (!response.success) {
                throw new Error(response.message || 'Gagal menghapus form');
            }

            setFormTemplates(prev => prev.filter(template => template.id !== templateId));

            if (selectedTemplate && selectedTemplate.id === templateId) {
                setSelectedTemplate(null);
                setFormConfig(null);
                document.title = 'Form Builder - Impala Network';
            }

            toast({
                title: "Form berhasil dihapus",
                description: "Form telah dihapus dari database",
                variant: "default"
            });
        } catch (error) {
            console.error('Error deleting form:', error);
            toast({
                title: "Error",
                description: error.message || 'Gagal menghapus form',
                variant: "destructive"
            });
            throw error;
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
            <Card>
                <CardContent className='p-6'>
                    <div className='border-b border-gray-200'>
                        <nav className='-mb-px flex space-x-8'>
                            <button
                                onClick={() => {
                                    setActiveTab('builder');
                                    if (activeTab !== 'builder') {
                                        if (selectedTemplate) {
                                            document.title = `Edit "${selectedTemplate.program_name}" - Form Builder | Impala Network`;
                                        } else if (formConfig.programName) {
                                            document.title = `Buat Form "${formConfig.programName}" - Form Builder | Impala Network`;
                                        }
                                    }
                                }}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'builder'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Form Builder
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('links');
                                    document.title = `Manage Form Links (${formTemplates.filter(t => t.is_published).length}) - Impala Network`;
                                }}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'links'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Manage Links ({formTemplates.filter(t => t.is_published).length})
                            </button>
                            <button
                                onClick={() => setActiveTab('submission')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'submission'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}

                            >
                                Submissions ({selectedTemplate?.submissionCount || 0})
                            </button>
                        </nav>
                    </div>
                </CardContent>
            </Card>

            {activeTab === 'links' && (
                <Card>
                    <CardHeader>
                        <div className='flex justify-between items-center'>
                            <div>
                                <CardTitle>Form Builder</CardTitle>
                                <CardDescription>
                                    Buat dan Kelola Formulir Pendaftaran Program
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <FormTemplatesList 
                            templates={formTemplates}
                            selectedTemplate={selectedTemplate}
                            onTemplateSelect={handleTemplateSelect}
                            onDeleteTemplate={handleDeleteTemplate}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === 'builder' && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Form Canvas
                                {loadingPrograms && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                            </CardTitle>
                            {/* Tampilkan nama form di header */}
                            {formConfig.title && (
                                <CardDescription className="text-lg font-medium text-blue-700">
                                    {formConfig.title}
                                </CardDescription>
                            )}
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
                                showOnlyProgramInfo={true}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='pt-6'>
                            <div className='flex justify-between items-center'>
                                <div className='space-y-2'>
                                    <p className='text-sm text-gray-600'>
                                        Pilih nama program dari daftar yang tersedia
                                    </p>
                                    {formConfig.programName && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            ✓ Program: {formConfig.programName}
                                        </Badge>
                                    )}
                                </div>

                                <div className='flex gap-2'>
                                    <Button
                                        onClick={handleCreateTemplate}
                                        disabled={!formConfig?.programName}
                                        variant="secondary"
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Buat Form
                                    </Button>
                                    <Button
                                        onClick={handlePublishTemplate}
                                        disabled={!selectedTemplate || selectedTemplate.is_published}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Rocket className="h-4 w-4" />
                                        Publish Form
                                    </Button>
                                </div>
                            </div>

                            <Alert className="mt-4">
                                <AlertDescription>
                                    <strong>Status Form:</strong>{' '}
                                    {selectedTemplate && selectedTemplate.id ? (
                                        selectedTemplate.is_published ? (
                                            <span className="text-green-600">
                                                Published - Link: /register/{selectedTemplate.unique_slug}
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
                </>
            )}
        </div>
    );
};

export default FormBuilderWorkspace;