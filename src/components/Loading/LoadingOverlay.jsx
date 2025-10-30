import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ message = 'Loading...', showSpinner = true, blurBackground = true, zIndex = 50 }) => {
    return (
        <div 
            className={`absolute inset-0 flex items-center justify-center rounded-lg ${
                blurBackground ? 'backdrop-blur-sm bg-white/70' : 'bg-white/90'
            }`}
            style={{ zIndex }}
        >
            <div className="flex flex-col items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg border border-gray-200">
                {showSpinner && <LoadingSpinner size="lg" />}
                <span className="text-sm font-medium text-gray-700">
                    {message}
                </span>
            </div>
        </div>
    )
}

export default LoadingOverlay;