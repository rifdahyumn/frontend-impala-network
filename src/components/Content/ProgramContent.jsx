import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, Building, User, MapPin, Calendar, DollarSign, Share2Icon, ExternalLink, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';

const ProgramContent = ({ selectedProgram, onDelete, detailTitle, onOpenEditModal, onProgramEdited, showConfirm }) => {
    const [activeCategory, setActiveCategory] = useState('Program Information');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const detailFields = [
        {
            category: 'Program Information',
            icon: Building,
            fields: [
                { key: 'program_name', label: 'Program Name', icon: Building },
                { key: 'client', label: 'Client', icon: Building },
                { key: 'category', label: 'Category', icon: Building },
                { key: 'description', label: 'Description', icon: Building }
            ]
        },
        {
            category: 'Schedule & Duration',
            icon: Calendar,
            fields: [
                { key: 'duration', label: 'Duration', icon: Calendar },
                { key: 'start_date', label: 'Start Date', icon: Calendar },
                { key: 'end_date', label: 'End Date', icon: Calendar },
                { key: 'location', label: 'Location', icon: MapPin }
            ]
        },
        {
            category: 'Pricing & Capacity',
            icon: DollarSign,
            fields: [
                { key: 'price', label: 'Price', icon: DollarSign },
                { key: 'capacity', label: 'Capacity', icon: User },
                { key: 'link_rab', label: 'Link RAB', icon: Share2Icon, isLink: true }
            ]
        },
        {
            category: 'Instructor',
            icon: MapPin,
            fields: [
                { key: 'instructors', label: 'Instructor', icon: User },
                { key: 'tags', label: 'Tags', icon: User }
            ]
        },
    ];

    const dispatchProgramEvent = (type, programData) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(type, {
                detail: {
                    ...programData,
                    timestamp: new Date().toISOString()
                }
            }));
        }
    };

    const isValidUrl = (url) => {
        if (!url) return false;

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const formatUrl = (url) => {
        if (!url) return '';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }

        return url;
    };

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    const handleEdit = () => {
        if (!selectedProgram) return;
        if (onOpenEditModal) {
            onOpenEditModal(selectedProgram, (updatedProgram) => {
                if (onProgramEdited) {
                    onProgramEdited(updatedProgram);
                }

                toast.success('Program updated successfully');
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedProgram) return;
        
        if (showConfirm && typeof showConfirm === 'function') {
            showConfirm({
                title: 'Delete Program',
                message: `Are you sure you want to delete "${selectedProgram.program_name}"? This action cannot be undone.`,
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    await performDelete();
                },
                onCancel: () => {
                    toast('Deletion cancelled', { icon: '⚠️' });
                }
            });
        } else {
            const confirmed = window.confirm(`Are you sure you want to delete "${selectedProgram.program_name}"? This action cannot be undone.`);
            if (confirmed) {
                await performDelete();
            }
        }
    };

    const performDelete = async () => {
        setDeleteLoading(true);
        
        try {
            dispatchProgramEvent('programDeleted', {
                type: 'deleted',
                program: {
                    id: selectedProgram.id,
                    name: selectedProgram.program_name,
                    client: selectedProgram.client,
                    category: selectedProgram.category
                }
            });
            
            await onDelete(selectedProgram.id);
            
            dispatchProgramEvent('programDeletedSuccess', {
                type: 'deleted_success',
                program: {
                    id: selectedProgram.id,
                    name: selectedProgram.program_name
                },
                message: `Program "${selectedProgram.program_name}" has been deleted successfully`
            });
            
            toast.success(`Program "${selectedProgram.program_name}" deleted successfully`);
            
        } catch (error) {
            console.error('Error in handleDelete:', error);
            
            dispatchProgramEvent('programDeleteError', {
                type: 'deleted_error',
                program: {
                    id: selectedProgram.id,
                    name: selectedProgram.program_name
                },
                error: error.message || 'Failed to delete program'
            });
            
            toast.error(error.message || 'Failed to delete program');
        } finally {
            setDeleteLoading(false);
        }
    };

    const ActiveCategoryContent = () => {
        const activeCategoryData = getActiveCategoryData();

        if (!activeCategoryData || !selectedProgram) return null;

        const CategoryIcon = activeCategoryData.icon;

        return (
            <div className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-4 pb-2 border-b border-gray-100'>
                    <CategoryIcon className='w-4 h-4 text-amber-400' />
                    <h3 className='font-semibold text-gray-800'>{activeCategory}</h3>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    {activeCategoryData.fields.map((field, index) => {
                        const FieldIcon = field.icon;
                        const value = selectedProgram[field.key] || '-';

                        const isLinkField = field.isLink && value !== '-';
                        const formattedUrl = isLinkField ? formatUrl(value) : '';
                        const isValidLink = isLinkField && isValidUrl(formattedUrl);

                        const isArrayField = Array.isArray(value);
                        const displayValue = isArrayField ? 
                            value.join(', ') : 
                            value;

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0' />

                                <div className='flex-1'>
                                    <label className='text-sm text-gray-500 block mb-1'>
                                        {field.label}
                                    </label>
                                    
                                    {isLinkField && isValidLink ? (
                                        <div className='flex flex-col'>
                                            <a 
                                                href={formattedUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm flex items-center gap-1 group'
                                            >
                                                <span className='break-all'>
                                                    {formattedUrl}
                                                </span>
                                                <ExternalLink className='h-3 w-3 flex-shrink-0' />
                                            </a>
                                        </div>
                                    ) : isLinkField && value !== '-' ? (
                                        <div className='flex flex-col'>
                                            <span className='text-gray-900 text-sm font-medium break-all'>
                                                {value}
                                            </span>
                                            <span className='text-xs text-red-500 mt-1'>
                                                (Format URL tidak valid)
                                            </span>
                                        </div>
                                    ) : (
                                        <p className='text-gray-900 text-sm font-medium'>
                                            {displayValue}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const formatPrice = (price) => {
        if (!price) return '-';
        
        try {
            if (typeof price === 'string' && price.startsWith('Rp')) {
                return price;
            }
            
            const numericPrice = parseInt(price);
            if (isNaN(numericPrice)) return price;
            
            return `Rp ${numericPrice.toLocaleString('id-ID')}`;
        } catch {
            return price;
        }
    };

    const preparedProgram = selectedProgram ? {
        ...selectedProgram,
        price: formatPrice(selectedProgram.price),
        instructors: Array.isArray(selectedProgram.instructors) ? selectedProgram.instructors : 
                   (typeof selectedProgram.instructors === 'string' ? selectedProgram.instructors.split(',') : []),
        tags: Array.isArray(selectedProgram.tags) ? selectedProgram.tags : 
              (typeof selectedProgram.tags === 'string' ? selectedProgram.tags.split(',') : [])
    } : null;

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{detailTitle}</CardTitle>
                    {preparedProgram && (
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
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {preparedProgram ? (
                    <div className='space-y-6'>
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
                                );
                            })}
                        </div>

                        <ActiveCategoryContent />
                    </div>
                ) : (
                    <div className='text-center py-8 text-gray-500'>
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Program Selected</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Select a program from the list to view its details, edit information, or delete it.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProgramContent;