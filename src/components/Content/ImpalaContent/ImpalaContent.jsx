import { Edit, Trash2, Clipboard } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { useDetailFields } from './ImpalaContentConfig';
import EditMemberModal from './EditMemberModal';
import toast from 'react-hot-toast';

const ImpalaContent = ({ selectedMember, onDelete, detailTitle, onMemberUpdated }) => {
    const [activeCategory, setActiveCategory] = useState('Personal Information');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { getDetailFields } = useDetailFields();

    const detailFields = getDetailFields(selectedMember);

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    const handleEditClick = () => {
        if (!selectedMember) {
            toast.error('No member selected');
            return;
        }
        setIsEditModalOpen(true);
    };

    const handleMemberUpdated = async (updatedMember) => {
        try {
            if (onMemberUpdated) {
                await onMemberUpdated(updatedMember);
            } else {
                toast.error('Update function not available');
            }
        } catch (error) {
            toast.error('Failed to update member', error);
        }
    };

    const ActiveCategoryContent = () => {
        const activeCategoryData = getActiveCategoryData();

        if(!activeCategoryData || !selectedMember) return null;

        const CategoryIcon = activeCategoryData.icon;

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
                            displayValue = selectedMember[field.key] ? 'Ya' : 'Tidak'
                        }
                        
                        if (Array.isArray(displayValue)) {
                            displayValue = displayValue.join(', ');
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
    };

    useEffect(() => {
        if (selectedMember) {
            setActiveCategory('Personal Information');
        }
    }, [selectedMember]);

    return (
        <>
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

                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2"
                                        onClick={handleEditClick}
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
                                        Hapus
                                    </Button>
                                </div>
                            </div>

                            <ActiveCategoryContent />
                        </div>
                    ) : (
                         <div className='text-center py-8 text-gray-500'>
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clipboard className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Beneficiary Selected</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Select a beneficiary from the list to view its details, edit information, or delete it.
                        </p>
                    </div>
                )}
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <EditMemberModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                memberData={selectedMember}
                onMemberUpdated={handleMemberUpdated}
                detailFields={detailFields}
            />
        </>
    )
}

export default ImpalaContent;