import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import ClientContent from "../components/Content/ClientContent";
import { toast } from 'react-hot-toast';

const ProgramClient = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        industry: '',
        company: '',
        program_name: '',
        sortBy: 'id',
        sortOrder: 'desc'
    });
    
    // const members = [
    //     {
    //         id: 1,
    //         fullName: 'Muhammad Faiz Al Izza',
    //         email: 'mfaizalizza@gmail.com',
    //         phone: '+62 85293387788',
    //         company: 'MBG Company',
    //         industry: 'Fast Moving Consumer Goods',
    //         programName: 'Startup 1001',
    //         status: 'Active',
    //         dealSize: 'Rp 250.000.000',
    //         gender: 'Laki-laki',
    //         business: 'Retail',
    //         total_employee: '500-1000 employees',
    //         address: 'Jl. Semarang Barat No. 123',
    //         city: 'Semarang',
    //         country: 'Indonesia',
    //         position: 'Marketing Manager',
    //         joinDate: '2024-01-15',
    //         notes: 'Client tertarik dengan program scaling',
    //         action: 'Detail'
    //     },
    //     {
    //         id: 2,
    //         fullName: 'Dr. Richard Tan',
    //         email: 'richard@medicallab.co.id',
    //         phone: '+62 81122334455',
    //         company: 'Medical Lab Indonesia',
    //         industry: 'Healthcare Services',
    //         programName: 'Healthcare Analytics Pro',
    //         status: 'Inactive',
    //         dealSize: 'Rp 420.000.000',
    //         gender: 'Laki-laki',
    //         business: 'Medical Laboratory',
    //         total_employee: '200-500 employees',
    //         address: 'Jl. Gatot Subroto Kav. 21, Jakarta',
    //         city: 'Jakarta',
    //         country: 'Indonesia',
    //         position: 'Medical Director',
    //         joinDate: '2024-02-05',
    //         notes: 'Phase 1 implementation completed, training staff for phase 2',
    //         action: 'Detail'
    //     }
    // ];

    const fetchClient = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                ...filters
            }).toString();

            const response = await fetch(`http://localhost:3000/api/client?${queryParams}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setMembers(result.data || []);
                setPagination(prev => ({
                    ...prev,
                    page: result.meta?.pagination?.page || page,
                    total: result.meta?.pagination?.total || 0,
                    totalPages: result.meta?.pagination?.totalPages || 0
                }));
            } else {
                throw new Error(result.message || 'Failed to fetch clients');
            }

        } catch (error) {
            console.error('Error fetching client:', error)
            setError(error.message)
            toast.error('Failed to load client')
        } finally {
            setLoading(false)
        }
    }

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Phone', 'Company', 'Program Name', 'Deal', 'Status', 'Action'],
        title: "Client Management",
        addButton: "Add Client",
        detailTitle: "Client Details"
    };

    useEffect(() => {
        fetchClient();
    }, [])
    
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


    const formattedMembers = members.map((client, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        
        // ✅ Nomor urut = (page - 1) * limit + index + 1
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
        
        return {
            id: client.id,
            no: itemNumber, // ✅ Ini yang akan ditampilkan di kolom "No"
            fullName: client.full_name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            industry: client.industry,
            programName: client.program_name,
            deal: client.deal_size,
            status: client.status,
            action: 'Detail',
            // Original data untuk detail view
            ...client
        };
    });

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>

                        {loading && (
                            <div>
                                <Loader2 />
                                Loading...
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div>
                                <div>
                                    <p>{error}</p>
                                    <Button>
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

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

                        {loading && members.length === 0 ? (
                            <div>
                                <Loader2 />
                                <span>Loading Client...</span>
                            </div>
                        ) : (
                            <>
                                <MemberTable
                                    members={formattedMembers}
                                    onSelectMember={setSelectedMember}
                                    headers={tableConfig.headers}
                                    isLoading={loading}
                                />

                                <div className='mt-6'>
                                    <Pagination />
                                </div>
                            </>
                        )}

                        
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