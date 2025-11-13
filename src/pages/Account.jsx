import AccountContent from "../components/Content/AccountContent";
import Header from "../components/Layout/Header";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus } from "lucide-react";
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

const Account = () => {
    const [selectedUser, setSelectedUser] = useState(null)
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const { users, loading, error, pagination, filters, setFilters, fetchUser } = useUsers()

    const handleAddUser = () => {
        setIsAddUserModalOpen(true);
    };

    const handleOpenEditModal = (program) => {
        setEditingUser(program);
        setIsEditModalOpen(true);
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
            full_name: user.full_name,
            email: user.email,
            password: user.password,
            role: user.role,
            status: user.status,
            phone: user.phone,
            position: user.position,
            avatar: user.avatar,
            action: 'Detail',
            ...user
        }
    })

    const handleEdit = () => {
        if (selectedUser) {
            console.log('Edit client:', selectedUser);
            
            alert(`Edit client: ${selectedUser.fullName}`);
        }
    };

    const handleDelete = () => {
        if (selectedUser) {
            if (window.confirm(`Are you sure you want to delete ${selectedUser.fullName}?`)) {
                console.log('Delete client:', selectedUser);
                
                setSelectedUser(null); 
                alert(`Client ${selectedUser.fullName} deleted`);
            }
        }
    };

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>
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

                        <MemberTable
                            members={users}
                            onSelectMember={setSelectedUser}
                            headers={tableConfig.headers}
                        />

                        <div className='mt-6'>
                            <Pagination 
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.total}
                                onPageChange={handlePageChange}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                </Card>

                <AccountContent
                    selectedMember={selectedUser}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />
             {/* Add User Modal */}
             <AddUser 
                isAddUserModalOpen={isAddUserModalOpen} 
                setIsAddUserModalOpen={setIsAddUserModalOpen}
             />
            </div>
        </div>
    )
}

export default Account;