import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { CheckCircle, Home, UserCheck, Mail, Phone, MessageCircle } from 'lucide-react';

const PublicFormSuccess = ({ template, submittedData, getAfterSubmitMessage }) => {
    const navigate = useNavigate();
    
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
                        <div className="mb-4">
                            <CheckCircle className="h-20 w-20 mx-auto text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Pendaftaran Berhasil! 🎉</h1>
                        <p className="text-green-100 text-lg">
                            {getAfterSubmitMessage()}
                        </p>
                    </div>

                    <div className="p-8">
                        {submittedData && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                    Ringkasan Pendaftaran
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nama Lengkap:</span>
                                            <span className="font-semibold">{submittedData.full_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-semibold">{submittedData.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Kategori:</span>
                                            <span className="font-semibold">{submittedData.category}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tanggal Pendaftaran:</span>
                                            <span className="font-semibold">{submittedData.submittedAt}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Program:</span>
                                            <span className="font-semibold">{submittedData.programName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-semibold text-green-600">Terkonfirmasi</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasWhatsappGroup() && (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Gabung Grup WhatsApp
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Kembali ke Beranda
                                </Button>
                            </div>
                        )}

                        <div className="text-center mt-8 pt-6 border-t border-gray-200">
                            <p className="text-gray-600 mb-2">Butuh bantuan?</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    support@impala.network
                                </span>
                                <span className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    +62 811-1011-512
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicFormSuccess;