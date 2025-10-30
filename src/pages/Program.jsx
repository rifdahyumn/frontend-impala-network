import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import ProgramContent from "../components/Content/ProgramClient";
import { toast } from 'react-hot-toast';
import { LoadingSpinner, LoadingOverlay, LoadingTable, LoadingCard } from '../components/Loading/'

const Program = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
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
        // sortOrder: 'desc'
    });

    const fetchClient = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                ...filters
            }).toString();

            const response = await fetch(`http://localhost:3000/api/program?${queryParams}`);

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
        headers: ['No', 'Program Name', 'Client', 'Category', 'Status', 'Duration', 'Price', 'Action'],
        title: "Program Management",
        addButton: "Add Program",
        detailTitle: "Program Details"
    };

    useEffect(() => {
            fetchClient();
    }, [])

    // Form state untuk Add Program
    const [formData, setFormData] = useState({
        programName: '',
        programCode: '',
        category: '',
        status: 'Active',
        duration: '',
        startDate: '',
        endDate: '',
        price: '',
        capacity: '',
        instructor: [''],
        location: '',
        description: '',
        tags: ['']
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInstructorChange = (index, value) => {
        const updatedInstructors = [...formData.instructor];
        updatedInstructors[index] = value;
        setFormData(prev => ({
            ...prev,
            instructor: updatedInstructors
        }));
    };

    const handleAddInstructor = () => {
        setFormData(prev => ({
            ...prev,
            instructor: [...prev.instructor, '']
        }));
    };

    const handleRemoveInstructor = (index) => {
        if (formData.instructor.length > 1) {
            const updatedInstructors = formData.instructor.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                instructor: updatedInstructors
            }));
        }
    };

    const handleTagChange = (index, value) => {
        const updatedTags = [...formData.tags];
        updatedTags[index] = value;
        setFormData(prev => ({
            ...prev,
            tags: updatedTags
        }));
    };

    const handleAddTag = () => {
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, '']
        }));
    };

    const handleRemoveTag = (index) => {
        if (formData.tags.length > 1) {
            const updatedTags = formData.tags.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                tags: updatedTags
            }));
        }
    };

    const handleAddProgram = () => {
        setIsAddProgramModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddProgramModalOpen(false);
        // Reset form
        setFormData({
            programName: '',
            programCode: '',
            category: '',
            status: 'Active',
            duration: '',
            startDate: '',
            endDate: '',
            price: '',
            capacity: '',
            instructor: [''],
            location: '',
            description: '',
            tags: ['']
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter out empty instructors and tags
        const filteredInstructors = formData.instructor.filter(instructor => instructor.trim() !== '');
        const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
        
        const programData = {
            ...formData,
            instructor: filteredInstructors,
            tags: filteredTags
        };
        
        console.log('New program data:', programData);
        alert(`Program "${formData.programName}" added successfully!`);
        handleCloseModal();
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

    const formattedProgram = members.map((client, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
        
        return {
            id: client.id,
            no: itemNumber,
            programName: client.full_name,
            client: client.client,
            category: client.category,
            duration: client.duration,
            price: client.price,
            // deal: client.deal_size,
            status: client.status,
            action: 'Detail',
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
                            <LoadingSpinner 
                                size='sm'
                                text='Loading Program...'
                                className='px-4 py-2 bg-blue-50 rounded-full border border-blue-200'
                            />
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load clients</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        // onClick={handleRefresh}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        <RefreshCw className="h-4 w-4" />
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

                        {loading && members.length === 0 ? (
                            // ✅ Using Loading Components for initial load
                            <div className="space-y-6">
                                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                    <LoadingSpinner size="xl" text="Loading clients..." />
                                    <div className="w-64 bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                    </div>
                                </div>
                                
                                {/* Optional: Show skeleton table while loading */}
                                <LoadingTable columns={9} rows={5} />
                            </div>
                        ) : members.length === 0 ? (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">No clients found</h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {filters.search || Object.values(filters).some(f => f) 
                                            ? "Try adjusting your search or filters to find what you're looking for."
                                            : "Get started by adding your first client to the system."
                                        }
                                    </p>
                                </div>
                                <Button 
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => toast.success('Add client feature coming soon!')}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Your First Client
                                </Button>
                            </div>
                        ) : (
                            // Data Loaded State
                            <>
                                <div className="relative">
                                    {/* ✅ Using LoadingOverlay for refresh */}
                                    {loading && (
                                        <LoadingOverlay 
                                            message="Updating data..."
                                            blurBackground={true}
                                        />
                                    )}
                                    
                                    <MemberTable
                                        members={formattedProgram}
                                        onSelectMember={setSelectedMember}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                {/* Pagination */}
                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        Showing <span className="font-semibold">{formattedProgram.length}</span> of{' '}
                                        <span className="font-semibold">{pagination.total}</span> clients
                                    </div>
                                    
                                    <Pagination 
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        onPageChange={(page) => {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            fetchClient(page);
                                        }}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        
                    </CardContent>
                </Card>

                <ProgramContent
                    selectedMember={selectedMember}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />

                {isAddProgramModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                            onClick={handleCloseModal}
                        />

                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-semibold">Add New Program</h2>
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

                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Program Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="programName"
                                            value={formData.programName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter program name"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Program Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="programCode"
                                            value={formData.programCode}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., STP-1001"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Business Development">Business Development</option>
                                            <option value="Healthcare Technology">Healthcare Technology</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Finance">Finance</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status *
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Draft">Draft</option>
                                        </select>
                                    </div>

                                    {/* Duration & Dates */}
                                    <div className="md:col-span-2 mt-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule & Duration</h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration *
                                        </label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., 3 months"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Pricing & Capacity */}
                                    <div className="md:col-span-2 mt-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Capacity</h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price *
                                        </label>
                                        <input
                                            type="text"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Rp 0.000.000"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Capacity *
                                        </label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Maximum participants"
                                            required
                                        />
                                    </div>

                                    {/* Location & Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Hetero Space Semarang"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Program description"
                                            required
                                        />
                                    </div>

                                    {/* Instructors */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Instructors
                                            </label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddInstructor}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Instructor
                                            </Button>
                                        </div>
                                        {formData.instructor.map((instructor, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={instructor}
                                                    onChange={(e) => handleInstructorChange(index, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Instructor name"
                                                />
                                                {formData.instructor.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveInstructor(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tags */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tags
                                            </label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddTag}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Tag
                                            </Button>
                                        </div>
                                        {formData.tags.map((tag, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={tag}
                                                    onChange={(e) => handleTagChange(index, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Tag name"
                                                />
                                                {formData.tags.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveTag(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Add Program
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

export default Program;