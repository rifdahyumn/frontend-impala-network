import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus, Users, RefreshCw, Briefcase, Filter, X } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import ClientContent from "../components/Content/ClientContent";
import { toast } from 'react-hot-toast';
import AddClient from "../components/AddButton/AddClient";
import { useClients } from '../hooks/useClients';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "../components/ui/dropdown-menu";

const ProgramClient = () => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    
    // STATE UNTUK SEARCH & FILTER
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        status: null, // 'active', 'inactive', atau null
        businessType: null, // business type atau null
    });
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [availableBusinessTypes, setAvailableBusinessTypes] = useState([]);

    const {
        members,
        loading,
        error,
        pagination,
        handlePageChange,
        fetchClients,
        addClient,
        updateClient,
        deleteClient
    } = useClients();

    // FUNGSI UNTUK MENGAMBIL BUSINESS TYPES YANG UNIK
    const extractBusinessTypes = useMemo(() => {
        return (clients) => {
            const types = new Set();
            clients.forEach(client => {
                if (client.business) {
                    // Jika business adalah string, tambahkan langsung
                    if (typeof client.business === 'string') {
                        const cleanType = client.business.trim();
                        if (cleanType) {
                            types.add(cleanType);
                        }
                    }
                    // Jika business adalah array (multiple types)
                    else if (Array.isArray(client.business)) {
                        client.business.forEach(type => {
                            if (type && typeof type === 'string') {
                                const cleanType = type.trim();
                                if (cleanType) {
                                    types.add(cleanType);
                                }
                            }
                        });
                    }
                }
            });
            
            // Konversi ke array dan urutkan
            return Array.from(types).sort();
        };
    }, []);

    // STATUS OPTIONS
    const statusOptions = [
        { value: 'active', label: '🟢 Active', color: 'text-green-600 bg-green-50' },
        { value: 'inactive', label: '🔴 Inactive', color: 'text-red-600 bg-red-50' },
    ];

    // FUNGSI UNTUK APPLY SEMUA FILTER
    const applyAllFilters = () => {
        let result = [...members];
        
        // 1. Apply Search
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(client =>
                (client.full_name?.toLowerCase().includes(searchLower)) ||
                (client.email?.toLowerCase().includes(searchLower)) ||
                (client.company?.toLowerCase().includes(searchLower)) ||
                (client.program_name?.toLowerCase().includes(searchLower)) ||
                (client.business?.toLowerCase().includes(searchLower))
            );
        }
        
        // 2. Apply Status Filter
        if (activeFilters.status) {
            result = result.filter(client => {
                const clientStatus = client.status?.toLowerCase();
                return activeFilters.status === 'all' || clientStatus === activeFilters.status;
            });
        }
        
        // 3. Apply Business Type Filter
        if (activeFilters.businessType && activeFilters.businessType !== 'all') {
            result = result.filter(client => {
                const clientBusiness = client.business;
                if (!clientBusiness) return false;
                
                // Jika business adalah string
                if (typeof clientBusiness === 'string') {
                    return clientBusiness.toLowerCase() === activeFilters.businessType.toLowerCase();
                }
                
                // Jika business adalah array
                if (Array.isArray(clientBusiness)) {
                    return clientBusiness.some(business => 
                        business?.toLowerCase() === activeFilters.businessType.toLowerCase()
                    );
                }
                
                return false;
            });
        }
        
        setFilteredMembers(result);
    };

    // HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // HANDLE STATUS FILTER CHANGE
    const handleStatusFilterChange = (status) => {
        setActiveFilters(prev => ({
            ...prev,
            status: prev.status === status ? null : status
        }));
    };

    // HANDLE BUSINESS TYPE FILTER CHANGE
    const handleBusinessTypeFilterChange = (businessType) => {
        setActiveFilters(prev => ({
            ...prev,
            businessType: prev.businessType === businessType ? null : businessType
        }));
    };

    // CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setActiveFilters({
            status: null,
            businessType: null,
        });
    };

    // CLEAR SPECIFIC FILTER
    const clearFilter = (filterType) => {
        if (filterType === 'status') {
            setActiveFilters(prev => ({ ...prev, status: null }));
        } else if (filterType === 'businessType') {
            setActiveFilters(prev => ({ ...prev, businessType: null }));
        } else if (filterType === 'search') {
            setSearchTerm("");
        }
    };

    // INITIALIZE BUSINESS TYPES
    useEffect(() => {
        if (members.length > 0) {
            const extractedTypes = extractBusinessTypes(members);
            setAvailableBusinessTypes(extractedTypes);
        }
    }, [members, extractBusinessTypes]);

    // APPLY FILTERS SETIAP KALI ADA PERUBAHAN
    useEffect(() => {
        if (members.length > 0) {
            applyAllFilters();
        }
    }, [searchTerm, activeFilters, members]);

    const handleAddClient = () => {
        setIsAddClientModalOpen(true);
    };

    const handleOpenEditModal = (client) => {
        setEditingClient(client);
        setIsEditModalOpen(true);
    };

    const handleEditClient = async (clientId, clientData) => {
        try {
            const updatedClient = await updateClient(clientId, clientData);

            if (selectedMember && selectedMember.id === clientId) {
                setSelectedMember(prev => ({
                    ...prev,
                    ...clientData,
                    ...updatedClient
                }));
            }

            setIsEditModalOpen(false);
            setEditingClient(null);
            toast.success('Client Updated successfully');
        } catch {
            console.error('Error updating', error);
            toast.error(error.message || 'Failed to update client');
        }
    };

    const handleAddNewClient = async (clientData) => {
        try {
            await addClient(clientData);
            setIsAddClientModalOpen(false);
            toast.success('Client added successfully');
            fetchClients(pagination.page);
        } catch {
            // 
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!selectedMember) return;

        if (!window.confirm(`Are you sure want to delete ${selectedMember.full_name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteClient(clientId);
            setSelectedMember(null);
            fetchClients(pagination.page);
        } catch {
            // 
        }
    };

    useEffect(() => {
        if (selectedMember && members.length > 0) {
            const currentSelected = members.find(member => member.id === selectedMember.id);
            if (currentSelected) {
                setSelectedMember(currentSelected);
            }
        }
    }, [members, selectedMember?.id]);

    // GET ACTIVE FILTERS COUNT - HANYA STATUS DAN BUSINESS TYPE
    const getActiveFiltersCount = () => {
        let count = 0;
        // TIDAK MENGHITUNG SEARCH TERM
        if (activeFilters.status) count++;
        if (activeFilters.businessType) count++;
        return count;
    };

    // GET TOTAL ACTIVE CRITERIA (SEARCH + FILTERS) UNTUK DISPLAY
    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.status) count++;
        if (activeFilters.businessType) count++;
        return count;
    };

    // GET BUSINESS TYPE DISPLAY NAME
    const getBusinessDisplayName = (businessValue) => {
        if (!businessValue) return '-';
        
        if (typeof businessValue === 'string') {
            return businessValue;
        }
        
        if (Array.isArray(businessValue)) {
            return businessValue.join(', ');
        }
        
        return String(businessValue);
    };

    const formattedMembers = filteredMembers.map((client, index) => {
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
            business: getBusinessDisplayName(client.business),
            programName: client.program_name,
            status: client.status,
            action: 'Detail',
            ...client
        };
    });

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Company', 'Business Type', 'Program Name', 'Status', 'Action'],
        title: "Client Management",
        addButton: "Add Client",
        detailTitle: "Client Details"
    };

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

                        {/* SEARCH & FILTER SECTION */}
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search..."
                                    value={searchTerm}
                                />
                                
                                {/* FILTER DROPDOWN - HANYA AKTIF JIKA ADA STATUS/BUSINESS TYPE FILTER */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                                            className={`flex items-center gap-2 transition-all duration-200 ${
                                                getActiveFiltersCount() > 0 
                                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                                    : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                                            }`}
                                        >
                                            <Filter className={`h-4 w-4 ${
                                                getActiveFiltersCount() > 0 ? "text-white" : "text-gray-500"
                                            }`} />
                                            Filter
                                            {getActiveFiltersCount() > 0 && (
                                                <span className="ml-1 bg-white text-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                                    {getActiveFiltersCount()}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 shadow-lg border border-gray-200">
                                        <DropdownMenuLabel className="text-gray-700 font-semibold">Filter Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        {/* STATUS FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Status
                                            </DropdownMenuLabel>
                                            {statusOptions.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={activeFilters.status === option.value}
                                                    onCheckedChange={() => handleStatusFilterChange(option.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* BUSINESS TYPE FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Business Type
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                {/* ALL BUSINESS TYPES OPTION */}
                                                <DropdownMenuCheckboxItem
                                                    checked={activeFilters.businessType === 'all'}
                                                    onCheckedChange={() => handleBusinessTypeFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    📊 All Business Types
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableBusinessTypes.map((type) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={type}
                                                        checked={activeFilters.businessType?.toLowerCase() === type.toLowerCase()}
                                                        onCheckedChange={() => handleBusinessTypeFilterChange(type)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        <span className="mr-2">🏢</span>
                                                        {type}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CLEAR FILTERS - HANYA CLEAR STATUS & BUSINESS TYPE */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setActiveFilters({
                                                    status: null,
                                                    businessType: null,
                                                });
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-medium"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                        
                        {/* ACTIVE FILTERS BADGES - TAMPILKAN JIKA ADA SEARCH ATAU FILTER */}
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {/* SEARCH BADGE */}
                                {searchTerm && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>🔍 "{searchTerm}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* STATUS FILTER BADGE */}
                                {activeFilters.status && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {activeFilters.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                                        <button 
                                            onClick={() => clearFilter('status')}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* BUSINESS TYPE FILTER BADGE */}
                                {activeFilters.businessType && activeFilters.businessType !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        {activeFilters.businessType}
                                        <button 
                                            onClick={() => clearFilter('businessType')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* ALL BUSINESS TYPES BADGE */}
                                {activeFilters.businessType === 'all' && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        All Business Types
                                        <button 
                                            onClick={() => clearFilter('businessType')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* CLEAR ALL - CLEARS BOTH SEARCH AND FILTERS */}
                                <Button 
                                    variant="ghost" 
                                    onClick={clearAllFilters}
                                    className="text-sm h-8"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {loading && members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading clients...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No clients found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {getTotalActiveCriteria() > 0 
                                            ? "No clients match your current filters. Try adjusting your criteria."
                                            : "Get started by adding your first client to the system."
                                        }
                                    </p>
                                </div>
                                {getTotalActiveCriteria() > 0 ? (
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={clearAllFilters}
                                        variant="outline"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={handleAddClient}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Your First Client
                                    </Button>
                                )}
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
                                    {/* SHOWING RESULTS */}
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredMembers.length} of {members.length} clients
                                        {getTotalActiveCriteria() > 0 && " (filtered)"}
                                    </div>
                                    
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