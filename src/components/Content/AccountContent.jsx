import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from "../ui/button";
import { Edit, Trash2, User, UserCog, Mail, Phone, Shield, History, CheckCircle, Lock, Image, EyeOff, Eye, Loader2, UserCheck, AlertTriangle } from "lucide-react";
import toast from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ConfirmModal from "./ConfirmModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

const AccountContent = ({ 
    selectedUser, 
    onOpenEditModal, 
    detailTitle, 
    onDelete, 
    onActivateUser,
    onUserUpdated,
    onClientDeleted,
    showConfirm,
    handleConfirm,
    handleCancel,
    isOpen,
    config
}) => {
    const [activeCategory, setActiveCategory] = useState('Account Information');
    const [showPassword, setShowPassword] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activateLoading, setActivateLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [avatarLoadError, setAvatarLoadError] = useState(false);

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
                { key: 'status', label: 'Status', icon: CheckCircle },
                { key: 'created_at', label: 'Created At', icon: History },
                { key: 'updated_at', label: 'Last Updated', icon: History }
            ]
        },
    ];

    const getActiveCategoryData = () => {
        return detailFields.find(category => category.category === activeCategory);
    };

    const handleEdit = () => {
        if (!selectedUser) return;
        if (onOpenEditModal) {
            onOpenEditModal(selectedUser);
        }
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        
        if (showConfirm) {
            showConfirm({
                title: 'Deactivate User',
                message: `Are you sure you want to deactivate "${selectedUser.full_name}"? User will not be able to access the system.`,
                type: 'danger',
                confirmText: 'Deactivate',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    setDeleteLoading(true);
                    try {
                        if (onDelete) {
                            await onDelete(selectedUser.id);
                            toast.success(`User "${selectedUser.full_name}" deactivated successfully`);
                            
                            if (onUserUpdated) {
                                onUserUpdated();
                            }
                            
                            if (onClientDeleted) {
                                onClientDeleted();
                            }
                        }
                    } catch (error) {
                        console.error('Error deactivating user:', error);
                        toast.error(error.message || 'Failed to deactivate user');
                    } finally {
                        setDeleteLoading(false);
                    }
                },
                onCancel: () => {
                    toast('Deactivation cancelled', { icon: '⚠️' });
                }
            });
        } else {
            setDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        
        setDeleteLoading(true);
        try {
            if (onDelete) {
                await onDelete(selectedUser.id);
                toast.success(`User "${selectedUser.full_name}" deactivated successfully`);
                
                if (onUserUpdated) {
                    onUserUpdated();
                }
                
                if (onClientDeleted) {
                    onClientDeleted();
                }
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            toast.error(error.message || 'Failed to deactivate user');
        } finally {
            setDeleteLoading(false);
            setDeleteModalOpen(false);
        }
    };

    const handleActivate = () => {
        if (!selectedUser) return;

        if (showConfirm) {
            showConfirm({
                title: 'Activate User',
                message: `Are you sure you want to activate "${selectedUser.full_name}"?`,
                type: 'info',
                confirmText: 'Activate',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    setActivateLoading(true);
                    try {
                        if (onActivateUser) {
                            await onActivateUser(selectedUser.id);
                            toast.success(`User "${selectedUser.full_name}" activated successfully`);
                            
                            if (onUserUpdated) {
                                onUserUpdated();
                            }
                        }
                    } catch (error) {
                        console.error('Error activating user:', error);
                        toast.error(error.message || 'Failed to activate user');
                    } finally {
                        setActivateLoading(false);
                    }
                },
                onCancel: () => {
                    toast('Activation cancelled', { icon: '⚠️' });
                }
            });
        } else {
            if (!window.confirm(`Are you sure you want to activate user ${selectedUser.full_name}?`)) {
                return;
            }
            
            setActivateLoading(true);
            try {
                if (onActivateUser) {
                    onActivateUser(selectedUser.id)
                        .then(() => {
                            toast.success(`User "${selectedUser.full_name}" activated successfully`);
                            if (onUserUpdated) {
                                onUserUpdated();
                            }
                        })
                        .catch((error) => {
                            console.error('Error activating user:', error);
                            toast.error(error.message || 'Failed to activate user');
                        })
                        .finally(() => {
                            setActivateLoading(false);
                        });
                }
            } catch (error) {
                console.error('Error activating user:', error);
                toast.error(error.message || 'Failed to activate user');
                setActivateLoading(false);
            }
        }
    };

    const maskPassword = (password) => {
        if (!password) return '-';
        return '•'.repeat(8);
    };

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        
        if (avatarPath.startsWith('http')) {
            return avatarPath;
        }
        
        if (avatarPath.startsWith('/uploads/')) {
            const baseUrl = API_BASE_URL?.replace(/\/$/, '');
            return `${baseUrl}${avatarPath}`;
        }
        
        const baseUrl = API_BASE_URL?.replace(/\/$/, '');
        const path = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
        return `${baseUrl}${path}`;
    };

    const handleAvatarError = () => {
        setAvatarLoadError(true);
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatValue = (value, key) => {
        if (value === null || value === undefined) return '-';
        
        if (key === 'last_login' || key === 'created_at' || key === 'updated_at') {
            return formatDate(value);
        }
        
        if (key === 'status') {
            const status = value?.toLowerCase();
            if (status === 'active') {
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
            } else if (status === 'inactive') {
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>;
            }
            return value;
        }
        
        if (key === 'role') {
            const roleMap = {
                'admin': 'Admin',
                'manajer_program': 'Manajer Program',
                'komunitas': 'Community Team'
            };
            return roleMap[value] || value;
        }
        
        return value;
    };

    const ActiveCategoryContent = () => {
        const activeCategoryData = getActiveCategoryData();

        if (!activeCategoryData || !selectedUser) return null;

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
                        let displayValue = selectedUser[field.key];

                        if (field.isPassword) {
                            return (
                                <div key={index} className='flex items-start gap-3 col-span-2'>
                                    <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0' />

                                    <div className='flex-1'>
                                        <label className='text-sm text-gray-500 block mb-1'>
                                            {field.label}
                                        </label>
                                        <div className='flex items-center gap-2'>
                                            <p className='text-gray-900 text-sm font-medium font-mono'>
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
                            );
                        }

                        if (field.isImage) {
                            const avatarUrl = getAvatarUrl(displayValue);
                            return (
                                <div key={index} className='flex items-start gap-3 col-span-2'>
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
                                                    onError={handleAvatarError}
                                                />
                                                <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold'>
                                                    {getInitials(selectedUser.full_name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className='flex-1'>
                                                <p className={`text-sm font-medium ${displayValue && !avatarLoadError ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {displayValue && !avatarLoadError ? '✓ Profile picture uploaded' : 'No profile picture'}
                                                </p>
                                                {avatarLoadError && displayValue && (
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        Image failed to load
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={index} className='flex items-start gap-3'>
                                <FieldIcon className='h-4 w-4 text-gray-400 mt-1 flex-shrink-0' />
                                <div className='flex-1'>
                                    <label className='text-sm text-gray-500 block mb-1'>
                                        {field.label}
                                    </label>
                                    <div className='text-gray-900 text-sm font-medium'>
                                        {formatValue(displayValue, field.key)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!selectedUser) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{detailTitle || 'User Details'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-gray-500'>
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserCog className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No User Selected</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Select a user from the list to view their details, edit information, or manage their account.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{detailTitle || 'User Details'}</CardTitle>
                    <div className="flex items-center gap-2">
                        {selectedUser.status === 'Inactive' && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                Inactive
                            </span>
                        )}
                        {selectedUser.status === 'Active' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Active
                            </span>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
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
                                                setActiveCategory(category.category);
                                                setShowPassword(false);
                                                setAvatarLoadError(false); 
                                            }}
                                        >
                                            <CategoryIcon className='h-4 w-4' />
                                            {category.category}
                                        </Button>
                                    );
                                })}
                            </div>

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

                                {/* Button Activate (muncul hanya untuk user Inactive) */}
                                {selectedUser.status === 'Inactive' && (
                                    <Button
                                        onClick={handleActivate}
                                        disabled={activateLoading}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {activateLoading ? (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                        ) : (
                                            <UserCheck className='h-4 w-4' />
                                        )}
                                        {activateLoading ? 'Activating...' : 'Activate'}
                                    </Button>
                                )}

                                {/* Button Deactivate (muncul hanya untuk user Active) */}
                                {selectedUser.status === 'Active' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={handleDelete}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? (
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                        ) : (
                                            <Trash2 className='h-4 w-4' />
                                        )}
                                        {deleteLoading ? 'Deactivating...' : 'Deactivate'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <ActiveCategoryContent />
                    </div>
                </CardContent>
            </Card>

            {/* Modal Konfirmasi dari props showConfirm */}
            {showConfirm && (
                <ConfirmModal 
                    isOpen={isOpen || deleteModalOpen}
                    config={config || {
                        title: 'Deactivate User',
                        message: selectedUser ? `Are you sure you want to deactivate "${selectedUser.full_name}"? User will not be able to access the system.` : '',
                        type: 'danger',
                        confirmText: 'Deactivate',
                        cancelText: 'Cancel',
                    }}
                    onConfirm={handleConfirm || handleConfirmDelete}
                    onCancel={handleCancel || (() => {
                        setDeleteModalOpen(false);
                        toast('Deactivation cancelled', { icon: '⚠️' });
                    })}
                />
            )}

            {/* Fallback Modal jika showConfirm tidak tersedia */}
            {!showConfirm && (
                <ConfirmModal 
                    isOpen={deleteModalOpen}
                    config={{
                        title: 'Deactivate User',
                        message: selectedUser ? `Are you sure you want to deactivate "${selectedUser.full_name}"? User will not be able to access the system.` : '',
                        type: 'danger',
                        confirmText: 'Deactivate',
                        cancelText: 'Cancel',
                    }}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setDeleteModalOpen(false);
                        toast('Deactivation cancelled', { icon: '⚠️' });
                    }}
                />
            )}
        </>
    );
};

export default AccountContent;