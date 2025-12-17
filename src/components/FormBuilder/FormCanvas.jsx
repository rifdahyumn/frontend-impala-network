import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Users, MessageSquare, Link } from 'lucide-react';

const FormCanvas = ({ 
    formConfig, 
    selectedField,
    onProgramNameUpdate,
    onSettingsUpdate,
    onProgramSearch,
    availablePrograms = [],
    loadingPrograms = false
}) => {
    // State lokal untuk input
    const [whatsappLink, setWhatsappLink] = useState("");
    const [afterSubmitMessage, setAfterSubmitMessage] = useState("");

    // Sync dengan formConfig saat berubah
    useEffect(() => {
        if (formConfig.settings) {
            setWhatsappLink(formConfig.settings.whatsappGroupLink || "");
            setAfterSubmitMessage(formConfig.settings.afterSubmitMessage || 
                "Terima kasih telah mendaftar! ");
        }
    }, [formConfig.settings]);

    const handleProgramNameChange = (e) => {
        if (onProgramNameUpdate) {
            onProgramNameUpdate(e.target.value);
        }
    };

    const handleWhatsAppLinkChange = (e) => {
        const value = e.target.value;
        setWhatsappLink(value);
        
        // Update parent component
        if (onSettingsUpdate) {
            const newSettings = {
                ...formConfig.settings,
                whatsappGroupLink: value,
                afterSubmitMessage: afterSubmitMessage
            };
            onSettingsUpdate(newSettings);
        }
    };

    const handleAfterSubmitMessageChange = (e) => {
        const value = e.target.value;
        setAfterSubmitMessage(value);
        
        // Update parent component
        if (onSettingsUpdate) {
            const newSettings = {
                ...formConfig.settings,
                whatsappGroupLink: whatsappLink,
                afterSubmitMessage: value
            };
            onSettingsUpdate(newSettings);
        }
    };

    const getProgramName = (program) => {
        if (typeof program === 'string') return program;
        if (program && program.program_name) return program.program_name;
        if (program && program.name) return program.name;
        return String(program);
    };

    const getProgramId = (program) => {
        if (typeof program === 'string') return program;
        if (program && program.id) return program.id;
        if (program && program.program_id) return program.program_id;
        return program;
    };

    const renderProgramField = () => {
        const field = {
            id: 'program_name',
            label: 'Nama Program',
            required: true
        };
        
        const isRequired = field.required === true;
        const hasSelectedProgram = formConfig.programName && formConfig.programName !== "";
        const selectedProgram = availablePrograms.find(
            p => getProgramName(p) === formConfig.programName
        );

        return (
            <div 
                key={field.id}
                className={`field-item p-4 border-2 ${
                    hasSelectedProgram 
                        ? 'border-gray-200 bg-white' 
                        : 'border-blue-200 bg-blue-50'
                } rounded-lg mb-4 ${
                    selectedField?.id === field.id 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : ''
                }`}
            >
                <div className="field-header mb-3">
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                        {field.label}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Pilih program dari daftar yang tersedia
                    </p>
                </div>
                
                <div className="relative">
                    <select
                        value={formConfig.programName || ''}
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
                                    {formConfig.programName}
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
                                <span className="text-red-500 ml-1">*</span>
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
            </div>
        );
    };

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

                {formConfig.programName && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                <span className="text-amber-600 text-xs">2</span>
                            </div>
                            Pengaturan WhatsApp and Message
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Konfigurasi grup WhatsApp dan pesan setelah submit untuk program{" "}
                            <span className="font-semibold text-amber-700">{formConfig.programName}</span>
                        </p>
                        {renderWhatsAppSettings()}
                    </div>
                )}

                {formConfig.programName && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Status Konfigurasi:
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {formConfig.programName ? (
                                    <>
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            Program: <span className="font-medium">{formConfig.programName}</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">!</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            Program belum dipilih
                                        </p>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {whatsappLink ? (
                                    <>
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            WhatsApp Group: <span className="font-medium">Terkonfigurasi</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">!</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            WhatsApp Group: <span className="text-red-600 font-medium">Belum dikonfigurasi</span>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormCanvas;