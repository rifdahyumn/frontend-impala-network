import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { Plus, X } from "lucide-react";

const AddMemberSemarang = ({ isAddMemberModalOpen, setIsAddMemberModalOpen }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        nik: '',
        email: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        education: '',
        company: '',
        address: '',
        district: '',
        city: '',
        province: '',
        postal_code: '',
        space: '',
        add_on: [],
        join_date: '',
        end_date: '',
        addInformation: ''
    });

    const [addOnOptions, setAddOnOptions] = useState([
        { value: 'Snack', label: 'Snack' },
        { value: 'Ricebox', label: 'Ricebox' },
        { value: 'Camera Sony A7II', label: 'Camera Sony A7II' },
        { value: 'Lensa GM 24-70mm', label: 'Lensa GM 24-70mm' },
        { value: 'Lighting Godox', label: 'Lighting Godox' },
        { value: 'LED Continous', label: 'LED Continous' },
        { value: 'Zhiyun Crane Plus Stabilizer', label: 'Zhiyun Crane Plus Stabilizer' },
        { value: 'DJI Osmo Stabilizer', label: 'DJI Osmo Stabilizer' },
        { value: 'Tripod', label: 'Tripod' },
        { value: 'Jabra Speaker & Mic Webinar', label: 'Jabra Speaker & Mic Webinar' },
        { value: 'Mic & Sound System', label: 'Mic & Sound System' },
        { value: 'TV + HDMI', label: 'TV + HDMI' },
    ]);
    
    const [selectedAddOn, setSelectedAddOn] = useState('');
    const [newAddOn, setNewAddOn] = useState('');

    const handleAddOn = () => {
        let addOnToAdd = '';

        if (newAddOn.trim()) {
            addOnToAdd = newAddOn.trim();
        } else if (selectedAddOn) {
            const selectedOption = addOnOptions.find(opt => opt.value === selectedAddOn);
            addOnToAdd = selectedOption ? selectedOption.label : selectedAddOn;
        }

        if (addOnToAdd && !formData.add_on.includes(addOnToAdd)) {
            const updatedAddOn = [...formData.add_on, addOnToAdd];
            setFormData(prev => ({
                ...prev,
                add_on: updatedAddOn
            }));

            if (newAddOn.trim() && !addOnOptions.find(opt => opt.value === addOnToAdd)) {
                const newOption = {
                    value: addOnToAdd,
                    label: addOnToAdd
                };
                setAddOnOptions(prev => [...prev, newOption]);
            }

            setSelectedAddOn('');
            setNewAddOn('');
        }
    };

    const handleRemoveAddOn = (index) => {
        const updatedAddOn = formData.add_on.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            add_on: updatedAddOn
        }));
    };

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
                    name: 'nik',
                    label: 'NIK',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter NIK'
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    placeholder: 'Enter email'
                },
                {
                    name: 'phone',
                    label: 'Phone Number',
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
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' }
                    ]
                },
                {
                    name: 'date_of_birth',
                    label: 'Date of Birth',
                    type: 'date',
                    required: true,
                    placeholder: 'Select date of birth'
                },
                {
                    name: 'education',
                    label: 'Last Education',
                    type: 'select',
                    required: true,
                    placeholder: 'Select last education',
                    options: [
                        { value: 'sma', label: 'Senior High School (SMA/SMK/MA)' },
                        { value: 'd3', label: 'Diploma (D3)' },
                        { value: 's1', label: 'Bachelor Degree (S1)' },
                        { value: 's2', label: 'Master Degree (S2)' },
                        { value: 's3', label: 'Doctoral Degree (S3)' }
                    ]
                }
            ]
        },
        {
            title: "Residential Address",
            fields: [
                {
                    name: 'address',
                    label: 'Complete Address',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter complete address'
                },
                {
                    name: 'district',
                    label: 'District / Sub District',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter district / sub district',
                },
                {
                    name: 'city',
                    label: 'City / Regency',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter city'
                },
                {
                    name: 'province',
                    label: 'Province',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter province'
                },
                {
                    name: 'postal_code',
                    label: 'Postal Code',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter postal code'
                }
            ]
        },
        {
            title: "Business / Organization",
            fields: [
                {
                    name: 'company',
                    label: 'Name of Company',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter name of company'
                }
            ]
        },
        {
            title: "Service Requirements",
            fields: [
                {
                    name: 'space',
                    label: 'Choose your package',
                    type: 'select',
                    required: true,
                    placeholder: 'Select your package',
                    options: [
                        { value: 'Maneka Personal', label: 'Maneka Personal' },
                        { value: 'Maneka Group', label: 'Maneka Group' },
                        { value: 'Rembug 1', label: 'Rembug 1' },
                        { value: 'Rembug 2', label: 'Rembug 2' },
                        { value: 'Rembug 3', label: 'Rembug 3' },
                        { value: 'Private Office 1-3', label: 'Private Office 1-3' },
                        { value: 'Private Office 4-5', label: 'Private Office 4-5' },
                        { value: 'Private Office 6', label: 'Private Office 6' },
                        { value: 'Space Gatra', label: 'Space Gatra' },
                        { value: 'Space Maneka', label: 'Space Maneka' },
                        { value: 'Space Outdoor', label: 'Space Outdoor' },
                        { value: 'Virtual Office', label: 'Virtual Office' },
                        { value: 'Online Course', label: 'Course' },
                    ]
                },
                {
                    customComponent: true,
                    render: () => (
                        <div className="space-y-3 md:col-span-2">
                            <Label htmlFor="add-on">Add On</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedAddOn}
                                    onValueChange={(value) => setSelectedAddOn(value)}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select add on" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {addOnOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <Button 
                                    type="button" 
                                    onClick={handleAddOn}
                                    className="flex items-center gap-1 whitespace-nowrap"
                                    disabled={!selectedAddOn && !newAddOn}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>
                            
                            {formData.add_on.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.add_on.map((addon, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {addon}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAddOn(index)}
                                                className="text-blue-600 hover:text-blue-800 ml-1"
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
            ]
        },
        {
            title: "Additional Information",
            fields: [
                {
                    name: 'addInformation',
                    label: 'How did you find out about Hetero?',
                    type: 'select',
                    required: true,
                    placeholder: 'Select additional information',
                    options: [
                        { value: 'sosmed', label: 'Social Media' },
                        { value: 'website', label: 'Company Website' },
                        { value: 'friend', label: 'Friends / Family Recommendation' },
                        { value: 'event', label: 'Event / Exhibition' },
                        { value: 'local', label: 'Local Community' }
                    ]
                }
            ]
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('New member data for Semarang:', formData);
        alert(`Member ${formData.full_name} added successfully to Semarang!`);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setIsAddMemberModalOpen(false);
        setFormData({
            full_name: '',
            nik: '',
            email: '',
            phone: '',
            gender: '',
            date_of_birth: '',
            education: '',
            company: '',
            address: '',
            district: '',
            city: '',
            province: '',
            postal_code: '',
            space: '',
            add_on: [],
            join_date: '',
            end_date: '',
            addInformation: ''
        });
        setSelectedAddOn('');
        setNewAddOn('');
    };

    const renderField = (field, index) => {
        if (field.customComponent) {
            return (
                <div key={`custom-${index}`} className="md:col-span-2">
                    {field.render()}
                </div>
            );
        }

        if (field.type === 'select') {
            return (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                        value={formData[field.name] || ''}
                        onValueChange={(value) => handleSelectChange(field.name, value)}
                        required={field.required}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options.map((option) => (
                                <SelectItem 
                                    key={`${field.name}-${option.value}`}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );
        }

        if (field.type === 'date') {
            return (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full"
                    />
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
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full"
                />
            </div>
        );
    };

    return (
        <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
            <DialogContent className="max-h-[90vh] max-w-[900px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Member - Semarang</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new member to Semarang branch. Select service packages and choose dates as needed.
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.fields.map((field, index) => renderField(field, index))}
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
                            Add Member
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddMemberSemarang;