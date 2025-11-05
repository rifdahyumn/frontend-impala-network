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
import AddMemberSurakarta from "../components/AddButton/AddMemberSurakarta";
import HeteroContent from "../components/Content/HeteroContent";

const HeteroSurakarta = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    
    // Data khusus untuk Surakarta - SESUAIKAN DENGAN FIELD MAP YANG ADA
    const members = [
        {
            no: '1',
            // Personal Information
            member_id: 'MEM-SRK-001',
            full_name: 'Dewi Sartika',
            nik: '3375010601930001',
            email: 'dewisartika@gmail.com',
            phone: '081234567890',
            gender: 'Female',
            dateOfBirth: '1993-01-06',
            education: 'Bachelor Degree (S1)',
            
            // Residential Address
            address: 'Jl. Slamet Riyadi No. 12, RT 04 RW 03',
            district: 'Laweyan',
            city: 'Kota Surakarta',
            province: 'Jawa Tengah',
            postalCode: '57148',
            
            // Business / Organization
            company: 'PT. Solo Maju',

            // Service Requirements
            maneka: 'Active',
            rembug: 'Not Subscribed',
            eventSpace: 'Yes',
            privateOffice: 'No',

            // Additional Information
            addInformation:'Social Media',

            action: 'Manage'
        },
        {
            no: '2',
            // Personal Information
            member_id: 'MEM-SRK-002',
            full_name: 'Rudi Hartono',
            nik: '3375021502890002',
            email: 'rudihartono@gmail.com',
            phone: '082345678901',
            gender: 'Male',
            dateOfBirth: '1989-02-15',
            education: 'Master Degree (S2)',

            // Residential Address
            address: 'Jl. Adi Sucipto No. 55, RT 02 RW 06',
            district: 'Banjarsari',
            city: 'Kota Surakarta',
            province: 'Jawa Tengah',
            postalCode: '57138',

            // Business / Organization
            company: 'CV. Batik Indah',

             // Service Requirements
            maneka: 'Not Subscribed',
            rembug: 'Active',
            eventSpace: 'Yes',
            privateOffice: 'Yes',

            // Additional Information
            addInformation: 'Event / Exhibition',
            action: 'Manage'
        },
        {
            no: '3',
            // Personal Information
            member_id: 'MEM-SRK-003',
            full_name: 'Siti Aminah',
            nik: '3375032101970003',
            email: 'sitiaminah@gmail.com',
            phone: '083456789012',
            gender: 'Female',
            dateOfBirth: '1997-01-21',
            education: 'Bachelor Degree (S1)',

            // Residential Address
            address: 'Jl. Diponegoro No. 23, RT 05 RW 02',
            district: 'Jebres',
            city: 'Kota Surakarta',
            province: 'Jawa Tengah',
            postalCode: '57126',

            // Business / Organization
            company: 'PT. Jaya Abadi',

            // Service Requirements
            maneka: 'Active',
            rembug: 'Active',
            eventSpace: 'No',
            privateOffice: 'Yes',

            // Additional Information
            addInformation: 'Event / Exhibition',
            action: 'Manage'
        }
    ];


    // Ubah headers untuk match dengan fieldMap yang ada
    const tableConfig = {
        headers: ['No', 'Member ID', 'Full Name', 'Email', 'Phone', 'Company', 'Action'],
        title: "Hetero Surakarta",
        addButton: "Add Member",
        detailTitle: "Member Details"
    };

    const handleAddMemberSurakarta = () => {
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
                                    onClick={handleAddMemberSurakarta}
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
                <AddMemberSurakarta 
                    isAddMemberModalOpen={isAddMemberModalOpen} 
                    setIsAddMemberModalOpen={setIsAddMemberModalOpen}
                />
            </div>
        </div>
    )
}

export default HeteroSurakarta;