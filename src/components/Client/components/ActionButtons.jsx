import React from 'react';
import { Button } from "../../ui/button";
import { Plus, Upload, Download, Loader2 } from "lucide-react";
import ExportDropdown from './ExportDropdown';
import ImportDropdown from './ImportDropdown';

const ActionButtons = ({
    onAddClient,
    onImport,
    onExport,
    onDownloadTemplate,
    members,
    loading,
    isExporting,
    isInShowAllMode,
    tableConfig
}) => {
    return (
        <div className='flex flex-wrap justify-end gap-2'>
            <Button 
                onClick={onAddClient} 
                className='flex items-center gap-2 whitespace-nowrap'
            >
                <Plus className="h-4 w-4" />
                {tableConfig.addButton}
            </Button>
            
            <ImportDropdown
                onImport={onImport}
                onDownloadTemplate={onDownloadTemplate}
                loading={loading}
            />
            
            <ExportDropdown
                onExport={onExport}
                members={members}
                loading={loading}
                isExporting={isExporting}
                isInShowAllMode={isInShowAllMode}
            />
        </div>
    );
};

export default ActionButtons;