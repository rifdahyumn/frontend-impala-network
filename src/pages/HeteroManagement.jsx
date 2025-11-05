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
import AddMemberBanyumas from "../components/AddButton/AddMemberBanyumas";
import HeteroContent from "../components/Content/HeteroContent";

const HeteroManagement = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    
    // Data khusus untuk Banyumas
    const members = [
        {
            no: '1',
            // Personal Information
            member_id: 'MEM-BYM-001',
            full_name: 'Ahmad Rizki',
            nik: '3275011502950001',
            email: 'ahmadrizki@gmail.com',
            phone: '087896543654',
            gender: 'Male',
            dateOfBirth: '1995-02-15',
            education: 'Bachelor Degree (S1)',

            // Residential Address
            address: 'Jl. Ahmad Yani No. 17, RT 03 RW 04',
            district: 'Purwokerto Selatan',
            city: 'Kabupaten Banyumas',
            province: 'Jawa Tengah',
            postalCode: '53144',

            // Business / Organization
            company: 'PT. Jaya Sentosa',

            // Service Requirements
            maneka: 'Active',
            rembug: 'Not Subscribed',
            eventSpace: 'Yes',
            privateOffice: 'No',

            // Additional Information
            addInformation: 'Social Media',
            action: 'Manage'
        },
        {
            no: '2',
            // Personal Information
            member_id: 'MEM-BYM-002',
            full_name: 'Bambang Prakoso',
            nik: '3275020401880002',
            email: 'bambangprakos@gmail.com',
            phone: '085637826541',
            gender: 'Male',
            dateOfBirth: '1988-01-04',
            education: 'Diploma (D3)',

            // Residential Address
            address: 'Jl. Gatot Subroto No. 8, RT 02 RW 01',
            district: 'Banyumas',
            city: 'Kabupaten Banyumas',
            province: 'Jawa Tengah',
            postalCode: '53192',

            // Business / Organization
            company: 'CV. Makmur Abadi',

            // Service Requirements
            maneka: 'Not Subscribed',
            rembug: 'Active',
            eventSpace: 'No',
            privateOffice: 'Yes',

            // Additional Information
            addInformation: 'Friends / Family Recommendation',
            action: 'Manage'
        }
    ];


    const tableConfig = {
        headers: ['No', 'Member ID', 'Full Name', 'Email', 'Phone', 'Company', 'Action'],
        title: "Hetero Banyumas",
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
                <AddMemberBanyumas
                    isAddMemberModalOpen={isAddMemberModalOpen} 
                    setIsAddMemberModalOpen={setIsAddMemberModalOpen}
                />
            </div>
        </div>
    )
}

export default HeteroManagement;