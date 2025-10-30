import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, Building, User, Mail, Phone, MapPin, Calendar, DollarSign } from "lucide-react";
import clientService from '../../services/clientService';
import toast from 'react-hot-toast';

const ClientContent = ({ selectedMember, onDelete, detailTitle, onClientUpdated, onClientDeleted, onOpenEditModal }) => {
    const [activeCategory, setActiveCategory] = useState('Personal Information');
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false)

    const detailFields = [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'fullName', label: 'Full Name', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'position', label: 'Position', icon: User }
            ]
        },
        {
            category: 'Company Details',
            icon: Building,
            fields: [
                { key: 'company', label: 'Company', icon: Building },
                // { key: 'industry', label: 'Industry', icon: Building },
                { key: 'business', label: 'Business Type', icon: Building },
                { key: 'total_employee', label: 'Total Employee', icon: Building }
            ]
        },
        {
            category: 'Program',
            icon: DollarSign,
            fields: [
                { key: 'programName', label: 'Program Name', icon: DollarSign },
                { key: 'status', label: 'Status', icon: DollarSign },
                // { key: 'deal_size', label: 'Deal Size', icon: DollarSign },
                { key: 'join_date', label: 'Join Date', icon: Calendar }
            ]
        },
        {
            category: 'Location',
            icon: MapPin,
            fields: [
                { key: 'address', label: 'Address', icon: MapPin },
                { key: 'city', label: 'City', icon: MapPin },
                { key: 'country', label: 'Country', icon: MapPin }
            ]
        },
        {
            category: 'Additional Information',
            icon: Edit,
            fields: [
                { key: 'notes', label: 'Notes', icon: Edit }
            ]
        }
    ];

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    const handleEdit = () => {
        if (!selectedMember) return
        if (onOpenEditModal) {
            onOpenEditModal(selectedMember)
        }
    }

    const handleDelete = async () => {
        if(!selectedMember) return
        if(!window.confirm(`Are you sure want to delete ${selectedMember.full_name}? This action cannot be undone`)){
            return
        }

        setDeleteLoading(true)
        try {
            if(onDelete) {
                await onDelete(selectedMember.id)
            } else {
                await clientService.deleteClient(selectedMember.id)
                toast.error('Client deleted successfully')
            }

            if (onClientDeleted) {
                onClientDeleted()
            }
        } catch (error) {
            console.error('Error deleting client:', error)
            toast.error(error.message || 'Failed to delete client')
        } finally {
            setDeleteLoading(false)
        }
    }

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
                        const value = selectedMember[field.key] || selectedMember[field.key.toLowerCase()] || '-'

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0'  />

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
                                        onClick={handleEdit}
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={handleDelete}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        {deleteLoading ? 'Deleting...' : 'Delete'}
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

export default ClientContent;