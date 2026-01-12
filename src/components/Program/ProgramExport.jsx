import React, { useState } from 'react';
import { Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";

const ProgramExport = ({ 
    disabled = false,
    formatInstructorsForExport,
    formatTagsForExport 
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format = 'excel') => {
        try {
            setIsExporting(true);

            const response = await fetch(`/api/program?limit=10000&page=1`);

            if (!response.ok) {
                throw new Error('Failed to fetch data from server');
            }

            const result = await response.json();
            const allPrograms = result.data || result.programs || [];

            if (!allPrograms || allPrograms.length === 0) {
                toast.error('No data to export');
                return;
            }

            const exportData = allPrograms.map((program, index) => ({
                'No': index + 1,
                'Program Name': program.program_name || '-',
                'Category': program.category || '-',
                'Status': program.status || '-',
                'Duration': program.duration || '-',
                'Location': program.location || '-',
                'Capacity': program.capacity || '-',
                'Price': program.price || '-',
                'Client': program.client || '-',
                'Link RAB': program.link_rab || '-',
                'Start Date': program.start_date || '-',
                'End Date': program.end_date || '-',
                'Description': program.description || '-',
                'Instructors': formatInstructorsForExport(program.instructors),
                'Tags': formatTagsForExport(program.tags),
                'Created Date': program.created_at 
                    ? new Date(program.created_at).toLocaleDateString() 
                    : '-',
                'Last Updated': program.updated_at 
                    ? new Date(program.updated_at).toLocaleDateString() 
                    : '-'
            }));

            if (format === 'excel') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                const wscols = [
                    { wch: 5 }, { wch: 25 }, { wch: 20 }, 
                    { wch: 10 }, { wch: 15 }, { wch: 15 }, 
                    { wch: 25 }, { wch: 12 }, { wch: 12 }, 
                    { wch: 40 }, { wch: 12 }, { wch: 12 }
                ];
                ws['!cols'] = wscols;

                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = { c: C, r: 0 };
                    const cell_ref = XLSX.utils.encode_cell(cell_address);
                    if (!ws[cell_ref]) continue;
                    ws[cell_ref].s = {
                        font: { bold: true },
                        fill: { fgColor: { rgb: "E0E0E0" } }
                    };
                }
                
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Programs");
                
                const dateStr = new Date().toISOString().split('T')[0];
                const fileName = `programs_export_${dateStr}.xlsx`;
                
                XLSX.writeFile(wb, fileName);
                
                toast.success(`Exported ${exportData.length} programs to Excel`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(`Failed to export: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
            disabled={disabled || isExporting}
        >
            {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Export
        </Button>
    );
};

export default ProgramExport;