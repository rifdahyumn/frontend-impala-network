import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';
import Header from "../components/Layout/Header";

import { useProgramClient } from '../components/Client/useProgramClient';
import FiltersSection from '../components/Client/components/FilterSection';
import ActionButtons from '../components/Client/components/ActionButtons';
import StatusDisplay from '../components/Client/components/StatusDisplay';
import ActiveFilters from '../components/Client/components/ActiveFilters';
import EmptyState from '../components/Client/components/EmptyState';
import LoadingState from '../components/Client/components/LoadingState';
import ErrorDisplay from '../components/Client/components/ErrorDisplay';
import ImportModal from '../components/Client/components/ImportModal';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ClientContent from "../components/Content/ClientContent";
import AddClient from "../components/AddButton/AddClient";

const ProgramClient = () => {
    const {
        selectedMember,
        localFilters,
        loading,
        error,
        members,
        pagination,
        isInShowAllMode,
        getTotalActiveCriteria,
        getActiveFiltersCount,
        availableBusinessTypes,
        formattedMembers,
        tableConfig,
        
        clientDetailRef,
        highlightDetail,
        
        isAddClientModalOpen,
        setIsAddClientModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        editingClient,
        setEditingClient,
        isImportModalOpen,
        setIsImportModalOpen,
        importFile,
        validationErrors,
        isDragging,
        fileInputRef,
        dropZoneRef,
        isImporting,
        isExporting,
        
        handleSelectMember,
        handleSearch,
        handleStatusFilterChange,
        handleBusinessTypeFilterChange,
        clearFilter,
        clearAllFilters,
        handleToggleShowAll,
        handleResetToPagination,
        handleAddClient,
        handleOpenEditModal,
        handleDeleteClient,
        handleRefreshWithReset,
        handlePageChange,
        handleExport,
        handleOpenImportModal,
        handleImportExcel,
        handleDownloadTemplate,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        handleFileUpload,
        handleTriggerFileInput,
        handleRemoveFile,
        getBusinessTypeLabel,
        getStatusLabel,
        showAllOnSearch,
        statusOptions,
        addClient,
        updateClient,
        updateClientStatus,
        fetchClients,
        refreshData
    } = useProgramClient();

    console.log('Program Client - Search debug:', {
        searchValue: localFilters.search,
        showAllOnSearch: showAllOnSearch,
        membersCount: members.length,
        pagination: pagination,
        loading: loading,
        isInShowAllMode: isInShowAllMode
    })

    useEffect(() => {
        console.log('localFilters updated:', localFilters)
    }, [localFilters])

    useEffect(() => {
        console.log('Members updated:', members.length, 'items')
    })

    const handleAddNewClient = async (clientData) => {
        try {
            if (!clientData.full_name || !clientData.email) {
                toast.error('Full name and email are required');
                return;
            }
            
            const clientWithTimestamps = {
                ...clientData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: clientData.status || 'active'
            };
            
            await addClient(clientWithTimestamps);
            setIsAddClientModalOpen(false);
            
            toast.success(`Client "${clientData.full_name}" added successfully`);
            
            await fetchClients(pagination.page, localFilters, showAllOnSearch);
            
            setEditingClient(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        
        } catch (error) {
            console.error('Error adding client:', error);
            
            if (error.message.includes('already exists')) {
                toast.error('A client with this email already exists');
            } else if (error.message.includes('validation')) {
                toast.error('Please check your input data');
            } else {
                toast.error(error.message || 'Failed to add client. Please try again.');
            }
        }
    };

    const handleEditClient = async (clientId, clientData) => {
        try {
            if (!clientData.full_name || !clientData.email) {
                toast.error('Full name and email are required');
                return;
            }
            
            const clientWithTimestamps = {
                ...clientData,
                updated_at: new Date().toISOString()
            };
            
            const updatedClient = await updateClient(clientId, clientWithTimestamps);

            if (selectedMember && selectedMember.id === clientId) {
                handleSelectMember({
                    ...selectedMember,
                    ...clientData,
                    ...updatedClient
                });
            }

            setIsEditModalOpen(false);
            setEditingClient(null);
            
            toast.success(`Client "${clientData.full_name}" updated successfully`);
            await fetchClients(pagination.page, localFilters, showAllOnSearch);
    
            if (selectedMember && selectedMember.id !== clientId) {
                toast.success('Client information has been updated');
            }
        
        } catch (error) {
            console.error('Error updating client:', error);
            
            if (error.message.includes('not found')) {
                toast.error('Client not found. It may have been deleted.');
            } else if (error.message.includes('validation')) {
                toast.error('Please check your input data');
            } else if (error.message.includes('email already exists')) {
                toast.error('This email is already used by another client');
            } else {
                toast.error(error.message || 'Failed to update client. Please try again.');
            }
            
            await refreshData();
        }
    };

    const handleStatusChange = async (clientId, newStatus) => {
        try {
            if (!clientId || !newStatus) {
                console.error('Invalid parameters');
                return;
            }
            
            const statusToUpdate = newStatus === 'active' ? 'Active' : 'Inactive';
            
            await updateClientStatus(clientId, statusToUpdate);

            setTimeout(() => {
                fetchClients(pagination.page, localFilters, showAllOnSearch);
            }, 500);
            
        } catch (error) {
            console.error('[ProgramClient] Status change error:', error);

            try {
                await fetchClients(pagination.page, localFilters, showAllOnSearch);
            } catch (refreshError) {
                console.error('Failed to refresh data:', refreshError);
            }
        }
    };

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6 max-w-none'>
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
                            <ErrorDisplay 
                                error={error} 
                                onRetry={handleRefreshWithReset} 
                            />
                        )}
                        <div className='flex justify-between'>
                            <FiltersSection
                                localFilters={localFilters}
                                showAllOnSearch={showAllOnSearch}
                                isInShowAllMode={isInShowAllMode}
                                onSearch={handleSearch}
                                onToggleShowAll={handleToggleShowAll}
                                onResetToPagination={handleResetToPagination}
                                onStatusFilterChange={handleStatusFilterChange}
                                onBusinessTypeFilterChange={handleBusinessTypeFilterChange}
                                availableBusinessTypes={availableBusinessTypes}
                                statusOptions={statusOptions}
                                getActiveFiltersCount={getActiveFiltersCount}
                            />

                            <ActionButtons
                                onAddClient={handleAddClient}
                                onImport={handleOpenImportModal}
                                onExport={handleExport}
                                members={members}
                                loading={loading}
                                isExporting={isExporting}
                                isInShowAllMode={isInShowAllMode}
                                onDownloadTemplate={handleDownloadTemplate}
                                tableConfig={tableConfig}
                            />
                        </div>
                        

                        {isInShowAllMode && (
                            <StatusDisplay
                                searchTerm={localFilters.search}
                                onResetToPagination={handleResetToPagination}
                            />
                        )}

                        {getTotalActiveCriteria() > 0 && (
                            <ActiveFilters
                                localFilters={localFilters}
                                onClearFilter={clearFilter}
                                onClearAll={clearAllFilters}
                                getBusinessTypeLabel={getBusinessTypeLabel}
                                getStatusLabel={getStatusLabel}
                            />
                        )}

                        {loading && members.length === 0 ? (
                            <LoadingState />
                        ) : members.length === 0 ? (
                            <EmptyState
                                hasFilters={getTotalActiveCriteria() > 0}
                                onClearFilters={clearAllFilters}
                                onAddClient={handleAddClient}
                            />
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
                                        onSelectMember={handleSelectMember}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        itemsPerPage={pagination.limit}
                                        onPageChange={handlePageChange}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div 
                    ref={clientDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <ClientContent
                        selectedMember={selectedMember}
                        onOpenEditModal={handleOpenEditModal}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteClient}
                        detailTitle={tableConfig.detailTitle}
                        onClientUpdated={() => fetchClients(pagination.page, localFilters, showAllOnSearch)}
                        onClientDeleted={() => {
                            fetchClients(pagination.page, localFilters, showAllOnSearch);
                            
                        }}
                    />
                </div>

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
                    onClose={() => {
                        setIsAddClientModalOpen(false);
                        setIsEditModalOpen(false);
                        setEditingClient(null);
                    }}
                />

                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    importFile={importFile}
                    validationErrors={validationErrors}
                    isDragging={isDragging}
                    isImporting={isImporting}
                    fileInputRef={fileInputRef}
                    dropZoneRef={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onFileUpload={handleFileUpload}
                    onTriggerFileInput={handleTriggerFileInput}
                    onRemoveFile={handleRemoveFile}
                    onImport={handleImportExcel}
                />
            </div>
        </div>
    );
};

export default ProgramClient;