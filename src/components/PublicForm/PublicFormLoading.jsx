import React from 'react';
import { Button } from '../ui/button';

const PublicFormLoading = ({ hasTimeout }) => {
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
            <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>Memuat Formulir...</p>
                
                <p className='text-xs text-gray-400 mt-1'>
                    {hasTimeout ? 'Mengulang...' : 'Silakan tunggu sebentar'}
                </p>
                {hasTimeout && (
                    <Button 
                        onClick={() => window.location.reload()}
                        variant="ghost"
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                        Klik di sini jika loading terlalu lama
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PublicFormLoading;