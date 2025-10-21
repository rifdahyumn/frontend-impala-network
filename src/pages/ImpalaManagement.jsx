import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/Layout/Sidebar';
import React, { useState } from 'react';
import { ChevronDown, User } from "lucide-react"
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import AddMemberButton from '../components/ActionButton/AddMemberButton';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import Header from '../components/Layout/Header';
import FilterButton from '../components/SearchFilter/Filter';

const ImpalaManagement = () => {
    const [selectedMember, setSelectedMember] = useState(null)

    const members = [
        {
            id: 1,
            fullName: 'Muhammad Faiz Al Izza',
            email: 'mfaizalizza@gmail.com',
            whatsapp: '+62 852-9337-788',
            gender: 'Laki-laki',
            dateOfBirth: '26/02/2002',
            action: 'Detail'
        },
        {
            id: 2,
            fullName: 'Aditya Pramana Wiratama',
            email: 'aditya@gmail.com',
            whatsapp: '+62 852-8337-716',
            gender: 'Laki-laki',
            dateOfBirth: '20/10/2002',
            action: 'Detail'
        },
        {
            id: 3,
            fullName: 'Rizki Ananda Putra',
            email: 'rizki@gmail.com',
            whatsapp: '+62 852-3331-748',
            gender: 'Laki-laki',
            dateOfBirth: '20/10/2001',
            action: 'Detail'
        },
    ];

    return (
        <div className='flex min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>Impala Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2'>
                                <SearchBar />
                                <FilterDropdown />
                                <FilterButton />
                            </div>

                            <div className='flex gap-2'>
                                <AddMemberButton />
                                <ExportButton />
                            </div>
                        </div>

                        <MemberTable
                            members={members}
                            onSelectMember={setSelectedMember}
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