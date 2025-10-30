import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus, Users, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import ClientContent from "../components/Content/ClientContent";
import { toast } from 'react-hot-toast';
import AddClient from "../components/AddButton/AddClient";
import { useClients } from '../hooks/useClients';

const ProgramClient = () => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

    const {
        members,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        fetchClients,
        addClient,
        updateClient,
        deleteClient
    } = useClients();

    const handleAddClient = () => {
        setIsAddClientModalOpen(true);
    };

    const handleOpenEditModal = (client) => {
        setEditingClient(client);
        setIsEditModalOpen(true);
    };

    const handleEditClient = async (clientId, clientData) => {
        try {
            await updateClient(clientId, clientData);
            setIsEditModalOpen(false);
            setEditingClient(null);
            toast.success('Client updated successfully');
        } catch {
            // 
        }
    };

    const handleAddNewClient = async (clientData) => {
        try {
            await addClient(clientData);
            setIsAddClientModalOpen(false);
            toast.success('Client added successfully');
        } catch {
            // 
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!selectedMember) return;

        if (!window.confirm(`Are you sure you want to delete ${selectedMember.full_name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteClient(clientId);
            setSelectedMember(null);
            toast.success('Client deleted successfully');
        } catch {
            // 
        }
    };

    const handleRefresh = () => {
        fetchClients(pagination.page);
    };

    const handleSearch = (searchTerm) => {
        setFilters({ ...filters, search: searchTerm });
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchClients(page);
    };

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Company', 'Program Name', 'Status', 'Action'],
        title: "Client Management",
        addButton: "Add Client",
        detailTitle: "Client Details"
    };

    const formattedMembers = members.map((client, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
        
        return {
            id: client.id,
            no: itemNumber,
            fullName: client.full_name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            industry: client.industry,
            programName: client.program_name,
            status: client.status,
            action: 'Detail',
            ...client
        };
    });

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>

                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading clients...</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load clients</h3>
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
                                    onClick={handleAddClient} 
                                    className='flex items-center gap-2'
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton data={formattedMembers} />
                            </div>
                        </div>

                        {loading && members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading clients...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">No clients found</h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {filters.search || Object.values(filters).some(f => f) 
                                            ? "Try adjusting your search or filters to find what you're looking for."
                                            : "Get started by adding your first client to the system."
                                        }
                                    </p>
                                </div>
                                <Button 
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    onClick={handleAddClient}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Your First Client
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
                                        members={formattedMembers}
                                        onSelectMember={setSelectedMember}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        Showing <span className="font-semibold">{formattedMembers.length}</span> of{' '}
                                        <span className="font-semibold">{pagination.total}</span> clients
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

                <ClientContent
                    selectedMember={selectedMember}
                    onOpenEditModal={handleOpenEditModal}
                    onDelete={handleDeleteClient}
                    detailTitle={tableConfig.detailTitle}
                    onClientUpdated={() => fetchClients(pagination.page)}
                    onClientDeleted={() => {
                        fetchClients(pagination.page);
                        setSelectedMember(null);
                    }}
                />

                {/* Add/Edit Client Modal */}
                <AddClient 
                    isAddUserModalOpen={isAddClientModalOpen || isEditModalOpen}
                    setIsAddUserModalOpen={(open) => {
                        if (!open) {
                            setIsAddClientModalOpen(false);
                            setIsEditModalOpen(false);
                            setEditingClient(null);
                        }
                    }}
                    onAddClient={handleAddNewClient}
                    editData={editingClient}
                    onEditClient={handleEditClient}
                />
            </div>
        </div>
    );
};

export default ProgramClient;