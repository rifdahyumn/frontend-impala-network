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
    const isEditMode = !!editData;

    const [newInstructor, setNewInstructor] = useState('');
    const [newTag, setNewTag] = useState('');
    const [formData, setFormData] = useState({
        program_name: '',
        client: '',
        category: '',
        status: 'Active',
        start_date: '',
        end_date: '',
        price: 'Rp. ',
        link_rab: '',
        capacity: '',
        instructors: [],
        location: '',
        description: '',
        tags: []
    });

    const [loading, setLoading] = useState(false);
    const [programNames, setProgramNames] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});

    const formatCurrency = (value) => {
        if (!value) return 'Rp. ';
        
        const cleanValue = value.replace('Rp.', '').replace(/\s/g, '')
        const numericValue = cleanValue.replace(/\D/g, '');

        if (numericValue === '') return 'Rp. ';

        const numberValue = parseInt(numericValue);
        if (isNaN(numberValue)) return 'Rp. ';
        
        const formatted = numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `${formatted}`;
    };

    const parseCurrency = (formattedValue) => {
        if (!formattedValue || formattedValue === 'Rp. ' || formattedValue === 'Rp.') return '';
        
        return formattedValue
            .replace('Rp.', '')
            .replace(/\s/g, '')
            .replace(/\./g, '');
    };

    const handlePriceInput = (e) => {
        const { name, value } = e.target;

        if (value === 'Rp. ' || value === 'Rp.' || value === '') {
            setFormData(prev => ({
                ...prev,
                [name]: 'Rp. '
            }));
            return;
        }
        
        const formattedValue = formatCurrency(value);
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePriceKeyDown = (e) => {
        if (e.key === 'Backspace') {
            const currentValue = formData.price.replace(/\s/g, '');
            if (currentValue === 'Rp.' || currentValue === 'Rp') {
                setFormData(prev => ({
                    ...prev,
                    price: 'Rp. '
                }));
                e.preventDefault();
            }
        }
    };
    const handlePricePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        
        const numbersOnly = pastedData.replace(/\D/g, '');
        const formattedValue = formatCurrency(numbersOnly);
        
        setFormData(prev => ({
            ...prev,
            price: formattedValue
        }));
    };

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
                    loading: loadingPrograms,
                    disabled: isEditMode
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
                        { value: 'Seminar', label: 'Seminar / Webinar' },
                        { value: 'Workshop', label: 'Workshop' },
                        { value: 'Community Service', label: 'Community Service' },
                        { value: 'Expo', label: 'Expo' }
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
                    placeholder: ''
                },
                {
                    name: 'link_rab',
                    label: 'Link RAB',
                    type: 'text',
                    required: true,
                    placeholder: ''
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
                
                    {formData.instructors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.instructors.map((instructor, index) => (
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
            let formattedPrice = 'Rp. ';

            if (editData.price) {
                if (!editData.price.startsWith('Rp. ')) {
                    const numericValue = editData.price.toString().replace(/\D/g, '');
                    formattedPrice = formatCurrency(numericValue);
                } else {
                    formattedPrice = editData.price;
                }
            }

            setFormData({
                program_name: editData.program_name || '',
                client: editData.client || '',
                category: editData.category || '',
                status: editData.status || 'Active',
                start_date: editData.start_date || '',
                end_date: editData.end_date || '',
                price: formattedPrice,
                link_rab: editData.link_rab || '',
                capacity: editData.capacity || '',
                instructors: editData.instructors || [],
                location: editData.location || '',
                description: editData.description || '',
                tags: editData.tags || []
            });
        } else {
            setFormData({
                program_name: '',
                client: '',
                category: '',
                status: 'Active',
                start_date: '',
                end_date: '',
                price: '',
                link_rab: '',
                capacity: '',
                instructors: [],
                location: '',
                description: '',
                tags: []
            });
        }
        setErrors({});
    }, [isEditMode, editData, isAddProgramModalOpen]);

    const validateForm = () => {
        const newErrors = {};

        formSections.forEach(section => {
            if (section.fields && Array.isArray(section.fields)) {
                section.fields.forEach(field => {
                    if (field.required) {
                        const value = formData[field.name];
                        if (!value || value.toString().trim() === '' || value === 'Rp. ') {
                            newErrors[field.name] = `${field.label} is required`;
                        }
                    }
                });
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'program_name' && value !== formData.program_name) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                client: '' 
            }));
        } else if (name === 'price') {
            handlePriceInput(e); 
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
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
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const rawPrice = parseCurrency(formData.price);

            const programData = {
                program_name: formData.program_name,
                client: formData.client,
                category: formData.category,
                status: formData.status || 'Active',
                start_date: formData.start_date,
                end_date: formData.end_date,
                price: rawPrice,
                link_rab: formData.link_rab,
                capacity: formData.capacity,
                instructors: Array.isArray(formData.instructors) ? formData.instructors : [formData.instructors],
                location: formData.location,
                description: formData.description,
                tags: Array.isArray(formData.tags) ? formData.tags : [formData.tags]
            };

            if (isEditMode) {
                if (onEditProgram) {
                    await onEditProgram(editData.id, programData);
                } else {
                    await programService.updateProgram(editData.id, programData);
                    toast.success('Program updated successfully');
                }
            } else {
                if (onAddProgram) {
                    await onAddProgram(programData);
                } else {
                    await programService.addProgram(programData);
                    toast.success('Program added successfully');
                }
            }

            handleCloseModal();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} program:`, error);
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} program`);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsAddProgramModalOpen(false);
        setErrors({});
        setSearchQuery('');
        setProgramNames([]);
        setNewInstructor('');
        setNewTag('');
    };

    const handleAddInstructor = () => {
        if (newInstructor.trim() && !formData.instructors.includes(newInstructor.trim())) {
            setFormData(prev => ({
                ...prev,
                instructors: [...prev.instructors, newInstructor.trim()]
            }));
            setNewInstructor('');
        }
    };

    const handleRemoveInstructor = (index) => {
        setFormData(prev => ({
            ...prev,
            instructors: prev.instructors.filter((_, i) => i !== index)
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

        const error = errors[field.name];
        const value = formData[field.name] || '';

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

        if (field.name === 'price') {
            return (
                <div key={field.name || index} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    <div className="relative">
                        <Input 
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={formData.price}
                            onChange={handlePriceInput}
                            onKeyDown={handlePriceKeyDown}
                            onPaste={handlePricePaste}
                            required={field.required}
                            className={`pl-12 ${error ? 'border-red-500' : ''} font-medium`}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-semibold text-sm">
                            Rp.
                        </span>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            );
        }

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
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical"
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
            <DialogContent className="max-h-[90vh] max-w-[900px] overflow-y-auto">
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
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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