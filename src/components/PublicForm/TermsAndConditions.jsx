import React from 'react';
import { CheckCircle } from 'lucide-react';

const TermsAndConditions = ({ termsAccepted, setTermsAccepted, programName }) => {
    return (
        <div className={`p-4 mb-6 rounded-lg border transition-all ${
            termsAccepted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
        }`}>
            <div className="flex items-start gap-3">
                <input 
                    type="checkbox" 
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                />
                <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                        <span className="font-medium">Syarat dan Ketentuan:</span>
                        <br />
                        Saya menyatakan bahwa data yang saya berikan adalah benar dan lengkap.
                        Saya bersedia untuk mengikuti semua prosedur dan ketentuan program {programName}.
                        Saya memahami bahwa data yang saya berikan akan digunakan untuk keperluan administrasi program.
                    </label>
                </div>
            </div>
            
            {/* Status terms */}
            <div className={`mt-3 ml-7 text-sm ${
                termsAccepted ? 'text-green-600' : 'text-yellow-600'
            }`}>
                {termsAccepted ? (
                    <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Syarat dan ketentuan telah disetujui
                    </span>
                ) : (
                    <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Anda harus menyetujui syarat dan ketentuan untuk melanjutkan
                    </span>
                )}
            </div>
        </div>
    );
};

export default TermsAndConditions;