import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, X } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useState } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import FilterDropdown from '../components/SearchFilter/FilterDropdown';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import ProgramContent from "../components/Content/ProgramClient";

const Program = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false)
    
    const members = [
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
        headers: ['No', 'Program Name', 'Program Code', 'Category', 'Status', 'Duration', 'Price', 'Action'],
        title: "Program Management",
        addButton: "Add Program",
        detailTitle: "Program Details"
    };

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
                            members={members}
                            onSelectMember={setSelectedMember}
                            headers={tableConfig.headers}
                        />

                        <div className='mt-6'>
                            <Pagination />
                        </div>
                    </CardContent>
                </Card>

                <ProgramContent
                    selectedMember={selectedMember}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />

                {/* Add Program Modal */}
                {isAddProgramModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop dengan efek redup */}
                        <div 
                            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                            onClick={handleCloseModal}
                        />
                        
                        {/* Modal Content */}
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

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* Basic Information */}
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