import React, { useState, useEffect } from 'react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Phone, Calendar, User as UserIcon, Home, Briefcase, GraduationCap, Heart, Users, FileText, Settings } from 'lucide-react';

const EditMemberForm = ({
    isEditMode,
    memberData,
    onMemberUpdated,
    setIsModalOpen,
    detailFields = []
}) => {
    const [activeCategory, setActiveCategory] = useState('Personal Information');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, handleSubmit, reset, watch, formState: { errors }, setValue } = useForm({
        defaultValues: {}
    });

    useEffect(() => {
        if (isEditMode && memberData) {
            reset(memberData);
        }
    }, [isEditMode, memberData, reset]);

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

    const disabilityStatus = watch('disability_status');

    const onSubmit = async (formData) => {
        try {
            setIsSubmitting(true);

            if (!formData.full_name?.trim()) {
                toast.error('Nama lengkap harus diisi');
                setIsSubmitting(false);
                return;
            }

            if (!formData.email?.trim()) {
                toast.error('Email harus diisi');
                setIsSubmitting(false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                toast.error('Format email tidak valid');
                setIsSubmitting(false);
                return;
            }

            if (isEditMode && onMemberUpdated) {
                const memberId = memberData?.id || memberData?._id || memberData?.memberId;
                
                if (!memberId) {
                    toast.error('Cannot update: Member ID not found');
                    setIsSubmitting(false);
                    return;
                }

                const updatedData = {
                    ...formData,

                    updated_at: new Date().toISOString()
                };
                
                await onMemberUpdated(updatedData);
                setIsModalOpen(false);
            } else {
                toast.error('Update function not available');
            }
        } catch (error) {
            toast.error(error.message || 'Gagal menyimpan data');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFieldInput = (fieldKey, fieldConfig) => {
        const fieldType = fieldConfig.type || 'text';
        const error = errors[fieldKey];
        
        let options = [];
        if (fieldKey === 'disability_status') options = disabilityOptions;
        else if (fieldKey === 'education') options = educationOptions;
        else if (fieldKey === 'gender') options = genderOptions;
        else if (fieldConfig.options) options = fieldConfig.options;

        switch (fieldType) {
            case 'textarea':
                return (
                    <div className="w-full">
                        <Textarea
                            {...register(fieldKey, {
                                required: fieldConfig.required ? `${fieldConfig.label} harus diisi` : false
                            })}
                            placeholder={`Masukkan ${fieldConfig.label.toLowerCase()}`}
                            rows={3}
                            className={`min-h-[80px] ${error ? 'border-red-500' : ''}`}
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error.message}</p>
                        )}
                    </div>
                );
            
            case 'select':
                return (
                    <div className="w-full">
                        <Select
                            value={watch(fieldKey) || ''}
                            onValueChange={(value) => setValue(fieldKey, value, { shouldValidate: true })}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
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
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error.message}</p>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <div className="w-full">
                        <Input
                            type="date"
                            {...register(fieldKey, {
                                required: fieldConfig.required ? `${fieldConfig.label} harus diisi` : false
                            })}
                            className={error ? 'border-red-500' : ''}
                            disabled={isSubmitting}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error.message}</p>
                        )}
                    </div>
                );
            
            case 'number':
                return (
                    <div className="w-full">
                        <Input
                            type="number"
                            {...register(fieldKey, {
                                required: fieldConfig.required ? `${fieldConfig.label} harus diisi` : false,
                                min: fieldConfig.min ? { value: fieldConfig.min, message: `Minimal ${fieldConfig.min}` } : undefined,
                                max: fieldConfig.max ? { value: fieldConfig.max, message: `Maksimal ${fieldConfig.max}` } : undefined
                            })}
                            placeholder={`Masukkan ${fieldConfig.label.toLowerCase()}`}
                            className={error ? 'border-red-500' : ''}
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error.message}</p>
                        )}
                    </div>
                );
            
            case 'email':
                return (
                    <div className="w-full">
                        <Input
                            type="email"
                            {...register(fieldKey, {
                                required: `${fieldConfig.label} harus diisi`,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Format email tidak valid'
                                }
                            })}
                            placeholder={`Masukkan ${fieldConfig.label.toLowerCase()}`}
                            className={error ? 'border-red-500' : ''}
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error.message}</p>
                        )}
                    </div>
                );
            
            default:
                return (
                    <div className="w-full">
                        <Input
                            {...register(fieldKey, {
                                required: fieldConfig.required ? `${fieldConfig.label} harus diisi` : false,
                                minLength: fieldConfig.minLength ? {
                                    value: fieldConfig.minLength,
                                    message: `Minimal ${fieldConfig.minLength} karakter`
                                } : undefined
                            })}
                            placeholder={`Masukkan ${fieldConfig.label.toLowerCase()}`}
                            className={error ? 'border-red-500' : ''}
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error.message}</p>
                        )}
                    </div>
                );
        }
    };

    const activeCategoryData = detailFields.find(cat => cat.category === activeCategory);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-6">
                {detailFields.map((category, index) => {
                    const CategoryIcon = category.icon;
                    return (
                        <Button
                            key={index}
                            type="button"
                            variant={activeCategory === category.category ? 'default' : 'outline'}
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setActiveCategory(category.category)}
                            disabled={isSubmitting}
                        >
                            <CategoryIcon className="h-4 w-4" />
                            {category.category}
                        </Button>
                    );
                })}
            </div>

            {activeCategoryData && (
                <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <activeCategoryData.icon className="w-4 h-4 text-amber-400" />
                        <h4 className="font-medium text-gray-800">
                            {activeCategoryData.category}
                        </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCategoryData.fields.map((field, fieldIndex) => {
                            const FieldIcon = field.icon;
                            
                            return (
                                <div key={fieldIndex} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FieldIcon className="h-4 w-4 text-gray-400" />
                                        <Label htmlFor={field.key} className={`text-sm font-medium ${errors[field.key] ? 'text-red-600' : ''}`}>
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </Label>
                                    </div>
                                    
                                    {renderFieldInput(field.key, field)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Conditional Field for Disability Type */}
                    {activeCategoryData.category === 'Personal Information' && 
                     disabilityStatus === 'Lainnya' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 md:col-span-2">
                            <div className="space-y-2">
                                <Label htmlFor="disability_type" className="text-sm font-medium">
                                    Jenis Disabilitas (jika memilih Lainnya)
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="disability_type"
                                    {...register('disability_type', {
                                        required: 'Jenis disabilitas harus diisi jika memilih Lainnya'
                                    })}
                                    placeholder="Jelaskan jenis disabilitas Anda"
                                    className={`w-full ${errors.disability_type ? 'border-red-500' : ''}`}
                                    disabled={isSubmitting}
                                />
                                {errors.disability_type && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.disability_type.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menyimpan...
                        </>
                    ) : (
                        "Update Beneficiary"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default EditMemberForm;