import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, Building, User, MapPin, Calendar, DollarSign, Share2Icon, ExternalLink, Loader2, TrendingUp, Users, BarChart, PenTool, FileText, Settings, Play, Target, CheckCircle2, Award, Clock, Circle, Presentation, Info, CheckCircle, RefreshCw } from "lucide-react";
import toast from 'react-hot-toast';
import clientService from '../../services/clientService';
import ClientDetailModal from './ClientDetailModal';
import programService from '../../services/programService';

const ProgramContent = ({ selectedProgram, onDelete, detailTitle, onOpenEditModal, onProgramEdited, showConfirm, onProgramUpdate }) => {
    const [activeCategory, setActiveCategory] = useState('Program Information');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [updatingStage, setUpdatingStage] = useState(null)

    const [isClientModalOpen, setIsClientModalOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState(null)
    const [clientLoading, setClientLoading] = useState(false)

    const stageData = [
        { key: 'stage_start_leads_realisasi', label: 'Start Leads', icon: Users, description: 'Pengumpulan leads awal', color: 'blue', order: 1 },
        { key: 'stage_analysis_realisasi', label: 'Analysis', icon: BarChart, description: 'Analisis kebutuhan program', color: 'indigo', order: 2 },
        { key: 'stage_project_creative_development_realisasi', label: 'Creative Development', icon: PenTool, description: 'Pengembangan konsep kreatif', color: 'purple', order: 3 },
        { key: 'stage_program_description_realisasi', label: 'Program Description', icon: FileText, description: 'Deskripsi program', color: 'pink', order: 4 },
        { key: 'stage_project_initial_presentation_realisasi', label: 'Initial Presentation', icon: Presentation, description: 'Presentasi awal ke client', color: 'orange', order: 5 },
        { key: 'stage_project_organizing_development_realisasi', label: 'Organizing Development', icon: Settings, description: 'Pengembangan organisasi program', color: 'teal', order: 6 },
        { key: 'stage_project_implementation_presentation_realisasi', label: 'Implementation Presentation', icon: Presentation, description: 'Presentasi implementasi', color: 'cyan', order: 7 },
        { key: 'stage_project_implementation_realisasi', label: 'Implementation', icon: Play, description: 'Pelaksanaan program', color: 'green', order: 8 },
        { key: 'stage_project_evaluation_monitoring_realisasi', label: 'Evaluation & Monitoring', icon: Target, description: 'Evaluasi dan monitoring', color: 'yellow', order: 9 },
        { key: 'stage_project_satisfaction_survey_realisasi', label: 'Satisfaction Survey', icon: CheckCircle2, description: 'Survey kepuasan', color: 'emerald', order: 10 },
        { key: 'stage_project_report_realisasi', label: 'Report', icon: FileText, description: 'Pembuatan laporan', color: 'amber', order: 11 },
        { key: 'stage_end_sustainability_realisasi', label: 'End & Sustainability', icon: Award, description: 'Keberlanjutan program', color: 'rose', order: 12 },
    ];

    const handleOpenClientModal = async () => {      
        if (!selectedProgram) {
            toast.error('No Program selected');
            return;
        }

        setClientLoading(true);

        try {
            const result = await clientService.getClientByProgramName(selectedProgram.program_name)

            if (result.success && result.data) {
                setSelectedClient(result.data)
                setIsClientModalOpen(true)
            } else {
                toast.error(result.message || 'Client not found for this program')    
            }

        } catch (error) {
            console.error('Error fetching client:', error);
            toast.error('Failed to load client details');
        } finally {
            setClientLoading(false);
        }
    };

    const handleCloseClienModal = () => {
        setIsClientModalOpen(false)
        setSelectedClient(null)
    }

    const handleStageClick = async (stageKey, currentValue) => {
        if (!selectedProgram?.id) return

        const newValue = currentValue >= 100 ? 0 : 100

        setUpdatingStage(stageKey)

        try {
            const result = await programService.updateStage(selectedProgram.id, stageKey, newValue)

            if (result.success) {
                if (onProgramUpdate) {
                    onProgramUpdate({
                        ...selectedProgram,
                        [stageKey]: newValue
                    })
                }

                toast.success(`Stage Updated to ${newValue}%`)
            } else {
                toast.error('Failed to update stage')
            }
        } catch (error) {
            console.error('Error updating stage: ', error)
            toast.error('Error updating stage')
        } finally {
            setUpdatingStage(null)
        }
    }

    const handleMarkAllCompleted = async () => {
        if (!selectedProgram?.id) return

        const updates = {}
        stageData.forEach(stage => {
            updates[stage.key] = 100
        })

        setUpdatingStage('all')

        try {
            const result = await programService.updateMultipleStages(selectedProgram.id, updates)

            if (result.success) {
                if (onProgramUpdate) {
                    onProgramUpdate({
                        ...selectedProgram,
                        ...updates
                    })
                }
                toast.success('All stages marked as completed')
            }
        } catch (error) {
            console.error('Error updating stages', error)
            toast.error('Failed to update stages')
        } finally {
            setUpdatingStage(null)
        }
    }

    const handleResetAll = async () => {
        if (!selectedProgram?.id) return

        const updates = {};
        stageData.forEach(stage => {
            updates[stage.key] = 0;
        });

        setUpdatingStage('all');

        try {
             const result = await programService.updateMultipleStages(selectedProgram.id, updates);

            if (result.success) {
                if (onProgramUpdate) {
                    onProgramUpdate({
                        ...selectedProgram,
                        ...updates
                    });
                }
                toast.success('All stages reset');
            }
        } catch (error) {
            console.error('Error updating stages:', error);
            toast.error('Failed to reset stages');
        } finally {
            setUpdatingStage(null);
        }
    }

    const detailFields = [
        {
            category: 'Program Information',
            icon: Building,
            fields: [
                { key: 'program_name', label: 'Program Name', icon: Building },
                { key: 'category', label: 'Category', icon: Building },
                { key: 'status', label: 'Status', icon: Building },
                { key: 'duration', label: 'Duration', icon: Calendar },
                { key: 'start_date', label: 'Start Date', icon: Calendar },
                { key: 'end_date', label: 'End Date', icon: Calendar },
                { key: 'description', label: 'Description', icon: Building },
                { key: 'client_info', label: 'Client/Partner Information', icon: Building, isClientButton: true },
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
                { key: 'instructors', label: 'Talents', icon: User, isArray: true },
                { key: 'tags', label: 'Tags', icon: User, isArray: true },
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
                isStage: true,
                order: stage.order
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

        const completedStages = stageValues.filter(v => v >= 100).length;
        const inProgressStages = stageValues.filter(v => v > 0 && v < 100).length;

        const sortedStages = [...stageData].sort((a, b) => a.order - b.order);

        return (
            <div className='space-y-6'>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className='text-lg font-semibold text-gray-800'>
                                Program Stages Progress
                            </h4>
                            <p>
                                {completedStages} of {stageData.length} stages completed • {inProgressStages} in progress
                            </p>
                        </div>
                        <span className='text-3xl font-bold text-blue-600'>
                            {totalProgress.toFixed(1)}%
                        </span>
                    </div>

                    <div className='w-full bg-gray-200 rounded-full h-3 mb-2'>
                        <div
                            style={{ width: `${totalProgress}%` }}
                            className='bg-blue-600 h-3 rounded-full transition-all duration-500'
                        />
                    </div>

                    <div className='flex justify-end gap-2 mt-4'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleMarkAllCompleted}
                            disabled={updatingStage === 'all'}
                            className='text-green-600 border-green-200 hover:bg-green-50'
                        >
                            {updatingStage === 'all' ? (
                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                            ) : (
                                <CheckCircle className='h-4 w-4 mr-2' />
                            )}
                            Mark All Completed
                        </Button>
                        <Button
                            variant="outline"
                            size='sm'
                            onClick={handleResetAll}
                            disabled={updatingStage === 'all'}
                            className='text-gray-600 border-gray-200 hover:bg-gray-50'
                        >
                            <RefreshCw />
                            Reset All
                        </Button>
                    </div>
                </div>

                <div className='grid grid-cols-3 gap-4'>
                    {sortedStages.map((stage) => {
                        const value = parseInt(selectedProgram[stage.key]) || 0
                        const StageIcon = stage.icon
                        const isCompleted = value >= 100
                        const isInProgress = value > 0 && value < 100
                        const isUpdating = updatingStage === stage.key

                        let statusColor = 'gray'
                        let statusBg = 'bg-gray-50'
                        let borderColor = 'border-gray-200'
                        let textColor = 'text-gray-600'
                        let iconBg = 'bg-gray-100'
                        let iconColor = 'text-gray-500'

                        if (isCompleted) {
                            statusColor = 'green'
                            statusBg = 'bg-green-50'
                            borderColor = 'border-green-200'
                            textColor = 'text-green-700'
                            iconBg = 'bg-green-100'
                            iconColor = 'text-green-600'
                        } else if (isInProgress) {
                            statusColor = 'yellow'
                            statusBg = 'bg-yellow-50'
                            borderColor = 'border-yellow-200'
                            textColor = 'text-yellow-700'
                            iconBg = 'bg-yellow-100'
                            iconColor = 'text-yellow-600'
                        }

                        return (
                            <div
                                key={stage.key}
                                className={`border rounded-lg p-4 ${statusBg} ${borderColor} hover:shadow-md transition-all cursor-pointer group`}
                                onClick={() => handleStageClick(stage.key, value)}
                            >
                                <div className='flex items-center justify-between mb-3'>
                                    <div className='flex items-center gap-3'>
                                        <div className={`p-2 rounded-lg ${iconBg} transition-colors group-hover:scale-110`}>
                                            <StageIcon className={`w-5 h-5 ${iconColor}`} />
                                        </div>
                                        <div>
                                            <h5 className='font-semibold text-gray-800'>
                                                {stage.label}
                                            </h5>
                                        </div>
                                    </div>

                                    {isUpdating ? (
                                        <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
                                    ) : (
                                        <span className={`text-sm font-bold ${textColor}`}>
                                            {value}%
                                        </span>
                                    )}
                                </div>

                                <div className='w-full bg-gray-200 rounded-full h-2 mb-3'>
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${
                                            isCompleted ? 'bg-green-500' :
                                            isInProgress ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>

                                
                            </div>
                        )
                    })}
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

                        if (field.isClientButton) {
                            return (
                                <div
                                    key={index}
                                    className='flex items-start gap-3 col-span-2'
                                >
                                    <FieldIcon className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />

                                    <div className='flex-1'>
                                        <label className='text-sm text-gray-500 block mb-2'>
                                            {field.label}
                                        </label>

                                        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='p-2 bg-blue-100 rounded-lg'>
                                                        <Building className='h-5 w-5 text-blue-600' />
                                                    </div>

                                                    <div>
                                                        <h4 className='font-semibold text-gray-800'>
                                                            {selectedProgram.nama_perusahaan || selectedProgram.client || 'Client Name'}
                                                        </h4>
                                                        <p className='text-xs text-gray-500 mt-0.5'>
                                                            {selectedProgram.partner_pic_name || 'No PIC assigned'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='flex gap-2'>
                                                    <button
                                                        onClick={handleOpenClientModal}
                                                        disabled={clientLoading}
                                                        className='group relative inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
                                                        title='Click to view complete client details'
                                                    >
                                                        {clientLoading ? (
                                                            <>
                                                                <Loader2 className='h-4 w-4 animate-spin' />
                                                                <span>Loading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Info className='h-4 w-4 group-hover:scale-110 transition-transform' />
                                                                <span>View Client/Partner Details</span>
                                                                <ExternalLink className='w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

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

            <ClientDetailModal
                isOpen={isClientModalOpen}
                onClose={handleCloseClienModal}
                client={selectedClient}
                loading={clientLoading}
            />
        </Card>
    );
};

export default ProgramContent;