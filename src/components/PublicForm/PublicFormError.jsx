import React from 'react';
import { AlertCircle, XCircle, RefreshCw, Home, ExternalLink } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const PublicFormError = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-cyan-100 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20"
            >
                <motion.div 
                    animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        repeatDelay: 3,
                        duration: 2 
                    }}
                    className="relative mb-6"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="relative">
                            <XCircle className="w-12 h-12 text-rose-500" />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"
                            >
                                <AlertCircle className="w-3 h-3 text-white" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Oops! Form Nggak Ketemu
                    </h1>
                    <p className="text-gray-600 text-lg mb-4">
                        Kayaknya form yang kamu cari udah nggak ada atau dipindahin nih!
                    </p>
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-left">
                        <p className="text-sm text-rose-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                                <strong>Kemungkinan karena:</strong> Form udah expired, link salah, atau udah dihapus sama admin.
                            </span>
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic">
                        "Udah nyari-nyari kesana kemari, tapi formnya masih ngumpet juga ya? 😅"
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Punya masalah? DM admin aja langsung!
                    </p>
                </div>

                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-30 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-30 blur-xl"></div>
            </motion.div>
        </div>
    );
};

export default PublicFormError;