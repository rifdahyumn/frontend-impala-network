import Header from "../components/Layout/Header";
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
import ClientContent from "../components/Content/ClientContent";

const ProgramClient = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    
    const members = [
        {
            id: 1,
            fullName: 'Muhammad Faiz Al Izza',
            email: 'mfaizalizza@gmail.com',
            phone: '+62 85293387788',
            company: 'MBG Company',
            industry: 'Fast Moving Consumer Goods',
            program: 'Startup 1001',
            status: 'Active',
            dealSize: 'Rp 250.000.000',
            gender: 'Laki-laki',
            business: 'Retail',
            companySize: '500-1000 employees',
            address: 'Jl. Semarang Barat No. 123',
            city: 'Semarang',
            country: 'Indonesia',
            position: 'Marketing Manager',
            joinDate: '2024-01-15',
            notes: 'Client tertarik dengan program scaling',
            action: 'Detail'
        },
        {
            id: 2,
            fullName: 'Dr. Richard Tan',
            email: 'richard@medicallab.co.id',
            phone: '+62 81122334455',
            company: 'Medical Lab Indonesia',
            industry: 'Healthcare Services',
            program: 'Healthcare Analytics Pro',
            status: 'Inactive',
            dealSize: 'Rp 420.000.000',
            gender: 'Laki-laki',
            business: 'Medical Laboratory',
            companySize: '200-500 employees',
            address: 'Jl. Gatot Subroto Kav. 21, Jakarta',
            city: 'Jakarta',
            country: 'Indonesia',
            position: 'Medical Director',
            joinDate: '2024-02-05',
            notes: 'Phase 1 implementation completed, training staff for phase 2',
            action: 'Detail'
        }
    ];

    
    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Company', 'Industry', 'Program', 'Deal', 'Status', 'Action'],
        title: "Client Management",
        addButton: "Add Client",
        detailTitle: "Client Details"
    };

    
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

                <ClientContent
                    selectedMember={selectedMember}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />
            </div>
        </div>
    )
}

export default ProgramClient;