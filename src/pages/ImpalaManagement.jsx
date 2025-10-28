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
import ImpalaContent from '../components/Content/ImpalaContent';

const ImpalaManagement = () => {
    const [selectedMember, setSelectedMember] = useState(null)

    const members = [
        {
            id: 'IMP-001',
            fullName: 'Lutfiana Dini Lathiifah',
            nik: '3320000000000001',
            email: 'dini@shopee.com',
            phone: '0850000001',
            gender: 'Perempuan',
            dateOfBirth: '22/12/2002',
            education: 'Sarjana',
            programName: 'StartUp 1001',
            address: 'Jl. Langon Tahunan',
            subdistrict: 'Tahunan',
            city: 'Jepara',
            province: 'Jawa Tengah',
            postalCode: '90909',
            business: 'Furniture',
            bussinessName: 'Dny Deco Jepara',
            establishedYear: '2025',
            bussinessAddress: 'Jl. Sukono Langon',
            bussinessForm: 'PT.',
            certifications: 'Halal',
            monthly_revenue: '50000000 - 100000000',
            total_employee: '5-10 Employees',
            hasOrganizationStructur: true,
            sosialMedia: 'instagram.com/dnydeco',
            marketplace: 'shopee.com/dnydecojepara',
            google_bussiness: 'g.page/dntdeco',
            website: 'dnydeco.id',
            ownerPhoto: 'images/dini',
            bussinessLogo: 'images/logo',
            productPhoto: 'images/product',
            status: 'Active',
            action: 'Detail'
        },
    ];

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Program Name', 'Bussiness Name', 'Business Type', 'Action'],
        title: "Impala Management",
        addButton: "Add Participants",
        detailTitle: "Participant Details"
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

                <ImpalaContent
                    selectedMember={selectedMember}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />
            </div>
        </div>
    )
}

export default ImpalaManagement;