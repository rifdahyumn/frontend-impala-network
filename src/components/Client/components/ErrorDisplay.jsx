import React from 'react';
import { Button } from "../../ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorDisplay = ({ error, onRetry }) => {
    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800">Failed to load clients</h3>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRetry}
                    className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            </div>
        </div>
    );
};

export default ErrorDisplay;