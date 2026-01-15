import React from 'react';
import { Button } from '../ui/button';
import { Home } from 'lucide-react';

const PublicFormError = ({ loadError, hasTimeout, slug }) => {

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {hasTimeout ? 'Waktu Habis' : 'Formulir Tidak Ditemukan'}
                    </h1>
                    <p className="text-gray-600 mb-4">
                        {loadError || `Formulir dengan slug "${slug}" tidak tersedia.`}
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-700">
                            Slug: <strong>{slug}</strong>
                        </p>
                        <p className="text-sm text-red-600 mt-2">
                            {hasTimeout 
                                ? 'Server membutuhkan waktu terlalu lama untuk merespons.' 
                                : 'Pastikan formulir sudah dipublish dan URL benar.'
                            }
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    <Button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Coba Lagi
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PublicFormError;