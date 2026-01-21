import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { FileText, Calendar, ExternalLink, Copy, Loader2, Trash2, AlertCircle, Info, Check } from 'lucide-react';

const FormTemplateList = ({ templates, selectedTemplate, onTemplateSelect, onCopyLink, onDeleteTemplate }) => {
    const [deletingId, setDeletingId] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState(null)
    const [copiedTemplateId, setCopiedTemplateId] = useState(null)

    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin

    const getExpiryStatus = (endDate) => {
        if (!endDate) return 'no_date';
        
        const now = new Date();
        const expiryDate = new Date(endDate);
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'expired';
        if (diffDays <= 3) return 'soon';
        return 'active';
    }

    const copyFullLink = (template) => {
        const fullLink = `${baseUrl}/register/${template.unique_slug}`
        navigator.clipboard.writeText(fullLink)
            .then(() => {
                setCopiedTemplateId(template.id)

                if (onCopyLink) {
                    onCopyLink(fullLink, template.program_name);
                }

                setTimeout(() => {
                    setCopiedTemplateId(null)
                }, 2000)
            })
            .catch(err => {
                console.error('Gagal menyalin:', err)

                const tempInput = document.createElement('input')
                tempInput.value = fullLink
                document.body.appendChild(tempInput)
                tempInput.select()
                document.execCommand('copy')
                document.body.removeChild(tempInput)

                setCopiedTemplateId(template.id)
                setTimeout(() => {
                    setCopiedTemplateId(null)
                }, 2000)
            })
    }

    const openFullLink = (template) => {
        const fullLink = `${baseUrl}/register/${template.unique_slug}`
        window.open(fullLink, '_blank', 'noopener,noreferrer')
    }

    const handleDeleteClick = (template, e) => {
        e.stopPropagation()
        setTemplateToDelete(template)
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        if (!templateToDelete) return
        
        setDeletingId(templateToDelete.id)
        setShowDeleteConfirm(false)

        try {
            await onDeleteTemplate(templateToDelete.id)
        } catch (error) {
            console.error('Error deleting template:', error)
            alert('Gagal menghapus form. Silahkan coba lagi')
        } finally {
            setDeletingId(null)
            setTemplateToDelete(null)
        }
    }

    const cancelDelete = () => {
        setShowDeleteConfirm(false)
        setTemplateToDelete(null)
    }

    return (
        <>
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
                    <div 
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 animate-in fade-in-zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-full bg-red-50 border border-red-100">
                                    <AlertCircle className="h-7 w-7 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Konfirmasi Penghapusan
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Anda akan menghapus form berikut
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <div className="ml-3">
                                        <h4 className="text-sm font-semibold text-gray-800">
                                            {templateToDelete?.program_name}
                                        </h4>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-gray-700">
                                                Dibuat: {new Date(templateToDelete?.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                            {templateToDelete?.unique_slug && (
                                                <p className="text-xs text-gray-600 font-mono">
                                                    /register/{templateToDelete?.unique_slug}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="ml-3">
                                        <h4 className="text-sm font-semibold text-amber-800">
                                            Perhatian!
                                        </h4>
                                        <div className="mt-1 text-sm text-amber-700">
                                            <p className="mb-1">• Tindakan ini <span className="font-bold">tidak dapat dibatalkan</span></p>
                                            <p className="mb-1">• Semua data form akan dihapus permanen</p>
                                            <p>• Link form tidak akan dapat diakses lagi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cancelDelete}
                                    className="px-6 py-2.5 rounded-lg border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-gray-700 font-medium"
                                >
                                    Batalkan
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    className="px-6 py-2.5 rounded-lg font-medium"
                                >
                                    Ya, Hapus Form
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Card className='min-h-screen border border-gray-200 shadow-sm'>
                <CardHeader className='border-gray-100'>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className='flex items-center gap-2.5 text-gray-800'>
                                <div className="p-2 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                Form Templates
                                <Badge
                                    variant='outline'
                                    className='ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs'
                                >
                                    {templates.length} aktif
                                </Badge>
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <ScrollArea className="h-screen pr-4">
                        {templates.length === 0 ? (
                            <div className='text-center py-12 text-gray-500'>
                                <div className="p-4 bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                    <FileText className='h-10 w-10 text-gray-400' />
                                </div>
                                <p className="text-gray-600">
                                    Tidak ada template aktif
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Semua template telah berakhir atau program tidak ditemukan
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {templates.map(template => {
                                    const expiryStatus = getExpiryStatus(template.end_date)

                                    return (
                                        <div
                                            key={template.id}
                                            className={`p-5 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md group ${
                                                selectedTemplate?.id === template.id
                                                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                                                    : 'border-gray-200 hover:border-blue-200 bg-white'
                                            }`}
                                            onClick={() => onTemplateSelect(template)}
                                        >
                                            <div className='flex justify-between items-start mb-3'>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className='font-semibold text-gray-800 text-lg group-hover:text-blue-700 transition-colors'>
                                                            {template.program_name}
                                                        </h4>
                                                        {/* {expiryStatus === 'soon' && (
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                                                Akan berakhir
                                                            </Badge>
                                                        )} */}
                                                    </div>
                                                </div>

                                                <div className='flex gap-2 ml-2'>
                                                    {template.is_published && (
                                                        <Badge variant="default" className="bg-green-500 text-white text-xs border-0">
                                                            Published
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className='flex items-center gap-2 text-sm text-green-600 mb-4'>
                                                    <Calendar className='h-4 w-4 text-green-500' />
                                                    <span className="font-medium">
                                                        Dibuat : {new Date(template.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                {template.end_date && (
                                                    <div className={`flex items-center gap-2 text-sm -mt-2 mb-4 ${
                                                        expiryStatus === 'soon' ? 'text-amber-600' : 'text-red-600'
                                                    }`}>
                                                        <Calendar className={`h-4 w-4 ${
                                                            expiryStatus === 'soon' ? 'text-amber-500' : 'text-red-500'
                                                        }`} />
                                                        <span className="font-medium">
                                                            Berakhir: {new Date(template.end_date).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {expiryStatus === 'soon' && (
                                                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                                                Segera berakhir
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {template.unique_slug && (
                                                <div className='space-y-3'>
                                                    <div className="flex items-center justify-between">
                                                        <p className='text-sm text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100'>
                                                            <span className="text-gray-600">Link: </span>
                                                            /register/{template.unique_slug}
                                                        </p>
                                                    </div>

                                                    <div className='flex gap-2 pt-2'>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                copyFullLink(template)
                                                            }}
                                                            className={`flex items-center gap-1.5 text-xs transition-all duration-300 ${
                                                                copiedTemplateId === template.id
                                                                    ? 'bg-green-50 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                                                                    : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                                                            }`}
                                                        >
                                                            {copiedTemplateId === template.id ? (
                                                                <>
                                                                    <Check className='h-3.5 w-3.5' />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className='h-3.5 w-3.5' />
                                                                    Copy Form
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openFullLink(template)
                                                            }}
                                                            className='flex items-center gap-1.5 text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all'
                                                        >
                                                            <ExternalLink className='h-3.5 w-3.5' />
                                                            Buka Form
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='destructive'
                                                            onClick={(e) => handleDeleteClick(template, e)}
                                                            disabled={deletingId === template.id}
                                                            className='flex items-center gap-1.5 text-xs'
                                                        >
                                                            {deletingId === template.id ? (
                                                                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                                            ) : (
                                                                <Trash2 className='w-3.5 h-3.5' />
                                                            )}
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {!template.unique_slug && (
                                                <div className="space-y-3">
                                                    <p className='text-sm text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg'>
                                                        Belum memiliki link (belum dipublish)
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={(e) => handleDeleteClick(template, e)}
                                                            disabled={deletingId === template.id}
                                                            className="flex items-center gap-1.5 text-xs"
                                                        >
                                                            {deletingId === template.id ? (
                                                                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                                            ) : (
                                                                <Trash2 className='h-3.5 w-3.5' />
                                                            )}
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                
                                    
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </>
    )
}

export default FormTemplateList