import { Edit, Trash2, Save, X } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useDetailFields } from './ImpalaContentConfig';
import toast from 'react-hot-toast';

const ImpalaContent = ({ selectedMember, onDelete, detailTitle, onMemberUpdated }) => {
    const [activeCategory, setActiveCategory] = useState('Personal Information');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedMember, setEditedMember] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getDetailFields } = useDetailFields();

    const detailFields = getDetailFields(selectedMember);

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    // Handle Edit Button Click
    const handleEditClick = () => {
        if (!selectedMember) return;
        
        // Set data awal untuk editing
        setEditedMember({ ...selectedMember });
        setIsEditModalOpen(true);
    };

    // Handle Save in Modal
    const handleSaveEdit = async () => {
        try {
            setIsSubmitting(true);
            
            // Validasi field wajib sesuai dengan formulir
            const requiredFields = ['full_name', 'email', 'phone', 'gender', 'date_of_birth', 'education', 'address', 'city', 'province', 'postal_code'];
            const missingFields = requiredFields.filter(field => {
                const value = editedMember[field];
                return !value || value.toString().trim() === '';
            });

            if (missingFields.length > 0) {
                const fieldLabels = {
                    full_name: 'Nama Lengkap', email: 'Email', phone: 'Nomor WhatsApp',
                    gender: 'Jenis Kelamin', date_of_birth: 'Tanggal Lahir', education: 'Pendidikan Terakhir',
                    address: 'Alamat Lengkap', city: 'Kota/Kabupaten', province: 'Provinsi', postal_code: 'Kode Pos'
                };
                toast.error(`Harap lengkapi: ${missingFields.map(f => fieldLabels[f]).join(', ')}`);
                return;
            }

            // Validasi jika memilih disabilitas "Lainnya" tapi tidak mengisi detail
            if (editedMember.disability_status === 'Lainnya' && (!editedMember.disability_type || editedMember.disability_type.trim() === '')) {
                toast.error('Harap jelaskan jenis disabilitas Anda');
                return;
            }

            // Kirim ke parent component
            if (onMemberUpdated) {
                await onMemberUpdated(editedMember);
                toast.success('Data member berhasil diperbarui');
            }
            
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating member:', error);
            toast.error(error.message || 'Gagal memperbarui data member');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Cancel Edit
    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditedMember({});
    };

    // Handle Field Change in Modal
    const handleFieldChange = (fieldKey, value) => {
        setEditedMember(prev => ({
            ...prev,
            [fieldKey]: value
        }));
        
        // Reset disability_type jika tidak memilih "Lainnya"
        if (fieldKey === 'disability_status' && value !== 'Lainnya') {
            setEditedMember(prev => ({ ...prev, disability_type: '' }));
        }
    };

    // Options untuk select fields
    const disabilityOptions = [
        'Tidak memiliki disabilitas',
        'Disabilitas Fisik/Motorik',
        'Disabilitas Penglihatan (Tuna Netra/Low Vision)',
        'Disabilitas Pendengaran (Tuna Rungu/Tuli)',
        'Disabilitas Bicara/Komunikasi',
        'Disabilitas Intelektual',
        'Disabilitas Mental/Psikososial',
        'Disabilitas Ganda/Multiple',
        'Disabilitas Neurologis/Perkembangan (Autisme, ADHD, dll)',
        'Penyakit Kronis/Disabilitas Laten',
        'Lainnya'
    ];

    const educationOptions = [
        'SD/Sederajat',
        'SMP/Sederajat',
        'SMA/Sederajat',
        'Diploma (D1-D4)',
        'Sarjana (S1)',
        'Magister (S2)',
        'Doktor (S3)',
        'Tidak Bersekolah'
    ];

    const genderOptions = ['Laki-laki', 'Perempuan'];

    // Render field input berdasarkan tipe field
    const renderFieldInput = (fieldKey, fieldConfig, value) => {
        const commonProps = {
            value: value || '',
            onChange: (e) => handleFieldChange(fieldKey, e.target.value),
            placeholder: `Masukkan ${fieldConfig.label.toLowerCase()}`,
            className: "w-full"
        };

        // Tentukan tipe field berdasarkan config atau key
        let fieldType = fieldConfig.type || 'text';
        
        // Override berdasarkan key tertentu
        if (fieldKey === 'disability_status') fieldType = 'select';
        if (fieldKey === 'education') fieldType = 'select';
        if (fieldKey === 'gender') fieldType = 'select';
        if (fieldKey === 'date_of_birth') fieldType = 'date';
        if (fieldKey === 'reason_join_program') fieldType = 'textarea';
        if (fieldKey === 'description') fieldType = 'textarea';
        if (fieldKey === 'address') fieldType = 'textarea';

        switch (fieldType) {
            case 'textarea':
                return (
                    <Textarea
                        {...commonProps}
                        rows={3}
                        className="min-h-[80px]"
                    />
                );
            
            case 'select':
                let options = [];
                if (fieldKey === 'disability_status') options = disabilityOptions;
                else if (fieldKey === 'education') options = educationOptions;
                else if (fieldKey === 'gender') options = genderOptions;
                else if (fieldConfig.options) options = fieldConfig.options;
                
                return (
                    <Select
                        value={value || ''}
                        onValueChange={(val) => handleFieldChange(fieldKey, val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={`Pilih ${fieldConfig.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option, index) => (
                                <SelectItem key={index} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            
            case 'date':
                return (
                    <Input
                        type="date"
                        {...commonProps}
                    />
                );
            
            case 'number':
                return (
                    <Input
                        type="number"
                        {...commonProps}
                    />
                );
            
            case 'email':
                return (
                    <Input
                        type="email"
                        {...commonProps}
                    />
                );
            
            case 'tel':
                return (
                    <Input
                        type="tel"
                        {...commonProps}
                    />
                );
            
            default:
                return <Input {...commonProps} />;
        }
    };

    // Render Modal Edit
    const EditMemberModal = () => {
        if (!isEditModalOpen || !selectedMember) return null;

        const allCategories = getDetailFields(selectedMember);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Edit Member: {selectedMember.full_name || selectedMember.id}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Perbarui informasi member sesuai dengan struktur formulir
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Modal Body - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Tabs untuk kategori */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {allCategories.map((category, index) => {
                                    const CategoryIcon = category.icon;
                                    return (
                                        <Button
                                            key={index}
                                            type="button"
                                            variant={activeCategory === category.category ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => setActiveCategory(category.category)}
                                        >
                                            <CategoryIcon className="h-4 w-4" />
                                            {category.category}
                                        </Button>
                                    );
                                })}
                            </div>

                            {/* Content per kategori */}
                            {allCategories.map((category, catIndex) => {
                                const CategoryIcon = category.icon;
                                
                                if (category.category !== activeCategory) return null;
                                
                                return (
                                    <div key={catIndex} className="border border-gray-200 rounded-lg p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CategoryIcon className="w-4 h-4 text-amber-400" />
                                            <h4 className="font-medium text-gray-800">
                                                {category.category}
                                            </h4>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {category.fields.map((field, fieldIndex) => {
                                                const FieldIcon = field.icon;
                                                const value = editedMember[field.key] || '';
                                                
                                                return (
                                                    <div key={fieldIndex} className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <FieldIcon className="h-4 w-4 text-gray-400" />
                                                            <Label htmlFor={field.key} className="text-sm font-medium">
                                                                {field.label}
                                                            </Label>
                                                            {['full_name', 'email', 'phone', 'gender', 'date_of_birth', 'education', 'address', 'city', 'province', 'postal_code'].includes(field.key) && (
                                                                <span className="text-xs text-red-500">*</span>
                                                            )}
                                                        </div>
                                                        
                                                        {renderFieldInput(field.key, field, value)}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Field khusus untuk disability_type jika memilih Lainnya */}
                                        {category.category === 'Personal Information' && 
                                         editedMember.disability_status === 'Lainnya' && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 md:col-span-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="disability_type" className="text-sm font-medium">
                                                        Jenis Disabilitas (jika memilih Lainnya)
                                                    </Label>
                                                    <Input
                                                        id="disability_type"
                                                        value={editedMember.disability_type || ''}
                                                        onChange={(e) => handleFieldChange('disability_type', e.target.value)}
                                                        placeholder="Jelaskan jenis disabilitas Anda"
                                                        className="w-full"
                                                    />
                                                    <p className="text-xs text-gray-500">
                                                        *Wajib diisi jika memilih "Lainnya"
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> Menandakan field wajib diisi
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isSubmitting}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleSaveEdit}
                                    className="bg-amber-500 hover:bg-amber-400"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changed
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
            setIsEditModalOpen(false);
            setEditedMember({});
        }
    }, [selectedMember]);

    return (
        <>
            {/* Main Content */}
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
                        <div className='text-center py-4 text-gray-500'>
                            <p>Pilih member untuk melihat detail</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Modal (Rendered conditionally) */}
            <EditMemberModal />
        </>
    )
}

export default ImpalaContent;