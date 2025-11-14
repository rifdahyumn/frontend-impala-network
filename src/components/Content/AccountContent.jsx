import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, User, Mail, Phone,Shield, History, CheckCircle, Lock, Image, EyeClosed, EyeOffIcon } from "lucide-react";

const AccountContent = ({ selectedMember, onEdit, onDelete, detailTitle }) => {
    const [activeCategory, setActiveCategory] = useState('Account Information');

    const detailFields = [
        {
            category: 'Account Information',
            icon: User,
            fields: [
                { key: 'employee_id', label: 'Employee Id', icon: User },
                { key: 'password', label: 'Password', icon: EyeOffIcon },
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
                { key: 'avatar', label: 'Avatar', icon: Image }
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

    const ActiveCategoryContent = () => {
        const activeCategoryData = getActiveCategoryData()

        if(!activeCategoryData || !selectedMember) return null;

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
                        let displayValue = selectedMember[field.key]

                        if (field.key === 'emailVerified' || field.key === 'twoFactorEnabled') {
                            displayValue = selectedMember[field.key] ? 'Yes' : 'No'
                        }

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon cla ssName='h-4 w-4 text-gray-400 mt-1 flex-shrink-0'  />

                                <div className='flex-1'>
                                    <label className='text-sm text-gray-500 block mb-1'>
                                        {field.label}
                                    </label>
                                    <p className='text-gray-900 text-sm font-medium'>
                                        {displayValue || '-'}
                                    </p>
                                </div>
                            </div>
                        )
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
                {selectedMember ? (
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
                                            onClick={() => setActiveCategory(category.category)}
                                        >
                                            <CategoryIcon className='h-4 w-4' />
                                            {category.category}
                                        </Button>
                                    )
                                })}
                            </div>

                            {selectedMember && (
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2"
                                        onClick={onEdit}
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