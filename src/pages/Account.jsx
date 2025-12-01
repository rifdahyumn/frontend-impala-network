import AccountContent from "../components/Content/AccountContent";
import Header from "../components/Layout/Header";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import AddUser from "../components/AddButton/AddUser";
import { useUsers } from "../hooks/useUser";
import toast from "react-hot-toast";

const Account = () => {
    const [selectedUser, setSelectedUser] = useState(null)
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const { users, loading, error, pagination, filters, setFilters, fetchUser, addUser, updateUser, deleteUser, activateUser  } = useUsers()

    const handleAddUser = () => {
        setIsAddUserModalOpen(true);
    };

    const handleAddUserSuccess = async (userData) => {
        try {
            await addUser(userData);
            setIsAddUserModalOpen(false);
        } catch {
            // Error sudah dihandle di hook
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditUser = async (userId, userData) => {
        try {
            const updatedUser = await updateUser(userId, userData)

            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(prev => ({
                    ...prev,
                    ...userData,
                    ...updateUser
                }))
            }

            setIsEditModalOpen(false)
            setEditingUser(null)
            toast.success('User updated successfully')
        } catch (error) {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update user')
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!selectedUser) return

        if (!window.confirm(`Are you sure want to delete ${selectedUser.full_name}? This action cannot be undone`)) {
            return
        }

        try {
            await deleteUser(userId)
            setSelectedUser(null)
        } catch {
            //
        }
    }

    const handleActivate = async (userId) => {
        try {
            await activateUser(userId);
        } catch (error) {
            console.error('❌ Error activating user from parent:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (selectedUser && users.length > 0) {
            const currentSelected = users.find(member => member.id === selectedUser.id)
            if (currentSelected) {
                setSelectedUser(currentSelected)
            }
        }
    }, [users, selectedUser?.id])

    const handleRefresh = () => {
        fetchUser(pagination.page);
    };

    const handleSearch = (searchTerm) => {
        setFilters({ ...filters, search: searchTerm });
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchUser(page);
    };

    const tableConfig = {
        headers: ['No', 'Employee ID', 'Full Name', 'Email', 'Position', 'Role', 'Status', 'Last Login', 'Action'],
        title: 'User Account Management',
        addButton: 'Add User',
        detailTitle: 'User Details'
    }

    const formattedUsers = users.map((user, index) => {
        const currentPage = pagination.page
        const itemsPerPage = pagination.limit
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1

        return {
            id: user.id,
            no: itemNumber,
            employee_id: user.employee_id,
            full_name: user.full_name,
            email: user.email,
            password: user.password,
            role: user.role,
            last_login: user.last_login,
            status: user.status,
            phone: user.phone,
            position: user.position,
            avatar: user.avatar,
            action: 'Detail',
            ...user
        }
    })

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
                                <span className="text-sm">Loading users...</span>
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
                                    onClick={handleAddUser}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton />
                            </div>
                        </div>

                        {loading && users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading users...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">No users found</h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {filters.search || Object.values(filters).some(f => f) 
                                            ? "Try adjusting your search or filters to find what you're looking for."
                                            : "Get started by adding your first client to the system."
                                        }
                                    </p>
                                </div>
                                <Button 
                                    className="flex items-center gap-2"
                                    onClick={handleAddUser}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Your First User
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
                                        members={formattedUsers}
                                        onSelectMember={setSelectedUser}
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

                <AccountContent
                    selectedUser={selectedUser}
                    onOpenEditModal={handleOpenEditModal}
                    onDelete={handleDeleteUser}
                    onActivateUser={handleActivate}
                    detailTitle={tableConfig.detailTitle}
                    onUserUpdated={() => fetchUser(pagination.page)}
                    onClientDeleted={() => {
                        fetchUser(pagination.page);
                        setSelectedUser(null);
                    }}
                    
                />
             {/* Add User Modal */}
             <AddUser 
                isAddUserModalOpen={isAddUserModalOpen || isEditModalOpen} 
                setIsAddUserModalOpen={(open) => {
                    if (!open) {
                        setIsAddUserModalOpen(false)
                        setIsEditModalOpen(false)
                        setEditingUser(null)
                    }
                }}
                onAddUser={handleAddUserSuccess}
                editData={editingUser}
                onEditUser={handleEditUser}
             />
            </div>
        </div>
    )
}

export default Account;