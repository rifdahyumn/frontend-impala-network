import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, AlertCircle, Tag, Filter, X, RefreshCw, Download, Upload, FileText, FileSpreadsheet, CheckSquare } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ImpalaContent from '../components/Content/ImpalaContent';
import { useImpala } from "../hooks/useImpala";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem} from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx'

const ImpalaManagement = () => {
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [highlightDetail, setHighlightDetail] = useState(false);
    const participantDetailRef = useRef(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        gender: null,
        category: null,
    });
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);

    const { participant, loading, error, pagination, handlePageChange, refreshData } = useImpala();

    const handleSelectParticipant = useCallback((participant) => {
        setSelectedParticipant(participant);
        setHighlightDetail(true);
        
        setTimeout(() => {
            if (participantDetailRef.current) {
                participantDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                participantDetailRef.current.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150);
    }, []);

    const handleDownloadTemplate = useCallback(() => {
        try {
            const templateData = [
                {
                    'full_name': 'Contoh: John Doe',
                    'email': 'Contoh: john@example.com',
                    'gender': 'Contoh: Laki-laki',
                    'phone': 'Contoh: 081234567890',
                    'category': 'Contoh: Mahasiswa',
                    'program_name': 'Contoh: Program Impala',
                    'entity': 'Contoh: Universitas Indonesia',
                    'address': 'Contoh: Jl. Contoh No. 123',
                    'notes': 'Contoh: Catatan tambahan'
                },
            ];
            
            const headers = Object.keys(templateData[0]);
            const csvContent = [
                headers.join(','),
                ...templateData.map(row => 
                    headers.map(header => 
                        `"${row[header] || ''}"`
                    ).join(',')
                )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `impala_import_template_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Template CSV berhasil didownload');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal mendownload template');
        }
    }, []);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            toast.error('Hanya file CSV yang diperbolehkan');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File terlalu besar. Maksimal 5MB');
            return;
        }
        
        setImportFile(file);
    }, []);

    const handleImportCSV = useCallback(async () => {
        if (!importFile) {
            toast.error('Pilih file CSV terlebih dahulu');
            return;
        }
        
        setIsImporting(true);
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const csvText = e.target.result;
                    const rows = csvText.split('\n');
                    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    const importedParticipants = [];
                    for (let i = 1; i < rows.length; i++) {
                        if (!rows[i].trim()) continue;
                        
                        const values = rows[i].split(',').map(v => v.trim().replace(/"/g, ''));
                        const participant = {};
                        
                        headers.forEach((header, index) => {
                            participant[header] = values[index] || '';
                        });

                        if (participant.full_name?.includes('Contoh:')) continue;
                        if (participant.email?.includes('Contoh:')) continue;

                        if (participant.full_name && participant.email) {
                            importedParticipants.push(participant);
                        }
                    }
                    
                    if (importedParticipants.length === 0) {
                        toast.error('Tidak ada data valid yang ditemukan dalam file');
                        return;
                    }

                    const existingParticipants = JSON.parse(localStorage.getItem('impala_participants') || '[]');
                    const newParticipants = [
                        ...existingParticipants,
                        ...importedParticipants.map((participant, index) => ({
                            id: Date.now() + index,
                            ...participant,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }))
                    ];
                    localStorage.setItem('impala_participants', JSON.stringify(newParticipants));
                    
                    setImportFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    setIsImportModalOpen(false);
                    
                    await refreshData();
                    
                    toast.success(`Berhasil mengimport ${importedParticipants.length} participant`);
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    toast.error('Format file CSV tidak valid');
                }
            };
            
            reader.readAsText(importFile);
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Gagal mengimport data');
        } finally {
            setIsImporting(false);
        }
    }, [importFile, refreshData]);

    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    const genderOptions = [
        { value: 'laki-laki', label: '👨 Laki-laki' },
        { value: 'perempuan', label: '👩 Perempuan' },
    ];

    // EKSTRAK SEMUA CATEGORY UNIK DARI DATA PARTICIPANT
    const extractCategories = useMemo(() => {
        return (participants) => {
            if (!participants.length) return [];
            
            const allCategories = participants
                .map(p => p.category)
                .filter(category => category && category.trim() !== "");
            
            const uniqueCategories = [...new Set(allCategories)].sort();
            
            return uniqueCategories.map(category => {
                let emoji = "👤";
                const lowerCategory = category.toLowerCase();
                
                if (lowerCategory.includes("mahasiswa")) emoji = "🎓";
                else if (lowerCategory.includes("umkm")) emoji = "🏪";
                else if (lowerCategory.includes("startup")) emoji = "🚀";
                else if (lowerCategory.includes("corporate")) emoji = "🏢";
                else if (lowerCategory.includes("student")) emoji = "📚";
                else if (lowerCategory.includes("professional")) emoji = "💼";
                
                return {
                    value: category.toLowerCase(),
                    label: `${emoji} ${category}`,
                    original: category
                };
            });
        };
    }, []);

    // FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...participant];
        
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(participant =>
                participant.full_name?.toLowerCase().includes(term) ||
                participant.email?.toLowerCase().includes(term) ||
                participant.category?.toLowerCase().includes(term) ||
                participant.program_name?.toLowerCase().includes(term) ||
                participant.business?.toLowerCase().includes(term) ||
                participant.gender?.toLowerCase().includes(term)
            );
        }
        
        if (activeFilters.gender) {
            result = result.filter(participant => {
                const participantGender = participant.gender?.toLowerCase();
                return activeFilters.gender === 'all' || participantGender === activeFilters.gender;
            });
        }
        
        if (activeFilters.category && activeFilters.category !== 'all') {
            result = result.filter(participant => {
                const participantCategory = participant.category;
                if (!participantCategory) return false;
                
                return participantCategory.toLowerCase() === activeFilters.category.toLowerCase();
            });
        }
        
        setFilteredParticipants(result);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        const lowerTerm = term.toLowerCase();
        if (lowerTerm === 'perempuan' || lowerTerm === 'laki-laki') {
            setActiveFilters(prev => ({
                ...prev,
                gender: lowerTerm
            }));
        }
    };

    const handleGenderFilterChange = (gender) => {
        setActiveFilters(prev => ({
            ...prev,
            gender: prev.gender === gender ? null : gender
        }));
    };

    const handleCategoryFilterChange = (category) => {
        setActiveFilters(prev => ({
            ...prev,
            category: prev.category === category ? null : category
        }));
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setActiveFilters({
            gender: null,
            category: null,
        });
    };

    const clearFilter = (filterType) => {
        if (filterType === 'gender') {
            setActiveFilters(prev => ({ ...prev, gender: null }));
        } else if (filterType === 'category') {
            setActiveFilters(prev => ({ ...prev, category: null }));
        } else if (filterType === 'search') {
            setSearchTerm("");
        }
    };

    useEffect(() => {
        if (participant.length > 0) {
            const normalizedParticipants = participant.map(p => ({
                ...p,
                gender: p.gender ? p.gender.toLowerCase().trim() : p.gender
            }));
            
            const extractedCategories = extractCategories(normalizedParticipants);
            setAvailableCategories(extractedCategories);
            setFilteredParticipants(normalizedParticipants);
        }
    }, [participant, extractCategories]);

    useEffect(() => {
        if (participant.length > 0) {
            setFilteredParticipants(participant);
            applyAllFilters();
        }
    }, [participant]);

    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, activeFilters]);

    const handleEdit = () => {
        if (selectedParticipant) {
            alert(`Edit participant: ${selectedParticipant.full_name}`);
        }
    };

    const handleDelete = () => {
        if (selectedParticipant) {
            if (window.confirm(`Are you sure you want to delete ${selectedParticipant.full_name}?`)) {
                setSelectedParticipant(null);
                toast.success('Participant deleted successfully');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        if (selectedParticipant && participant.length > 0) {
            const currentSelected = participant.find(p => p.id === selectedParticipant.id);
            if (currentSelected) {
                setSelectedParticipant(currentSelected);
            } else {
                setSelectedParticipant(null);
            }
        }
    }, [participant, selectedParticipant?.id]);

    const handleRefresh = useCallback(() => {
        refreshData();
        clearAllFilters();
    }, [refreshData, clearAllFilters]);

    const handlePageChangeModified = useCallback((page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handlePageChange(page);
    }, [handlePageChange]);

    const getActiveFiltersCount = () => {
        let count = 0;
        if (activeFilters.gender) count++;
        if (activeFilters.category) count++;
        return count;
    };

    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.gender) count++;
        if (activeFilters.category) count++;
        return count;
    };

    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue);
        return category ? category.original : categoryValue;
    };

    const getGenderLabel = (genderValue) => {
        if (!genderValue) return "";
        if (genderValue.toLowerCase() === 'laki-laki') return '👨 Laki-laki';
        if (genderValue.toLowerCase() === 'perempuan') return '👩 Perempuan';
        return genderValue;
    };

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Gender', 'Program Name', 'Category', 'Entity', 'Action'],
        title: "Impala Management",
        addButton: "Add Participant",
        detailTitle: "Participant Details"
    };

    const formattedParticipants = filteredParticipants.map((participant, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;

        return {
            id: participant.id,
            no: itemNumber,
            full_name: participant.full_name,
            email: participant.email,
            category: participant.category,
            program_name: participant.program_name,
            phone: participant.phone,
            business: participant.business,
            gender: participant.gender,
            action: 'Detail',
            ...participant
        };
    });

    const handleExport = useCallback(async (exportAll = false) => {
        try {
            toast.loading(exportAll
                ? 'Fetching ALL data from database...'
                : 'Preparing export data...'
            )

            let dataToExport;
            let filenamePrefix;

            if (exportAll) {
                const response = await fetch(`/api/impala/export?exportType=all`)

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to fetch all data')
                }

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.message || 'Export Failed')
                }

                dataToExport = result.data
                filenamePrefix = 'impala_management'
            } else {
                dataToExport = filteredParticipants
                filenamePrefix = 'impala_management_filter'
            }

            if (!dataToExport || dataToExport.length === 0) {
                toast.dismiss()
                toast.error('No data to export')
                return
            }

            const exportData = dataToExport.map((p, index) => ({
                'No': index + 1,
                'Nama Lengkap': p.full_name || '',
                'Email': p.email || '',
                'Nomor Telepon': p.phone || '',
                'Jenis Kelamin': p.gender || '',
                'Kategori': p.category || '',
                'Program': p.program_name || '',
                'Tanggal Lahir': p.date_of_birth || '',
                'Usia': p.age || '',
                'Alamat': p.address || '',
                'Kota/Kabupaten': p.regency_name || '',
                'Provinsi': p.province_name || '',
                'Pendidikan': p.education || '',
                'NIK': p.nik || '',
                'Kode Pos': p.postal_code || '',
                'Status Disabilitas': p.disability_status || '',
                'Alasan Bergabung': p.reason_join_program || '',
                'Tanggal Dibuat': p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '',
                'Tanggal Diperbarui': p.updated_at ? new Date(p.updated_at).toLocaleDateString('id-ID') : '',
                
                'Nama Usaha': p.business_name || '',
                'Jenis Usaha': p.business_type || '',
                'Alamat Usaha': p.business_address || '',
                'Bentuk Usaha': p.business_form || '',
                'Tahun Berdiri': p.established_year || '',
                'Pendapatan Bulanan': p.monthly_revenue || '',
                'Jumlah Karyawan': p.employee_count || '',
                'Sertifikasi': p.certifications || '',
                
                'Institusi': p.institution || '',
                'Jurusan': p.major || '',
                'Semester': p.semester || '',
                'Tahun Masuk': p.enrollment_year || '',
                'Minat Karir': p.career_interest || '',
                'Kompetensi Inti': p.core_competency || '',
                
                'Tempat Kerja': p.workplace || '',
                'Posisi': p.position || '',
                'Lama Bekerja': p.work_duration || '',
                'Sektor Industri': p.industry_sector || '',
                'Keahlian': p.skills || '',
                
                'Nama Komunitas': p.community_name || '',
                'Bidang Fokus': p.focus_area || '',
                'Jumlah Anggota': p.member_count || '',
                'Area Operasional': p.operational_area || '',
                'Peran dalam Komunitas': p.community_role || '',
                
                'Media Sosial': p.social_media || '',
                'Marketplace': p.marketplace || '',
                'Website': p.website || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData)

            const wscols = [
                { wch: 5 },    { wch: 10 },   { wch: 25 },   { wch: 30 },
                { wch: 15 },   { wch: 15 },   { wch: 20 },   { wch: 30 },
                { wch: 15 },   { wch: 8 },    { wch: 40 },   { wch: 20 },
                { wch: 20 },   { wch: 20 },   { wch: 20 },   { wch: 20 },
                { wch: 20 },   { wch: 10 },   { wch: 25 },   { wch: 40 },
                { wch: 15 },   { wch: 15 },   { wch: 25 },   { wch: 20 },
                { wch: 40 },   { wch: 20 },   { wch: 15 },   { wch: 10 },
                { wch: 15 },   { wch: 25 },   { wch: 20 },   { wch: 15 },
                { wch: 20 },   { wch: 30 },   { wch: 25 },   { wch: 30 },
                { wch: 15 },   { wch: 20 },   { wch: 25 },   { wch: 30 },
                { wch: 25 },   { wch: 25 }    
            ];
            worksheet['!cols'] = wscols
            
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Beneficiaries')

            const timestamp = new Date().toString()
                .replace(/[:.]/g, '-')
                .replace('T', '-')
                .split('.')[0]
            
            XLSX.writeFile(workbook, `impala_management_${timestamp}.xlsx`)

            toast.success(`Successfully exported ${filteredParticipants.length} beneficiaries to excel`)
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export participants');
        }
    }, [filteredParticipants]);

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6 max-w-none'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>

                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading Participant...</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load participants</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefresh}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap'>
                                <div className="w-full sm:w-auto min-w-[250px]">
                                    <SearchBar 
                                        onSearch={handleSearch}
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                                            className={`flex items-center gap-2 transition-all duration-200 ${
                                                getActiveFiltersCount() > 0 
                                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                                    : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                                            }`}
                                        >
                                            <Filter className={`h-4 w-4 ${
                                                getActiveFiltersCount() > 0 ? "text-white" : "text-gray-500"
                                            }`} />
                                            Filter
                                            {getActiveFiltersCount() > 0 && (
                                                <span className="ml-1 bg-white text-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                                    {getActiveFiltersCount()}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 shadow-lg border border-gray-200">
                                        <DropdownMenuLabel className="text-gray-700 font-semibold">Filter Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Gender
                                            </DropdownMenuLabel>
                                            {genderOptions.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={activeFilters.gender?.toLowerCase() === option.value.toLowerCase()}
                                                    onCheckedChange={() => handleGenderFilterChange(option.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CATEGORY FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Category
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                <DropdownMenuCheckboxItem
                                                    checked={activeFilters.category === 'all'}
                                                    onCheckedChange={() => handleCategoryFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    👥 All Categories
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableCategories.map((category) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={category.value}
                                                        checked={activeFilters.category?.toLowerCase() === category.value.toLowerCase()}
                                                        onCheckedChange={() => handleCategoryFilterChange(category.value)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        {category.label}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CLEAR FILTERS */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setActiveFilters({
                                                    gender: null,
                                                    category: null,
                                                });
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-medium"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                {/* Import Button dengan Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Import
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        <DropdownMenuItem 
                                            onClick={handleDownloadTemplate}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Template
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={handleOpenImportModal}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Upload File
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <Button 
                                    onClick={handleExport}
                                    variant="outline"
                                    className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 whitespace-nowrap"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Export
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {searchTerm && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>🔍 "{searchTerm}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {activeFilters.gender && (
                                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {getGenderLabel(activeFilters.gender)}
                                        <button 
                                            onClick={() => clearFilter('gender')}
                                            className="text-pink-600 hover:text-pink-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {activeFilters.category && activeFilters.category !== 'all' && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {getCategoryLabel(activeFilters.category)}
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {activeFilters.category === 'all' && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        All Categories
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                <Button 
                                    variant="ghost" 
                                    onClick={clearAllFilters}
                                    className="text-sm h-8"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {loading && participant.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading participants...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : filteredParticipants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No participants found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {getTotalActiveCriteria() > 0 
                                            ? "No participants match your current filters. Try adjusting your criteria."
                                            : "Get started by adding your first participant."
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {getTotalActiveCriteria() > 0 && (
                                        <Button 
                                            className="flex items-center gap-2"
                                            onClick={clearAllFilters}
                                            variant="outline"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button 
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New Participant
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    {loading && (
                                        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-gray-600">Updating data...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <MemberTable
                                        members={formattedParticipants}
                                        onSelectMember={handleSelectParticipant}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <Pagination 
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        itemsPerPage={pagination.limit}
                                        onPageChange={handlePageChangeModified}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}
                        
                    </CardContent>
                </Card>

                <div 
                    ref={participantDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <ImpalaContent
                        selectedMember={selectedParticipant}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        detailTitle={tableConfig.detailTitle}
                    />
                </div>

                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                Import Participants from CSV
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Upload a CSV file to import multiple participants at once.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
                                <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                                    <li>Download the template first for correct format</li>
                                    <li>Fill in the data according to the columns</li>
                                    <li>Maximum file size: 5MB</li>
                                    <li>Only CSV files are supported</li>
                                </ul>
                            </div>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-blue-400 transition-colors max-w-full overflow-hidden">
                                {importFile ? (
                                    <div className="space-y-3">
                                        <FileText className="h-12 w-12 text-green-500 mx-auto" />
                                        <p className="font-medium text-gray-700 text-lg truncate max-w-full px-2">{importFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(importFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setImportFile(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-700 mt-2"
                                        >
                                            Remove File
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-base text-gray-600 mb-3 px-2">
                                            <strong>Drag & drop your CSV file here, or click to browse</strong>
                                        </p>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-2 px-6 py-2"
                                        >
                                            Select File
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleImportCSV}
                                disabled={!importFile || isImporting}
                                className="flex items-center gap-2 px-6 py-2 w-full sm:w-auto justify-center"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Import File
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default ImpalaManagement;