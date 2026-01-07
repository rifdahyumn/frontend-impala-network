import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import FormCanvas from './FormCanvas';
import FormTemplatesList from './FormTemplateList';
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

    const handleSettingsUpdate = (newSettings) => {
        if (!formConfig) return

        setFormConfig(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                ...newSettings
            }
        }))
    }

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setFormConfig(template.form_config);

        document.title = `Edit "${template.program_name}" - Form Builder | Impala Network`;
        
        toast({
            title: "Template Dimuat",
            description: `Template "${template.program_name}" berhasil dimuat`
        });
    };

    const handleDirectPublish = async () => {
        if (!formConfig || !formConfig.programName) {
            toast({
                title: "Error",
                description: "Please select a program first",
                variant: "destructive"
            });
            return;
        }

        const whatsappLink = formConfig.settings?.whatsappGroupLink;
        if (whatsappLink && whatsappLink.trim() !== "") {
            if (!whatsappLink.startsWith('https://')) {
                toast({
                    title: "Error",
                    description: "Please enter the WhatsApp Group link",
                    variant: "destructive"
                });

                return
            }
        }

        try {
            setIsSaving(true);

            const templateData = {
                program_name: formConfig.programName,
                whatsapp_group_link: whatsappLink || "",
                after_submit_message: formConfig.settings?.afterSubmitMessage || "Terima kasih sudah mendaftar program ini",
                form_config: {
                    ...formConfig,
                    personalInfo: formConfig.personalInfo || getDefaultFormConfig().personalInfo,
                    categories: formConfig.categories || getDefaultFormConfig().categories,
                    title: formConfig.title || `Pendaftaran Program ${formConfig.programName}`,
                    programName: formConfig.programName,
                    settings: {
                        whatsappGroupLink: whatsappLink || "",
                        afterSubmitMessage: formConfig.settings?.afterSubmitMessage || 
                            "Terima kasih sudah mendaftar program ini"
                    }
                }
            };

            let templateToPublish;

            if (selectedTemplate && selectedTemplate.id) {
                const updateResponse = await formTemplateService.updateFormTemplate(selectedTemplate.id, templateData);
                
                if (!updateResponse.success) {
                    throw new Error(updateResponse.message || 'Failed to update form');
                }
                templateToPublish = updateResponse.data;
                
            } else {
                const createResponse = await formTemplateService.createFormTemplate(templateData);
                
                if (!createResponse.success) {
                    throw new Error(createResponse.message || 'Failed to create form');
                }
                templateToPublish = createResponse.data;
            }

            const publishResponse = await formTemplateService.publishFormTemplate(templateToPublish.id);

            if (!publishResponse.success) {
                throw new Error(publishResponse.message || "Failed to publish form");
            }

            const publishedTemplate = publishResponse.data;

            const enhancedTemplate = {
                ...publishedTemplate,
                form_config: {
                    ...publishedTemplate.form_config,
                    settings: {
                        whatsappGroupLink: publishedTemplate.whatsapp_group_link || 
                                        publishedTemplate.form_config?.settings?.whatsappGroupLink || "",
                        afterSubmitMessage: publishedTemplate.after_submit_message || 
                                        publishedTemplate.form_config?.settings?.afterSubmitMessage || 
                                        "Terima Kasih telah mendaftar"
                    }
                }
            };

            setFormTemplates(prev => [enhancedTemplate, ...prev]);
            setSelectedTemplate(enhancedTemplate);

            const publicUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
            const formLink = `${publicUrl}/register/${publishedTemplate.unique_slug}`;

            await navigator.clipboard.writeText(formLink);
            
            document.title = `Form "${publishedTemplate.program_name}" (Published) - Form Builder | Impala Network`;
            
            toast({
                title: "Form Berhasil Dipublish!",
                description: (
                    <div>
                        <p>Form "<strong>{publishedTemplate.program_name}</strong>" sekarang live!</p>
                        <p className="text-sm mt-2">
                            <strong>Link Public:</strong>
                            <br />
                            <a 
                                href={formLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 underline break-all text-xs'
                            >
                                {formLink}
                            </a>
                        </p>
                        <p className='text-xs text-green-600 mt-1'>
                            Link sudah disalin ke clipboard
                        </p>
                    </div>
                ),
                duration: 8000
            });

        } catch (error) {
            console.error('Error publishing template:', error);
            
            let errorMessage = error.message || "Error to publish form";
            
            if (error.message.includes("500")) {
                errorMessage = "Server error. Please check backend logs.";
            } else if (error.message.includes("400")) {
                errorMessage = "Invalid data format. Please check your inputs.";
            }
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
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
                                Submissions
                            </button>
                        </nav>
                    </div>
                </CardContent>
            </Card>

            {activeTab === 'links' && (
                <FormTemplatesList 
                    templates={formTemplates}
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={handleTemplateSelect}
                    onDeleteTemplate={handleDeleteTemplate}
                />
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
                        </CardHeader>
                        <CardContent>
                            <FormCanvas
                                formConfig={formConfig}
                                selectedField={selectedField}
                                onFieldSelect={setSelectedField}
                                onFieldUpdate={updateField}
                                onProgramNameUpdate={handleProgramSelect}
                                onSettingsUpdate={handleSettingsUpdate}
                                onProgramSearch={handleProgramSearch}
                                onDirectPublish={handleDirectPublish}
                                isSaving={isSaving}
                                selectedTemplate={selectedTemplate}
                                availablePrograms={availablePrograms}
                                loadingPrograms={loadingPrograms}
                                showOnlyProgramInfo={true}
                            />
                        </CardContent>
                    </Card>
                </>
            )}

            {activeTab === 'submission' && (
                <FormSubmissionsList />
            )}
        </div>
    );
};

export default FormBuilderWorkspace;