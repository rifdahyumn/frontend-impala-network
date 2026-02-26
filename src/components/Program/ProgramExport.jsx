import React, { useState } from 'react';
import { Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";
import programService from "../../services/programService"; 

const ProgramExport = ({ 
    disabled = false,
    formatInstructorsForExport,
    formatTagsForExport,
    filters = {},
    showAllOnSearch = false
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format = 'excel') => {
        try {
            setIsExporting(true);
            
            const params = {
                page: 1,
                limit: 10000,
                search: filters.search || '',
                status: filters.status || '',
                category: filters.category && filters.category !== 'all' ? filters.category : '',
                showAllOnSearch: showAllOnSearch
            };
            
            const result = await programService.fetchPrograms(params);
            
            const allPrograms = result.data || [];

            if (!allPrograms || allPrograms.length === 0) {
                toast.error('No data to export');
                return;
            }

            const activeFilters = Object.keys(filters).filter(key => 
                filters[key] && filters[key].toString().trim() !== '' && 
                !(key === 'category' && filters[key] === 'all')
            ).length;

            const exportData = allPrograms.map((program, index) => ({
                'No': index + 1,
                'Program Name': program.program_name || '-',
                'Client': program.client || '-',
                'Category': program.category || '-',
                'Status': program.status || '-',
                'Area': program.area || '-',
                'Location': program.location || '-',
                'Start Date': program.start_date || '-',
                'End Date': program.end_date || '-',
                'Duration': program.duration || '-',
                'Capacity': program.capacity || '-',
                'Actual Participants': program.participant || 0,
                'Budget Offering': program.budget_offering ? `Rp ${program.budget_offering.toLocaleString()}` : '-',
                'Budget Usage Plan': program.budget_usage_plan ? `Rp ${program.budget_usage_plan.toLocaleString()}` : '-',
                'Budget Finance Closure': program.budget_finance_closure ? `Rp ${program.budget_finance_closure.toLocaleString()}` : '-',
                'Realisasi Penyerapan': program.budget_finance_closure_realisasi_penyerapan || '-',
                'Estimasi Margin': program.margin_estimasi_margin ? `Rp ${program.margin_estimasi_margin.toLocaleString()}` : '-',
                'Real Margin': program.margin_real_margin ? `Rp ${program.margin_real_margin.toLocaleString()}` : '-',
                'Termin': program.termin || '-',
                'Instructors': formatInstructorsForExport(program.instructors),
                'Man Power PIC': program.man_power_pic 
                    ? (Array.isArray(program.man_power_pic) 
                        ? program.man_power_pic.join(', ') 
                        : String(program.man_power_pic))
                    : '-',
                'Man Power Leads': program.man_power_leads || '-',
                'Division': program.man_power_division || '-',
                'Team Internal': program.jumlah_team_internal || 0,
                'Team Eksternal': program.jumlah_team_eksternal || 0,
                'Tags': formatTagsForExport(program.tags),
                'Interest of Program': program.interest_of_program 
                    ? (Array.isArray(program.interest_of_program) 
                        ? program.interest_of_program.join(', ') 
                        : String(program.interest_of_program))
                    : '-',
                'Kolaborator': program.kolaborator 
                    ? (Array.isArray(program.kolaborator) 
                        ? program.kolaborator.join(', ') 
                        : String(program.kolaborator))
                    : '-',
                'Description': program.description || '-',
                'Link Folder': program.link_folder_program || '-',
                'Link Deck': program.deck_program_link || '-',
                'Link Quotation': program.quotation || '-',
                'Link Invoice': program.invoice || '-',
                'Link Receipt': program.receipt || '-',
                'Link Survey': program.satisfaction_survey_link || '-',
                'Created Date': program.created_at ? new Date(program.created_at).toLocaleDateString('id-ID') : '-',
                'Last Updated': program.updated_at ? new Date(program.updated_at).toLocaleDateString('id-ID') : '-'
            }));

            if (format === 'excel') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                const wscols = [
                    { wch: 5 },   
                    { wch: 30 },   
                    { wch: 25 },  
                    { wch: 20 },   
                    { wch: 10 },  
                    { wch: 10 },  
                    { wch: 15 },  
                    { wch: 12 },  
                    { wch: 12 },  
                    { wch: 10 },  
                    { wch: 10 },   
                    { wch: 10 },  
                    { wch: 18 },   
                    { wch: 18 },   
                    { wch: 18 },   
                    { wch: 12 },  
                    { wch: 18 },   
                    { wch: 18 },   
                    { wch: 20 },   
                    { wch: 25 },   
                    { wch: 25 },   
                    { wch: 20 },  
                    { wch: 20 },  
                    { wch: 8 },   
                    { wch: 8 },    
                    { wch: 25 },   
                    { wch: 25 },   
                    { wch: 25 },   
                    { wch: 40 },   
                    { wch: 30 },   
                    { wch: 30 },  
                    { wch: 30 },   
                    { wch: 30 },  
                    { wch: 30 },   
                    { wch: 30 },  
                    { wch: 12 },   
                    { wch: 12 }   
                ];
                ws['!cols'] = wscols;

                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = { c: C, r: 0 };
                    const cell_ref = XLSX.utils.encode_cell(cell_address);
                    if (!ws[cell_ref]) continue;
                    ws[cell_ref].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "2563EB" } },
                        alignment: { horizontal: "center", vertical: "center", wrapText: true }
                    };
                }
                
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Programs");
                
                const dateStr = new Date().toISOString().split('T')[0];
                let fileName = `programs_export_${dateStr}`;
                
                if (activeFilters > 0) {
                    if (filters.search) {
                        fileName += `_search-${filters.search.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '_')}`;
                    }
                    if (filters.status) {
                        fileName += `_status-${filters.status}`;
                    }
                    if (filters.category && filters.category !== 'all') {
                        fileName += `_category-${filters.category}`;
                    }
                }
                
                fileName += '.xlsx';
                
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
            title={isExporting ? "Exporting..." : "Export filtered data"}
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