import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '', showText = true }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
            {showText && (
                <span className={`text-gray-600 ${textSizes[size]}`}>
                    {text}
                </span>
            )}
        </div>
    )
}

export default LoadingSpinner;