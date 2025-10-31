import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import clientService from "../../services/clientService";

const AddClient = ({ isAddUserModalOpen, setIsAddUserModalOpen, onAddClient, editData = null, onEditClient = null }) => {
    const isEditMode = !!editData
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        program_name: '',
        join_date: '',
        gender: '',
        position: '',
        business: '',
        total_employee: '',
        address: '',
        city: '',
        country: '',
        notes: '',
        status: 'Active'
    });

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const formSections = [
        {
            title: "Personal Information",
            fields: [
                {
                    name: 'full_name',
                    label: 'Full Name',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter full name'
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    placeholder: 'Enter email address'
                },
                {
                    name: 'phone',
                    label: 'Phone',
                    type: 'tel',
                    required: true,
                    placeholder: 'Enter phone number'
                },
                {
                    name: 'gender',
                    label: 'Gender',
                    type: 'select',
                    required: true,
                    placeholder: 'Select gender',
                    options: [
                        { value: 'Laki-laki', label: 'Male' },
                        { value: 'Perempuan', label: 'Female' }
                    ]
                },
            ]
        },
        {
            title: "Company Detail",
            fields: [
                {
                    name: 'company',
                    label: 'Company',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter company name'
                },
                {
                    name: 'business',
                    label: 'Business Type',
                    type: 'select',
                    required: true,
                    placeholder: 'Select business type',
                    options: [
                        { value: 'Retail', label: 'Retail' },
                        { value: 'Technology', label: 'Technology' },
                        { value: 'Healthcare', label: 'Healthcare' },
                        { value: 'Finance', label: 'Finance' },
                        { value: 'Education', label: 'Education' }
                    ]
                },
                {
                    name: 'total_employee',
                    label: 'Total Employee',
                    type: 'select',
                    required: true,
                    placeholder: 'Select total employee',
                    options: [
                        { value: '1-50', label: '1-50 employees' },
                        { value: '50-100', label: '50-100 employees' },
                        { value: '100-500', label: '100-500 employees' },
                        { value: '500-1000', label: '500-1000 employees' },
                        { value: '1000+', label: '1000+ employees' }
                    ]
                },
                {
                    name: 'position',
                    label: 'Job Position',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter position'
                },
            ]
        },
        {
            title: "Program",
            fields: [
                {
                    name: 'program_name',
                    label: 'Program Name',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter program name'
                },
                // {
                //   name: 'joindate',
                //   label: 'Join Date',
                //   type: 'date',
                //   required: true,
                //   placeholder: 'Select join date'
                // },
            ]
        },
        {
            title: "Location",
            fields: [
                {
                    name: 'address',
                    label: 'Adress',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter address'
                },
                {
                    name: 'city',
                    label: 'City',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter city'
                },
                {
                    name: 'country',
                    label: 'Country',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter country'
                },
            ]
        },
        {
            title: "Additional Information",
            fields: [
                {
                    name: 'notes',
                    label: 'Notes',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Enter notes'
                },
            ]
        }
    ];

    useEffect(() => {
        if (isEditMode && editData) {
            setFormData({
                full_name: editData.full_name || '',
                email: editData.email || '',
                phone: editData.phone || '',
                company: editData.company || '',
                program_name: editData.program_name || '',
                join_date: editData.join_date || '',
                gender: editData.gender || '',
                position: editData.position || '',
                business: editData.business || '',
                total_employee: editData.total_employee || '',
                address: editData.address || '',
                city: editData.city || '',
                country: editData.country || '',
                notes: editData.notes || '',
                status: editData.status || 'active'
                
            })
        } else {
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                company: '',
                program_name: '',
                join_date: '',
                gender: '',
                position: '',
                business: '',
                total_employee: '',
                address: '',
                city: '',
                country: '',
                notes: '',
                status: 'Active',
            })
        }
        setErrors({})
    }, [isEditMode, editData, isAddUserModalOpen])

    const validateForm = () => {
        const newErrors = {}

        formSections.forEach(section => {
            section.fields.forEach(field => {
                if (field.required) {
                    const value = formData[field.name]
                    if (!value || value.toString().trim() === '') {
                        newErrors[field.name] = `${field.label} is required`
                    }
                }
            })
        })

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Phone number is too short'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

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
            const clientData = {
                ...formData,
                join_date: new Date().toISOString().split('T')[0]
            }

            if (isEditMode) {
                if (onEditClient) {
                    await onEditClient(editData.id, clientData)
                } else {
                    await clientService.updateClient(editData.id, clientData)
                    toast.success('updated successfully')
                }
            } else {
                if (onAddClient) {
                    await onAddClient(clientData)
                } else {
                    await clientService.addClient(clientData)
                    toast.success('Added successfully')
                }
            }

            handleCloseModal()
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} client: `, error)
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} client`)
        } finally {
            setLoading(false)
        }
    };

    const handleCloseModal = () => {
        setIsAddUserModalOpen(false);
        setErrors({})
    };

    const renderField = (field) => {
        const error = errors[field.name]
        const value = formData[field.name] || '';

        if (field.type === 'select') {
            return (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                        value={value}
                        onValueChange={(value) => handleSelectChange(field.name, value)}
                        required={field.required}
                    >
                        <SelectTrigger className={error ? 'border-red-500' : ''} >
                            <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options.map((option) => (
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
                <div key={field.name} className="space-y-2 md:col-span-2">
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
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            );
        }

        return (
            <div key={field.name} className="space-y-2">
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
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
            <DialogContent className="max-h-[90vh] max-w-[900px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Client' : 'Add New Client'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the client information below'
                            : 'Fill in the details below to add a new client to the system'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {formSections.map((section, sectionIndex) => (
                        <div key={section.title} className="space-y-4">

                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {section.title}
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {section.fields.map(renderField)}
                            </div>

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
                                ? (isEditMode ? 'Updating Client...' : 'Adding Client...')
                                : (isEditMode ? 'Update Client' : 'Add Client')
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddClient;