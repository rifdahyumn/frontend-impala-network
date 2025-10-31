import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState } from "react";
import { X, Plus, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import programService from "../../services/programService";

const AddProgram = ({ isAddProgramModalOpen, setIsAddProgramModalOpen, onAddProgram, editData = null, onEditProgram }) => {
    const isEditMode = !!editData

    const [newInstructor, setNewInstructor] = useState('');
    const [newTag, setNewTag] = useState('');
    const [formData, setFormData] = useState({
        program_name: '',
        client: '',
        category: '',
        status: 'Active',
        duration: '',
        start_date: '',
        end_date: '',
        price: '',
        capacity: '',
        instructor: [],
        location: '',
        description: '',
        tags: []
    });

    const [loading, setLoading] = useState(false)
    const [programNames, setProgramNames] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isAddProgramModalOpen) {
            fetchProgramNames();
        }
    }, [isAddProgramModalOpen]);

    const fetchProgramNames = async (search = '') => {
        setLoadingPrograms(true);
        try {
            const response = await programService.getProgramNamesFromClients(search);
            setProgramNames(response.data || []);
        } catch (error) {
            console.error('Error fetching program names:', error);
            toast.error('Failed to load program names');
        } finally {
            setLoadingPrograms(false);
        }
    };

    const handleProgramSearch = (query) => {
        setSearchQuery(query);
        fetchProgramNames(query);
    };

    const handleProgramSelect = (selectedProgramName) => {
        const selectedProgram = programNames.find(program => program.program_name === selectedProgramName);
        if (selectedProgram) {
            setFormData(prev => ({
                ...prev,
                program_name: selectedProgram.program_name,
                client: selectedProgram.company || '',
                description: selectedProgram.program_name ? `Program ${selectedProgram.program_name} untuk ${selectedProgram.client_name || selectedProgram.company}` : ''
            }));

            if (errors.program_name) {
                setErrors(prev => ({
                    ...prev,
                    program_name: ''
                }));
            }
        }
    };

    const formSections = [
        {
            title: "Program Information",
            fields: [
                {
                    name: 'program_name',
                    label: 'Program Name',
                    type: 'program_dropdown',
                    required: true,
                    placeholder: 'Select program name',
                    options: programNames,
                    loading: loadingPrograms
                },
                {
                    name: 'client',
                    label: 'Client Company',
                    type: 'text',
                    required: true,
                    placeholder: 'Will auto-fill from program selection',
                    disabled: true
                },
                {
                    name: 'category',
                    label: 'Category',
                    type: 'select',
                    required: true,
                    placeholder: 'Select category',
                    options: [
                        { value: 'seminar', label: 'Seminar / Webinar' },
                        { value: 'workshop', label: 'Workshop / Training' },
                        { value: 'volunteer', label: 'Volunteer / Community Service' },
                        { value: 'exhibition', label: 'Exhibition / Expo' }
                    ]
                },
                {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Enter program description'
                }
            ]
        },
        {
            title: "Schedule & Duration",
            fields: [
                {
                    name: 'duration',
                    label: 'Duration',
                    type: 'text',
                    required: true,
                    placeholder: 'e.g., 3 months, 4 months'
                },
                {
                    name: 'start_date',
                    label: 'Start Date',
                    type: 'date',
                    required: true,
                    placeholder: 'Select start date'
                },
                {
                    name: 'end_date',
                    label: 'End Date',
                    type: 'date',
                    required: true,
                    placeholder: 'Select end date'
                },
                {
                    name: 'location',
                    label: 'Location',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter program location'
                }
            ]
        },
        {
            title: "Pricing & Capacity",
            fields: [
                {
                    name: 'price',
                    label: 'Price',
                    type: 'text',
                    required: true,
                    placeholder: 'e.g., Rp 250.000.000'
                },
                {
                    name: 'capacity',
                    label: 'Capacity',
                    type: 'select',
                    required: true,
                    placeholder: 'Select capacity',
                    options: [
                        { value: '1-50', label: '1-50' },
                        { value: '50-100', label: '50-100' },
                        { value: '100-500', label: '100-500' },
                    ]
                }
            ]
        },
        {
            title: "Instructors",
            customComponent: true,
            fields: [],
            render: () => (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={newInstructor}
                            onChange={(e) => setNewInstructor(e.target.value)}
                            placeholder="Enter instructor name"
                            className="flex-1"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddInstructor();
                                }
                            }}
                        />
                        <Button 
                            type="button" 
                            onClick={handleAddInstructor}
                            className="flex items-center gap-1"
                        >
                        <Plus className="h-4 w-4" />
                            Add
                        </Button>
                    </div>
                
                {formData.instructor.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.instructor.map((instructor, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                                {instructor}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveInstructor(index)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            )
        },
        {
            title: "Tags",
            customComponent: true,
            fields: [],
            render: () => (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Enter tag (e.g., Startup, Funding)"
                            className="flex-1"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                                }
                            }}
                        />
                        <Button 
                            type="button" 
                            onClick={handleAddTag}
                            className="flex items-center gap-1"
                            >
                        <Plus className="h-4 w-4" />
                            Add
                        </Button>
                    </div>
                
                    {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(index)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }
    ];

    useEffect(() => {
        if (isEditMode && editData) {
            setFormData({
                program_name: editData.program_name || '',
                client: editData.client || '',
                category: editData.category || '',
                status: editData.status || '',
                duration: editData.duration || '',
                start_date: editData.start_date || '',
                end_date: editData.end_date || '',
                price: editData.price || '',
                capacity: editData.capacity || '',
                instructor: editData.instructor || '',
                location: editData.location || '',
                description: editData.description || '',
                tags: editData.tags || ''
            })
        } else {
            setFormData({
                program_name: '',
                client: '',
                category: '',
                status: '',
                duration: '',
                start_date: '',
                end_date: '',
                price: '',
                capacity: '',
                instructor: '',
                location: '',
                description: '',
                tags: ''
            })
        }
        setErrors({})
    }, [isEditMode, editData, isAddProgramModalOpen])

    const validateForm = () => {
        const newErrors = {}

        formSections.forEach(section => {
            if (section.fields && Array.isArray(section.fields)) {
                section.fields.forEach(field => {
                    if (field.required) {
                        const value = formData[field.name];
                        if (!value || value.toString().trim() === '') {
                            newErrors[field.name] = `${field.label} is required`
                        }
                    }
                })
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'program_name' && value !== formData.program_name) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                client: '' 
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if(errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors in the form')
            return;
        }

        setLoading(true)

        try {
            const programData = {
                ...formData,
            }

            if (isEditMode) {
                if (onEditProgram) {
                    await onEditProgram(editData.id, programData)
                } else {
                    await programService.updateProgram(editData.id, programData)
                    toast.success('updated successfully')
                }
            } else {
                if (onAddProgram) {
                    await onAddProgram(programData)
                } else {
                    await programService.addProgram(programData)
                    toast.success('Added successfully')
                }
            }

            handleCloseModal()
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} program: `, error)
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} program`)
        } finally {
            setLoading(false)
        }
    };

    const handleCloseModal = () => {
        setIsAddProgramModalOpen(false);
        setErrors({});
        setSearchQuery('');
        setProgramNames([]);
    };

    const handleAddInstructor = () => {
        if (newInstructor.trim() && !formData.instructor.includes(newInstructor.trim())) {
        setFormData(prev => ({
            ...prev,
            instructor: [...prev.instructor, newInstructor.trim()]
        }));
        setNewInstructor('');
        }
    };

    const handleRemoveInstructor = (index) => {
        setFormData(prev => ({
            ...prev,
            instructor: prev.instructor.filter((_, i) => i !== index)
        }));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
            }
    };

    const handleRemoveTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const renderField = (field, index) => {
        if (!field || typeof field !== 'object') {
            console.warn('Invalid field:', field);
            return null;
        }

        const error = errors[field.name]
        const value = formData[field.name] || '';

        if (field.type === 'program_dropdown') {
            return (
                <div key={field.name || index} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    <Select
                        value={formData.program_name}
                        onValueChange={handleProgramSelect}
                        onOpenChange={(open) => {
                            if (open) fetchProgramNames();
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">

                            <div className="p-2 border-b sticky top-0 bg-white z-10">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search program names..."
                                        value={searchQuery}
                                        onChange={(e) => handleProgramSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>


                            {field.loading && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm">Loading program names...</span>
                                </div>
                            )}

 
                            {!field.loading && field.options && field.options.map((program, idx) => (
                                <SelectItem 
                                    key={`${program.program_name}-${idx}`} 
                                    value={program.program_name}
                                >
                                    <div className="flex flex-col py-1">
                                        <span className="font-medium text-sm">
                                            {program.program_name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {program.company} • {program.client_name}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}


                            {!field.loading && (!field.options || field.options.length === 0) && (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    {searchQuery ? 'No program names found' : 'No program names available'}
                                </div>
                            )}
                        </SelectContent>
                    </Select>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
 
                    {formData.program_name && formData.client && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded mt-2">
                            Selected: <strong>{formData.program_name}</strong> from <strong>{formData.client}</strong>
                        </div>
                    )}
                </div>
            );
        }

        if (field.disabled) {
            return (
                <div key={field.name || index} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        id={field.name}
                        name={field.name}
                        value={value}
                        placeholder={field.placeholder}
                        disabled={true}
                        className="bg-gray-100 text-gray-600"
                    />
                    <p className="text-xs text-gray-500">
                        This field will auto-fill when you select a program
                    </p>
                </div>
            );
        }

        if (field.type === 'select') {
            return (
                <div key={field.name || index} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                        value={value}
                        onValueChange={(value) => handleSelectChange(field.name, value)}
                        required={field.required}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            );
        }

        if (field.type === 'textarea') {
            return (
                <div key={field.name || index} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <textarea
                        id={field.name}
                        name={field.name}
                        value={value}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            );
        }

        return (
            <div key={field.name || index} className="space-y-2">
                <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className={error ? 'border-red-500' : ''}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
        );
    };

    return (
        <Dialog open={isAddProgramModalOpen} onOpenChange={setIsAddProgramModalOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Program' : 'Add New Program'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the program information below'
                            : 'Fill in the details below to add a new program to the system'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {formSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {section.title}
                                </h3>
                            </div>

                            {section.customComponent ? (
                                <div className="col-span-2">
                                    {section.render()}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {section.fields && section.fields.map((field, fieldIndex) => 
                                        renderField(field, fieldIndex)
                                    )}
                                </div>
                            )}

                            {sectionIndex < formSections.length - 1 && (
                                <div className="pt-2" />
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading 
                                ? (isEditMode ? 'Updating Program...' : 'Adding Program...')
                                : (isEditMode ? 'Update Program' : 'Add Program')
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProgram;