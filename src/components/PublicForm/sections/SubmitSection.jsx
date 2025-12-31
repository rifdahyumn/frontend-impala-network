import React from 'react';
import { Button } from '../../ui/button';

const SubmitSection = ({ isSubmitting, getSubmitButtonStatus }) => {
    const buttonStatus = getSubmitButtonStatus();
    
    return (
        <div className="flex justify-end pt-6 border-t border-gray-200">
            <div className="relative">
                <Button 
                    type="submit" 
                    disabled={isSubmitting || buttonStatus.disabled}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Menyimpan Data...
                        </>
                    ) : (
                        '📨 Kirim Pendaftaran'
                    )}
                </Button>
                
                {buttonStatus.disabled && !isSubmitting && (
                    <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                        {buttonStatus.tooltip}
                        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmitSection;