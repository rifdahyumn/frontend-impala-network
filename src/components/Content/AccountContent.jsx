import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, User, Mail, Phone,Shield, History, CheckCircle, Lock, Image, EyeClosed, EyeOffIcon, EyeOff, Eye } from "lucide-react";
import toast from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const AccountContent = ({ selectedUser, onOpenEditModal, detailTitle, onDelete, onUserEdited }) => {
    const [activeCategory, setActiveCategory] = useState('Account Information');
    const [showPassword, setShowPassword] = useState(false)

    const detailFields = [
        {
            category: 'Account Information',
            icon: User,
            fields: [
                { key: 'employee_id', label: 'Employee Id', icon: User },
                { key: 'password', label: 'Password', icon: Lock, isPassword: true },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'role', label: 'Role', icon: Shield }
            ]
        },
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'position', label: 'Position', icon: User },
                { key: 'avatar', label: 'Avatar', icon: Image, isImage: true }
            ]
        },
        {
            category: 'Security & Access',
            icon: Lock,
            fields: [
                { key: 'last_login', label: 'Last Login', icon: History },
                { key: 'emailVerified', label: 'Email Verified', icon: CheckCircle },
                { key: 'twoFactorEnabled', label: 'Two Factor Enabled', icon: Shield },
                { key: 'login_attempts', label: 'Login Attempts', icon: Lock }
            ]
        },
    ];

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    const handleEdit = () => {
        if (!selectedUser) return
        if (onOpenEditModal) {
            onOpenEditModal(selectedUser, (updatedUser) => {
                if (onUserEdited) {
                    onUserEdited(updatedUser)
                }

                toast.success('User updated successfully')
            })
        }
    }

    const maskPassword = (password) => {
        if (!password) return '-'
        return '•'.repeat(8);
    }

    const getAvatarUrl = (avatarPath) => {
        console.log('🔍 Debug Avatar:', {
            avatarPath,
            type: typeof avatarPath,
            startsWithUpload: avatarPath?.startsWith('/uploads'),
            fullUrl: avatarPath?.startsWith('http')
        });
        
        if (!avatarPath) return null;
        
        // Jika sudah full URL, return langsung
        if (avatarPath.startsWith('http')) {
            return avatarPath;
        }
        
        // Jika path relative (contoh: /uploads/avatars/avatar-123.jpg)
        // Tambahkan base URL backend
        // eslint-disable-next-line no-undef
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}${avatarPath}`;
        
        console.log('🔗 Generated URL:', fullUrl);
        return fullUrl;
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const ActiveCategoryContent = () => {
        const activeCategoryData = getActiveCategoryData()

        if(!activeCategoryData || !selectedUser) return null;

        const CategoryIcon = activeCategoryData.icon

        return (
            <div className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-4 pb-2 border-b border-gray-100'>
                    <CategoryIcon className='w-4 h-4 text-amber-400' />
                    <h3 className='font-semibold text-gray-800'>{activeCategory}</h3>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    {activeCategoryData.fields.map((field, index) => {
                        const FieldIcon = field.icon
                        let displayValue = selectedUser[field.key]

                        if (field.key === 'emailVerified' || field.key === 'twoFactorEnabled') {
                            displayValue = selectedUser[field.key] ? 'Yes' : 'No'
                        }

                        if (field.isPassword) {
                            return (
                                <div key={index} className='flex items-start gap-3'>
                                    <FieldIcon cla ssName='h-4 w-4 text-gray-400 mt-1 flex-shrink-0'  />

                                    <div className='flex-1'>
                                        <label className='text-sm text-gray-500 block mb-1'>
                                            {field.label}
                                        </label>
                                        <div className='flex items-center gap-2'>
                                            <p className='text-gray-900 text-sm font-medium'>
                                                {showPassword ? (displayValue || '-') : maskPassword(displayValue)}
                                            </p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-gray-100"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className='h-3 w-3 text-gray-500' />
                                                ) : (
                                                    <Eye className='h-3 w-3 text-gray-500' />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        if (field.isImage) {
                            const avatarUrl = getAvatarUrl(displayValue)
                            return (
                                <div key={index} className='flex items-start gap-3'>
                                    <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0' />

                                    <div className='flex-1'>
                                        <label className='text-sm text-gray-500 block mb-1'>
                                            {field.label}
                                        </label>
                                        <div className='flex items-center gap-4'>
                                            <Avatar className='h-16 w-16 border-2 border-gray-200'>
                                                <AvatarImage 
                                                    src={avatarUrl}
                                                    alt={`${selectedUser.full_name}'s avatar`}
                                                    className='object-cover'
                                                />
                                                <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold'>
                                                    {getInitials(selectedUser.full_name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className='flex-1'>
                                                <p className={`text-sm font-medium ${displayValue ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {displayValue ? '✓ Profile picture uploaded' : 'No profile picture'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0' />
                                <div className='flex-1'>
                                    <label className='text-sm text-gray-500 block mb-1'>
                                        {field.label}
                                    </label>
                                    <p className='text-gray-900 text-sm font-medium'>
                                        {displayValue || '-'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{detailTitle}</CardTitle>
            </CardHeader>

            <CardContent>
                {selectedUser ? (
                    <div className='space-y-6'>
                        <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {detailFields.map((category, index) => {
                                    const CategoryIcon = category.icon;

                                    return (
                                        <Button
                                            key={index}
                                            variant={activeCategory === category.category ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => {
                                                setActiveCategory(category.category)
                                                setShowPassword(false)
                                            }}
                                        >
                                            <CategoryIcon className='h-4 w-4' />
                                            {category.category}
                                        </Button>
                                    )
                                })}
                            </div>

                            {selectedUser && (
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2"
                                        onClick={handleEdit}
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={onDelete}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>

                        <ActiveCategoryContent />
                    </div>
                ) : (
                    <div className='text-center py-4 text-gray-500'>
                        <p>Select a client to view details</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )

}

export default AccountContent;