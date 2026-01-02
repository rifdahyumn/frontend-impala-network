import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { AlertCircle, FileSpreadsheet, FileText, Upload, Loader2 } from "lucide-react";

const ImportModal = ({
    isOpen,
    onClose,
    importFile,
    validationErrors,
    isDragging,
    isImporting,
    fileInputRef,
    dropZoneRef,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onFileUpload,
    onTriggerFileInput,
    onRemoveFile,
    onImport
    
}) => {
    // Dalam ImportModal, sebelum return:
console.log('ImportModal Props:', {
    isOpen,
    importFile: importFile?.name,
    validationErrors,
    isImporting,
    onImport: typeof onImport // Harus 'function'
});
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                        Import Clients from Excel
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Upload an Excel file (.xlsx or .xls) to import multiple clients at once.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
                    <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                    <li>Download the template first for correct format</li>
                    <li>Fill in the data according to the columns</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Only Excel files (.xlsx, .xls) are supported</li>
                    <li>Data must be in the first sheet</li>
                    <li>First row must contain column headers</li>
                    </ul>
                </div>
                
                <div 
                    ref={dropZoneRef}
                    className={`
                        border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors max-w-full overflow-hidden
                        ${isDragging 
                            ? 'border-blue-400 bg-blue-50' 
                            : importFile 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-blue-400'
                        }
                    `}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {importFile ? (
                        <div className="space-y-3">
                            <FileText className="h-12 w-12 text-green-500 mx-auto" />
                            <p className="font-medium text-gray-700 text-lg truncate max-w-full px-2">{importFile.name}</p>
                            <p className="text-sm text-gray-500">
                                {(importFile.size / 1024).toFixed(2)} KB
                            </p>
                            <div className="flex justify-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRemoveFile}
                                className="text-red-600 hover:text-red-700"
                            >
                                Remove File
                            </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                            <p className="text-base text-gray-600 mb-3 px-2">
                                <strong>
                                    {isDragging 
                                    ? "Drop your Excel file here" 
                                    : "Drag & drop your Excel file here, or click to browse"
                                    }
                                </strong>
                            </p>
                            {isDragging && (
                                <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                                    <p className="text-sm text-blue-700 font-medium">
                                    Release to upload file
                                    </p>
                                </div>
                            )}
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={onFileUpload}
                                className="hidden"
                                id="excel-upload"
                            />
                            <Button
                                variant={isDragging ? "default" : "outline"}
                                onClick={onTriggerFileInput}
                                className={`mt-2 px-6 py-2 ${isDragging ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                            >
                                {isDragging ? 'Or Click to Browse' : 'Select File'}
                            </Button>
                        </>
                    )}
                </div>

                {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Terdapat {validationErrors.length} error:
                        </h4>
                        <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                            {validationErrors.slice(0, 10).map((error, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>{error}</span>
                                </li>
                            ))}
                            {validationErrors.length > 10 && (
                                <li className="text-red-500 text-xs italic">
                                    ... dan {validationErrors.length - 10} error lainnya
                                </li>
                            )}
                        </ul>
                    </div>
                )}
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={onImport}
                        disabled={!importFile || isImporting}
                        className="flex items-center gap-2 px-6 py-2 w-full justify-center"
                    >
                        {isImporting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Importing...
                        </>
                        ) : (
                        <>
                            <Upload className="h-4 w-4" />
                            Import File
                        </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImportModal;