import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Upload, X } from "lucide-react";

const AddUser = ({ isAddUserModalOpen, setIsAddUserModalOpen }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        position: '',
        role: '',
        phone: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const formSections = [
        {
            title: "Account Information",
            fields: [
                {
                    name: 'employee_id',
                    label: 'Employee Id',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter employee id'
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    required: true,
                    placeholder: 'Enter password'
                },
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    placeholder: 'Enter email address'
                },
                {
                    name: 'role',
                    label: 'Role',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Role',
                    options: [
                        { value: 'admin', label: 'Admin' },
                        { value: 'manajer_Program', label: 'Manajer Program' },
                        { value: 'staff', label: 'Community Team' }
                    ]
                }
            ]
        },
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
                    name: 'phone',
                    label: 'Phone',
                    type: 'tel',
                    required: true,
                    placeholder: 'Enter phone number'
                },
                {
                    name: 'position',
                    label: 'Position',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Position',
                    options: [
                        { value: 'managing_Director', label: 'Managing Director' },
                        { value: 'director', label: 'Director' },
                        { value: 'general_Secretary', label: 'Head Manager' },
                        { value: 'finance', label: 'Finance' },
                        { value: 'legal', label: 'Legal' },
                        { value: 'talent_Manager', label: 'Talent Manager' },
                        { value: 'ecosystem_Manager', label: 'Ecosystem Manager' },
                        { value: 'strategic_Partnership_Executive', label: 'Strategic Partnership Executive' },
                        { value: 'program_Manager', label: 'Program Manager' },
                        { value: 'space_Manager', label: 'Space Manager' },
                        { value: 'creative', label: 'Creative' }
                    ]
                }
            ]
        },
        {
            title: "Profile Photo",
            description: "Upload a profile photo",
            fields: [
                {
                    name: 'avatar',
                    label: 'Profile Photo',
                    type: 'file',
                    required: false,
                    placeholder: 'Choose photo',
                    accept: 'image/*',
                    maxSize: 5
                }
            ]
        },
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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Please select an image file")
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB')
                return
            }

            setAvatar(file)

            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeAvatar = () => {
        setAvatar(null)
        setAvatarPreview(null)
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        alert(`User ${formData.fullName} added successfully!`);
        setIsAddUserModalOpen(false);
 
        setFormData({
            fullName: '',
            username: '',
            email: '',
            position: '',
            role: '',
            phone: ''
        });
    };

    const handleCloseModal = () => {
        setIsAddUserModalOpen(false);

        setFormData({
            fullName: '',
            username: '',
            email: '',
            position: '',
            role: '',
            phone: ''
        });
    };

    const renderField = (field) => {
        if (field.type === 'file') {
            return (
                <Card key={field.name} className="p-4">
                    <CardContent className='p-0'>
                        <div className="flex flex-row items-center gap-6">
                            <div className="flex-shrink-0">
                                {avatarPreview ? (
                                    <div className="relative">
                                        <Avatar className="w-20 h-20 border-2 border-border">
                                            <AvatarImage src={avatarPreview} />
                                            <AvatarFallback className='text-lg'>
                                                <Upload className="w-6 h-6" />
                                            </AvatarFallback>
                                        </Avatar>

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                            onClick={removeAvatar}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Avatar className="w-20 h-20 border-2 border-dashed border-muted-foreground/25">
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            <Upload className="w-6 h-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-base font-medium">
                                        {field.label}
                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="file"
                                        accept={field.accept}
                                        onChange={handleAvatarChange}
                                        className="w-full cursor-pointer"
                                    />
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    Supported: JPG, PNG, GIF • Max: {field.maxSize}MB
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        if (field.type === 'select') {
            return (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                        value={formData[field.name]}
                        onValueChange={(value) => handleSelectChange(field.name, value)}
                        required={field.required}
                    >
                        <SelectTrigger>
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
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
            <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new user to the system.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {formSections.map((section, sectionIndex) => (
                        <div key={section.title} className="space-y-4">
                        
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {section.title}
                                </h3>
                                {section.description && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {section.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            Add User
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddUser;