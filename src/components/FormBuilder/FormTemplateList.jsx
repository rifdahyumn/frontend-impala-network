import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { X, FileText, Calendar } from 'lucide-react';

const FormTemplateList = ({ templates, selectedTemplate, onTemplateSelect, onClose }) => {
    return (
        <Card className='mb-4'>
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

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                    >
                        <X className='h-4 w-4' />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-64">
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
                                        <p className='text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded'>
                                            /register/{template.unique_slug}
                                        </p>
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