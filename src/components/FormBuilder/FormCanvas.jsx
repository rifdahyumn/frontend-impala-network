import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Users, MessageSquare, Link, Rocket } from 'lucide-react';
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

    const safeFormConfig = formConfig || {};

    useEffect(() => {
        if (safeFormConfig.settings) {
            setWhatsappLink(safeFormConfig.settings.whatsappGroupLink || "");
            setAfterSubmitMessage(safeFormConfig.settings.afterSubmitMessage || 
                "Terima kasih telah mendaftar! ");
        } else {
            setWhatsappLink("");
            setAfterSubmitMessage("Terima kasih telah mendaftar! ");
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
                afterSubmitMessage: afterSubmitMessage
            })
        }
    };

    const handleAfterSubmitMessageChange = (e) => {
        const value = e.target.value;
        setAfterSubmitMessage(value);
        
        if (onSettingsUpdate) {
            onSettingsUpdate({
                whatsappGroupLink: whatsappLink,
                afterSubmitMessage: value
            })
        }
    };

    const getProgramName = (program) => {
        if (!program) return "";
        if (typeof program === 'string') return program;
        if (program.program_name) return program.program_name;
        if (program.name) return program.name;
        return String(program);
    };

    const getProgramId = (program) => {
        if (!program) return "";
        if (typeof program === 'string') return program;
        if (program.id) return program.id;
        if (program.program_id) return program.program_id;
        return program;
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
        const hasSelectedProgram = safeFormConfig.programName && safeFormConfig.programName !== "";
        const selectedProgram = availablePrograms.find(
            p => getProgramName(p) === safeFormConfig.programName
        );

        return (
            <div 
                className={`field-item p-4 border-2 ${
                    hasSelectedProgram 
                        ? 'border-gray-200 bg-white' 
                        : 'border-blue-200 bg-blue-50'
                } rounded-lg mb-4`}
            >
                <div className="field-header mb-3">
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                        Nama Program
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Pilih program dari daftar yang tersedia
                    </p>
                </div>
                
                <div className="relative">
                    <select
                        value={safeFormConfig.programName || ''}
                        onChange={handleProgramNameChange}
                        disabled={loadingPrograms || availablePrograms.length === 0}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white font-medium appearance-none"
                    >
                        <option value="">{loadingPrograms ? 'Memuat program...' : 'Pilih Program'}</option>
                        {availablePrograms.map((program, index) => {
                            const programName = getProgramName(program);
                            const programId = getProgramId(program);
                            
                            return (
                                <option 
                                    key={programId || index} 
                                    value={programName}
                                    title={programName}
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
                
                {loadingPrograms ? (
                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <p className="text-xs">Memuat daftar program...</p>
                    </div>
                ) : availablePrograms.length === 0 ? (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <p className="text-xs">
                            Tidak ada program yang ditemukan.
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 mt-2">
                        Ditemukan {availablePrograms.length} program
                    </p>
                )}
                
                {hasSelectedProgram && selectedProgram && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-green-800">
                                    Program Terpilih
                                </p>
                                <p className="text-sm text-green-700">
                                    {safeFormConfig.programName}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderWhatsAppSettings = () => {
        return (
            <div className="space-y-4 mt-6">
                {/* WhatsApp Group Link */}
                <div className="field-item p-4 border-2 border-gray-200 bg-white rounded-lg">
                    <div className="field-header mb-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-5 h-5 text-black" />
                            <label className="block text-sm font-bold text-black">
                                WhatsApp Group Link
                                <span className="text-red-500 ml-1">(Opsional)</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 ml-7">
                            Link grup WhatsApp untuk peserta yang telah berhasil mendaftar
                        </p>
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center">
                            <Link className="absolute left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="url"
                                placeholder="https://chat.whatsapp.com/..."
                                value={whatsappLink}
                                onChange={handleWhatsAppLinkChange}
                                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono text-sm"
                            />
                        </div>
                        
                        {whatsappLink && !whatsappLink.startsWith('https://') && (
                            <p className="text-xs text-red-600 mt-2">
                                Link harus dimulai dengan https://
                            </p>
                        )}
                        
                        {whatsappLink && whatsappLink.includes('chat.whatsapp.com') && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                    <Users className="w-4 h-4" />
                                    Test WhatsApp Group Link
                                </a>
                                <p className="text-xs text-green-600 self-center">
                                    Klik untuk membuka link di tab baru
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* After Submit Message */}
                <div className="field-item p-4 border-2 border-gray-200 bg-white rounded-lg">
                    <div className="field-header mb-3">
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-5 h-5 text-black" />
                            <label className="block text-sm font-bold text-black">
                                Custom Message After Submit
                            </label>
                        </div>
                        <p className="text-xs text-black ml-7">
                            Pesan yang akan ditampilkan setelah peserta berhasil submit form
                        </p>
                    </div>
                    
                    <textarea
                        placeholder="Contoh: Terima kasih telah mendaftar! Silakan bergabung ke grup WhatsApp untuk informasi lebih lanjut."
                        value={afterSubmitMessage}
                        onChange={handleAfterSubmitMessageChange}
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none"
                    />
                </div>

                <div className='mt-8 pt-6 border-t border-gray-200'>
                    <div className='flex flex-row justify-between items-center gap-4'>
                        <div className='space-y-2'>
                            <Button
                                onClick={handlePublicClick}
                                disabled={!canPublish() || isSaving}
                                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 w-auto"
                                size="lg"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className='w-4 h-4' />
                                        {selectedTemplate && selectedTemplate.is_published ? 'Update & Republish' : 'Publish'}
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
            <div className="form-canvas p-8">
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">Memuat konfigurasi form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-canvas">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Konfigurasi Form Pendaftaran
                </h3>
                <p className="text-sm text-gray-600">
                    Pilih program dan atur pengaturan WhatsApp untuk form pendaftaran
                </p>
            </div>
            
            <div className="canvas-content">
                <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600 text-xs">1</span>
                        </div>
                        Pilih Program
                    </h4>
                    {renderProgramField()}
                </div>

                {safeFormConfig.programName && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                <span className="text-amber-600 text-xs">2</span>
                            </div>
                            Pengaturan WhatsApp and Message
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Konfigurasi grup WhatsApp dan pesan setelah submit untuk program{" "}
                            <span className="font-semibold text-amber-700">{safeFormConfig.programName}</span>
                        </p>
                        {renderWhatsAppSettings()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormCanvas;