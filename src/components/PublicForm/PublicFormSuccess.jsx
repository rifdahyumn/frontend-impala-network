import React from 'react';
import { Button } from '../ui/button';
import { CheckCircle, Home, UserCheck, Mail, Phone, MessageCircle, Calendar, Tag, FileText, ArrowLeft, Share2, Download, Award } from 'lucide-react';

const PublicFormSuccess = ({ template, submittedData, getAfterSubmitMessage }) => {
    
    const getWhatsappGroupLink = () => {
        if (template?.whatsapp_group_link) return template.whatsapp_group_link;
        if (template?.program?.whatsapp_group_link) return template.program.whatsapp_group_link;
        return null;
    };

    const hasWhatsappGroup = () => {
        const link = getWhatsappGroupLink();
        return link && link.trim() !== '' && link.startsWith('https://');
    };

    const handleShare = () => {
        const waGroupLink = getWhatsappGroupLink();
        if (!waGroupLink) return;
        window.open(waGroupLink, '_blank');
    };

    

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 shadow-lg">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Pendaftaran Berhasil! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {getAfterSubmitMessage()}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <Award className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Selamat! {submittedData?.full_name?.split(' ')[0]}
                                    </h2>
                                    <p className="text-emerald-100">
                                        Pendaftaran Anda telah tercatat dalam sistem
                                    </p>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    
                    <div className="p-8">
                        {submittedData && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    Ringkasan Pendaftaran
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <UserCheck className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
                                                <p className="font-semibold text-gray-900">
                                                    {submittedData.full_name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <Mail className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Email</p>
                                                <p className="font-semibold text-gray-900 break-all">
                                                    {submittedData.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <Tag className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Kategori Peserta</p>
                                                <p className="font-semibold text-gray-900">
                                                    {submittedData.category}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <Calendar className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Tanggal Pendaftaran</p>
                                                <p className="font-semibold text-gray-900">
                                                    {submittedData.submittedAt}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <Award className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Program</p>
                                                <p className="font-semibold text-gray-900">
                                                    {submittedData.programName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-3 bg-green-50 rounded-xl border border-green-200">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                                <p className="font-semibold text-green-600">
                                                    ✓ Terkonfirmasi
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            {hasWhatsappGroup() && (
                                <Button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Gabung Grup WhatsApp
                                </Button>
                            )}
                            
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-8">
                    © 2026 Impala Network. All rights reserved.
                </p>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default PublicFormSuccess;