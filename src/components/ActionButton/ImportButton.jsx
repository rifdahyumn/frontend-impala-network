import React, { useState, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Upload, Download, FileSpreadsheet, FileText, Loader2, AlertCircle, CheckCircle2, X, FileDown } from "lucide-react";
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ImportButton = ({ 
    onImport, 
    onDownloadTemplate,
    
    buttonText = "Import Excel",
    buttonVariant = "outline",
    buttonClassName = "",
    disabled = false,
    
    expectedColumns = [], 
    requiredColumns = [], 
    columnDisplayNames = {}, 
    sampleData = [],
    
    title = "Import Data",
    description = "Upload file Excel (.xlsx) untuk mengimport data secara massal.",
    instructionText = null,
    
    customValidators = [], 
    maxFileSize = 10, 
}) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importPreview, setImportPreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [importSummary, setImportSummary] = useState(null);
    
    const fileInputRef = useRef(null);

    const defaultSampleData = expectedColumns.length > 0 ? [
        Object.fromEntries(
        expectedColumns.map(col => [col, `Contoh: ${columnDisplayNames[col] || col}`])
        )
    ] : [];

    const validateExcelFile = (file) => {
        const errors = [];
        
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            errors.push('File harus berformat Excel (.xlsx atau .xls)');
        }
        
        if (file.size > maxFileSize * 1024 * 1024) {
            errors.push(`Ukuran file maksimal ${maxFileSize}MB`);
        }
        
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/excel',
            'application/x-excel',
            'application/x-msexcel'
        ];
        
        if (!validTypes.includes(file.type) && file.type !== '') {
            errors.push('Tipe file tidak valid. Hanya file Excel yang diperbolehkan');
        }
        
        return errors;
    };

    const validateRowData = (row, rowIndex) => {
        const errors = [];
        
        requiredColumns.forEach(column => {
            if (!row[column] || row[column].toString().trim() === '') {
                errors.push(`Baris ${rowIndex}: Kolom "${columnDisplayNames[column] || column}" wajib diisi`);
            }
        });
        
        if (row.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email.toString())) {
                errors.push(`Baris ${rowIndex}: Format email tidak valid`);
            }
        }
        
        customValidators.forEach((validator, index) => {
            try {
                const result = validator(row, rowIndex);
                if (result && typeof result === 'string') {
                    errors.push(`Baris ${rowIndex}: ${result}`);
                }
            } catch (error) {
                console.warn(`Custom validator ${index} error:`, error);
            }
        });
        
        return errors;
    };

    const parseExcel = (data) => {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            
            if (jsonData.length === 0) {
                throw new Error('File Excel tidak berisi data');
            }

            const headers = Object.keys(jsonData[0]).map(h => h.trim());
            
            if (expectedColumns.length > 0) {
                const missingColumns = expectedColumns.filter(col => !headers.includes(col));
                if (missingColumns.length > 0) {
                    throw new Error(`Kolom yang hilang: ${missingColumns.join(', ')}`);
                }
            }
            
            const dataRows = [];
            const errors = [];
            
            jsonData.forEach((row, index) => {
                try {
                    const cleanRow = {};
                    headers.forEach(header => {
                        const value = row[header];
                        cleanRow[header] = value !== undefined && value !== null ? 
                        (typeof value === 'string' ? value.trim() : value.toString().trim()) : '';
                    });
                    
                    if (Object.values(cleanRow).some(value => 
                        value.toString().includes('Contoh:') || 
                        value.toString().includes('CONTOH:') ||
                        value.toString().includes('contoh:')
                    )) {
                        return;
                    }
                    
                    if (Object.values(cleanRow).every(value => value === '')) {
                        return;
                    }
                    
                    const rowErrors = validateRowData(cleanRow, index + 1);
                    if (rowErrors.length > 0) {
                        errors.push(...rowErrors);
                        return;
                    }
                    
                    dataRows.push(cleanRow);
                } catch (error) {
                    errors.push(`Baris ${index + 1}: ${error.message}`);
                }
            });
        
            return { data: dataRows, errors, headers };
        } catch (error) {
            throw new Error(`Gagal membaca file Excel: ${error.message}`);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setValidationErrors([]);
        setImportSummary(null);
        
        const errors = validateExcelFile(file);
        if (errors.length > 0) {
            setValidationErrors(errors);
            setImportFile(null);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const { data: parsedData, errors, headers } = parseExcel(data);
                
                if (errors.length > 0) {
                    setValidationErrors(errors);
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data valid yang ditemukan dalam file');
                    } else {
                        toast.error(`Terdapat ${errors.length} error dalam file`);
                    }
                }
                
                if (parsedData.length > 0) {
                    setImportFile(file);
                    setImportPreview({
                        totalRows: parsedData.length + errors.length,
                        validRows: parsedData.length,
                        invalidRows: errors.length,
                        headers,
                        sampleData: parsedData.slice(0, 5)
                    });
                    toast.success(`File berhasil diupload: ${parsedData.length} data valid ditemukan`);
                } else {
                    setImportFile(null);
                }
            } catch (error) {
                setValidationErrors([error.message]);
                toast.error('Gagal membaca file Excel');
            }
        };
        
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (!importFile) {
            toast.error('Pilih file terlebih dahulu');
            return;
        }
        
        setIsProcessing(true);
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const { data: parsedData, errors } = parseExcel(data);
                    
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data yang bisa diimport');
                        setIsProcessing(false);
                        return;
                    }
                    
                    if (onImport) {
                        const result = await onImport(parsedData);
                        
                        setImportSummary({
                            totalProcessed: parsedData.length,
                            successful: result?.successful || parsedData.length,
                            failed: result?.failed || errors.length,
                            errors: result?.errors || errors
                        });
                        
                        if (result?.successful > 0) {
                            toast.success(`Berhasil mengimport ${result.successful} data`);
                            
                            setTimeout(() => {
                                resetImportState();
                                setIsImportModalOpen(false);
                            }, 3000);
                        }
                    }
                } catch (error) {
                    toast.error(`Error saat import: ${error.message}`);
                } finally {
                    setIsProcessing(false);
                }
            };
            
            reader.readAsArrayBuffer(importFile);
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Gagal melakukan import');
            setIsProcessing(false);
        }
    };

    const resetImportState = () => {
        setImportFile(null);
        setImportPreview(null);
        setValidationErrors([]);
        setImportSummary(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownloadTemplate = () => {
        if (onDownloadTemplate) {
            onDownloadTemplate();
        } else {
            const templateData = sampleData.length > 0 ? sampleData : defaultSampleData;
            
            if (templateData.length === 0) {
                toast.error('Tidak ada konfigurasi kolom untuk template');
                return;
            }
            
            const headers = expectedColumns.length > 0 ? expectedColumns : Object.keys(templateData[0]);
            
            const wsData = [
                headers.map(header => columnDisplayNames[header] || header), 
                ...templateData.map(row => 
                headers.map(header => row[header] || '')
                )
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            if (!ws['!cols']) ws['!cols'] = [];
            headers.forEach((_, i) => {
                ws['!cols'][i] = { wch: 20 };
            });
            
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");
            
            XLSX.writeFile(wb, `import_template_${Date.now()}.xlsx`);
            
            toast.success('Template Excel berhasil didownload');
        }
    };

    return (
        <>
        {/* Import Button dengan Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={buttonVariant}
                        disabled={disabled}
                        className={`flex items-center gap-2 ${buttonClassName}`}
                    >
                        <Upload className="h-4 w-4" />
                        {buttonText}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuItem 
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <FileDown className="h-4 w-4" />
                        <div>
                            <div className="font-medium">Download Template</div>
                            <div className="text-xs text-gray-500">Format Excel yang benar</div>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <div>
                            <div className="font-medium">Upload File Excel</div>
                            <div className="text-xs text-gray-500">Import data dari file</div>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Import Modal */}
            <Dialog open={isImportModalOpen} onOpenChange={(open) => {
                if (!open) {
                resetImportState();
                }
                setIsImportModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                            {title}
                        </DialogTitle>
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-6">
                        <div className={`flex items-center gap-2 ${importFile ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importFile ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                                1
                            </div>
                            <span className="text-sm font-medium">Upload File</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-4 bg-gray-200"></div>
                        <div className={`flex items-center gap-2 ${importSummary ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importSummary ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                                2
                            </div>
                            <span className="text-sm font-medium">Import Selesai</span>
                        </div>
                    </div>

                    {/* Upload Section */}
                    {!importSummary && (
                        <div className="space-y-4">
                        
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {instructionText || 'Petunjuk Import:'}
                                </h4>
                                <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                                    <li>Download template terlebih dahulu untuk format yang benar</li>
                                    {requiredColumns.length > 0 && (
                                        <li>Kolom wajib: {requiredColumns.map(col => columnDisplayNames[col] || col).join(', ')}</li>
                                    )}
                                    <li>Maksimal ukuran file: {maxFileSize}MB</li>
                                    <li>File Excel (.xlsx atau .xls) yang didukung</li>
                                    <li>Data harus berada pada sheet pertama</li>
                                    <li>Baris pertama harus berisi header/nama kolom</li>
                                </ul>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                                {importFile ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <FileText className="h-12 w-12 text-green-500" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-800">{importFile.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(importFile.size / 1024).toFixed(2)} KB • {importPreview?.validRows || 0} data valid
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Preview Data */}
                                        {importPreview && importPreview.sampleData.length > 0 && (
                                            <div className="mt-4 border rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-2 border-b">
                                                    <h5 className="text-sm font-medium text-gray-700">
                                                        Preview Data ({importPreview.validRows} data valid)
                                                    </h5>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-gray-100">
                                                            <tr>
                                                                {importPreview.headers.slice(0, Math.min(4, importPreview.headers.length)).map((header, index) => (
                                                                <th key={index} className="p-2 text-left border-b font-medium text-gray-700">
                                                                    {columnDisplayNames[header] || header}
                                                                </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {importPreview.sampleData.map((row, rowIndex) => (
                                                                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                                                                {importPreview.headers.slice(0, Math.min(4, importPreview.headers.length)).map((header, colIndex) => (
                                                                    <td key={colIndex} className="p-2 truncate max-w-[120px]">
                                                                    {row[header] || '-'}
                                                                    </td>
                                                                ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-2 justify-center pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={resetImportState}
                                                className="flex items-center gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Ganti File
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                            <Upload className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Drag & drop file Excel Anda di sini
                                        </p>
                                        <p className="text-xs text-gray-500 mb-4">
                                            atau klik untuk memilih file dari komputer
                                        </p>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="excel-upload"
                                        />
                                        <Button
                                            variant="default"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6"
                                        >
                                            Pilih File
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

                            {expectedColumns.length > 0 && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Format Kolom yang Diharapkan:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {expectedColumns.map((column, index) => (
                                            <span 
                                                key={index}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                requiredColumns.includes(column)
                                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                                    : 'bg-white text-gray-600 border border-gray-300'
                                                }`}
                                            >
                                                {columnDisplayNames[column] || column}
                                                {requiredColumns.includes(column) && ' *'}
                                            </span>
                                        ))}
                                    </div>
                                    {requiredColumns.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            * Kolom dengan tanda bintang wajib diisi
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Import Summary */}
                    {importSummary && (
                        <div className="space-y-6">
                            <div className={`${importSummary.successful > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-6 text-center`}>
                                {importSummary.successful > 0 ? (
                                    <>
                                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                                            Import Berhasil!
                                        </h3>
                                        <p className="text-green-600">
                                            {importSummary.successful} dari {importSummary.totalProcessed} data berhasil diimport
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                            Import Gagal
                                        </h3>
                                        <p className="text-yellow-600">
                                            Tidak ada data yang berhasil diimport
                                        </p>
                                    </>
                                )}
                            </div>

                            {importSummary.totalProcessed > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">{importSummary.successful}</div>
                                        <div className="text-sm text-blue-800">Berhasil</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-600">{importSummary.failed}</div>
                                        <div className="text-sm text-red-800">Gagal</div>
                                    </div>
                                </div>
                            )}

                            {importSummary.errors.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                        Data yang gagal diimport:
                                    </h4>
                                    <ul className="text-xs text-yellow-600 space-y-1 max-h-32 overflow-y-auto">
                                        {importSummary.errors.slice(0, 5).map((error, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="mt-1">•</span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="text-center text-sm text-gray-500">
                                Modal akan tertutup otomatis dalam 3 detik...
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                        {!importSummary && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Template
                                </Button>
                                <div className="flex-1"></div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetImportState();
                                        setIsImportModalOpen(false);
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={!importFile || isProcessing || validationErrors.length > 0}
                                    className="flex items-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Import Data
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImportButton;