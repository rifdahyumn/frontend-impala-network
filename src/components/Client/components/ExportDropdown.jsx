import React from 'react';
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

const ExportDropdown = ({
    onExport,
    members,
    loading,
    isExporting,
    isInShowAllMode
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 whitespace-nowrap"
                    disabled={loading || members.length === 0 || isExporting}
                    onClick={() => onExport('excel')}
                >
                    {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Export {isInShowAllMode ? 'All' : ''}
                </Button>
            </DropdownMenuTrigger>
            
        </DropdownMenu>
    );
};

export default ExportDropdown;