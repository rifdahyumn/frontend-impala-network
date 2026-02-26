import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState, useMemo } from "react"; // Tambahkan useMemo
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import userService from "../../services/userService";

const AddUser = ({ isAddUserModalOpen, setIsAddUserModalOpen, onAddUser, editData = null, onEditUser = null }) => {
    const isEditMode = !!editData
    const [formData, setFormData] = useState({
        employee_id: '',
        email: '',
        password: '',
        role: '',
        full_name: '',
        position: '',
        phone: '',
        avatar: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({})
    const [originalData, setOriginalData] = useState({})

    // Gunakan useMemo untuk formSections agar bisa bergantung pada isEditMode
    const formSections = useMemo(() => [
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
                    required: !isEditMode, // Akan berubah sesuai mode
                    placeholder: isEditMode ? 'Leave blank to keep current password' : 'Enter password'
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
                        { value: 'manajer_program', label: 'Manajer Program' },
                        { value: 'komunitas', label: 'Community Team' }
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
                    type: 'text',
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
                        { value: 'Managing Director', label: 'Managing Director' },
                        { value: 'Director', label: 'Director' },
                        { value: 'General Secretary', label: 'Head Manager' },
                        { value: 'Finance', label: 'Finance' },
                        { value: 'Legal', label: 'Legal' },
                        { value: 'Talent Manager', label: 'Talent Manager' },
                        { value: 'Ecosystem Manager', label: 'Ecosystem Manager' },
                        { value: 'Strategic Partnership_Executive', label: 'Strategic Partnership Executive' },
                        { value: 'Program Manager', label: 'Program Manager' },
                        { value: 'Space Manager', label: 'Space Manager' },
                        { value: 'Creative', label: 'Creative' }
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
    ], [isEditMode]); // Rekomputasi ketika isEditMode berubah

    useEffect(() => {
        if (isEditMode && editData) {
            const newFormData = {
                employee_id: editData.employee_id || '',
                email: editData.email || '',
                password: '',
                role: editData.role || '',
                full_name: editData.full_name || '',
                position: editData.position || '',
                phone: editData.phone || '',
                avatar: editData.avatar || '',
                status: editData.status || 'Active'
            }
            setFormData(newFormData)
            setOriginalData(newFormData)
            
            if (editData.avatar) {
                setAvatarPreview(editData.avatar)
            }
        } else {
            setFormData({
                employee_id: '',
                email: '',
                password: '',
                role: '',
                full_name: '',
                position: '',
                phone: '',
                avatar: '',
                status: 'Active',
            })
            setOriginalData({})
        }
        setAvatar(null)
        setAvatarPreview(null)
        setErrors({})
    }, [isEditMode, editData, isAddUserModalOpen])

    const validateForm = () => {
        const newErrors = {}

        formSections.forEach(section => {
            section.fields.forEach(field => {
                if (isEditMode && field.name === 'password') {
                    return
                }
                
                if (field.required && !field.disabled) {
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

        if (formData.phone) {
            const phoneString = formData.phone.toString();
            const digitsOnly = phoneString.replace(/\D/g, '');
            
            if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                newErrors.phone = 'Phone number must be between 10-15 digits'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const hasChanges = () => {
        if (!isEditMode) return true;
        
        for (const key in formData) {
            if (key === 'password') {
                if (formData[key]) return true;
            } else if (formData[key] !== originalData[key]) {
                return true;
            }
        }
        
        if (avatar) return true;
        
        return false;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        const fieldConfig = formSections
            .flatMap(section => section.fields)
            .find(field => field.name === name)

        if (fieldConfig?.disabled) {
            return
        }

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
        const fieldConfig = formSections
            .flatMap(section => section.fields)
            .find(field => field.name === name);
            
        if (fieldConfig?.disabled) {
            return;
        }

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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file")
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('=== HANDLE SUBMIT START ===');
        console.log('isEditMode:', isEditMode);
        console.log('formData state:', JSON.stringify(formData, null, 2));
        
        // Cek nilai setiap field
        console.log('email value:', formData.email);
        console.log('email type:', typeof formData.email);
        console.log('email length:', formData.email?.length);
        
        console.log('full_name value:', formData.full_name);
        console.log('employee_id value:', formData.employee_id);
        console.log('role value:', formData.role);
        console.log('phone value:', formData.phone);

        if (!validateForm()) {
            console.log('Validasi gagal!');
            toast.error('Please fix the errors in the form');
            return;
        }

        if (isEditMode && !hasChanges()) {
            toast.error('No changes detected');
            return;
        }

        setLoading(true)

        try {
            const formDataToSend = new FormData();

            // Log untuk mode edit
            if (isEditMode) {
                console.log('=== EDIT MODE ===');
                let hasChangesToSend = false;
                
                Object.keys(formData).forEach(key => {
                    if (key === 'password') {
                        if (formData[key] && formData[key].trim() !== '') {
                            console.log(`Edit mode - adding password (changed)`);
                            formDataToSend.append(key, formData[key]);
                            hasChangesToSend = true;
                        }
                    } else if (formData[key] !== originalData[key]) {
                        console.log(`Edit mode - adding ${key}:`, formData[key]);
                        console.log(`Original ${key}:`, originalData[key]);
                        formDataToSend.append(key, formData[key]);
                        hasChangesToSend = true;
                    }
                });

                if (avatar) {
                    console.log('Edit mode - adding avatar file:', avatar.name);
                    formDataToSend.append('avatar_file', avatar);
                    hasChangesToSend = true;
                }

                if (!hasChangesToSend) {
                    toast.error('No fields to update');
                    setLoading(false);
                    return;
                }
            }
            
            // Required fields untuk mode tambah
            console.log('=== REQUIRED FIELDS CHECK ===');
            const requiredFields = ['email', 'full_name', 'employee_id', 'role', 'phone'];
    
            for (const field of requiredFields) {
                console.log(`Checking field ${field}:`, formData[field]);
                console.log(`Trimmed:`, formData[field]?.trim());
                
                if (!formData[field] || formData[field].trim() === '') {
                    console.error(`Field ${field} KOSONG!`);
                    toast.error(`${field} is required`);
                    setLoading(false);
                    return;
                }

                console.log(`Appending ${field}:`, formData[field].trim());
                formDataToSend.append(field, formData[field].trim());
            }

            // Optional fields
            if (formData.position) {
                console.log('Appending position:', formData.position);
                formDataToSend.append('position', formData.position);
            }

            if (formData.password) {
                console.log('Appending password');
                formDataToSend.append('password', formData.password);
            }

            if (avatar) {
                console.log('Appending avatar_file:', avatar.name);
                formDataToSend.append('avatar_file', avatar);
            }

            // Log final FormData
            console.log('=== FINAL FORMDATA ENTRIES ===');
            for (let pair of formDataToSend.entries()) {
                if (pair[0] === 'avatar_file') {
                    console.log(pair[0] + ': [FILE] ' + (pair[1]?.name || 'unknown'));
                } else {
                    console.log(pair[0] + ': ' + pair[1]);
                }
            }

            // Lanjutkan dengan pengiriman...
            if (isEditMode) {
                if (onEditUser) {
                    await onEditUser(editData.id, formDataToSend);
                } else {
                    await userService.updateUser(editData.id, formDataToSend);
                }
                toast.success('User updated successfully');
            } else {
                if (onAddUser) {
                    await onAddUser(formDataToSend);
                } else {
                    await userService.addUser(formDataToSend);
                }
                toast.success('User added successfully');
            }
            
            handleCloseModal();
        } catch (error) {
            console.error('Submit error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || error.message || `Failed to ${isEditMode ? 'update' : 'add'} user`);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsAddUserModalOpen(false)
        setErrors({})
        setAvatar(null)
        setAvatarPreview(null)
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
                    >
                        <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
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
                    {errors[field.name] && (
                        <p className="text-sm text-red-500">{errors[field.name]}</p>
                    )}
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
                    className={`w-full ${errors[field.name] ? 'border-red-500' : ''}`}
                />
                {errors[field.name] && (
                    <p className="text-sm text-red-500">{errors[field.name]}</p>
                )}
            </div>
        );
    };

    return (
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
            <DialogContent className="max-h-[90vh] max-w-[900px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the user information below'
                            : 'Fill in the details below to add a new user to the system'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {formSections.map((section) => (
                        <div key={section.title} className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {section.title}
                                </h3>
                                {section.description && (
                                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {section.fields.map(renderField)}
                            </div>
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
                                ? (isEditMode ? 'Updating...' : 'Adding...')
                                : (isEditMode ? 'Update User' : 'Add User')
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddUser;