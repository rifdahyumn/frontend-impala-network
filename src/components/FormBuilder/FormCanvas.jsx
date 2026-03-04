import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Users, MessageSquare, Link, Rocket, Building, CheckCircle, ExternalLink, Shield, FileText, Globe, Target, Hash } from 'lucide-react';
import { Button } from '../ui/button';

const FormCanvas = ({ 
    formConfig = {},
    onProgramNameUpdate,
    onSettingsUpdate,
    onDirectPublish,
    isSaving = false,
    selectedTemplate = null,
    availablePrograms = [],
    loadingPrograms = false
}) => {
    const [whatsappLink, setWhatsappLink] = useState("");
    const [afterSubmitMessage, setAfterSubmitMessage] = useState("");
    const [slug, setSlug] = useState("")

    const safeFormConfig = formConfig || {};

    useEffect(() => {
        if (safeFormConfig.settings) {
            setWhatsappLink(safeFormConfig.settings.whatsappGroupLink || "");
            setAfterSubmitMessage(safeFormConfig.settings.afterSubmitMessage || 
                "Terima kasih telah mendaftar program kami. Tim kami akan menghubungi Anda dalam waktu 1x24 jam untuk proses selanjutnya.");
                setSlug(safeFormConfig.settings.slug || "")
        } else {
            setWhatsappLink("");
            setAfterSubmitMessage("Terima kasih telah mendaftar program kami.");
            setSlug("")
        }
    }, [safeFormConfig.settings]);

    const handleProgramNameChange = (e) => {
        if (onProgramNameUpdate) {
            onProgramNameUpdate(e.target.value);
        }
    };

    const handleWhatsAppLinkChange = (e) => {
        const value = e.target.value;
        setWhatsappLink(value);
        
        if (onSettingsUpdate) {
            onSettingsUpdate({
                whatsappGroupLink: value,
                afterSubmitMessage: afterSubmitMessage,
                slug: slug
            })
        }
    };

    const handleAfterSubmitMessageChange = (e) => {
        const value = e.target.value;
        setAfterSubmitMessage(value);
        
        if (onSettingsUpdate) {
            onSettingsUpdate({
                whatsappGroupLink: whatsappLink,
                afterSubmitMessage: value,
                slug: slug
            })
        }
    };

    const handleSlugChange = (e) => {
        const value = e.target.value
        setSlug(value)

        if (onSettingsUpdate) {
            onSettingsUpdate({
                whatsappGroupLink: whatsappLink,
                afterSubmitMessage: afterSubmitMessage,
                slug: value
            })
        }
    }

    const getProgramName = (program) => {
        if (!program) return "";
        if (typeof program === 'string') return program;
        if (program.program_name) return program.program_name;
        if (program.name) return program.name;
        return String(program);
    };

    const handlePublicClick = () => {
        if (onDirectPublish) {
            onDirectPublish()
        }
    }

    const canPublish = () => {
        const hasProgram = safeFormConfig.programName && safeFormConfig.programName.trim() !== "";
        const hasWhatsAppLink = whatsappLink && whatsappLink.trim() !== "";
        if (hasWhatsAppLink && !whatsappLink.startsWith('https://')){
            return false
        }

        return hasProgram && !isSaving
    }

    const renderProgramField = () => {
        const isRequired = true;

        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">1</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Select Company Program</h3>
                        <p className="text-sm text-gray-500">Select the program that will be used for the registration form</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Program Name
                            {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        <div className="relative">
                            <div className="flex items-center">
                                <Building className="absolute left-3 h-4 w-4 text-gray-400" />
                                <select
                                    value={safeFormConfig.programName || ''}
                                    onChange={handleProgramNameChange}
                                    disabled={loadingPrograms || availablePrograms.length === 0}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium appearance-none"
                                >
                                    <option value="">{loadingPrograms ? 'Loading Program...' : '-- Select Company Program --'}</option>
                                    {availablePrograms.map((program, index) => {
                                        const programName = getProgramName(program);
                                        
                                        let uniqueKey = index
                                        if (program && typeof program === 'object') {
                                            if (program.id) uniqueKey = `id-${program.id}`;
                                            else if (program.program_id) uniqueKey = `pid-${program.program_id}`;
                                            else if (program.name) uniqueKey = `name-${program.name}`;
                                            else if (program.program_name) uniqueKey = `pname-${program.program_name}`;
                                            else uniqueKey = `index-${index}`;
                                        } else if (typeof program === 'string') {
                                            uniqueKey = `str-${program}-${index}`
                                        }
                                        
                                        return (
                                            <option 
                                                key={uniqueKey} 
                                                value={programName}
                                                className="py-2"
                                            >
                                                {programName}
                                            </option>
                                        );
                                    })}
                                </select>
                                
                                {loadingPrograms && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                {loadingPrograms ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                        <span className="text-xs text-blue-600">Loading program list...</span>
                                    </>
                                ) : availablePrograms.length === 0 ? (
                                    <>
                                        <AlertCircle className="h-3 w-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            No Programs Found
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-3 w-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            {availablePrograms.length} Program Available
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderWhatsAppSettings = () => {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">2</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Form Configuration</h3>
                        <p className="text-sm text-gray-500">Set up communication channels and messages for participants</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <div className='flex items-center gap-2 mb-3'>
                            <Hash className='w-5 h-5 text-blue-600' />
                            <label className='block text-sm font-medium text-gray-700'>
                                Custom SLug / URL
                                <span className="text-gray-500 font-normal ml-2">(Opsional)</span>
                            </label>
                            
                        </div>

                        <div className='relative'>
                            <div className='flex items-center'>
                                <span className='absolute left-3 text-gray-400 text-sm'>/pendaftaran/</span>
                                <input 
                                    type="text"
                                    placeholder='Enter url here...'
                                    value={slug}
                                    onChange={handleSlugChange}
                                    className='w-full pl-[7.3rem] pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-sm'
                                />
                            </div>

                            {slug && (
                                <div className='mt-2 flex items-center gap-2 text-gray-600 text-sm'>
                                    <CheckCircle className='w-4 h-4' />
                                    <span>
                                        Preview: https://domain.com/pendaftaran/{slug}
                                    </span>
                                </div>
                            )}

                            <p className='text-xs text-gray-500 mt-2'>
                                The URL will be used as the unique URL for the registration form
                            </p>
                        </div>
                        <div className='h-px bg-gray-200 my-6'></div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-5 h-5 text-green-600" />
                            <label className="block text-sm font-medium text-gray-700">
                                WhatsApp Group Link
                                <span className="text-gray-500 font-normal ml-2">(Opsional)</span>
                            </label>
                        </div>
                        
                        <div className="relative">
                            <div className="flex items-center">
                                <Link className="absolute left-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="url"
                                    placeholder="https://chat.whatsapp.com/..."
                                    value={whatsappLink}
                                    onChange={handleWhatsAppLinkChange}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-mono text-sm"
                                />
                            </div>
                            
                            {whatsappLink && !whatsappLink.startsWith('https://') && (
                                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Link harus dimulai dengan https://
                                </div>
                            )}
                            
                            {whatsappLink && whatsappLink.includes('chat.whatsapp.com') && (
                                <div className="mt-2 flex items-center gap-3">
                                    <span className="text-xs text-green-600">
                                        Valid WhatsApp group link
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                            <label className="block text-sm font-medium text-gray-700">
                                Registration Confirmation Message
                            </label>
                        </div>
                        
                        <div className="relative">
                            <textarea
                                placeholder="Contoh: Terima kasih telah mendaftar program [Nama Program]. Tim kami akan menghubungi Anda dalam 1x24 jam untuk proses selanjutnya."
                                value={afterSubmitMessage}
                                onChange={handleAfterSubmitMessageChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {afterSubmitMessage.length}/500 karakter
                            </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                            This message will be displayed after the participant completes registration.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderPublishSection = () => {
        const isFormReady = canPublish();

        return (
            <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                                    <Rocket className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Publish Registration Form</h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedTemplate && selectedTemplate.is_published 
                                            ? "The form has been published. Update the changes and republish to distribute the latest version."
                                            : "Publish the form to make it publicly accessible via a unique link."
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            {safeFormConfig.programName && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <Building className="w-3 h-3 mr-1" />
                                        Program: {safeFormConfig.programName}
                                    </span>
                                    {selectedTemplate?.is_published && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Globe className="w-3 h-3 mr-1" />
                                            Status: Live
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <Button
                                onClick={handlePublicClick}
                                disabled={!isFormReady || isSaving}
                                size="lg"
                                className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl px-8 py-6 text-base font-medium"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="w-5 h-5" />
                                        <span>
                                            {selectedTemplate && selectedTemplate.is_published 
                                                ? 'Update & Republish' 
                                                : 'Publish Form'
                                            }
                                        </span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!formConfig) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-200 p-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Workspace</h3>
                <p className="text-gray-600">Setting up the form configuration...</p>
            </div>
        );
    }

    return (
        <div className="form-canvas space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Builder Workspace</h1>
                <p className="text-gray-600">
                    Configure the registration form for your company's program
                </p>
                {selectedTemplate && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <FileText className="w-3 h-3" />
                        Editing: {selectedTemplate.program_name}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              
                <div className="lg:col-span-2 space-y-6">
                    {renderProgramField()}
                    {safeFormConfig.programName && renderWhatsAppSettings()}
                </div>
            </div>

            {safeFormConfig.programName && renderPublishSection()}
        </div>
    );
};

export default FormCanvas;