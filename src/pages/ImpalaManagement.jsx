import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import ImpalaContent from '../components/Content/ImpalaContent';
import { useImpala } from "../hooks/useImpala";

const ImpalaManagement = () => {
    const [selectedParticipant, setSelectedParticipant] = useState(null)
    const { participant, loading, error, pagination, filters, setFilters, fetchImpala, addProgram, updateProgram, deleteProgram } = useImpala();
    // const members = [
    //     {
    //         id: 1,
    //         full_name: 'Sarah Brotoseno',
    //         email: 'sarah@bussiness.com',
    //         category: 'UMKM',
    //         bussinessName: 'Sarah Fashion Store',
    //         program_name: 'Business Development Program',
    //         phone: '08976543211',
    //         business: 'Retail',
    //         dateOfBirth: '1990-01-15',
    //         gender: 'Perempuan',
    //         address: 'Jl. Business Center No. 123',
    //         city: 'Jakarta Utara',
    //         province: 'DKI Jakarta',
    //         establishedYear: 2018,
    //         bussinessAddress: 'Jl. Retail Street No. 456',
    //         bussinessForm: 'PT',
    //         certifications: ["ISO-9001", "Halal-Certificate"],
    //         monthly_revenue: '50000000.00',
    //         total_employee: 15,
    //         hasOrganizationStructur: true,
    //         sosialMedia: ["instagram.com/sarahfashion", "facebook.com/sarahfashion"],
    //         marketplace: ["tokopedia.com/sarahfashion", "shopee.com/sarahfashion"],
    //         website: ["https://busineess_kue.com"],
    //         reason_join_program: 'Ingin belajar mengembangan usaha'
    //     },
    //     {
    //         id: 2,
    //         full_name: 'Budi Santoso',
    //         email: 'budi@student.ac.id',
    //         phone: '08976543211',
    //         category: 'Mahasiswa',
    //         institution: 'Universitas Indonesia',
    //         program_name: 'Student Entrepreneurship Program',
    //         dateOfBirth: '2001-08-20',
    //         gender: 'Laki-laki',
    //         address: 'Jl. Kampus No. 45',
    //         city: 'Depok',
    //         province: 'Jawa Barat',
    //         major: 'Teknik Informatika',
    //         enrollment_year: 2020,
    //         career_interest: 'Wirausaha Teknologi',
    //         core_competency: ["Programming", "Data Analysis", "Public Speaking"],
    //         reason_join_program: 'Ingin menambah ilmu'
    //     },
    //     {
    //         id: 3,
    //         full_name: "Ahmad Fauzi",
    //         email: "ahmad@kementerian.go.id",
    //         phone: "+628112233445",
    //         category: "Profesional",
    //         program_name: "Professional Development Program",
    //         dateOfBirth: "1980-12-05",
    //         gender: "Laki-laki",
    //         address: "Jl. Pemuda No. 10",
    //         city: "Jakarta Pusat",
    //         province: "DKI Jakarta",
    //         workplace: "Kementerian BUMN",
    //         position: "Analis Kebijakan",
    //         work_duration: "8 tahun",
    //         industry_sector: "Pemerintahan",
    //         reason_join_program: 'Ingin menambah ilmu'
    //     },
    //     {
    //         id: 4,
    //         full_name: "Dewi Lestari",
    //         email: "dewi@komunitas.org",
    //         phone: "+628556677889",
    //         program_name: "Community Empowerment Program",
    //         category: "Komunitas",
    //         dateOfBirth: "1992-07-15",
    //         gender: "Perempuan",
    //         address: "Jl. Melati No. 25",
    //         city: "Bandung",
    //         province: "Jawa Barat",
    //         name_community: "Komunitas Digital Kreatif",
    //         focus_area: "Pelatihan Digital Marketing",
    //         total_members: 150,
    //         operational_area: "Lokal",
    //         reason_join_program: "Penguatan_komunitas",
    //     }
    // ];

    const handleEdit = () => {
        if (selectedParticipant) {
            console.log('Edit client:', selectedParticipant);
            
            alert(`Edit client: ${selectedParticipant.fullName}`);
        }
    };

    const handleDelete = () => {
        if (selectedParticipant) {
            if (window.confirm(`Are you sure you want to delete ${selectedParticipant.fullName}?`)) {
                console.log('Delete client:', selectedParticipant);
                
                setSelectedParticipant(null); 
                alert(`Client ${selectedParticipant.fullName} deleted`);
            }
        }
    };

    useEffect(() => {
        if (selectedParticipant && participant.length > 0) {
            const currentSelected = participant.find(participant => participant.id === selectedParticipant.id)
            if (currentSelected) {
                setSelectedParticipant(currentSelected)
            }
        }
    }, [participant, selectedParticipant?.id])

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Program Name', 'Category', 'Entity', 'Action'],
        title: "Impala Management",
        addButton: "Add Participants",
        detailTitle: "Participant Details"
    };

    const formattedParticipants = participant.map((participant, index) => {
        const currentPage = pagination.page
        const itemsPerPage = pagination.limit
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1

        return {
            id: participant.id,
            no: itemNumber,
            full_name: participant.full_name,
            email: participant.email,
            category: participant.category,
            program_name: participant.program_name,
            phone: participant.phone,
            business: participant.business,
            // dateOfBirth: participant.dateOfBirth,
            gender: participant.gender,
            action: 'Detail',
            ...participant
        }
    })

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
                            members={formattedParticipants}
                            onSelectMember={setSelectedParticipant}
                            headers={tableConfig.headers}
                            isLoading={loading}
                        />

                        <div className='mt-6'>
                            <Pagination 
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.total}
                                // onPageChange={handlePageChange}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                </Card>

                <ImpalaContent
                    selectedMember={selectedParticipant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />
            </div>
        </div>
    )
}

export default ImpalaManagement;