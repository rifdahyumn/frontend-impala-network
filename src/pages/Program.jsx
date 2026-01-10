import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Users, RefreshCw, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useCallback, useRef } from 'react';
import toast from "react-hot-toast";
import { usePrograms } from "../hooks/usePrograms";
import AddProgram from "../components/AddButton/AddProgram";
import ProgramContent from "../components/Content/ProgramClient";

import ProgramFilters from '../components/Program/ProgramFilters';
import ProgramExport from '../components/Program/ProgramExport';
import ProgramImportModal from '../components/Program/ProgramImportModal';
import ProgramTable from '../components/Program/ProgramTable';
import { formatInstructorsForExport, formatTagsForExport } from '../components/Program/ProgramHelper';
import { getDisplayStatus, updateExpiredPrograms } from '../components/Program/ProgramStatus';
import ConfirmModal from "../components/Content/ConfirmModal";

const Program = () => {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    
    const [highlightDetail, setHighlightDetail] = useState(false);
    const programDetailRef = useRef(null);
    
    const { programs, loading, error, pagination, filters, showAllOnSearch, updateFiltersAndFetch, searchPrograms,
        toggleShowAllOnSearch, clearFilters, clearSearch, isShowAllMode, resetToPaginationMode, fetchPrograms: hookFetchPrograms,
        addProgram, updateProgram, deleteProgram, refreshData, isImporting, importProgress, importResult,
        importFromFile, downloadImportTemplate, parseExcelFile, resetImport, showConfirm, handleConfirm, handleCancel,
        isOpen: isConfirmOpen, config: confirmConfig } = usePrograms();

    const [searchTerm, setSearchTerm] = useState("");
    const [availableCategories, setAvailableCategories] = useState([]);

    const handleSelectProgram = useCallback((program) => {
        setSelectedProgram(program);
        setHighlightDetail(true);
        
        setTimeout(() => {
            if (programDetailRef.current) {
                programDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                programDetailRef.current.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150);
    }, []);

    const handleAddProgram = () => {
        setIsAddProgramModalOpen(true);
    };

    const handleOpenEditModal = (program) => {
        setEditingProgram(program);
        setIsEditModalOpen(true);
    };

    const handleEditProgram = async (programId, programData) => {
        try {
            const updatedProgram = await updateProgram(programId, programData)

            if (selectedProgram && selectedProgram.id === programId) {
                setSelectedProgram(prev => ({
                    ...prev,
                    ...programData,
                    ...updatedProgram
                }))
            }

            setIsEditModalOpen(false)
            setEditingProgram(null)
            toast.success('Program Updated successfully')
        } catch (error) {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update program')
        }
    };

    const handleAddNewProgram = async (programData) => {
        try {
            await addProgram(programData);
            setIsAddProgramModalOpen(false);
            toast.success('Program added successfully');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error adding program:', error);
            toast.error(error.message || 'Failed to add program');
        }
    };

    const handleDeleteProgram = async (programId) => {
        if (!selectedProgram) return;

        if (showConfirm && typeof showConfirm === 'function') {
            showConfirm({
                title: 'Delete Program',
                message: `Are you sure you want to delete "${selectedProgram.program_name}"? This action cannot be undone.`,
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    try {
                        await deleteProgram(programId);
                        setSelectedProgram(null);
                        toast.success('Program deleted successfully');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                        console.error('Error deleting program:', error);
                        toast.error(error.message || 'Failed to delete program');
                    }
                },
                onCancel: () => {
                    toast('Deletion cancelled', { icon: AlertTriangle });
                }
            })
        }
    };

    const handleRefresh = () => {
        refreshData();
        setSearchTerm("");
        clearFilters();
        setSelectedProgram(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearAllFilters = useCallback(() => {
        setSearchTerm("");
        clearFilters();
        setSelectedProgram(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [clearFilters]);

    useEffect(() => {
        if (selectedProgram && programs.length > 0) {
            const currentSelected = programs.find(program => program.id === selectedProgram.id)
            if (currentSelected) {
                setSelectedProgram(currentSelected)
            } else {
                setSelectedProgram(null);
            }
        }
    }, [programs, selectedProgram?.id])

    useEffect(() => {
        if (programs.length > 0) {
            const allCategories = programs
                .map(program => program.category)
                .filter(category => category && category.trim() !== "");
            
            const uniqueCategories = [...new Set(allCategories)].sort();
            
            const formattedCategories = uniqueCategories.map(category => ({
                value: category.toLowerCase(),
                label: `${category}`,
                original: category
            }));
            
            setAvailableCategories(formattedCategories);
        }
    }, [programs]);

    useEffect(() => {
        updateExpiredPrograms(programs, updateProgram);
    }, [programs, updateProgram]);

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                
                {isImporting && (
                    <div className="mb-6 bg-white rounded-lg shadow-md border border-blue-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                <span className="font-medium text-blue-700">Importing Programs...</span>
                            </div>
                            <span className="text-sm font-medium text-blue-600">{importProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${importProgress}%` }}
                            />
                        </div>
                        {importResult && importResult.successful > 0 && (
                            <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {importResult.successful} programs imported successfully
                            </div>
                        )}
                    </div>
                )}

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>Program Management</CardTitle>
                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading programs...</span>
                            </div>
                        )}
                    </CardHeader>
                    
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load programs</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefresh}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

                        <ProgramFilters
                            filters={filters}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            showAllOnSearch={showAllOnSearch}
                            isShowAllMode={isShowAllMode}
                            availableCategories={availableCategories}
                            handleSearch={searchPrograms}
                            handleToggleShowAll={toggleShowAllOnSearch}
                            handleResetToPagination={resetToPaginationMode}
                            updateFiltersAndFetch={updateFiltersAndFetch}
                            clearFilters={clearFilters}
                            clearSearch={clearSearch}
                            handleAddProgram={handleAddProgram}
                            handleOpenImportModal={() => setIsImportModalOpen(true)}
                            handleDownloadTemplate={downloadImportTemplate}
                            loading={loading}
                            isImporting={isImporting}
                            programs={programs}
                            exportComponent={
                                <ProgramExport
                                    disabled={isImporting}
                                    formatInstructorsForExport={formatInstructorsForExport}
                                    formatTagsForExport={formatTagsForExport}
                                />
                            }
                        />

                        <ProgramTable
                            programs={programs}
                            pagination={pagination}
                            loading={loading}
                            isImporting={isImporting}
                            isShowAllMode={isShowAllMode}
                            handleSelectProgram={handleSelectProgram}
                            handlePageChange={hookFetchPrograms}
                            handleClearAllFilters={handleClearAllFilters}
                            filters={filters}
                            availableCategories={availableCategories}
                            getDisplayStatus={getDisplayStatus}
                        />

                    </CardContent>
                </Card>

                <div 
                    ref={programDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <ProgramContent
                        selectedProgram={selectedProgram}
                        onOpenEditModal={handleOpenEditModal}
                        onEdit={handleEditProgram}
                        onDelete={handleDeleteProgram}
                        detailTitle="Program Details"
                        showConfirm={showConfirm}
                        onClientUpdated={() => hookFetchPrograms(pagination.page)}
                        onClientDeleted={() => {
                            hookFetchPrograms(pagination.page);
                            setSelectedProgram(null);
                        }}
                    />
                </div>

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    config={confirmConfig}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />

                <AddProgram
                    isAddProgramModalOpen={isAddProgramModalOpen || isEditModalOpen}
                    setIsAddProgramModalOpen={(open) => {
                        if (!open) {
                            setIsAddProgramModalOpen(false)
                            setIsEditModalOpen(false)
                            setEditingProgram(null)
                        }
                    }}
                    onAddProgram={handleAddNewProgram}
                    editData={editingProgram}
                    onEditProgram={handleEditProgram}
                />

                <ProgramImportModal
                    isImportModalOpen={isImportModalOpen}
                    setIsImportModalOpen={setIsImportModalOpen}
                    importFile={importFile}
                    setImportFile={setImportFile}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                    isImporting={isImporting}
                    importProgress={importProgress}
                    parseExcelFile={parseExcelFile}
                    handleImportExcel={importFromFile}
                    resetImport={resetImport}
                    fileInputRef={fileInputRef}
                    dropZoneRef={dropZoneRef}
                />

            </div>
        </div>
    )
}

export default Program;