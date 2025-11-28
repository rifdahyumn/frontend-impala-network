import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Link, Calendar } from 'lucide-react';

const FormLinksTab = ({ formTemplates, formatDate }) => {
    const publishedTemplates = formTemplates.filter(template => template.is_published);
    const draftTemplates = formTemplates.filter(template => !template.is_published);

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Form yang di publish ({publishedTemplates.length})
                </h3>

                {publishedTemplates.length === 0 ? (
                    <Alert>
                        <AlertDescription>
                            Belum ada form yang dipublish. Publish form terlebih dahulu untuk mendapatkan link public
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className='grid grid-cols-1 gap-4'>
                        {publishedTemplates.map(template => (
                            <Card key={template.id} className="border-l-4 border-l-green-500">
                                <CardContent className='p-4'>
                                    <div className='flex justify-between items-start'>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-3 mb-2'>
                                                <h4 className='font-semibold text-gray-800 text-lg'>
                                                    {template.program_name}
                                                </h4>

                                                <Badge variant="default" className='bg-green-100 text-green-800'>
                                                    Published
                                                </Badge>
                                            </div>

                                            <div className='space-y-1 text-sm text-gray-600'>
                                                <p className='flex items-center gap-2'>
                                                    <Link className='h-4 w-4' />
                                                    <span>
                                                        /register/{template.unique_slug}
                                                    </span>
                                                </p>
                                                <p className='flex items-center gap-2'>
                                                    <Calendar className='h-4 w-4' />
                                                    DiPublish: {formatDate(template.updated_at)}
                                                </p>
                                                <p className='text-xs text-gray-500'>
                                                    ID: {template.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Draft Form ({draftTemplates.length})
                </h3>

                {draftTemplates.length === 0 ? (
                    <Alert>
                        <AlertDescription>
                            Belum ada form dalam draft
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className='grid grid-cols-1 gap-4'>
                        {draftTemplates.map(template => (
                            <Card key={template.id} className='border-l-4 border-l-yellow-500'>
                                <CardContent className='p-4'>
                                    <div className='flex justify-between items-start'>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-3 mb-2'>
                                                <h4 className='font-semibold text-gray-800'>
                                                    {template.program_name}
                                                </h4>
                                                <Badge variant='outline' className='text-yellow-600'>
                                                    Draft
                                                </Badge>
                                            </div>

                                            <div className='space-y-1 text-sm text-gray-600'>
                                                <p className='flex items-center gap-2'>
                                                    <Calendar className='h-4 w-4' />
                                                    Dibuat: {formatDate(template.created_at)}
                                                </p>
                                                <p className='text-xs text-gray-500'>
                                                    ID: {template.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormLinksTab;