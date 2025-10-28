import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from "../components/SearchFilter/Filter";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "../components/ui/button"

const HeteroSemarang = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    
    // Data khusus untuk Semarang
    const members = [
        {
            id: 'SMR-001',
            employeeId: 'EMP-SMR-001',
            fullName: 'Ahmad Rizki',
            position: 'Software Engineer',
            department: 'IT',
            joinDate: '2023-01-15',
            status: 'Active',
            salary: 'Rp 15,000,000',
            action: 'Manage'
        },
        {
            id: 'SMR-002',
            employeeId: 'EMP-SMR-002',
            fullName: 'Sari Dewi',
            position: 'Product Manager',
            department: 'Product',
            joinDate: '2023-03-20',
            status: 'Active',
            salary: 'Rp 20,000,000',
            action: 'Manage'
        }
    ];

    const tableConfig = {
        headers: ['ID', 'Employee ID', 'Full Name', 'Position', 'Department', 'Join Date', 'Status', 'Salary', 'Action'],
        title: "Hetero Semarang",
        addButton: "Add Member",
        detailTitle: "Member Details"
    };

    // Form state untuk Add Member
    const [formData, setFormData] = useState({
        employeeId: '',
        fullName: '',
        position: '',
        department: '',
        joinDate: '',
        status: 'Active',
        salary: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddMemberModalOpen(false);
        setFormData({
            employeeId: '',
            fullName: '',
            position: '',
            department: '',
            joinDate: '',
            status: 'Active',
            salary: ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('New member data:', formData);
        alert(`Employee ${formData.fullName} added successfully to Semarang!`);
        handleCloseModal();
    };

    // Navigation handlers

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            {/* Main Sidebar */}


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
                                    Add Member
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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Member Details - Semarang</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {selectedMember ? (
                            <div className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Full Name</label>
                                        <p className='text-gray-900'>{selectedMember.fullName}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Position</label>
                                        <p className='text-gray-900'>{selectedMember.position}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Department</label>
                                        <p className='text-gray-900'>{selectedMember.department}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Join Date</label>
                                        <p className='text-gray-900'>{selectedMember.joinDate}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Status</label>
                                        <p className='text-gray-900'>{selectedMember.status}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-500'>Salary</label>
                                        <p className='text-gray-900'>{selectedMember.salary}</p>
                                    </div>
                                </div>
                            </div>
                        ) : ( 
                            <div className='text-center py-8 text-gray-500'>
                                <p>Select a member to view details</p>
                            </div>
                        )} 
                    </CardContent>
                </Card>

                {/* Add Member Modal */}
                {isAddMemberModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                            onClick={handleCloseModal}
                        />
                        
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-semibold">Add New Member - Semarang</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCloseModal}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Employee ID *
                                        </label>
                                        <input
                                            type="text"
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="EMP-SMR-XXX"
                                            required
                                        />
                                    </div>
                                    {/* ... rest of form fields ... */}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Add Member
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HeteroSemarang;