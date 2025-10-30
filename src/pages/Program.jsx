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
import ProgramContent from "../components/Content/ProgramClient";
import AddProgram from "../components/AddButton/AddProgram";

const Program = () => {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);

    const handleAddProgram = () => {
        setIsAddProgramModalOpen(true);
    };

    const programs = [
        {
            id: 1,
            programName: 'Startup 1001',
            programCode: 'STP-1001',
            category: 'Business Development',
            status: 'Active',
            duration: '3 months',
            startDate: '2025-10-01',
            endDate: '2025-12-31',
            price: 'Rp 250.000.000',
            capacity: 50,
            instructor: ['Ahmad Wijaya', 'Willie Salim', 'Pras Teguh', 'Deddy Corbuzier'],
            location: 'Hetero Space Semarang',
            description: 'Program intensif untuk startup early stage',
            tags: ['Startup', 'Funding', 'Mentoring'],
            action: 'Details'
        },
        {
            id: 2,
            programName: 'Healthcare Analytics Pro',
            programCode: 'HCP-2001',
            category: 'Healthcare Technology',
            status: 'Active',
            duration: '4 months',
            startDate: '2025-10-01',
            endDate: '2026-01-31',
            price: 'Rp 420.000.000',
            capacity: 30,
            instructor: ['Dr. Sarah Miller', 'Dr. Tirta Peng Peng', 'Dr. Boyke'],
            location: 'Hetero Space Solo & Online',
            description: 'Advanced analytics untuk industri healthcare',
            tags: ['Healthcare', 'Analytics', 'Data Science'],
            action: 'Details'
        },
    ];

    const tableConfig = {
        headers: ['No', 'Program Name', 'Client Name', 'Category', 'Status', 'Duration', 'Price', 'Action'],
        title: "Program Management",
        addButton: "Add Program",
        detailTitle: "Program Details"
    };

    const handleEdit = () => {
        if (selectedProgram) {
            console.log('Edit program:', selectedProgram);
            alert(`Edit program: ${selectedProgram.programName}`);
        }
    };

    const handleDelete = () => {
        if (selectedProgram) {
            if (window.confirm(`Are you sure you want to delete ${selectedProgram.programName}?`)) {
                console.log('Delete program:', selectedProgram);
                setSelectedProgram(null); 
                alert(`Program ${selectedProgram.programName} deleted`);
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
                                    onClick={handleAddProgram}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton />
                            </div>
                        </div>

                        <MemberTable
                            members={programs}
                            onSelectMember={setSelectedProgram}
                            headers={tableConfig.headers}
                        />

                        <div className='mt-6'>
                            <Pagination />
                        </div>
                    </CardContent>
                </Card>

                <ProgramContent
                    selectedMember={selectedProgram}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />

                <AddProgram 
                    isAddProgramModalOpen={isAddProgramModalOpen} 
                    setIsAddProgramModalOpen={setIsAddProgramModalOpen}    
                />
            </div>
        </div>
    )
}

export default Program;