import AccountContent from "../components/Content/AccountContent";
import Header from "../components/Layout/Header";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import AddUser from "../components/AddButton/AddUser";

const Account = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    const handleAddUser = () => {
        setIsAddUserModalOpen(true);
    };

    const members = [
        {
            id: '1',
            employeeId: 'USR-001',
            username: 'ahmad_rizki',
            email: 'ahmad.rizki@company.com',
            password: 'encrypted_password_123',
            role: 'Manajer_Program',
            status: 'Active',
            fullName: 'Ahmad Rizki',
            phone: '+62 81234567890',
            position: 'CEO Program',
            avatar: '/avatars/ahmad.jpg',
            lastLogin: '2024-01-15 09:30:25',
            createdAt: '2023-01-15',
            updatedAt: '2024-01-15',
            emailVerified: true,
            twoFactorEnabled: false,
            loginAttempts: 1,
            action: 'Details'
        }
    ]

    const tableConfig = {
        headers: ['No', 'Employee ID', 'Username', 'Email', 'Position', 'Role', 'Status', 'Last Login', 'Action'],
        title: 'User Account Management',
        addButton: 'Add User',
        detailTitle: 'User Details'
    }

    const handleEdit = () => {
        if (selectedMember) {
            console.log('Edit client:', selectedMember);
            
            alert(`Edit client: ${selectedMember.fullName}`);
        }
    };

    const handleDelete = () => {
        if (selectedMember) {
            if (window.confirm(`Are you sure you want to delete ${selectedMember.fullName}?`)) {
                console.log('Delete client:', selectedMember);
                
                setSelectedMember(null); 
                alert(`Client ${selectedMember.fullName} deleted`);
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
                            members={members}
                            onSelectMember={setSelectedMember}
                            headers={tableConfig.headers}
                        />

                        <div className='mt-6'>
                            <Pagination />
                        </div>
                    </CardContent>
                </Card>

                <AccountContent
                    selectedMember={selectedMember}
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