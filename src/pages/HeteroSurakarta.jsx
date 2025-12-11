import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from "../components/SearchFilter/SearchBar";
import ExportButton from "../components/ActionButton/ExportButton";
import MemberTable from "../components/MemberTable/MemberTable";
import Pagination from "../components/Pagination/Pagination";
import { Loader2, Plus, Users, UserCheck, AlertCircle, Tag, X, Building2, Filter, User, Download, Upload, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "../components/ui/button"
import AddMemberSurakarta from "../components/AddButton/AddMemberSurakarta";
import HeteroSoloContent from "../components/Content/HeteroSurakartaContent";
import { useHeteroSolo } from "../hooks/useHeteroSolo";
import toast from "react-hot-toast";
import MemberStatsCards from "../MemberHetero/MemberStatsCard";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";

const HeteroSurakarta = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [editingMember, setEditingMember] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    
    // 🔴 TAMBAH: State untuk modal import
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    
    // 🔴 TAMBAH: Ref untuk upload input
    const fileInputRef = useRef(null);
    
    // 🔴 TAMBAHKAN: State untuk visual feedback auto-scroll
    const [highlightDetail, setHighlightDetail] = useState(false);
    
    // 🔴 TAMBAHKAN: Ref untuk auto-scroll ke detail section
    const memberDetailRef = useRef(null);
    
    // STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        gender: null, // 'male', 'female', atau null
        space: null, // space atau null
    });
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [availableSpaces, setAvailableSpaces] = useState([]);

    const { members, loading, error, pagination, filters, setFilters, fetchMembers, addMemberHeteroSolo, updateMemberHeteroSolo, deleteMemberHeteroSolo } = useHeteroSolo()

    // 🔴 TAMBAHKAN: Fungsi untuk handle select member dengan auto-scroll
    const handleSelectMember = useCallback((member) => {
        // Set selected member
        setSelectedMember(member);
        
        // Trigger highlight effect
        setHighlightDetail(true);
        
        // Auto-scroll ke member detail section
        setTimeout(() => {
            if (memberDetailRef.current) {
                memberDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Tambahkan smooth transition effect
                memberDetailRef.current.style.transition = 'all 0.5s ease';
                
                // Remove highlight after 2 seconds
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150); // Delay sedikit untuk memastikan DOM sudah update
    }, []);

    // 🔴 TAMBAH: Fungsi untuk download template CSV
    const handleDownloadTemplate = useCallback(() => {
        try {
            // Template data untuk import member Hetero Surakarta
            const templateData = [
                {
                    'full_name': 'Contoh: John Doe',
                    'email': 'Contoh: john@example.com',
                    'gender': 'Contoh: male',
                    'phone': 'Contoh: 081234567890',
                    'space': 'Contoh: Maneka Personal',
                    'company': 'Contoh: PT. Contoh Indonesia',
                    'duration': 'Contoh: 12 months',
                    'status': 'Contoh: active',
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
            link.setAttribute('download', `hetero_surakarta_import_template_${new Date().getTime()}.csv`);
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
                    const importedMembers = [];
                    for (let i = 1; i < rows.length; i++) {
                        if (!rows[i].trim()) continue;
                        
                        const values = rows[i].split(',').map(v => v.trim().replace(/"/g, ''));
                        const member = {};
                        
                        headers.forEach((header, index) => {
                            member[header] = values[index] || '';
                        });
                        
                        // Skip contoh data
                        if (member.full_name?.includes('Contoh:')) continue;
                        if (member.email?.includes('Contoh:')) continue;
                        
                        // Validasi data minimal
                        if (member.full_name && member.email) {
                            importedMembers.push(member);
                        }
                    }
                    
                    if (importedMembers.length === 0) {
                        toast.error('Tidak ada data valid yang ditemukan dalam file');
                        return;
                    }
                    
                    // Simulasi import data (ganti dengan API call sebenarnya)
                    console.log('Data yang akan diimport:', importedMembers);
                    
                    // Contoh: Simpan ke localStorage untuk demo
                    // Dalam implementasi real, kirim ke API
                    const existingMembers = JSON.parse(localStorage.getItem('hetero_surakarta_members') || '[]');
                    const newMembers = [
                        ...existingMembers,
                        ...importedMembers.map((member, index) => ({
                            id: Date.now() + index,
                            ...member,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }))
                    ];
                    localStorage.setItem('hetero_surakarta_members', JSON.stringify(newMembers));
                    
                    // Reset form
                    setImportFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    // Close modal
                    setIsImportModalOpen(false);
                    
                    // Refresh data
                    await fetchMembers(pagination.page);
                    
                    toast.success(`Berhasil mengimport ${importedMembers.length} member`);
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
    }, [importFile, fetchMembers, pagination.page]);

    // 🔴 TAMBAH: Fungsi untuk open import modal
    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    // DAFTAR SPACE FIXED UNTUK SURAKARTA
    const allSpaceOptions = [
        { value: "maneka personal", label: "🏠 Maneka Personal", original: "Maneka Personal" },
        { value: "maneka group", label: "👥 Maneka Group", original: "Maneka Group" },
        { value: "rembug 1", label: "🗣️ Rembug 1", original: "Rembug 1" },
        { value: "rembug 2-6", label: "🗣️ Rembug 2-6", original: "Rembug 2-6" },
        { value: "rembug 7", label: "🗣️ Rembug 7", original: "Rembug 7" },
        { value: "private office 1-3", label: "🚪 Private Office 1-3", original: "Private Office 1-3" },
        { value: "private office 4&5", label: "🚪 Private Office 4&5", original: "Private Office 4&5" },
        { value: "private office 6", label: "🚪 Private Office 6", original: "Private Office 6" },
        { value: "space gatra", label: "🏛️ Space Gatra", original: "Space Gatra" },
        { value: "space gayeng", label: "🎉 Space Gayeng", original: "Space Gayeng" },
        { value: "markspace", label: "📍 Markspace", original: "Markspace" },
        { value: "foodlab", label: "🍽️ Foodlab", original: "Foodlab" },
        { value: "abipraya membership", label: "🎫 Abipraya Membership", original: "Abipraya Membership" },
        { value: "abipraya event", label: "🎪 Abipraya Event", original: "Abipraya Event" },
        { value: "virtual office", label: "💻 Virtual Office", original: "Virtual Office" },
        { value: "outdoorspace", label: "🌳 Outdoor Space", original: "Outdoor Space" }
    ];

    // GENDER OPTIONS
    const genderOptions = [
        { value: 'male', label: '👨 Male' },
        { value: 'female', label: '👩 Female' },
    ];

    // EKSTRAK SPACE YANG ADA DI DATA + TAMBAHKAN YANG BELUM ADA
    const extractSpaces = useMemo(() => {
        return (membersList) => {
            if (!membersList.length) return allSpaceOptions;
            
            // Ambil semua space dari data member
            const existingSpaces = membersList
                .map(member => member.space)
                .filter(space => space && space.trim() !== "");
            
            // Format space dari data
            const dataSpaces = existingSpaces.map(space => {
                const lowerSpace = space.toLowerCase();
                const matchedOption = allSpaceOptions.find(opt => 
                    lowerSpace.includes(opt.value) || 
                    opt.value.includes(lowerSpace) ||
                    space.toLowerCase().includes(opt.value)
                );
                
                if (matchedOption) {
                    return {
                        value: matchedOption.value,
                        label: matchedOption.label,
                        original: matchedOption.original
                    };
                }
                
                // Jika tidak ada yang cocok, buat baru
                let emoji = "🏢";
                if (lowerSpace.includes("maneka")) emoji = "🎨";
                else if (lowerSpace.includes("rembug")) emoji = "🗣️";
                else if (lowerSpace.includes("private")) emoji = "🚪";
                else if (lowerSpace.includes("gatra")) emoji = "🏛️";
                else if (lowerSpace.includes("gayeng")) emoji = "🎉";
                else if (lowerSpace.includes("markspace")) emoji = "📍";
                else if (lowerSpace.includes("foodlab")) emoji = "🍽️";
                else if (lowerSpace.includes("abipraya")) emoji = "🎫";
                else if (lowerSpace.includes("virtual")) emoji = "💻";
                else if (lowerSpace.includes("outdoor")) emoji = "🌳";
                else if (lowerSpace.includes("course")) emoji = "📚";
                
                return {
                    value: lowerSpace,
                    label: `${emoji} ${space}`,
                    original: space
                };
            });
            
            // Hilangkan duplikat berdasarkan value
            const uniqueDataSpaces = [...new Map(dataSpaces.map(item => [item.value, item])).values()];
            
            // Gabungkan dengan allSpaceOptions, prioritaskan yang ada di data
            const combinedSpaces = [...uniqueDataSpaces];
            
            // Tambahkan yang belum ada dari allSpaceOptions
            allSpaceOptions.forEach(option => {
                if (!combinedSpaces.some(s => s.value === option.value)) {
                    combinedSpaces.push(option);
                }
            });
            
            return combinedSpaces.sort((a, b) => a.original.localeCompare(b.original));
        };
    }, []);

    // FUNGSI UNTUK GET SPACE LABEL
    const getSpaceLabel = (spaceValue) => {
        if (!spaceValue || spaceValue === "all") return "All Spaces";
        const space = allSpaceOptions.find(s => s.value === spaceValue) || 
                     availableSpaces.find(s => s.value === spaceValue);
        return space ? space.original : spaceValue;
    };

    // FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...members];
        
        // 1. Apply Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(member =>
                member.full_name?.toLowerCase().includes(term) ||
                member.email?.toLowerCase().includes(term) ||
                member.space?.toLowerCase().includes(term) ||
                member.company?.toLowerCase().includes(term) ||
                member.phone?.toLowerCase().includes(term)
            );
        }
        
        // 2. Apply Gender Filter
        if (activeFilters.gender) {
            result = result.filter(member => {
                const memberGender = member.gender?.toLowerCase();
                return activeFilters.gender === 'all' || memberGender === activeFilters.gender;
            });
        }
        
        // 3. Apply Space Filter
        if (activeFilters.space && activeFilters.space !== 'all') {
            result = result.filter(member => {
                const memberSpace = member.space?.toLowerCase();
                if (!memberSpace) return false;
                
                // Cek kesamaan langsung
                if (memberSpace === activeFilters.space) return true;
                
                // Cek apakah mengandung atau dikandung
                return memberSpace.includes(activeFilters.space) || 
                       activeFilters.space.includes(memberSpace);
            });
        }
        
        setFilteredMembers(result);
    };

    // HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilters({ ...filters, search: term });
    };

    // HANDLE GENDER FILTER CHANGE
    const handleGenderFilterChange = (gender) => {
        setActiveFilters(prev => ({
            ...prev,
            gender: prev.gender === gender ? null : gender
        }));
        setFilters({ ...filters, gender: gender || '' });
    };

    // HANDLE SPACE FILTER CHANGE
    const handleSpaceFilterChange = (space) => {
        setActiveFilters(prev => ({
            ...prev,
            space: prev.space === space ? null : space
        }));
        setFilters({ ...filters, space: space || '' });
    };

    // CLEAR ALL FILTERS
    const clearAllFilters = useCallback(() => {
        setSearchTerm("");
        setActiveFilters({
            gender: null,
            space: null,
        });
        setFilteredMembers(members);
        setFilters({ search: "", gender: "", space: "" });
        setSelectedMember(null); // Reset selected member saat clear filter
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas
    }, [members, setFilters]);

    // CLEAR SPECIFIC FILTER
    const clearFilter = (filterType) => {
        if (filterType === 'gender') {
            setActiveFilters(prev => ({ ...prev, gender: null }));
            setFilters({ ...filters, gender: '' });
        } else if (filterType === 'space') {
            setActiveFilters(prev => ({ ...prev, space: null }));
            setFilters({ ...filters, space: '' });
        } else if (filterType === 'search') {
            setSearchTerm("");
            setFilters({ ...filters, search: '' });
        }
    };

    // INITIALIZE SPACES
    useEffect(() => {
        if (members.length > 0) {
            const extractedSpaces = extractSpaces(members);
            setAvailableSpaces(extractedSpaces);
        }
    }, [members, extractSpaces]);

    // APPLY FILTERS SETIAP MEMBERS BERUBAH
    useEffect(() => {
        if (members.length > 0) {
            setFilteredMembers(members);
            applyAllFilters();
        }
    }, [members]);

    // APPLY FILTERS SETIAP SEARCH ATAU FILTER BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, activeFilters]);

    const memberStats = useMemo(() => {
        const totalMembers = filteredMembers.length;
        const activeMembers = filteredMembers.filter(member => member.status === 'active').length;
        
        const activePercentage = totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : "0";

        return [
            {
                title: "Total Members",
                value: totalMembers.toString(),
                subtitle: activeFilters.space && activeFilters.space !== "all" ? `in ${getSpaceLabel(activeFilters.space)}` : "",
                percentage: `${totalMembers > 0 ? "12.5" : "0"}%`,
                trend: totalMembers > 0 ? "up" : "neutral",
                period: "Last Month",
                icon: Users,
                color: "blue",
                description: `${totalMembers > 0 ? "12.5" : "0"}% Growth`
            },
            {
                title: "Active Members",
                value: activeMembers.toString(),
                subtitle: activeFilters.space && activeFilters.space !== "all" ? `in ${getSpaceLabel(activeFilters.space)}` : "",
                percentage: `${activePercentage}%`,
                trend: activeMembers > 0 ? "up" : "down",
                period: "Last Month",
                icon: UserCheck,
                color: "green",
                description: `${activePercentage}% of total`
            }
        ];
    }, [filteredMembers, activeFilters.space, getSpaceLabel]);

    const handleAddMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleOpenEditModal = (member) => {
        setEditingMember(member)
        setIsEditModalOpen(true)
    }

    const handleEditMember = async (memberId, memberData) => {
        try {
            const updatedMember = await updateMemberHeteroSolo(memberId, memberData)

            if (selectedMember && selectedMember.id === memberId){
                setSelectedMember(prev => ({
                    ...prev,
                    ...memberData,
                    ...updatedMember
                }))
            }

            setIsEditModalOpen(false)
            setEditingMember(null)
            toast.success('Member updated successfully')
            fetchMembers(pagination.page);
        } catch (error) {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update member')
        }
    };

    const handleAddNewMember = async (memberData) => {
        try {
            await addMemberHeteroSolo(memberData)
            setIsAddMemberModalOpen(false)
            toast.success('Member added successfully')
            fetchMembers(pagination.page);
            
            // Scroll ke atas setelah add member
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            //
        }
    }

    const handleDeleteMember = async (memberId) => {
        if (!selectedMember) return

        if (!window.confirm(`Are you sure want to delete ${selectedMember.full_name}?. This Action cannot be undone.`)) {
            return
        }

        try {
            await deleteMemberHeteroSolo(memberId)
            setSelectedMember(null)
            toast.success('Member deleted successfully')
            fetchMembers(pagination.page);
            
            // Scroll ke atas setelah delete
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            //
        }
    };

    useEffect(() => {
        if (selectedMember && members.length > 0) {
            const currentSelected = members.find(member => member.id === selectedMember.id)
            if (currentSelected) {
                setSelectedMember(currentSelected)
            } else {
                // Jika member tidak ditemukan (mungkin dihapus atau difilter)
                setSelectedMember(null);
            }
        }
    }, [members, selectedMember?.id])

    const handleRefresh = () => {
        fetchMembers(pagination.page)
        clearAllFilters();
    }

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        fetchMembers(page)
    }

    // GET ACTIVE FILTERS COUNT - HANYA GENDER DAN SPACE
    const getActiveFiltersCount = () => {
        let count = 0;
        // TIDAK MENGHITUNG SEARCH TERM
        if (activeFilters.gender) count++;
        if (activeFilters.space) count++;
        return count;
    };

    // GET TOTAL ACTIVE CRITERIA (SEARCH + FILTERS) UNTUK DISPLAY
    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.gender) count++;
        if (activeFilters.space) count++;
        return count;
    };

    // GET GENDER LABEL
    const getGenderLabel = (genderValue) => {
        if (!genderValue) return "";
        if (genderValue === 'male') return '👨 Male';
        if (genderValue === 'female') return '👩 Female';
        return genderValue;
    };

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Gender', 'Space', 'Company', 'Duration', 'Status', 'Action'],
        title: 'Hetero Surakarta Management',
        addButton: "Add Member",
        detailTitle: "Member Details"
    }

    // FORMAT MEMBER DARI filteredMembers
    const formattedMembers = filteredMembers.map((member, index) => {
        const currentPage = pagination.page
        const itemsPerPage = pagination.limit
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1

        return {
            id: member.id,
            no: itemNumber,
            fullName: member.full_name,
            email: member.email,
            gender: member.gender,
            phone: member.phone,
            space: member.space,
            company: member.company,
            duration: member.duration,
            status: member.status,
            action: 'Detail',
            ...member
        }
    })

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                
                <MemberStatsCards statsData={memberStats} />

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>

                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading Members...</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load members</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefresh}
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
                                                    checked={activeFilters.gender === option.value}
                                                    onCheckedChange={() => handleGenderFilterChange(option.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* SPACE FILTER */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Space
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                {/* ALL SPACES OPTION */}
                                                <DropdownMenuCheckboxItem
                                                    checked={activeFilters.space === 'all'}
                                                    onCheckedChange={() => handleSpaceFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    🏢 All Spaces
                                                </DropdownMenuCheckboxItem>
                                                
                                                {availableSpaces.map((space) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={space.value}
                                                        checked={activeFilters.space?.toLowerCase() === space.value.toLowerCase()}
                                                        onCheckedChange={() => handleSpaceFilterChange(space.value)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        {space.label}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CLEAR FILTERS - HANYA CLEAR GENDER & SPACE */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setActiveFilters({
                                                    gender: null,
                                                    space: null,
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
                                <Button 
                                    className='flex items-center gap-2'
                                    onClick={handleAddMember}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                
                                {/* 🔴 TAMBAH: Import Button dengan Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
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
                                
                                <ExportButton data={formattedMembers} />
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
                                
                                {/* SPACE FILTER BADGE */}
                                {activeFilters.space && activeFilters.space !== 'all' && (
                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {getSpaceLabel(activeFilters.space)}
                                        <button 
                                            onClick={() => clearFilter('space')}
                                            className="text-orange-600 hover:text-orange-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* ALL SPACES BADGE */}
                                {activeFilters.space === 'all' && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        All Spaces
                                        <button 
                                            onClick={() => clearFilter('space')}
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

                        {loading && members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading members...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No members found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {getTotalActiveCriteria() > 0 
                                            ? `No members match your current filters${activeFilters.space && activeFilters.space !== "all" ? ` in ${getSpaceLabel(activeFilters.space)}` : ""}.`
                                            : "Get started by adding your first member."
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
                                        onClick={handleAddMember}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New Member
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
                                    
                                    {/* 🔴 MODIFIKASI: Gunakan handleSelectMember untuk auto-scroll */}
                                    <MemberTable
                                        members={formattedMembers}
                                        onSelectMember={handleSelectMember} // ← Ganti dengan fungsi baru
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredMembers.length} of {members.length} members
                                        {getTotalActiveCriteria() > 0 && " (filtered)"}
                                        {activeFilters.space && activeFilters.space !== 'all' && (
                                            <span className="ml-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                                in {getSpaceLabel(activeFilters.space)}
                                            </span>
                                        )}
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

                {/* 🔴 MODIFIKASI: Wrap HeteroSoloContent dengan div yang memiliki ref untuk auto-scroll */}
                <div 
                    ref={memberDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'ring-2 ring-blue-500 rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <HeteroSoloContent
                        selectedMember={selectedMember}
                        onOpenEditModal={handleOpenEditModal}
                        onEdit={handleEditMember}
                        onDelete={handleDeleteMember}
                        detailTitle={tableConfig.detailTitle}
                        onClientUpdated={() => fetchMembers(pagination.page)}
                        onClientDeleted={() => {
                            fetchMembers(pagination.page);
                            setSelectedMember(null);
                        }}
                    />
                </div>

                <AddMemberSurakarta 
                    isAddMemberModalOpen={isAddMemberModalOpen || isEditModalOpen} 
                    setIsAddMemberModalOpen={(open) => {
                        if (!open) {
                            setIsAddMemberModalOpen(false)
                            setIsEditModalOpen(false)
                            setEditingMember(null)
                        }
                    }}
                    onAddMember={handleAddNewMember}
                    editData={editingMember}
                    onEditMember={handleEditMember}
                />

                {/* 🔴 TAMBAH: Modal Import CSV */}
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                Import Members from CSV
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Upload a CSV file to import multiple members at once.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            {/* Petunjuk */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
                                <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                                    <li>Download the template first for correct format</li>
                                    <li>Fill in the data according to the columns</li>
                                    <li>Maximum file size: 5MB</li>
                                    <li>Only CSV files are supported</li>
                                </ul>
                            </div>
                            
                            {/* Upload Area */}
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

export default HeteroSurakarta;