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
            member_id: 'MEM-SRK-001', 
            full_name: 'Dewi Sartika',
            email: 'dewisartika@gmail.com',
            phone: '081234567890',
            company: 'PT. Solo Maju',
            action: 'Manage'
        },
        {
            no: '1',
            member_id: 'MEM-SRK-002',
            full_name: 'Rudi Hartono',
            email: 'rudihartono@gmail.com',
            phone: '082345678901',
            company: 'CV. Batik Indah',
            action: 'Manage'
        },
        {
            no: '3',
            member_id: 'MEM-SRK-003',
            full_name: 'Siti Aminah',
            email: 'sitiaminah@gmail.com',
            phone: '083456789012',
            company: 'PT. Jaya Abadi',
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