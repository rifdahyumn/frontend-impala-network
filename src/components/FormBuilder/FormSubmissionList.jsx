import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Loader2, Users, ChevronRight, Filter, Calendar, ChevronLeft } from 'lucide-react';
import formTemplateService from '../../services/formTemplateService';
import formSubmissionService from '../../services/formSubmissionService';

const FormSubmissionsList = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [programStats, setProgramStats] = useState({});

    useEffect(() => {
        loadAllPrograms();
    }, []);

    const loadAllPrograms = async () => {
        try {
            setLoadingTemplates(true);
            const response = await formTemplateService.getAllFormTemplates();
            const templatesData = response.data || [];
            
            const publishedTemplates = templatesData.filter(t => t.is_published);
            setTemplates(publishedTemplates);
            
            const programNames = publishedTemplates.map(t => t.program_name)
            if (programNames.length > 0) {
                const stats = await formSubmissionService.getMultipleProgramStats(programNames)
                setProgramStats(stats.data || {})
            }
        } catch (error) {
            console.error('Error loading programs:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleSelectProgram = async (programName) => {
    try {
        setSelectedProgram(programName);
        setLoadingSubmissions(true);

        const response = await formSubmissionService.getSubmissionByProgram(programName, {
            limit: 50
        });
        
        if (response.success === false) {
            console.error('[Component] API error:', response.message);
            setSubmissions([]);
        } else {
            setSubmissions(response.data || []);
        }
        
    } catch (error) {
        console.error('[Component] Error:', error);
        setSubmissions([]);
    } finally {
        setLoadingSubmissions(false);
    }
};

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!selectedProgram) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Daftar Program
                        </CardTitle>
                        <CardDescription>
                            Pilih program untuk melihat data pengisian form
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingTemplates ? (
                            <div className="flex items-center justify-center h-40 text-blue-600">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Memuat daftar program...</span>
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                <p>Belum ada program yang published</p>
                                <p className="text-sm mt-1">Publish form terlebih dahulu di tab "Form Builder"</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map((template) => (
                                    <Card 
                                        key={template.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleSelectProgram(template.program_name)}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{template.program_name}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Dibuat: {formatDate(template.created_at)}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                            
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm">
                                                            Total Pendaftar: 
                                                            <span className="font-bold ml-1">
                                                                {programStats[template.program_name]?.count || 0}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    
                                                </div>
                                                
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    {template.is_published ? 'Published' : 'Draft'}
                                                </Badge>
                                            </div>
                                            
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full mt-4 bg-amber-100 hover:bg-amber-200"
                                                onClick={() => handleSelectProgram(template.program_name)}
                                            >
                                                Lihat Data
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedProgram(null)}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <div>
                                <h2 className="text-xl font-bold">{selectedProgram}</h2>
                                <p className="text-sm text-gray-600">
                                    {submissions.length} data ditemukan
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {loadingSubmissions ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Memuat data pendaftar...</span>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                            <p>Belum ada data pendaftar untuk program ini</p>
                            <p className="text-sm mt-1">Form: /register/{selectedProgram.toLowerCase().replace(/\s+/g, '-')}</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Lengkap</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Telepon</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Tanggal Daftar</TableHead>
                                        <TableHead>Kota</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell className="font-medium">
                                                {submission.full_name}
                                            </TableCell>
                                            <TableCell>{submission.email}</TableCell>
                                            <TableCell>{submission.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {submission.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(submission.created_at)}</TableCell>
                                            <TableCell>{submission.regency_name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FormSubmissionsList;