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
                'Description': program.description || '-',
                'Capacity': program.capacity || '-',
                'Location': program.location || '-',
                'Interest of Program': program.interest_of_program 
                    ? (Array.isArray(program.interest_of_program) 
                        ? program.interest_of_program.join(', ') 
                        : String(program.interest_of_program))
                    : '-',
                'Area': program.area || '-',
                'Kolaborator': program.kolaborator 
                    ? (Array.isArray(program.kolaborator) 
                        ? program.kolaborator.join(', ') 
                        : String(program.kolaborator))
                    : '-',
                'Instructors': formatInstructorsForExport(program.instructors),
                'Tags': formatTagsForExport(program.tags),
                'Duration': program.duration || '-',
                'Start Date': program.start_date || '-',
                'End Date': program.end_date || '-',
                'Offering': program.budget_offering ? `${program.budget_offering.toLocaleString()}` : '-',
                'Usage Plan': program.budget_usage_plan ? `${program.budget_usage_plan.toLocaleString()}` : '-',
                'Finance Closure': program.budget_finance_closure ? `${program.budget_finance_closure.toLocaleString()}` : '-',
                'Absorption Realization': program.budget_finance_closure_realisasi_penyerapan || '-',
                'Real Margin': program.margin_real_margin ? `${program.margin_real_margin.toLocaleString()}` : '-',
                'Estimasi Margin': program.margin_estimasi_margin ? `${program.margin_estimasi_margin.toLocaleString()}` : '-',
                'Budget Offering Link': program.link_budgeting_offering || '-',
                'Usage Plan Link': program.link_budgeting_usage_plan || '-',
                'Finance Tracker': program.link_budgeting_finance_tracker || '-',
                'Quotation': program.quotation || '-',
                'Invoice': program.invoice || '-',
                'Receipt': program.receipt || '-',
                'Folder Program': program.link_folder_program || '-',
                'Deck Program': program.deck_program_link || '-',
                'Termin': program.termin || '-',
                'Team Leads': program.man_power_leads || '-',
                'Division': program.man_power_division || '-',
                'PIC Team': program.man_power_pic 
                    ? (Array.isArray(program.man_power_pic) 
                        ? program.man_power_pic.join(', ') 
                        : String(program.man_power_pic))
                    : '-',
                'Internal Team': program.jumlah_team_internal || 0,
                'Eksternal Team': program.jumlah_team_eksternal || 0,
                'Freelance Contract': program.link_kontrak_freelance || '-',  
                'Assignment Letter': program.link_surat_tugas || '-',  
                'Partner Contract': program.link_document_kontrak_partner || '-',  
                'Documentation': program.link_drive_documentation || '-',  
                'Media Release': program.link_drive_media_release_program || '-',  
                'Program Report': program.link_drive_program_report || '-',  
                'E-Catalogue': program.link_drive_e_catalogue_beneficiary || '-',  
                'Participants': program.participant || 0,
                'Activity': program.activity || '-',
                'BAST': program.link_drive_bast,
                'Survey Link': program.satisfaction_survey_link || '-',
                'Stage Start Leads': program.stage_start_leads_realisasi || '-',
                'Stage Analysis': program.stage_analysis_realisasi || '-',
                'Stage Project Creative Development': program.stage_project_creative_development_realisasi || '-',
                'Stage Program Description': program.stage_program_description_realisasi || '-',
                'Stage Project Initial Presentation': program.stage_project_initial_presentation_realisasi || '-',
                'Stage Project Organizing Development': program.stage_project_organizing_development_realisasi || '-',
                'Stage Project Implementation Presentation': program.stage_project_implementation_presentation_realisasi || '-',
                'Stage Project Implementation': program.stage_project_implementation_realisasi || '-',
                'Stage Project Evaluation & Monitoring': program.stage_project_evaluation_monitoring_realisasi || '-',
                'Stage Project Satisfaction Survey': program.stage_project_satisfaction_survey_realisasi || '-',
                'Stage Project Report': program.stage_project_report_realisasi || '-',
                'Stage End & Sustainability': program.stage_end_sustainability_realisasi || '-',
                'Total Progress': program.total_progress || '-',
                'Created Date': program.created_at ? new Date(program.created_at).toLocaleDateString('id-ID') : '-',
                'Last Updated': program.updated_at ? new Date(program.updated_at).toLocaleDateString('id-ID') : '-'
            }));

            if (format === 'excel') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                const wscols = [
                    { wch: 5 }, { wch: 40 }, { wch: 30 }, { wch: 25 }, { wch: 10 }, { wch: 50 }, 
                    { wch: 15 }, { wch: 25 }, { wch: 35 }, { wch: 12 }, { wch: 30 }, { wch: 40 }, 
                    { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, 
                    { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 50 }, { wch: 50 }, 
                    { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, 
                    { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 12 }, 
                    { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }, 
                    { wch: 50 }, { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 50 }, { wch: 12 }, 
                    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
                    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
                    { wch: 12 }, { wch: 12 }
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