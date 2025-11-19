import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, User, Mail, Phone, MapPin, Building, Package, Info, Calendar, BookOpen, Home } from "lucide-react";

const HeteroContent = ({ selectedMember, onEdit, onDelete, detailTitle }) => {
    const [activeCategory, setActiveCategory] = useState('Personal Information');

    const detailFields = [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                { key: 'nik', label: 'NIK', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone Number', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'date_of_birth', label: 'Date of Birth', icon: Calendar },
                { key: 'education', label: 'Last Education', icon: BookOpen },
                { key: 'company', label: 'Company/Organization', icon: Building }
            ]
        },
        {
            category: 'Residential Address',
            icon: Home,
            fields: [
                { key: 'address', label: 'Address', icon: MapPin },
                { key: 'district', label: 'District / Sub District', icon: MapPin },
                { key: 'city', label: 'City / Regency', icon: MapPin },
                { key: 'province', label: 'Province', icon: MapPin },
                { key: 'postal_code', label: 'Postal Code', icon: MapPin }
            ]
        },
        {
            category: 'Service Requirements',
            icon: Package,
            fields: [
                { key: 'space', label: 'Space', icon: Package },
                { key: 'add_on', label: 'Add On', icon: Package },
                { key: 'join_date', label: 'Join Date', icon: Calendar },
                { key: 'end_date', label: 'End Date', icon: Calendar },
            ]
        },
    ];

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    // const formatDisplayValue = (key, value) => {
    //     if (!value) return '-';
        
    //     const optionMappings = {
    //         gender: {
    //             'male': 'Male',
    //             'female': 'Female'
    //         },
    //         education: {
    //             'sma': 'Senior High School (SMA/SMK/MA)',
    //             'd3': 'Diploma (D3)',
    //             's1': 'Bachelor Degree (S1)',
    //             's2': 'Master Degree (S2)',
    //             's3': 'Doctoral Degree (S3)'
    //         },
    //         maneka: {
    //             'personal': 'Personal Membership',
    //             'group': 'Group Membership'
    //         },
    //         rembug: {
    //             '1': 'Rembug 1',
    //             '2': 'Rembug 2',
    //             '3': 'Rembug 3'
    //         },
    //         eventSpace: {
    //             'gatra': 'Gatra',
    //             'maneka': 'Maneka',
    //             'outdoor': 'Outdoor'
    //         },
    //         privateOffice: {
    //             '1-3': 'Private Office 1-3',
    //             '4&5': 'Private Office 4&5',
    //             '6': 'Private Office 6'
    //         },
    //         addInformation: {
    //             'sosmed': 'Social Media',
    //             'website': 'Company Website',
    //             'friend': 'Friends / Family Recommendation',
    //             'event': 'Event / Exhibition',
    //             'local': 'Local Community'
    //         }
    //     };

    //     // Cek jika value ada di mapping
    //     for (const [field, mapping] of Object.entries(optionMappings)) {
    //         if (key === field && mapping[value]) {
    //             return mapping[value];
    //         }
    //     }

    //     // Format date jika perlu
    //     if (key === 'dateOfBirth' && value) {
    //         return new Date(value).toLocaleDateString('id-ID', {
    //             year: 'numeric',
    //             month: 'long',
    //             day: 'numeric'
    //         });
    //     }

    //     return value;
    // };

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

                <div className={`grid ${activeCategoryData.category === 'Business / Organization' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    {activeCategoryData.fields.map((field, index) => {
                        const FieldIcon = field.icon
                        const value = selectedMember[field.key] || selectedMember[field.key.toLowerCase()] || '-'

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0' />

                                <div className='flex-1'>
                                    <label className='text-sm text-gray-500 block mb-1'>
                                        {field.label}
                                    </label>
                                    <p className='text-gray-900 text-sm font-medium'>
                                        {value}
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
                        <p>Select a member to view details</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default HeteroContent;