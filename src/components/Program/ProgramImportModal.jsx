import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Upload, FileText, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ProgramImportModal = ({
    isImportModalOpen,
    setIsImportModalOpen,
    importFile,
    setImportFile,
    validationErrors,
    setValidationErrors,
    isImporting,
    importProgress,
    parseExcelFile,
    handleImportExcel,
    resetImport,
    fileInputRef,
    dropZoneRef
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const validateExcelFile = (file) => {
        const errors = [];
        
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            errors.push('File harus berformat Excel (.xlsx atau .xls)');
        }
        
        if (file.size > 10 * 1024 * 1024) {
            errors.push('File terlalu besar. Maksimal 10MB');
        }
        
        return errors;
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setValidationErrors([]);
        
        const errors = validateExcelFile(file);
        if (errors.length > 0) {
            setValidationErrors(errors);
            toast.error('File tidak valid');
            return;
        }
        
        setImportFile(file);
        
        try {
            const parsedData = await parseExcelFile(file);
            
            if (parsedData && parsedData.length > 0) {
                toast.success(`File berhasil diupload: ${parsedData.length} data ditemukan`);
            }
        } catch (error) {
            console.error('Parse file error:', error);
            setValidationErrors([error.message]);
            toast.error('Gagal membaca file Excel');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            handleFileUpload({ target: { files: [file] } });
        }
    };

    const handleTriggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleRemoveFile = () => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChangeFile = () => {
        handleTriggerFileInput();
    };

    const resetImportState = () => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        resetImport();
    };

    const handleImport = async () => {
        if (!importFile) {
            toast.error('Pilih file Excel terlebih dahulu');
            return;
        }
        
        try {       
            const result = await handleImportExcel(importFile);
            
            setImportFile(null);
            setValidationErrors([]);
            setIsDragging(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            setIsImportModalOpen(false);

            if (result && result.successful > 0) {
                toast.success(`Successfully imported ${result.successful} programs`);
            }
        } catch (error) {
            console.error('Import failed:', error);

            if (error.message.includes('Validation failed')) {
                const errorLines = error.message.split('\n');
                setValidationErrors(errorLines.slice(1));
            } else {
                setValidationErrors([error.message]);
            }
        }
    };

    return (
        <Dialog open={isImportModalOpen} onOpenChange={(open) => {
            if (!open) {
                resetImportState();
            }
            setIsImportModalOpen(open);
        }}>
            <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                        Import Programs from Excel
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Upload an Excel file (.xlsx or .xls) to import multiple programs at once.
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
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
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
                                        onClick={handleRemoveFile}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Remove File
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleChangeFile}
                                    >
                                        Change File
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
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="excel-upload"
                                />
                                <Button
                                    variant={isDragging ? "default" : "outline"}
                                    onClick={handleTriggerFileInput}
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

                    {isImporting && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">Importing...</span>
                                </div>
                                <span className="text-sm font-medium text-blue-600">{importProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${importProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsImportModalOpen(false)}
                        disabled={isImporting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!importFile || isImporting}
                        className="flex items-center gap-2 px-6 py-2 flex-1"
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

export default ProgramImportModal;