import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { X, FileText, Calendar, ExternalLink, Copy, Loader2, Trash2 } from 'lucide-react';

const FormTemplateList = ({ templates, selectedTemplate, onTemplateSelect, onCopyLink, onDeleteTemplate }) => {
    const [deletingId, setDeletingId] = useState(null)

    const copyFullLink = (template) => {
        const fullLink = `http://localhost:5173/register/${template.unique_slug}`
        navigator.clipboard.writeText(fullLink)

        if (onCopyLink) {
            onCopyLink(fullLink, template.program_name);
        } else {
            alert(`Link berhasil disalin: ${fullLink}`);
        }
    }

    const openFullLink = (template) => {
        const fullLink = `http://localhost:5173/register/${template.unique_slug}`
        window.open(fullLink, '_blank', 'noopener,noreferrer')
    }

    const handleDelete = async (template, e) => {
        e.stopPropagation()

        const confirmed = confirm(
            `Apakah anda yakin ingin menghapus form "${template.program_name}"?\n\n` +
            `Tindakan ini tidak dapat dibatalkan dan semua data yang terkait akan dihapus.`
        )

        if (!confirmed) return
        setDeletingId(template.id)

        try {
            await onDeleteTemplate(template.id)
        } catch (error) {
            console.error('Error deleting template:', error)
            alert('Gagal menghapus form. Silahkan coba lagi')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <Card className='mb-4 min-h-screen'>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <FileText className="h-5 w-5" />
                            Form Templates
                        </CardTitle>

                        <CardDescription>
                            Pilih template form yang dibuat
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-screen">
                    {templates.length === 0 ? (
                        <div className='text-center py-8 text-gray-500'>
                            <FileText className='h-12 w-12 mx-auto mb-2 opacity-50' />
                            <p>Belum ada template</p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                        selectedTemplate?.id === template.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => onTemplateSelect(template)}
                                >
                                    <div className='flex justify-between items-start mb-2'>
                                        <h4 className='font-semibold text-gray-800'>{template.program_name}</h4>

                                        <div className='flex gap-1'>
                                            {template.is_published && (
                                                <Badge variant="default" className="bg-green-500 text-xs">
                                                    Published
                                                </Badge>
                                            )}

                                            <Badge variant="outline" className='text-xs'>
                                                Draft
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                                        <Calendar className='h-3 w-3' />
                                        {new Date(template.created_at).toLocaleDateString('id-ID')}
                                    </div>

                                    {template.unique_slug && (
                                        <div className='space-y-2'>
                                            <p className='text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded'>
                                                /register/{template.unique_slug}
                                            </p>

                                            <div className='flex gap-2'>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        copyFullLink(template)
                                                    }}
                                                    className='flex items-center gap-1 text-xs'
                                                >
                                                    <Copy className='h-3 w-3' />
                                                    Copy Form
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openFullLink(template)
                                                    }}
                                                    className='flex items-center gap-1 text-xs'
                                                >
                                                    <ExternalLink className='h-3 w-3' />
                                                    Buka Form
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    variant='destructive'
                                                    onClick={(e) => handleDelete(template, e)}
                                                    className='flex items-center gap-1 text-xs'
                                                >
                                                    {deletingId === template.id ? (
                                                        <Loader2 className='w-3 h-3 animate-spin' />
                                                    ) : (
                                                        <Trash2 className='w-3 h-3' />
                                                    )}
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {!template.unique_slug && (
                                        <div className="space-y-2">
                                            <p className='text-xs text-gray-500 italic'>
                                                Belum memiliki link (belum dipublish)
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => handleDelete(template, e)}
                                                    disabled={deletingId === template.id}
                                                    className="flex items-center gap-1 text-xs"
                                                >
                                                    {deletingId === template.id ? (
                                                        <Loader2 className='h-3 w-3 animate-spin' />
                                                    ) : (
                                                        <Trash2 className='h-3 w-3' />
                                                    )}
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default FormTemplateList