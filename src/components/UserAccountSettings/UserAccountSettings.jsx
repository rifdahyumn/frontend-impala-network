// src/components/UserAccountSettings/UserAccountSettings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Upload, X } from "lucide-react";

const UserAccountSettings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: 'helloadmin@gmail.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        fullName: 'Alexander Ratouli',
        phone: '',
        position: 'Ecosystem Manager',
        avatar: ''
    });

    const [changePassword, setChangePassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

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
        console.log('Form data:', formData);
        alert('Settings saved successfully!');
    };

    const handleBack = () => {
        navigate(-1);
    };

    // ✅ RENDER FIELD FUNCTION - sama seperti AddUser
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

        // ✅ SPECIAL HANDLING FOR PASSWORD FIELDS
        if (field.name.includes('password') && !changePassword) {
            return null; // jangan render password fields jika changePassword false
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Hello Alexander Ratouli
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-600">Ecosystem Manager</span>
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                AR
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="mb-8 text-center">
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
                        {/* ✅ RENDER SECTIONS - sama seperti AddUser */}
                        {formSections.map((section, sectionIndex) => (
                            <div key={section.title} className="space-y-4">
                                <div className="border-b pb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {section.title}
                                    </h3>
                                    {section.description && (
                                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                    )}
                                </div>

                                {/* Change Password Toggle untuk Account Information */}
                                {section.title === "Account Information" && (
                                    <div className="flex items-center mb-4">
                                        <input
                                            type="checkbox"
                                            id="changePassword"
                                            checked={changePassword}
                                            onChange={(e) => setChangePassword(e.target.checked)}
                                            className="mr-3 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="changePassword" className="text-sm font-medium text-gray-700">
                                            Change Password
                                        </label>
                                    </div>
                                )}

                                {/* Password Fields (conditional) */}
                                {section.title === "Account Information" && changePassword && (
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">
                                                Current Password
                                            </Label>
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter current password"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">
                                                New Password
                                            </Label>
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter new password"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Confirm new password"
                                                className="w-full"
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

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                onClick={handleBack}
                                className="bg-whote-500 text-black px-6 py-2 rounded-md hover:bg-white-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-400/70"
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