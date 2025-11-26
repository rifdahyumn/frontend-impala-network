import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState, useMemo } from 'react'; // ✅ TAMBAH useMemo
import SearchBar from "../components/SearchFilter/SearchBar";
import FilterDropdown from "../components/SearchFilter/FilterDropdown";
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from "../components/MemberTable/MemberTable";
import Pagination from "../components/Pagination/Pagination";
import FilterButton from "../components/SearchFilter/Filter";
import { Loader2, Plus, X, Users, UserCheck, TrendingUp } from "lucide-react" // ✅ TAMBAH ICON
import { Button } from "../components/ui/button"
import AddMemberSurakarta from "../components/AddButton/AddMemberSurakarta";
import HeteroSoloContent from "../components/Content/HeteroSurakartaContent";
import { useHeteroSolo } from "../hooks/useHeteroSolo";
import toast from "react-hot-toast";
import MemberStatsCards from "../MemberHetero/MemberStatsCard"; // ✅ TAMBAH IMPORT

const HeteroSurakarta = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [editingMember, setEditingMember] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

    const { members, loading, error, pagination, filters, setFilters, fetchMembers, addMemberHeteroSolo, updateMemberHeteroSolo, deleteMemberHeteroSolo } = useHeteroSolo()

    // ✅ TAMBAHKAN: Stats data calculation - hanya 2 cards
    const memberStats = useMemo(() => {
        const totalMembers = members.length;
        const activeMembers = members.filter(member => member.status === 'active').length;
        
        // Calculate active percentage
        const activePercentage = totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : "0";

        return [
            {
                title: "Total Members",
                value: totalMembers.toString(),
                subtitle: "",
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
                subtitle: "",
                percentage: `${activePercentage}%`,
                trend: activeMembers > 0 ? "up" : "down",
                period: "Last Month",
                icon: UserCheck,
                color: "green",
                description: `${activePercentage}% of total`
            }
        ];
    }, [members]);

    const handleAddMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleOpenEditModal = (member) => {
        setEditingMember(member)
        setIsEditModalOpen(true)
    }

    const handleEditMember = async (memberId, memberData) => {
        try {
            const updatedMember = await updateMemberHeteroSolo(memberId, memberData)

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
        } catch (error) {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update member')
        }
    };

    const handleAddNewMember = async (memberData) => {
        try {
            await addMemberHeteroSolo(memberData)
            setIsAddMemberModalOpen(false)
            toast.success('Member added successfully')
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
            await deleteMemberHeteroSolo(memberId)
            setSelectedMember(null)
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
    }

    const handleSearch = (searchTerm) => {
        setFilters({ ...filters, search: searchTerm })
    }

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters })
    }

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        fetchMembers(page)
    }

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Space', 'Company', 'Duration', 'Status', 'Action'],
        title: 'Hetero Surakarta Management',
        addButton: "Add Member",
        detailTitle: "Member Details"
    }

    const formattedMembers = members.map((member, index) => {
        const currentPage = pagination.page
        const itemsPerPage = pagination.limit
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1

        return {
            id: member.id,
            no: itemNumber,
            fullName: member.full_name,
            action: 'Detail',
            ...member
        }
    })

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                
                {/* ✅ TAMBAHKAN: Stats Cards di sini */}
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
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2'>
                                <SearchBar />
                                <FilterDropdown />
                                <FilterButton />
                            </div>

                            <div className='flex gap-2'>
                                <Button 
                                    className='flex items-center gap-2'
                                    onClick={handleAddMember}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton />
                            </div>
                        </div>

                        {loading && members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading members...</span>
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
                                    <h3 className="text-lg font-semibold text-gray-700">No members found</h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {filters.search || Object.values(filters).some(f => f) 
                                            ? "Try adjusting your search or filters to find what you're looking for."
                                            : "Get started by adding your first client to the system."
                                        }
                                    </p>
                                </div>
                                <Button 
                                    className="flex items-center gap-2"
                                    onClick={handleAddMember}
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
                                        <span className="font-semibold">
                                            {pagination.total > 0 ? pagination.total : formattedMembers.length}
                                        </span> Member
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

                <HeteroSoloContent
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

                <AddMemberSurakarta 
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

export default HeteroSurakarta;