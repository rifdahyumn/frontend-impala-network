import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Upload, X, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const UserAccountSettings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const dropdownRef = useRef(null);
    
    const [formData, setFormData] = useState({
        email: user?.email || 'helloadmin@gmail.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        fullName: user?.full_name || 'Alexander Ratouli',
        phone: user?.phone || '',
        position: user?.position || 'Ecosystem Manager',
        avatar: user?.avatar || ''
    });

    const [changePassword, setChangePassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatPosition = (position) => {
        if (!position) return 'User';
        return position
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getShortName = (name) => {
        if (!name) return 'User';
        const words = name.split(' ');
        if (words.length <= 2) {
            return name;
        }
        return words.slice(0, 2).join(' ');
    };

    const formatRole = (role) => {
        if (!role) return 'User';
        return role
            .split('_')
            .map(word => {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    };

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            navigate('/login');
        }
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const formSections = [
        {
            title: "Account Information",
            fields: [
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    placeholder: 'Enter email address'
                },
            ]
        },
        {
            title: "Personal Information", 
            fields: [
                {
                    name: 'fullName',
                    label: 'Full Name',
                    type: 'text',
                    placeholder: 'Enter full name'
                },
                {
                    name: 'phone', 
                    label: 'Phone',
                    type: 'tel',
                    placeholder: 'Enter phone number'
                },
                {
                    name: 'position',
                    label: 'Position',
                    type: 'select',
                    placeholder: 'Select Position',
                    options: [
                        { value: 'Managing Director', label: 'Managing Director' },
                        { value: 'Director', label: 'Director' },
                        { value: 'General Secretary', label: 'General Secretary' },
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
        }
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        handleChange(name, value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleChange(name, value);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Please select an image file");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const renderField = (field) => {
        if (field.type === 'file') {
            return (
                <Card key={field.name} className="p-4 border-amber-100">
                    <CardContent className='p-0'>
                        <div className="flex flex-row items-center gap-6">
                            <div className="flex-shrink-0">
                                {avatarPreview ? (
                                    <div className="relative">
                                        <Avatar className="w-20 h-20 border-2 border-amber-200">
                                            <AvatarImage src={avatarPreview} />
                                            <AvatarFallback className='text-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white'>
                                                {getInitials(user?.full_name || formData.fullName)}
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
                                    <Avatar className="w-20 h-20 border-2 border-dashed border-amber-200">
                                        <AvatarFallback className="bg-amber-50 text-amber-600">
                                            <Upload className="w-6 h-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-base font-medium text-gray-900">
                                        {field.label}
                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type="file"
                                        accept={field.accept}
                                        onChange={handleAvatarChange}
                                        className="w-full cursor-pointer border-amber-200 focus:border-amber-500"
                                    />
                                </div>
                                <p className="text-sm text-gray-500">
                                    Supported: JPG, PNG, GIF • Max: {field.maxSize}MB
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (field.type === 'select') {
            return (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-gray-900">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                        value={formData[field.name]}
                        onValueChange={(value) => handleSelectChange(field.name, value)}
                        required={field.required}
                    >
                        <SelectTrigger className="border-amber-200 focus:border-amber-500">
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

        if (field.name.includes('password') && !changePassword) {
            return null;
        }

        return (
            <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-gray-900">
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
                    className="w-full border-amber-200 focus:border-amber-500"
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                        </div>
                        
                        <div className="relative" ref={dropdownRef}>
                            <div 
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                                onClick={toggleDropdown}
                            >
                                <div className="text-right">
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Hello {getShortName(user?.full_name || formData.fullName)}
                                    </h2>
                                    <p className="text-xs text-gray-600">
                                        {formatRole(user?.role)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-10 w-10 border-2 border-amber-200">
                                        <AvatarImage alt="profile" src={user?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white font-semibold">
                                            {getInitials(user?.full_name || formData.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-sm border border-amber-100 shadow-xl rounded-xl z-50">
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-xl border-b border-amber-100">
                                        <Avatar className="h-12 w-12 border-2 border-amber-200">
                                            <AvatarImage alt="profile" src={user?.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white font-semibold text-lg">
                                                {getInitials(user?.full_name || formData.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col flex-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {getShortName(user?.full_name || formData.fullName)}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {user?.email || formData.email}
                                            </p>
                                            <p className="text-xs text-amber-600 font-medium mt-1">
                                                {user?.position ? formatPosition(user.position) : formatPosition(formData.position)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            className="flex items-center gap-3 w-full py-3 px-3 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLogout();
                                            }}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span className="text-sm">Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <div className="mb-8 text-center">
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-amber-100 p-6">
                        {formSections.map((section, sectionIndex) => (
                            <div key={section.title} className="space-y-4">
                                <div className="border-b border-amber-100 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {section.title}
                                    </h3>
                                    {section.description && (
                                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                    )}
                                </div>

                                {section.title === "Account Information" && (
                                    <div className="flex items-center mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <input
                                            type="checkbox"
                                            id="changePassword"
                                            checked={changePassword}
                                            onChange={(e) => setChangePassword(e.target.checked)}
                                            className="mr-3 text-amber-600 focus:ring-amber-500"
                                        />
                                        <label htmlFor="changePassword" className="text-sm font-medium text-gray-700">
                                            Change Password
                                        </label>
                                    </div>
                                )}

                                {section.title === "Account Information" && changePassword && (
                                    <div className="space-y-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword" className="text-gray-900">
                                                Current Password
                                            </Label>
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter current password"
                                                className="w-full border-amber-200 focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-gray-900">
                                                New Password
                                            </Label>
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter new password"
                                                className="w-full border-amber-200 focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-gray-900">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Confirm new password"
                                                className="w-full border-amber-200 focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    {section.fields.map(renderField)}
                                </div>

                                {sectionIndex < formSections.length - 1 && (
                                    <div className="pt-2" />
                                )}
                            </div>
                        ))}

                        <div className="flex justify-between pt-6 border-t border-amber-100">
                            <Button
                                type="button"
                                onClick={handleBack}
                                className="bg-white text-gray-700 px-6 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-colors shadow-lg"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserAccountSettings;