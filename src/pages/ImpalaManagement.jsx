import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/Layout/Sidebar';
import React, { useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import AddMemberButton from '../components/ActionButton/AddMemberButton';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';

const ImpalaManagement = () => {
    const [selectedMember, setSelectedMember] = useState(null)

    const members = [
        {
            id: 1,
            fullName: 'Muhammad Faiz Al Izza',
            email: 'mfaizalizza@gmail.com',
            nomor: '+62 852-9337-788',
            gender: 'Laki-laki',
            birth: '26/02/2002',
            action: 'Detail'
        },
        {
            id: 2,
            fullName: 'Aditya Pramana Wiratama',
            email: 'aditya@gmail.com',
            nomor: '+62 852-8337-716',
            gender: 'Laki-laki',
            birth: '20/10/2002',
            action: 'Detail'
        },
        {
            id: 3,
            fullName: 'Rizki Ananda Putra',
            email: 'rizki@gmail.com',
            nomor: '+62 852-3331-748',
            gender: 'Laki-laki',
            birth: '20/10/2001',
            action: 'Detail'
        },
    ];

    return (
        <div className='flex min-h-screen bg-gray-50/40'>
            <Sidebar />

            <div className='flex-1 p-6'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-bold text-gray-900'>Hello Faiz</h1>
                </div>

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>Impala Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2'>
                                <SearchBar />
                                <FilterDropdown />
                            </div>

                            <div className='flex gap-2'>
                                <AddMemberButton />
                                <ExportButton />
                            </div>
                        </div>

                        <div className='text-sm text-gray-600 mb-4'>
                            Display 1-10 of 200 data
                        </div>

                        <MemberTable>

                        </MemberTable>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ImpalaManagement;