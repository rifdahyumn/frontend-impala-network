import { User, Edit, Trash2, Mail, Phone, Calendar, GraduationCap, MapPin, Building, Award, DollarSign, Users, CheckCircle, Globe, Image } from "lucide-react";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";

const ImpalaContent = ({ selectedMember, onEdit, onDelete, detailTitle }) => {
    const [activeCategory, setActiveCategory] = useState('Personal Information');

    const detailFields = [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'fullName', label: 'Full Name', icon: User },
                { key: 'nik', label: 'NIK', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'dateOfBirth', label: 'Date Of Birth', icon: Calendar },
                { key: 'education', label: 'Education', icon: GraduationCap },
                { key: 'programName', label: 'Program Name', icon: Award },
                { key: 'status', label: 'Status', icon: CheckCircle }
            ]
        },
        {
            category: 'Personal Address',
            icon: MapPin,
            fields: [
                { key: 'address', label: 'Address', icon: MapPin },
                { key: 'subdistrict', label: 'Subdistrict', icon: MapPin },
                { key: 'city', label: 'City', icon: MapPin },
                { key: 'province', label: 'Province', icon: MapPin },
                { key: 'postalCode', label: 'Postal Code', icon: MapPin }
            ]
        },
        {
            category: 'Business Information',
            icon: Building,
            fields: [
                { key: 'bussinessName', label: 'Business Name', icon: Building },
                { key: 'business', label: 'Business Type', icon: Building },
                { key: 'bussinessAddress', label: 'Business Address', icon: MapPin },
                { key: 'bussinessForm', label: 'Business Form', icon: Building },
                { key: 'establishedYear', label: 'Established Year', icon: Calendar },
                { key: 'certifications', label: 'Certifications', icon: Award }
            ]
        },
        {
            category: 'Business Performance',
            icon: DollarSign,
            fields: [
                { key: 'monthly_revenue', label: 'Monthly Revenue', icon: DollarSign },
                { key: 'total_employee', label: 'Total Employee', icon: Users },
                { key: 'hasOrganizationStructur', label: 'Has Organization Structure', icon: CheckCircle }
            ]
        },
        {
            category: 'Digital Presence',
            icon: Globe,
            fields: [
                { key: 'sosialMedia', label: 'Social Media', icon: Globe },
                { key: 'marketplace', label: 'Marketplace', icon: Globe },
                { key: 'google_bussiness', label: 'Google Business', icon: Globe },
                { key: 'website', label: 'Website', icon: Globe }
            ]
        },
        {
            category: 'Media & Documents',
            icon: Image,
            fields: [
                { key: 'ownerPhoto', label: 'Owner Photo', icon: Image },
                { key: 'bussinessLogo', label: 'Business Logo', icon: Image },
                { key: 'productPhoto', label: 'Product Photo', icon: Image }
            ]
        }
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

                        if (field.key === 'hasOrganizationStructur') {
                            displayValue = selectedMember[field.key] ? 'Yes' : 'No'
                        }

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0'  />

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

export default ImpalaContent