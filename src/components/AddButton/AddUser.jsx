import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import userService from "../../services/userService";

const AddUser = ({ isAddUserModalOpen, setIsAddUserModalOpen, onAddUser, editData = null, onEditUser = null }) => {
    const isEditMode = !!editData;
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
    const [errors, setErrors] = useState({});
    const [originalData, setOriginalData] = useState({});

    const getStringValue = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        return '';
    };

    const getChangedFields = () => {
        const changed = {};
        
        Object.keys(formData).forEach(key => {
            if (key === 'avatar') return;
            
            const currentValue = formData[key];
            const originalValue = originalData[key];
            
            if (key === 'password') {
                if (isEditMode) {
                    const passwordStr = getStringValue(currentValue);
                    if (passwordStr && passwordStr.trim() !== '') {
                        changed[key] = passwordStr.trim();
                    }
                } else {
                    const passwordStr = getStringValue(currentValue);
                    changed[key] = passwordStr;
                }
                return;
            }
            
            const currentStr = getStringValue(currentValue);
            const originalStr = getStringValue(originalValue);
            
            if (currentStr !== originalStr) {
                if (currentStr.trim() !== '' || key === 'position') {
                    changed[key] = currentStr;
                }
            }
        });
        
        return changed;
    };

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
                    required: !isEditMode,
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
                        { value: 'Strategic Partnership Executive', label: 'Strategic Partnership Executive' },
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
    ], [isEditMode]);

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
            };
            setFormData(newFormData);
            setOriginalData(newFormData);
            
            if (editData.avatar) {
                setAvatarPreview(editData.avatar);
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
            });
            setOriginalData({});
        }
        setAvatar(null);
        setAvatarPreview(null);
        setErrors({});
    }, [isEditMode, editData, isAddUserModalOpen]);

    const validateForm = () => {
        const newErrors = {};

        formSections.forEach(section => {
            section.fields.forEach(field => {
                if (isEditMode && field.name === 'password') {
                    return;
                }
                
                if (field.required && !field.disabled) {
                    const value = formData[field.name];
                    const strValue = getStringValue(value);
                    if (!strValue || strValue.trim() === '') {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                }
            });
        });

        if (formData.email && !/\S+@\S+\.\S+/.test(getStringValue(formData.email))) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone) {
            const phoneStr = getStringValue(formData.phone);
            const digitsOnly = phoneStr.replace(/\D/g, '');
            
            if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                newErrors.phone = 'Phone number must be between 10-15 digits';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
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
            }));
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
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setAvatar(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatar(null);
        setAvatarPreview(null);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        if (isEditMode) {
            const changedFields = getChangedFields();
            
            if (Object.keys(changedFields).length === 0 && !avatar) {
                toast.error('No changes detected');
                return;
            }
        }

        setLoading(true);

        try {
            let userId = null;
            let userResult = null;

            const formDataToSend = new FormData();

            if (isEditMode) {
                const updatedData = getChangedFields();
                
                Object.keys(updatedData).forEach(key => {
                    formDataToSend.append(key, updatedData[key]);
                });
                
                userId = editData.id;
            } else {
                formDataToSend.append('employee_id', getStringValue(formData.employee_id).trim());
                formDataToSend.append('email', getStringValue(formData.email).trim());
                formDataToSend.append('full_name', getStringValue(formData.full_name).trim());
                formDataToSend.append('role', formData.role);
                formDataToSend.append('phone', getStringValue(formData.phone).trim());
                
                if (formData.position) {
                    formDataToSend.append('position', formData.position);
                }
                
                if (formData.password) {
                    formDataToSend.append('password', formData.password);
                }
            }

            if (avatar) {
                formDataToSend.append('avatar_file', avatar);
            }

            if (isEditMode) {
                if (onEditUser) {
                    userResult = await onEditUser(editData.id, formDataToSend);
                } else {
                    userResult = await userService.updateUser(editData.id, formDataToSend);
                }
            } else {
                if (onAddUser) {
                    userResult = await onAddUser(formDataToSend);
                } else {
                    userResult = await userService.addUser(formDataToSend);
                }
                // eslint-disable-next-line no-unused-vars
                userId = userResult?.data?.id || userResult?.id;
            }

            if (avatar) {
                toast.success(isEditMode ? 'User and avatar updated successfully' : 'User and avatar added successfully');
            } else {
                toast.success(isEditMode ? 'User updated successfully' : 'User added successfully');
            }
            
            handleCloseModal();
            
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || error.message || `Failed to ${isEditMode ? 'update' : 'add'} user`);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsAddUserModalOpen(false);
        setErrors({});
        setAvatar(null);
        setAvatarPreview(null);
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
                                            disabled={loading}
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
                                        disabled={loading}
                                    />
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    Supported: JPG, PNG, GIF • Max: {field.maxSize}MB
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                        value={formData[field.name]}
                        onValueChange={(value) => handleSelectChange(field.name, value)}
                        disabled={loading}
                    >
                        <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                            <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options.map((option, index) => (
                                <SelectItem 
                                    key={`${field.name}-${option.value}-${index}`}
                                    value={option.value}
                                >
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
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={`w-full ${errors[field.name] ? 'border-red-500' : ''}`}
                    disabled={loading}
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