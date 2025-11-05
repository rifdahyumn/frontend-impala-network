import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useState } from 'react';
import SearchBar from "../components/SearchFilter/SearchBar";
import FilterDropdown from "../components/SearchFilter/FilterDropdown";
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from "../components/MemberTable/MemberTable";
import Pagination from "../components/Pagination/Pagination";
import FilterButton from "../components/SearchFilter/Filter";
import { Plus, X } from "lucide-react"
import { Button } from "../components/ui/button"
import AddMember from "../components/AddButton/AddMember";
import HeteroContent from "../components/Content/HeteroContent";

const HeteroSemarang = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    
    // Data khusus untuk Semarang
    const members = [
        {
            no: '1',
             // Personal Information
            member_id: 'MEM-SMG-001',
            full_name: 'Budi Santoso',
            nik: '3374091201890001',
            email: 'budisantoso@gmail.com',
            phone: '082134567890',
            gender: 'Male',
            dateOfBirth: '1989-01-12',
            education: 'Bachelor (S1)',

            // Residential Address
            address: 'Jl. Pandanaran No. 45, RT 03 RW 02',
            district: 'Semarang Tengah',
            city: 'Kota Semarang',
            province: 'Jawa Tengah',
            postalCode: '50241',
            
            // Business / Organization
            company: 'PT. Maju Bersama',
            
            // Service Requirements
            maneka: '',
            rembug: 'Rembug 1',
            eventSpace: '',
            privateOffice: '',
            
            // Additional Information
            addInformation: 'Social Media',
            action: 'Manage'
        },
        {
            no: '2',
            // Personal Information
            member_id: 'MEM-SMG-002',
            full_name: 'Rina Kurniawati',
            nik: '3374100503920002',
            email: 'rinakurniawati@gmail.com',
            phone: '085678901234',
            gender: 'Female',
            dateOfBirth: '1992-03-05',
            education: 'Bachelor (S1)',

            // Residential Address
            address: 'Jl. Gajah Mada No. 18, RT 01 RW 05',
            district: 'Candisari',
            city: 'Kota Semarang',
            province: 'Jawa Tengah',
            postalCode: '50254',
            
            // Business / Organization
            company: 'PT. Cipta Mandiri',
            
            // Service Requirements
            maneka: '',
            rembug: 'Rembug 2',
            eventSpace: '',
            privateOffice: 'Private Office 4&5',
            
            // Additional Information
            addInformation: 'Local Community',
            action: 'Manage'
        }
    ];

    const tableConfig = {
        headers: ['No', 'Member ID', 'Full Name', 'Email', 'Phone', 'Company', 'Action'],
        title: "Hetero Semarang",
        addButton: "Add Member",
        detailTitle: "Member Details"
    };

    const handleAddMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleEdit = () => {
        if (selectedMember) {
            console.log('Edit member:', selectedMember);
            alert(`Edit member: ${selectedMember.full_name}`);
        }
    };

    const handleDelete = () => {
        if (selectedMember) {
            if (window.confirm(`Are you sure you want to delete ${selectedMember.full_name}?`)) {
                console.log('Delete member:', selectedMember);
                setSelectedMember(null); 
                alert(`Member ${selectedMember.full_name} deleted`);
            }
        }
    };

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            {/* Main Content */}
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
                                    onClick={handleAddMember}
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

                <HeteroContent
                    selectedMember={selectedMember}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />

                {/* Add Member Modal */}
                <AddMember 
                    isAddMemberModalOpen={isAddMemberModalOpen} 
                    setIsAddMemberModalOpen={setIsAddMemberModalOpen}
                />
            </div>
        </div>
    )
}

export default HeteroSemarang;