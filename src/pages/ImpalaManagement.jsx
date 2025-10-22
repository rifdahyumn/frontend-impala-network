import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import Header from '../components/Layout/Header';
import FilterButton from '../components/SearchFilter/Filter';
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button"

const ImpalaManagement = () => {
    const [selectedMember, setSelectedMember] = useState(null)

    const members = [
        {
            id: 'IMP-001',
            employeeId: 'EMP-2024-001',
            fullName: 'Ahmad Rizki',
            position: 'Software Engineer',
            department: 'IT',
            joinDate: '2023-01-15',
            status: 'Active',
            salary: 'Rp 15,000,000',
            action: 'Manage'
        },
        {
            id: 'IMP-002',
            employeeId: 'EMP-2024-002',
            fullName: 'Sari Dewi',
            position: 'Product Manager',
            department: 'Product',
            joinDate: '2023-03-20',
            status: 'Active',
            salary: 'Rp 20,000,000',
            action: 'Manage'
        }
    ];

    // Configuration untuk table impala
    const tableConfig = {
        headers: ['ID', 'Employee ID', 'Full Name', 'Position', 'Department', 'Join Date', 'Status', 'Salary', 'Action'],
        title: "Impala Management",
        addButton: "Add Member",
        detailTitle: "Member Details"
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
                                <Button className='flex items-center gap-2'>
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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Member Details</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {selectedMember ? (
                            <div className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Full Name</label>
                                        <p className='text-gray-900'>{selectedMember.fullName}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Email</label>
                                        <p className='text-gray-900'>{selectedMember.email}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Whatsapp</label>
                                        <p className='text-gray-900'>{selectedMember.whatsapp}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Gender</label>
                                        <p className='text-gray-900'>{selectedMember.gender}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Date of Birth</label>
                                        <p className='text-gray-900'>{selectedMember.dateOfBirth}</p>
                                    </div>
                                </div>
                            </div>
                        ) : ( 
                            <div className='text-center py-8 text-gray-500'>
                                <p>Select a member to view details</p>
                            </div>
                        )} 
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ImpalaManagement;