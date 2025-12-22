import React from 'react';
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Upload, Download, FileSpreadsheet } from "lucide-react";

const ImportDropdown = ({
    onImport,
    onDownloadTemplate,
    loading
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                    disabled={loading}
                >
                    <Upload className="h-4 w-4" />
                    Import
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuItem 
                    onClick={onDownloadTemplate}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Download className="h-4 w-4" />
                    Download Template
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={onImport}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Upload File
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ImportDropdown;