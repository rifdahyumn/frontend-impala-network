import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, X, Loader2, Users } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import ProgramContent from "../components/Content/ProgramClient";
import toast from "react-hot-toast";
import { usePrograms } from "../hooks/usePrograms";
import AddProgram from "../components/AddButton/AddProgram";

const Program = () => {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { programs, loading, error, pagination, filters, setFilters, fetchProgram, addProgram, updateProgram, deleteProgram } = usePrograms();

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
        } catch {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update program' )
        }
    };

    const handleAddNewProgram = async (programData) => {
        try {
            await addProgram(programData);
            setIsAddProgramModalOpen(false);
            toast.success('Program added successfully');
        } catch {
            // 
        }
    };

    const handleDeleteProgram = async (programId) => {
        if (!selectedProgram) return;

        if (!window.confirm(`Are you sure you want to delete ${selectedProgram.program_name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteProgram(programId);
            setSelectedProgram(null);
        } catch {
            // 
        }
    };

    useEffect(() => {
        if (selectedProgram && programs.length > 0) {
            const currentSelected = programs.find(member => member.id === selectedProgram.id)
            if (currentSelected) {
                setSelectedProgram(currentSelected)
            }
        }
    }, [programs, selectedProgram?.id])

    const handleRefresh = () => {
        fetchProgram(pagination.page);
    };

    const handleSearch = (searchTerm) => {
        setFilters({ ...filters, search: searchTerm });
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchProgram(page);
    };
    
    const tableConfig = {
        headers: ['No', 'Program Name', 'Client', 'Category', 'Status', 'Duration', 'Price', 'Action'],
        title: "Program Management",
        addButton: "Add Program",
        detailTitle: "Program Details"
    };

    const formattedPrograms = programs.map((program, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
        
        return {
            id: program.id,
            no: itemNumber,
            program_name: program.program_name,
            category: program.category,
            status: program.status,
            duration: program.duration,
            start_date: program.start_date,
            end_date: program.end_date,
            price: program.price,
            action: 'Detail',
            ...program
        };
    });

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>
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

                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2'>
                                <SearchBar onSearch={handleSearch} />
                                <FilterDropdown onFilterChange={handleFilterChange} />
                                <FilterButton />
                            </div>

                            <div className='flex gap-2'>
                                <Button 
                                    className='flex items-center gap-2'
                                    onClick={handleAddProgram}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton />
                            </div>
                        </div>

                        {loading && programs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading program...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : programs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">No program found</h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {filters.search || Object.values(filters).some(f => f) 
                                            ? "Try adjusting your search or filters to find what you're looking for."
                                            : "Get started by adding your first program to the system."
                                        }
                                    </p>
                                </div>
                                <Button 
                                    className="flex items-center gap-2"
                                    onClick={handleAddProgram}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Your First Program
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    {loading && (
                                        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-gray-600">Updating data...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <MemberTable
                                        members={formattedPrograms}
                                        onSelectMember={setSelectedProgram}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        Showing <span className="font-semibold">{formattedPrograms.length}</span> of{' '}
                                        <span className="font-semibold">
                                            {pagination.total > 0 ? pagination.total : formattedPrograms.length}
                                        </span> program
                                    </div>
                                    
                                    <Pagination 
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        onPageChange={handlePageChange}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <ProgramContent
                    selectedProgram={selectedProgram}
                    onOpenEditModal={handleOpenEditModal}
                    onEdit={handleEditProgram}
                    onDelete={handleDeleteProgram}
                    detailTitle={tableConfig.detailTitle}
                    onClientUpdated={() => fetchProgram(pagination.page)}
                    onClientDeleted={() => {
                        fetchProgram(pagination.page);
                        setSelectedProgram(null);
                    }}
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
            </div>
        </div>
    )
}

export default Program;