import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from "../components/SearchFilter/SearchBar";
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from "../components/MemberTable/MemberTable";
import Pagination from "../components/Pagination/Pagination";
import FilterButton from "../components/SearchFilter/Filter";
import { Loader2, Plus, Users, UserCheck, AlertCircle, Tag, X, Building2 } from "lucide-react"
import { Button } from "../components/ui/button"
import AddMember from "../components/AddButton/AddMemberSemarang";
import HeteroContent from "../components/Content/HeteroSemarangContent";
import { useHeteroSemarang } from "../hooks/useHeteroSemarang";
import toast from "react-hot-toast";
import MemberStatsCards from "../MemberHetero/MemberStatsCard";

const HeteroSemarang = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [editingMember, setEditingMember] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    
    // STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [filteredMembers, setFilteredMembers] = useState([]);

    const { members, loading, error, pagination, filters, setFilters, fetchMembers, addMemberHeteroSemarang, updateMemberHeteroSemarang, deleteMemberHeteroSemarang } = useHeteroSemarang()

    // DAFTAR SPACE FIXED SESUAI PERMINTAAN
    const allSpaceOptions = [
        { value: "maneka personal", label: "🏠 Maneka Personal", original: "Maneka Personal" },
        { value: "maneka group", label: "👥 Maneka Group", original: "Maneka Group" },
        { value: "rembug 1", label: "🗣️ Rembug 1", original: "Rembug 1" },
        { value: "rembug 2", label: "🗣️ Rembug 2", original: "Rembug 2" },
        { value: "rembug 3", label: "🗣️ Rembug 3", original: "Rembug 3" },
        { value: "private office 1-3", label: "🚪 Private Office 1-3", original: "Private Office 1-3" },
        { value: "private office 4&5", label: "🚪 Private Office 4&5", original: "Private Office 4&5" },
        { value: "private office 6", label: "🚪 Private Office 6", original: "Private Office 6" },
        { value: "space gatra", label: "🏛️ Space Gatra", original: "Space Gatra" },
        { value: "space maneka", label: "🏛️ Space Maneka", original: "Space Maneka" },
        { value: "space outdoor", label: "🌳 Space Outdoor", original: "Space Outdoor" },
        { value: "virtual office", label: "💻 Virtual Office", original: "Virtual Office" },
        { value: "course", label: "📚 Course", original: "Course" }
    ];

    // EKSTRAK SPACE YANG ADA DI DATA + TAMBAHKAN YANG BELUM ADA
    const availableSpaces = useMemo(() => {
        if (!members.length) return allSpaceOptions;
        
        // Ambil semua space dari data member
        const existingSpaces = members
            .map(member => member.space)
            .filter(space => space && space.trim() !== "");
        
        // Format space dari data
        const dataSpaces = existingSpaces.map(space => {
            const lowerSpace = space.toLowerCase();
            const matchedOption = allSpaceOptions.find(opt => 
                lowerSpace.includes(opt.value) || 
                opt.value.includes(lowerSpace) ||
                space.toLowerCase().includes(opt.value)
            );
            
            if (matchedOption) {
                return {
                    value: matchedOption.value,
                    label: matchedOption.label,
                    original: matchedOption.original
                };
            }
            
            // Jika tidak ada yang cocok, buat baru
            let emoji = "🏢";
            if (lowerSpace.includes("maneka")) emoji = "🎨";
            else if (lowerSpace.includes("rembug")) emoji = "🗣️";
            else if (lowerSpace.includes("private")) emoji = "🚪";
            else if (lowerSpace.includes("virtual")) emoji = "💻";
            else if (lowerSpace.includes("course")) emoji = "📚";
            else if (lowerSpace.includes("gatra")) emoji = "🏛️";
            else if (lowerSpace.includes("outdoor")) emoji = "🌳";
            
            return {
                value: lowerSpace,
                label: `${emoji} ${space}`,
                original: space
            };
        });
        
        // Hilangkan duplikat berdasarkan value
        const uniqueDataSpaces = [...new Map(dataSpaces.map(item => [item.value, item])).values()];
        
        // Gabungkan dengan allSpaceOptions, prioritaskan yang ada di data
        const combinedSpaces = [...uniqueDataSpaces];
        
        // Tambahkan yang belum ada dari allSpaceOptions
        allSpaceOptions.forEach(option => {
            if (!combinedSpaces.some(s => s.value === option.value)) {
                combinedSpaces.push(option);
            }
        });
        
        return combinedSpaces.sort((a, b) => a.original.localeCompare(b.original));
    }, [members]);

    // FILTER OPTIONS BERDASARKAN SPACE
    const spaceFilterOptions = [
        { value: "all", label: "🏢 All Spaces" },
        ...availableSpaces
    ];

    // FUNGSI UNTUK GET SPACE LABEL
    const getSpaceLabel=(spaceValue) => {
         if (!spaceValue || spaceValue === "all") return "All Spaces";
        const space = allSpaceOptions.find(s => s.value === spaceValue) || 
                     availableSpaces.find(s => s.value === spaceValue);
        return space ? space.original : spaceValue;
    };

    // FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...members];
        
        // 1. Apply Space Filter
        if (selectedSpace && selectedSpace !== "all") {
            result = result.filter(member => {
                const memberSpace = member.space?.toLowerCase();
                if (!memberSpace) return false;
                
                // Cek kesamaan langsung
                if (memberSpace === selectedSpace) return true;
                
                // Cek apakah mengandung atau dikandung
                return memberSpace.includes(selectedSpace) || 
                       selectedSpace.includes(memberSpace);
            });
        }
        
        // 2. Apply Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(member =>
                member.full_name?.toLowerCase().includes(term) ||
                member.email?.toLowerCase().includes(term) ||
                member.space?.toLowerCase().includes(term) ||
                member.company?.toLowerCase().includes(term) ||
                member.phone?.toLowerCase().includes(term)
            );
        }
        
        setFilteredMembers(result);
    };

    // HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilters({ ...filters, search: term });
        applyAllFilters();
    };

    // HANDLE SPACE FILTER CHANGE
    const handleSpaceFilterChange = (spaceValue) => {
        setSelectedSpace(spaceValue);
        setFilters({ ...filters, space: spaceValue });
        applyAllFilters();
    };

    // CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedSpace(null);
        setFilteredMembers(members);
        setFilters({ search: "", space: "" });
    };

    // APPLY FILTERS SETIAP MEMBERS BERUBAH
    useEffect(() => {
        if (members.length > 0) {
            setFilteredMembers(members);
            applyAllFilters();
        }
    }, [members]);

    // APPLY FILTERS SETIAP SEARCH ATAU SPACE BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, selectedSpace]);

    const memberStats = useMemo(() => {
        const totalMembers = filteredMembers.length;
        const activeMembers = filteredMembers.filter(member => member.status === 'active').length;
        
        const activePercentage = totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : "0";

        return [
            {
                title: "Total Members",
                value: totalMembers.toString(),
                subtitle: selectedSpace && selectedSpace !== "all" ? `in ${getSpaceLabel(selectedSpace)}` : "",
                percentage: `${totalMembers > 0 ? "12.5" : "0"}%`,
                trend: totalMembers > 0 ? "up" : "neutral",
                period: "Last Month",
                icon: Users,
                color: "blue",
                description: `${totalMembers > 0 ? "12.5" : "0"}% Growth`
            },
            {
                title: "Active Members",
                value: activeMembers.toString(),
                subtitle: selectedSpace && selectedSpace !== "all" ? `in ${getSpaceLabel(selectedSpace)}` : "",
                percentage: `${activePercentage}%`,
                trend: activeMembers > 0 ? "up" : "down",
                period: "Last Month",
                icon: UserCheck,
                color: "green",
                description: `${activePercentage}% of total`
            }
        ];
    }, [filteredMembers, selectedSpace, getSpaceLabel]);

    const handleAddMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleOpenEditModal = (member) => {
        setEditingMember(member)
        setIsEditModalOpen(true)
    }

    const handleEditMember = async (memberId, memberData) => {
        try {
            const updatedMember = await updateMemberHeteroSemarang(memberId, memberData)

            if (selectedMember && selectedMember.id === memberId){
                setSelectedMember(prev => ({
                    ...prev,
                    ...memberData,
                    ...updatedMember
                }))
            }

            setIsEditModalOpen(false)
            setEditingMember(null)
            toast.success('Member updated successfully')
            fetchMembers(pagination.page);
        } catch (error) {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update member')
        }
    };

    const handleAddNewMember = async (memberData) => {
        try {
            await addMemberHeteroSemarang(memberData)
            setIsAddMemberModalOpen(false)
            toast.success('Member added successfully')
            fetchMembers(pagination.page);
        } catch {
            //
        }
    }

    const handleDeleteMember = async (memberId) => {
        if (!selectedMember) return

        if (!window.confirm(`Are you sure want to delete ${selectedMember.full_name}?. This Action cannot be undone.`)) {
            return
        }

        try {
            await deleteMemberHeteroSemarang(memberId)
            setSelectedMember(null)
            fetchMembers(pagination.page);
        } catch {
            //
        }
    };

    useEffect(() => {
        if (selectedMember && members.length > 0) {
            const currentSelected = members.find(member => member.id === selectedMember.id)
            if (currentSelected) {
                setSelectedMember(currentSelected)
            }
        }
    }, [members, selectedMember?.id])

    const handleRefresh = () => {
        fetchMembers(pagination.page)
        clearAllFilters();
    }

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        fetchMembers(page)
    }

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Space', 'Company', 'Duration', 'Status', 'Action'],
        title: 'Hetero Semarang Management',
        addButton: "Add Member",
        detailTitle: "Member Details"
    }

    // FORMAT MEMBER DARI filteredMembers
    const formattedMembers = filteredMembers.map((member, index) => {
        const currentPage = pagination.page
        const itemsPerPage = pagination.limit
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1

        return {
            id: member.id,
            no: itemNumber,
            fullName: member.full_name,
            email: member.email,
            phone: member.phone,
            space: member.space,
            company: member.company,
            duration: member.duration,
            status: member.status,
            action: 'Detail',
            ...member
        }
    })

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                
                <MemberStatsCards statsData={memberStats} />

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>

                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading Members...</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load members</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefresh}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        Reload Page
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* SEARCH & FILTER SECTION */}
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search..."
                                />
                                
                                {/* FILTER BY SPACE */}
                                {availableSpaces.length > 0 && (
                                    <FilterButton 
                                        onFilterChange={handleSpaceFilterChange}
                                        filterOptions={spaceFilterOptions}
                                        activeFilter={selectedSpace}
                                        buttonText={
                                            selectedSpace && selectedSpace !== "all" 
                                                ? `Space: ${getSpaceLabel(selectedSpace)}`
                                                : "Filter by Space"
                                        }
                                        color="orange"
                                    />
                                )}
                                
                                {/* CLEAR FILTERS BUTTON */}
                                {(searchTerm || selectedSpace) && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={clearAllFilters}
                                        className="text-sm h-10 flex items-center gap-2"
                                        size="sm"
                                    >
                                        <X className="h-3 w-3" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            <div className='flex gap-2'>
                                <Button 
                                    className='flex items-center gap-2'
                                    onClick={handleAddMember}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton data={formattedMembers} />
                            </div>
                        </div>
                        
                        {/* ACTIVE FILTERS BADGES */}
                        {(searchTerm || selectedSpace) && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                                {searchTerm && (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Tag className="h-3 w-3" />
                                        <span>Search: "{searchTerm}"</span>
                                        <button 
                                            onClick={() => setSearchTerm("")}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                            title="Remove search"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                                {selectedSpace && selectedSpace !== "all" && (
                                    <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Building2 className="h-3 w-3" />
                                        <span>Space: {getSpaceLabel(selectedSpace)}</span>
                                        <button 
                                            onClick={() => setSelectedSpace(null)}
                                            className="text-orange-600 hover:text-orange-800 ml-1"
                                            title="Remove space filter"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* FILTER STATUS INFO */}
                        {selectedSpace && selectedSpace !== "all" && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <span>
                                            Showing <span className="font-semibold">{filteredMembers.length}</span> members in <span className="font-semibold">{getSpaceLabel(selectedSpace)}</span>
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        {getSpaceLabel(selectedSpace)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {loading && members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading members...</span>
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
                                        No members found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {searchTerm || selectedSpace 
                                            ? `No members match your current filters${selectedSpace && selectedSpace !== "all" ? ` in ${getSpaceLabel(selectedSpace)}` : ""}.`
                                            : "Get started by adding your first member."
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {(searchTerm || selectedSpace) && (
                                        <Button 
                                            className="flex items-center gap-2"
                                            onClick={clearAllFilters}
                                            variant="outline"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={handleAddMember}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New Member
                                    </Button>
                                </div>
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
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredMembers.length} members
                                        {selectedSpace && selectedSpace !== "all" && (
                                            <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                                in {getSpaceLabel(selectedSpace)}
                                            </span>
                                        )}
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

                <HeteroContent
                    selectedMember={selectedMember}
                    onOpenEditModal={handleOpenEditModal}
                    onEdit={handleEditMember}
                    onDelete={handleDeleteMember}
                    detailTitle={tableConfig.detailTitle}
                    onClientUpdated={() => fetchMembers(pagination.page)}
                    onClientDeleted={() => {
                        fetchMembers(pagination.page);
                        setSelectedMember(null);
                    }}
                />

                <AddMember 
                    isAddMemberModalOpen={isAddMemberModalOpen || isEditModalOpen} 
                    setIsAddMemberModalOpen={(open) => {
                        if (!open) {
                            setIsAddMemberModalOpen(false)
                            setIsEditModalOpen(false)
                            setEditingMember(null)
                        }
                    }}
                    onAddMember={handleAddNewMember}
                    editData={editingMember}
                    onEditMember={handleEditMember}
                />
            </div>
        </div>
    )
}

export default HeteroSemarang;