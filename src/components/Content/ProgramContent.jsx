import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, Building, User, MapPin, Calendar, DollarSign, Share2Icon, ExternalLink, Loader2, TrendingUp, Users, BarChart, PenTool, FileText, Settings, Play, Target, CheckCircle2, Award, Clock, Circle, Presentation } from "lucide-react";
import toast from 'react-hot-toast';

const ProgramContent = ({ selectedProgram, onDelete, detailTitle, onOpenEditModal, onProgramEdited, showConfirm }) => {
    const [activeCategory, setActiveCategory] = useState('Program Information');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const stageData = [
        { key: 'stage_start_leads_realisasi', label: 'Start Leads', icon: Users, description: 'Pengumpulan leads awal', color: 'blue' },
        { key: 'stage_analysis_realisasi', label: 'Analysis', icon: BarChart, description: 'Analisis kebutuhan program', color: 'indigo' },
        { key: 'stage_project_creative_development_realisasi', label: 'Creative Development', icon: PenTool, description: 'Pengembangan konsep kreatif', color: 'purple' },
        { key: 'stage_program_description_realisasi', label: 'Program Description', icon: FileText, description: 'Deskripsi program', color: 'pink' },
        { key: 'stage_project_initial_presentation_realisasi', label: 'Initial Presentation', icon: Presentation, description: 'Presentasi awal ke client', color: 'orange' },
        { key: 'stage_project_organizing_development_realisasi', label: 'Organizing Development', icon: Settings, description: 'Pengembangan organisasi program', color: 'teal' },
        { key: 'stage_project_implementation_presentation_realisasi', label: 'Implementation Presentation', icon: Presentation, description: 'Presentasi implementasi', color: 'cyan' },
        { key: 'stage_project_implementation_realisasi', label: 'Implementation', icon: Play, description: 'Pelaksanaan program', color: 'green' },
        { key: 'stage_project_evaluation_monitoring_realisasi', label: 'Evaluation & Monitoring', icon: Target, description: 'Evaluasi dan monitoring', color: 'yellow' },
        { key: 'stage_project_satisfaction_survey_realisasi', label: 'Satisfaction Survey', icon: CheckCircle2, description: 'Survey kepuasan', color: 'emerald' },
        { key: 'stage_project_report_realisasi', label: 'Report', icon: FileText, description: 'Pembuatan laporan', color: 'amber' },
        { key: 'stage_end_sustainability_realisasi', label: 'End & Sustainability', icon: Award, description: 'Keberlanjutan program', color: 'rose' },
    ];

    const detailFields = [
        {
            category: 'Program Information',
            icon: Building,
            fields: [
                { key: 'program_name', label: 'Program Name', icon: Building },
                { key: 'deskripsi_program', label: 'Description', icon: Building },
                { key: 'client', label: 'Client', icon: Building },
                { key: 'category', label: 'Category', icon: Building },
                { key: 'status', label: 'Status', icon: Building },
                { key: 'duration', label: 'Duration', icon: Calendar },
                { key: 'start_date', label: 'Start Date', icon: Calendar },
                { key: 'end_date', label: 'End Date', icon: Calendar },
            ]
        },
        {
            category: 'Partner Information',
            icon: User,
            fields: [
                { key: 'nama_perusahaan', label: 'Company Name', icon: User },
                { key: 'nama_brand', label: 'Brand Name', icon: User },
                { key: 'partner_pic_name', label: 'PIC Name', icon: User },
                { key: 'job_title_pic', label: 'Job Title', icon: User },
                { key: 'partner_phone_contact', label: 'Phone', icon: User },
                { key: 'partner_bussiness_email', label: 'Email', icon: User },
                { key: 'partner_country_location', label: 'Country', icon: MapPin },
                { key: 'partner_location', label: 'Location', icon: MapPin },
                { key: 'partner_address', label: 'Address', icon: MapPin },
                { key: 'logo_partner', label: 'Logo', icon: User, isLink: true },
                { key: 'interest_of_program', label: 'Interest', icon: User, isArray: true },
            ]
        },
        {
            category: 'Budget',
            icon: DollarSign,
            fields: [
                { key: 'budget_offering', label: 'Offering', icon: DollarSign, isCurrency: true },
                { key: 'budget_usage_plan', label: 'Usage Plan', icon: DollarSign, isCurrency: true },
                { key: 'budget_finance_closure', label: 'Finance Closure', icon: DollarSign, isCurrency: true, hasSecondaryValue: true, secondaryKey: 'budget_finance_closure_realisasi_penyerapan' },
                { key: 'margin_real_margin', label: 'Real Margin', icon: TrendingUp, isCurrency: true },
                { key: 'margin_estimasi_margin', label: 'Estimasi Margin', icon: TrendingUp, isCurrency: true },
                { key: 'link_budgeting_offering', label: 'Budget Offering Link', icon: Share2Icon, isLink: true },
                { key: 'link_budgeting_usage_plan', label: 'Usage Plan Link', icon: Share2Icon, isLink: true },
                { key: 'link_budgeting_finance_tracker', label: 'Finance Tracker', icon: Share2Icon, isLink: true },
                { key: 'quotation', label: 'Quotation', icon: FileText, isLink: true },
                { key: 'invoice', label: 'Invoice', icon: FileText, isLink: true },
                { key: 'receipt', label: 'Receipt', icon: FileText, isLink: true },
            ]
        },
        {
            category: 'Program Documents',
            icon: FileText,
            fields: [
                { key: 'link_folder_program', label: 'Program Folder', icon: Share2Icon, isLink: true },
                { key: 'deck_program_link', label: 'Deck Program', icon: Share2Icon, isLink: true },
                { key: 'deck_program_status', label: 'Deck Status', icon: FileText },
                { key: 'link_rab', label: 'RAB Link', icon: Share2Icon, isLink: true },
                { key: 'termin', label: 'Termin', icon: Calendar },
            ]
        },
        {
            category: 'Team',
            icon: Users,
            fields: [
                { key: 'man_power_leads', label: 'Team Leads', icon: User },
                { key: 'man_power_division', label: 'Division', icon: User },
                { key: 'man_power_pic', label: 'PIC Team', icon: User, isArray: true },
                { key: 'jumlah_team_internal', label: 'Internal Team', icon: User },
                { key: 'jumlah_team_eksternal', label: 'External Team', icon: User },
                { key: 'link_kontrak_freelance', label: 'Freelance Contract', icon: Share2Icon, isLink: true },
                { key: 'link_surat_tugas', label: 'Assignment Letter', icon: Share2Icon, isLink: true },
                { key: 'link_document_kontrak_partner', label: 'Partner Contract', icon: Share2Icon, isLink: true },
            ]
        },
        {
            category: 'Post Event',
            icon: Award,
            fields: [
                { key: 'link_drive_documentation', label: 'Documentation', icon: Share2Icon, isLink: true },
                { key: 'link_drive_media_release_program', label: 'Media Release', icon: Share2Icon, isLink: true },
                { key: 'link_drive_program_report', label: 'Program Report', icon: Share2Icon, isLink: true },
                { key: 'link_drive_e_catalogue_beneficiary', label: 'E-Catalogue', icon: Share2Icon, isLink: true },
                { key: 'participant', label: 'Participants', icon: Users },
                { key: 'area', label: 'Area', icon: MapPin },
                { key: 'activity', label: 'Activity', icon: FileText },
                { key: 'kolaborator', label: 'Collaborators', icon: Users, isArray: true },
                { key: 'talent', label: 'Talents', icon: User, isArray: true },
                { key: 'link_drive_bast', label: 'BAST', icon: Share2Icon, isLink: true },
                { key: 'satisfaction_survey_link', label: 'Survey Link', icon: Share2Icon, isLink: true },
            ]
        },
        {
            category: 'Stages',
            icon: Target,
            fields: stageData.map(stage => ({
                key: stage.key,
                label: stage.label,
                icon: stage.icon,
                description: stage.description,
                color: stage.color,
                isStage: true
            }))
        },
    ];

    const dispatchProgramEvent = (type, programData) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(type, {
                detail: {
                    ...programData,
                    timestamp: new Date().toISOString()
                }
            }));
        }
    };

    const isValidUrl = (url) => {
        if (!url) return false;

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const formatUrl = (url) => {
        if (!url) return '';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }

        return url;
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return '-'

        try {
            if (typeof value === 'string' && value.includes('Rp')) {
                return value
            }

            let numericValue = value
            if (typeof value === 'string') {
                numericValue = value.replace(/[^0-9]/g, '')
            }

            const number = parseInt(numericValue)
            if (isNaN(number)) return value

            return `Rp. ${number.toLocaleString('id-ID')}`
        } catch {
            return value
        }
    }

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    const handleEdit = () => {
        if (!selectedProgram) return;
        if (onOpenEditModal) {
            onOpenEditModal(selectedProgram, (updatedProgram) => {
                if (onProgramEdited) {
                    onProgramEdited(updatedProgram);
                }

                toast.success('Program updated successfully');
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedProgram) return;
        
        if (showConfirm && typeof showConfirm === 'function') {
            showConfirm({
                title: 'Delete Program',
                message: `Are you sure you want to delete "${selectedProgram.program_name}"? This action cannot be undone.`,
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    await performDelete();
                },
                onCancel: () => {
                    toast('Deletion cancelled', { icon: '⚠️' });
                }
            });
        } else {
            const confirmed = window.confirm(`Are you sure you want to delete "${selectedProgram.program_name}"? This action cannot be undone.`);
            if (confirmed) {
                await performDelete();
            }
        }
    };

    const performDelete = async () => {
        setDeleteLoading(true);
        
        try {
            dispatchProgramEvent('programDeleted', {
                type: 'deleted',
                program: {
                    id: selectedProgram.id,
                    name: selectedProgram.program_name,
                    client: selectedProgram.client,
                    category: selectedProgram.category
                }
            });
            
            await onDelete(selectedProgram.id);
            
            dispatchProgramEvent('programDeletedSuccess', {
                type: 'deleted_success',
                program: {
                    id: selectedProgram.id,
                    name: selectedProgram.program_name
                },
                message: `Program "${selectedProgram.program_name}" has been deleted successfully`
            });
            
            toast.success(`Program "${selectedProgram.program_name}" deleted successfully`);
            
        } catch (error) {
            console.error('Error in handleDelete:', error);
            
            dispatchProgramEvent('programDeleteError', {
                type: 'deleted_error',
                program: {
                    id: selectedProgram.id,
                    name: selectedProgram.program_name
                },
                error: error.message || 'Failed to delete program'
            });
            
            toast.error(error.message || 'Failed to delete program');
        } finally {
            setDeleteLoading(false);
        }
    };

    const StagesProgress = () => {
        if (!selectedProgram) return null

        const stageValues = stageData.map(stage => parseInt(selectedProgram[stage.key]) || 0)
        const totalProgress = stageValues.reduce((acc, val) => acc + val, 0) / stageData.length

        return (
            <div className='space-y-6'>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                        </div>

                        <span className="text-2xl font-bold text-blue-600">
                            {totalProgress.toFixed(1)}%
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${totalProgress}%` }} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
                        {stageData.map((stage, index) => {
                            const value = parseInt(selectedProgram[stage.key]) || 0
                            const StageIcon = stage.icon

                            let statusColor = 'gray'
                            let statusBg = 'bg-gray-50'
                            let statusText = 'text-gray-600'
                            let progressColor = 'bg-gray-400'

                            if (value >= 100) {
                                statusColor = 'green'
                                statusBg = 'bg-green-50'
                                statusText = 'text-green-700'
                                progressColor = 'bg-green-500'
                            } else if (value < 0) {
                                statusColor = 'yellow';
                                statusBg = 'bg-yellow-50';
                                statusText = 'text-yellow-700';
                                progressColor = 'bg-yellow-500';
                            }

                            return (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-4 ${statusBg} border-${statusColor}-200 hover:shadow-md transition-shadow`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg bg-${statusColor}-100`}>
                                                <StageIcon className={`w-4 h-4 text-${statusColor}-600`} />
                                            </div>

                                            <div>
                                                <h5 className="font-medium text-gray-800">
                                                    {stage.label}
                                                </h5>
                                            </div>
                                        </div>

                                        <span className={`text-sm font-semibold ${statusText}`}>
                                            {value}%
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                        <div 
                                            className={`${progressColor} h-1.5 rounded-full transition-all duration-500`}
                                            style={{ width: `${value}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 mt-2">
                                        {value >= 100 ? (
                                            <>
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                <span className="text-xs text-green-600">
                                                    Completed
                                                </span>
                                            </>
                                        ) : value > 0 ? (
                                            <>
                                                <Clock className="w-3 h-3 text-yellow-500" />
                                                <span className="text-xs text-yellow-600">
                                                    In Progress
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Circle className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    Not Started
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    const ActiveCategoryContent = () => {
        const activeCategoryData = getActiveCategoryData();

        if (!activeCategoryData || !selectedProgram) return null;

        if (activeCategory === "Stages") {
            return <StagesProgress />
        }

        const CategoryIcon = activeCategoryData.icon;

        return (
            <div className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-4 pb-2 border-b border-gray-100'>
                    <CategoryIcon className='w-4 h-4 text-amber-400' />
                    <h3 className='font-semibold text-gray-800'>{activeCategory}</h3>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    {activeCategoryData.fields.map((field, index) => {
                        const FieldIcon = field.icon;
                        const rawValue = selectedProgram[field.key] || '-';

                        let displayValue = rawValue === undefined || rawValue === null ? '-' : rawValue

                        if (field.isCurrency && displayValue !== '-') {
                            displayValue = formatCurrency(displayValue)
                        }

                        const isLinkField = field.isLink && displayValue !== '-';
                        const formattedUrl = isLinkField ? formatUrl(displayValue) : '';
                        const isValidLink = isLinkField && isValidUrl(formattedUrl);

                        const isArrayField = Array.isArray(displayValue);
                        const finalDisplayValue = isArrayField ? 
                            rawValue.join(', ') : 
                            displayValue;

                        const secondaryValue = field.hasSecondaryValue && selectedProgram[field.secondaryKey]
                            ? selectedProgram[field.secondaryKey]
                            : null

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0' />

                                <div className='flex-1'>
                                    <label className='text-sm text-gray-500 block mb-1'>
                                        {field.label}
                                    </label>
                                    
                                    {isLinkField && isValidLink ? (
                                        <div className='flex flex-col'>
                                            <a 
                                                href={formattedUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm flex items-center gap-1 group'
                                            >
                                                <span className='break-all'>
                                                    {formattedUrl}
                                                </span>
                                                <ExternalLink className='h-3 w-3 flex-shrink-0' />
                                            </a>
                                        </div>
                                    ) : isLinkField && displayValue !== '-' ? (
                                        <div className='flex flex-col'>
                                            <span className='text-gray-900 text-sm font-medium break-all'>
                                                {displayValue}
                                            </span>
                                            <span className='text-xs text-red-500 mt-1'>
                                                (Format URL tidak valid)
                                            </span>
                                        </div>
                                    ) : (
                                       <div className='flex items-center gap-2 flex-wrap'>
                                            <p className='text-gray-900 text-sm font-medium'>
                                                {finalDisplayValue}
                                            </p>
                                            {secondaryValue && (
                                                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-300'>
                                                    {secondaryValue}
                                                </span>
                                            )}
                                       </div>
                                        
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const preparedProgram = selectedProgram ? {
        ...selectedProgram,
        instructors: Array.isArray(selectedProgram.instructors) ? selectedProgram.instructors : 
                   (typeof selectedProgram.instructors === 'string' ? selectedProgram.instructors.split(',') : []),
        tags: Array.isArray(selectedProgram.tags) ? selectedProgram.tags : 
              (typeof selectedProgram.tags === 'string' ? selectedProgram.tags.split(',') : [])
    } : null;

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{detailTitle}</CardTitle>
                    {preparedProgram && (
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={handleEdit}
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {preparedProgram ? (
                    <div className='space-y-6'>
                        <div className='flex flex-wrap gap-2 mb-4'>
                            {detailFields.map((category, index) => {
                                const CategoryIcon = category.icon;

                                return (
                                    <Button
                                        key={index}
                                        variant={activeCategory === category.category ? 'default' : 'outline'}
                                        size="sm"
                                        className="flex items-center gap-2"
                                        onClick={() => setActiveCategory(category.category)}
                                    >
                                        <CategoryIcon className='h-4 w-4' />
                                        {category.category}
                                    </Button>
                                );
                            })}
                        </div>

                        <ActiveCategoryContent />
                    </div>
                ) : (
                    <div className='text-center py-8 text-gray-500'>
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Program Selected</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Select a program from the list to view its details, edit information, or delete it.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProgramContent;