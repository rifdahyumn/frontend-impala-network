import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, AlertCircle, Tag, Filter, X } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ImpalaContent from '../components/Content/ImpalaContent';
import { useImpala } from "../hooks/useImpala";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "../components/ui/dropdown-menu";

const ImpalaManagement = () => {
    const [selectedParticipant, setSelectedParticipant] = useState(null)
    
    // STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        gender: null, // 'male', 'female', atau null
        category: null, // category atau null
    });
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);

<<<<<<< HEAD
    const { participant, loading, error, pagination, handlePageChange } = useImpala();
=======
    // 🔴 TAMBAHKAN: Fungsi untuk handle select participant dengan auto-scroll
    const handleSelectParticipant = useCallback((participant) => {
        // Set selected participant
        setSelectedParticipant(participant);
        
        // Trigger highlight effect
        setHighlightDetail(true);
        
        // Auto-scroll ke participant detail section
        setTimeout(() => {
            if (participantDetailRef.current) {
                participantDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Tambahkan smooth transition effect
                participantDetailRef.current.style.transition = 'all 0.5s ease';
                
                // Remove highlight after 2 seconds
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150); // Delay sedikit untuk memastikan DOM sudah update
    }, []);

    // 🔴 DIUBAH: Get state dari hook
    const { showAllOnSearch } = useImpala();
    const isInShowAllMode = isShowAllMode();

    // 🔴 TAMBAH: Fungsi untuk download template CSV
    const handleDownloadTemplate = useCallback(() => {
        try {
            // Template data untuk import participant Impala
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
            
            // Convert to CSV
            const headers = Object.keys(templateData[0]);
            const csvContent = [
                headers.join(','),
                ...templateData.map(row => 
                    headers.map(header => 
                        `"${row[header] || ''}"`
                    ).join(',')
                )
            ].join('\n');
            
            // Create blob and download
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

    // 🔴 TAMBAH: Fungsi untuk handle file upload
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validasi file type
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            toast.error('Hanya file CSV yang diperbolehkan');
            return;
        }
        
        // Validasi file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File terlalu besar. Maksimal 5MB');
            return;
        }
        
        setImportFile(file);
    }, []);

    // 🔴 TAMBAH: Fungsi untuk import CSV
    const handleImportCSV = useCallback(async () => {
        if (!importFile) {
            toast.error('Pilih file CSV terlebih dahulu');
            return;
        }
        
        setIsImporting(true);
        
        try {
            // Read CSV file
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const csvText = e.target.result;
                    const rows = csvText.split('\n');
                    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    // Parse CSV data
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
                    
                    // Reset form
                    setImportFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    // Close modal
                    setIsImportModalOpen(false);
                    
                    // Refresh data
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
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48

    const genderOptions = [
<<<<<<< HEAD
        { value: 'laki-laki', label: '👨 Laki-laki' },
        { value: 'perempuan', label: '👩 Perempuan' },
    ];

    // EKSTRAK SEMUA CATEGORY UNIK DARI DATA PARTICIPANT
    const extractCategories = useMemo(() => {
        return (participants) => {
            if (!participants.length) return [];
            
            // Ambil semua category dari data participant
            const allCategories = participants
=======
        { value: 'Laki-laki', label: 'Laki-laki' },
        { value: 'Perempuan', label: 'Perempuan' },
    ];

    const applyFilters = useCallback(async () => {
        await updateFiltersAndFetch(localFilters, showAllOnSearch);
    }, [localFilters, showAllOnSearch, updateFiltersAndFetch]);

    const applySearch = useCallback(async () => {
        await searchParticipants(localFilters.search, showAllOnSearch);
    }, [localFilters.search, showAllOnSearch, searchParticipants]);

    const handleSearch = useCallback((term) => {
        setLocalFilters(prev => ({ ...prev, search: term }));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localFilters.search !== '') {
                applySearch();
            }
        }, 500); // Debounce 500ms
        
        return () => clearTimeout(timer);
    }, [localFilters.search, applySearch]);

    // 🔴 DIUBAH: Apply filters ketika filter berubah
    useEffect(() => {
        if (localFilters.gender !== '' || localFilters.category !== '') {
            const timer = setTimeout(() => {
                applyFilters();
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [localFilters.gender, localFilters.category, applyFilters]);

    // 🔴 DIUBAH: Handle gender filter change yang lebih sederhana
    const handleGenderFilterChange = useCallback((gender) => {
        setLocalFilters(prev => ({
            ...prev,
            gender: prev.gender === gender ? '' : gender
        }));
    }, []);

    // 🔴 DIUBAH: Handle category filter change yang lebih sederhana
    const handleCategoryFilterChange = useCallback((category) => {
        setLocalFilters(prev => ({
            ...prev,
            category: prev.category === category ? '' : category
        }));
    }, []);

    // 🔴 DIUBAH: Clear all filters yang lebih sederhana
    const clearAllFilters = useCallback(async () => {
        // Reset state lokal
        setLocalFilters({
            search: '',
            gender: '',
            category: '',
        });
        
        // Reset selected participant saat clear filter
        setSelectedParticipant(null);
        
        // Panggil hook untuk clear semua
        await hookClearFilters();
        
        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [hookClearFilters]);

    // 🔴 DIUBAH: Clear specific filter
    const clearFilter = useCallback((filterType) => {
        if (filterType === 'search') {
            setLocalFilters(prev => ({ ...prev, search: '' }));
            hookClearSearch();
            return;
        }
        
        setLocalFilters(prev => ({ ...prev, [filterType]: '' }));
    }, [hookClearSearch]);

    // 🔴 MODIFIKASI: Toggle show all on search
    const handleToggleShowAll = useCallback(async (checked) => {
        await toggleShowAllOnSearch(checked);
        
        // Re-apply filters dengan mode baru
        if (localFilters.search || localFilters.gender || localFilters.category) {
            await applyFilters();
        }
    }, [toggleShowAllOnSearch, localFilters, applyFilters]);

    // 🔴 MODIFIKASI: Reset to pagination mode
    const handleResetToPagination = useCallback(async () => {
        await resetToPaginationMode();
    }, [resetToPaginationMode]);

    // 🔴 TAMBAHKAN: Handle export seperti di Program.jsx
    const handleExport = useCallback(async () => {
        try {
            // Gunakan filter yang sedang aktif
            const currentFilters = {
                search: localFilters.search,
                gender: localFilters.gender,
                category: localFilters.category
            };
            
            await exportParticipants('csv', currentFilters);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export participants');
        }
    }, [localFilters, exportParticipants]);

    useEffect(() => {
        if (participant.length > 0) {
            const allCategories = participant
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48
                .map(p => p.category)
                .filter(category => category && category.trim() !== "");
            
            // Hilangkan duplikat dan urutkan
            const uniqueCategories = [...new Set(allCategories)].sort();
            
            // Format untuk filter options dengan emoji yang sesuai
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
        
        // 1. Apply Search
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
        
        // 2. Apply Gender Filter
        if (activeFilters.gender) {
            result = result.filter(participant => {
                const participantGender = participant.gender?.toLowerCase();
                return activeFilters.gender === 'all' || participantGender === activeFilters.gender;
            });
        }
        
        // 3. Apply Category Filter
        if (activeFilters.category && activeFilters.category !== 'all') {
            result = result.filter(participant => {
                const participantCategory = participant.category;
                if (!participantCategory) return false;
                
                return participantCategory.toLowerCase() === activeFilters.category.toLowerCase();
            });
        }
        
        setFilteredParticipants(result);
    };

    // HANDLE SEARCH
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

    // HANDLE GENDER FILTER CHANGE
    const handleGenderFilterChange = (gender) => {
        setActiveFilters(prev => ({
            ...prev,
            gender: prev.gender === gender ? null : gender
        }));
    };

    // HANDLE CATEGORY FILTER CHANGE
    const handleCategoryFilterChange = (category) => {
        setActiveFilters(prev => ({
            ...prev,
            category: prev.category === category ? null : category
        }));
    };

    // CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setActiveFilters({
            gender: null,
            category: null,
        });
    };

    // CLEAR SPECIFIC FILTER
    const clearFilter = (filterType) => {
        if (filterType === 'gender') {
            setActiveFilters(prev => ({ ...prev, gender: null }));
        } else if (filterType === 'category') {
            setActiveFilters(prev => ({ ...prev, category: null }));
        } else if (filterType === 'search') {
            setSearchTerm("");
        }
    };

    // INITIALIZE CATEGORIES
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

    // APPLY FILTERS SETIAP PARTICIPANT BERUBAH
    useEffect(() => {
        if (participant.length > 0) {
            setFilteredParticipants(participant);
            applyAllFilters();
        }
    }, [participant]);

    // APPLY FILTERS SETIAP SEARCH ATAU FILTER BERUBAH
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
<<<<<<< HEAD
                console.log('Delete participant:', selectedParticipant);
                setSelectedParticipant(null); 
=======
                setSelectedParticipant(null);
                toast.success('Participant deleted successfully');

                window.scrollTo({ top: 0, behavior: 'smooth' });
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48
            }
        }
    };

    useEffect(() => {
        if (selectedParticipant && participant.length > 0) {
            const currentSelected = participant.find(p => p.id === selectedParticipant.id)
            if (currentSelected) {
                setSelectedParticipant(currentSelected)
<<<<<<< HEAD
=======
            } else {
                setSelectedParticipant(null);
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48
            }
        }
    }, [participant, selectedParticipant?.id])

<<<<<<< HEAD
    // GET ACTIVE FILTERS COUNT - HANYA GENDER DAN CATEGORY
    const getActiveFiltersCount = () => {
=======
    const handleRefresh = useCallback(() => {
        refreshData();
        clearAllFilters();
    }, [refreshData, clearAllFilters]);

    const handlePageChangeModified = useCallback((page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handlePageChange(page);
    }, [handlePageChange]);

    // GET ACTIVE FILTERS COUNT
    const getActiveFiltersCount = useCallback(() => {
>>>>>>> ac48c155c7b3994cbe7cadf0f0017f41bb579e48
        let count = 0;
        // TIDAK MENGHITUNG SEARCH TERM
        if (activeFilters.gender) count++;
        if (activeFilters.category) count++;
        return count;
    };

    // GET TOTAL ACTIVE CRITERIA (SEARCH + FILTERS) UNTUK DISPLAY
    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.gender) count++;
        if (activeFilters.category) count++;
        return count;
    };

    // GET CATEGORY LABEL
    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue || categoryValue === "all") return "All Categories";
        const category = availableCategories.find(c => c.value === categoryValue);
        return category ? category.original : categoryValue;
    };

    // GET GENDER LABEL
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

    // FORMAT PARTICIPANT DARI filteredParticipants
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

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                <Card className='mb-6'>
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
                        {/*ERROR MESSAGE */}
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
                                        onClick={() => window.location.reload()}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        Reload Page
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* SEARCH & FILTER SECTION */}
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search..."
                                />
                                
                                {/* FILTER DROPDOWN DENGAN WARNA AMBER */}
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
                                        
                                        {/* GENDER FILTER */}
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
                                                {/* ALL CATEGORIES OPTION */}
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
                                        
                                        {/* CLEAR FILTERS - HANYA CLEAR GENDER & CATEGORY */}
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

                            <div className='flex gap-2'>
                                <Button className='flex items-center gap-2'>
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton data={formattedParticipants} />
                            </div>
                        </div>
                        
                        {/* ACTIVE FILTERS BADGES - TAMPILKAN JIKA ADA SEARCH ATAU FILTER */}
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {/* SEARCH BADGE */}
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
                                
                                {/* GENDER FILTER BADGE */}
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
                                
                                {/* CATEGORY FILTER BADGE */}
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
                                
                                {/* ALL CATEGORIES BADGE */}
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
                                
                                {/* CLEAR ALL - CLEARS BOTH SEARCH AND FILTERS */}
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
                                        onSelectMember={setSelectedParticipant}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredParticipants.length} of {participant.length} participants
                                        {getTotalActiveCriteria() > 0 && " (filtered)"}
                                    </div>
                                    
                                    <Pagination 
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        itemsPerPage={pagination.limit}
                                        onPageChange={handlePageChange}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}
                        
                    </CardContent>
                </Card>

                <ImpalaContent
                    selectedMember={selectedParticipant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailTitle={tableConfig.detailTitle}
                />
            </div>
        </div>
    )
}

export default ImpalaManagement;