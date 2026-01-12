import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from "../components/SearchFilter/SearchBar";
import MemberTable from "../components/MemberTable/MemberTable";
import Pagination from "../components/Pagination/Pagination";
import { Loader2, Plus, Users, UserCheck, AlertCircle, Tag, X, Building2, Filter, User, Download, Upload, FileText, FileSpreadsheet, AlertTriangle } from "lucide-react"
import { Button } from "../components/ui/button"
import AddMemberBanyumas from "../components/AddButton/AddMemberBanyumas";
import HeteroBanyumasContent from "../components/Content/HeteroBanyumasContent";
import { useHeteroBanyumas } from "../hooks/useHeteroBanyumas";
import toast from "react-hot-toast";
import MemberStatsCards from "../MemberHetero/MemberStatsCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import * as XLSX from 'xlsx';
import ConfirmModal from "../components/Content/ConfirmModal";

const HeteroBanyumas = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [editingMember, setEditingMember] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const [highlightDetail, setHighlightDetail] = useState(false);

    const memberDetailRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        gender: null,
        space: null, 
    });
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [availableSpaces, setAvailableSpaces] = useState([]);

    const { members, loading, pagination, filters, setFilters, fetchMembers, addMemberHeteroBanyumas, 
        updateMemberHeteroBanyumas, deleteMemberHeteroBanyumas, showConfirm, handleConfirm, handleCancel,
        isOpen: isConfirmOpen, config: confirmConfig, stats, statsLoading } = useHeteroBanyumas()

    const handleSelectMember = useCallback((member) => {
        setSelectedMember(member);
        setHighlightDetail(true);
        
        setTimeout(() => {
            if (memberDetailRef.current) {
                memberDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                memberDetailRef.current.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (dropZoneRef.current && 
            !dropZoneRef.current.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            processFile(file);
        }
    }, []);

    const processFile = useCallback((file) => {
        setValidationErrors([]);
        
        const errors = validateExcelFile(file);
        if (errors.length > 0) {
            setValidationErrors(errors);
            setImportFile(null);
            toast.error('File tidak valid');
            return;
        }
        
        setImportFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const { data: parsedData, errors } = parseExcel(data);
                
                if (errors.length > 0) {
                    setValidationErrors(errors);
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data valid yang ditemukan dalam file');
                    } else {
                        toast.error(`Terdapat ${errors.length} error dalam file`);
                    }
                }
                
                if (parsedData.length > 0) {
                    toast.success(`File berhasil diupload: ${parsedData.length} data valid ditemukan`);
                }
            } catch (error) {
                setValidationErrors([error.message]);
                toast.error('Gagal membaca file Excel');
            }
        };
        
        reader.readAsArrayBuffer(file);
    }, []);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        processFile(file);
    }, [processFile]);

    const handleTriggerFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleChangeFile = useCallback(() => {
        handleTriggerFileInput();
    }, [handleTriggerFileInput]);

    const handleDownloadTemplate = useCallback(() => {
        try {
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
            
            const headers = Object.keys(templateData[0]);
            
            const wsData = [
                headers.map(header => header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                ...templateData.map(row => 
                    headers.map(header => row[header] || '')
                )
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            if (!ws['!cols']) ws['!cols'] = [];
            headers.forEach((_, i) => {
                ws['!cols'][i] = { wch: 25 };
            });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");

            XLSX.writeFile(wb, `hetero_banyumas_import_template_${new Date().getTime()}.xlsx`);
            
            toast.success('Template Excel berhasil didownload');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal mendownload template');
        }
    }, []);

    const validateExcelFile = (file) => {
        const errors = [];
        
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            errors.push('File harus berformat Excel (.xlsx atau .xls)');
        }
        
        if (file.size > 10 * 1024 * 1024) {
            errors.push('File terlalu besar. Maksimal 10MB');
        }
        
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/excel',
            'application/x-excel',
            'application/x-msexcel'
        ];
        
        if (!validTypes.includes(file.type) && file.type !== '') {
            errors.push('Tipe file tidak valid. Hanya file Excel yang diperbolehkan');
        }
        
        return errors;
    };

    const validateRowData = (row, rowIndex) => {
        const errors = [];
        
        if (!row.full_name || row.full_name.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "full_name" wajib diisi`);
        }
        
        if (!row.email || row.email.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "email" wajib diisi`);
        }
        
        if (row.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email.toString())) {
                errors.push(`Baris ${rowIndex}: Format email tidak valid`);
            }
        }
        
        return errors;
    };

    const parseExcel = (data) => {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            
            if (jsonData.length === 0) {
                throw new Error('File Excel tidak berisi data');
            }
            
            const headers = Object.keys(jsonData[0]).map(h => h.trim());
            
            const dataRows = [];
            const errors = [];
            
            jsonData.forEach((row, index) => {
                try {
                    const cleanRow = {};
                    headers.forEach(header => {
                        const value = row[header];
                        cleanRow[header] = value !== undefined && value !== null ? 
                            (typeof value === 'string' ? value.trim() : value.toString().trim()) : '';
                    });
                    
                    if (Object.values(cleanRow).some(value => 
                        value.toString().includes('Contoh:') || 
                        value.toString().includes('CONTOH:') ||
                        value.toString().includes('contoh:')
                    )) {
                        return;
                    }
                    
                    if (Object.values(cleanRow).every(value => value === '')) {
                        return;
                    }
                    
                    const rowErrors = validateRowData(cleanRow, index + 1);
                    if (rowErrors.length > 0) {
                        errors.push(...rowErrors);
                        return;
                    }
                    
                    dataRows.push(cleanRow);
                } catch (error) {
                    errors.push(`Baris ${index + 1}: ${error.message}`);
                }
            });
            
            return { data: dataRows, errors, headers };
        } catch (error) {
            throw new Error(`Gagal membaca file Excel: ${error.message}`);
        }
    };

    const handleImportExcel = useCallback(async () => {
        if (!importFile) {
            toast.error('Pilih file Excel terlebih dahulu');
            return;
        }
        
        setIsImporting(true);
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const { data: parsedData } = parseExcel(data);
                    
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data yang bisa diimport');
                        setIsImporting(false);
                        return;
                    }
                    
                    const existingMembers = JSON.parse(localStorage.getItem('hetero_banyumas_members') || '[]');
                    const newMembers = [
                        ...existingMembers,
                        ...parsedData.map((member, index) => ({
                            id: Date.now() + index,
                            ...member,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }))
                    ];
                    localStorage.setItem('hetero_banyumas_members', JSON.stringify(newMembers));
                    
                    setImportFile(null);
                    setValidationErrors([]);
                    setIsDragging(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    setIsImportModalOpen(false);
                    
                    await fetchMembers(pagination.page);
                    
                    toast.success(`Berhasil mengimport ${parsedData.length} member`);
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    toast.error('Format file Excel tidak valid');
                } finally {
                    setIsImporting(false);
                }
            };
            
            reader.readAsArrayBuffer(importFile);
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Gagal mengimport data');
            setIsImporting(false);
        }
    }, [importFile, fetchMembers, pagination.page]);

    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    const resetImportState = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleExport = useCallback(async (format = 'excel') => {
        try {
            if (!filteredMembers || filteredMembers.length === 0) {
                toast.error('No data to export');
                return;
            }
            
            setIsExporting(true);
            
            const exportData = filteredMembers.map((member, index) => ({
                'No': index + 1,
                'Full Name': member.full_name || '-',
                'NIK': member.nik || '-',
                'Email': member.email || '-',
                'Phone': member.phone || '-',
                'Gender': member.gender || '-',
                'Date of Birth': member.date_of_birth || '-',
                'Age': member.age || '-',
                'Education': member.education || '-',
                'Company': member.company || '-',
                'Status': member.status || '-',
                'Address': member.address || '-',
                'Space': member.space || '-',
                'Start Date': member.start_date || '-',
                'End Date': member.end_date || '-',
                'Duration': member.duration || '-',
                'Add On': member.add_on || '-',
                'Add Information': member.add_information || '-',
                'Created Date': member.created_at 
                    ? new Date(member.created_at).toLocaleDateString() 
                    : '-',
                'Last Updated': member.updated_at 
                    ? new Date(member.updated_at).toLocaleDateString() 
                    : '-'
            }));

            if (format === 'excel') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                const wscols = [
                    { wch: 5 },   
                    { wch: 25 }, 
                    { wch: 30 },  
                    { wch: 10 },  
                    { wch: 15 }, 
                    { wch: 25 },  
                    { wch: 30 }, 
                    { wch: 15 }, 
                    { wch: 10 }, 
                    { wch: 40 }, 
                    { wch: 40 },  
                    { wch: 12 },  
                    { wch: 12 }  
                ];
                ws['!cols'] = wscols;
                
                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = { c: C, r: 0 };
                    const cell_ref = XLSX.utils.encode_cell(cell_address);
                    if (!ws[cell_ref]) continue;
                    ws[cell_ref].s = {
                        font: { bold: true },
                        fill: { fgColor: { rgb: "E0E0E0" } }
                    };
                }
                
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Hetero Banyumas Members");
                
                const dateStr = new Date().toISOString().split('T')[0];
                const fileName = `hetero_banyumas_members_export_${dateStr}.xlsx`;
                
                XLSX.writeFile(wb, fileName);
                
                toast.success(`Exported ${exportData.length} members to Excel`);
            } 

        } catch (error) {
            console.error('Export failed:', error);
            toast.error(`Failed to export: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    }, [filteredMembers]);

    useEffect(() => {
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        
        window.addEventListener('dragover', preventDefaults, false);
        window.addEventListener('drop', preventDefaults, false);
        
        return () => {
            window.removeEventListener('dragover', preventDefaults, false);
            window.removeEventListener('drop', preventDefaults, false);
        };
    }, []);

    const allSpaceOptions = [
        { value: "maneka personal", label: "Maneka Personal", original: "Maneka Personal" },
        { value: "maneka group", label: "Maneka Group", original: "Maneka Group" },
        { value: "rembug meeting room", label: "Rembug Meeting Room", original: "Rembug Meeting Room" },
        { value: "rembug meeting room (weekend)", label: "Rembug Meeting Room (Weekend)", original: "Rembug Meeting Room (Weekend)" },
        { value: "private office 1", label: "Private Office 1", original: "Private Office 1" },
        { value: "private office 2", label: "Private Office 2", original: "Private Office 2" },
        { value: "private office 3&4", label: "Private Office 3&4", original: "Private Office 3&4" },
        { value: "private office 5", label: "Private Office 5", original: "Private Office 5" },
        { value: "private office 6", label: "Private Office 6", original: "Private Office 6" },
        { value: "virtual office", label: "Virtual Office", original: "Virtual Office" },
        { value: "gatra event space", label: "Gatra Event Space", original: "Gatra Event Space" },
        { value: "gatra wedding hall", label: "Gatra Wedding Hall", original: "Gatra Wedding Hall" },
        { value: "outdoorspace", label: "Outdoorspace", original: "Outdoorspace" },
        { value: "amphitheater", label: "Amphitheater", original: "Amphitheater" },
        { value: "basketball court personal", label: "Basketball Court Personal", original: "Basketball Court Personal" },
        { value: "basketball court membership", label: "Basketball Court Membership", original: "Basketball Court Membership" },
        { value: "futsal court personal", label: "Futsal Court Personal", original: "Futsal Court Personal" },
        { value: "futsal court membership", label: "Futsal Court Membership", original: "Futsal Court Membership" },
        { value: "tennis court personal", label: "Tennis Court Personal", original: "Tennis Court Personal" },
        { value: "tennis court membership", label: "Tennis Court Membership", original: "Tennis Court Membership" },
        { value: "co-living room 1", label: "Co-Living Room 1", original: "Co-Living Room 1" },
        { value: "co-living room 2", label: "Co-Living Room 2", original: "Co-Living Room 2" },
        { value: "co-living room 3", label: "Co-Living Room 3", original: "Co-Living Room 3" },
        { value: "co-living room 4", label: "Co-Living Room 4", original: "Co-Living Room 4" },
        { value: "makerspace", label: "Makerspace", original: "Makerspace" }
    ];

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    const extractSpaces = useMemo(() => {
        return (membersList) => {
            if (!membersList.length) return allSpaceOptions;
            
            const existingSpaces = membersList
                .map(member => member.space)
                .filter(space => space && space.trim() !== "");
            
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
                
                let emoji = "🏢";
                if (lowerSpace.includes("maneka")) emoji = "🎨";
                else if (lowerSpace.includes("rembug") || lowerSpace.includes("meeting")) emoji = "🗣️";
                else if (lowerSpace.includes("private") || lowerSpace.includes("office")) emoji = "🚪";
                else if (lowerSpace.includes("virtual")) emoji = "💻";
                else if (lowerSpace.includes("gatra") || lowerSpace.includes("event") || lowerSpace.includes("wedding")) emoji = "🏛️";
                else if (lowerSpace.includes("outdoor")) emoji = "🌳";
                else if (lowerSpace.includes("amphitheater")) emoji = "🎭";
                else if (lowerSpace.includes("basketball")) emoji = "🏀";
                else if (lowerSpace.includes("futsal")) emoji = "⚽";
                else if (lowerSpace.includes("tennis")) emoji = "🎾";
                else if (lowerSpace.includes("co-living") || lowerSpace.includes("living")) emoji = "🏠";
                else if (lowerSpace.includes("makerspace")) emoji = "🔧";
                else if (lowerSpace.includes("court")) emoji = "🏟️";
                else if (lowerSpace.includes("membership")) emoji = "🎫";
                
                return {
                    value: lowerSpace,
                    label: `${emoji} ${space}`,
                    original: space
                };
            });
            
            const uniqueDataSpaces = [...new Map(dataSpaces.map(item => [item.value, item])).values()];
            
            const combinedSpaces = [...uniqueDataSpaces];
            
            allSpaceOptions.forEach(option => {
                if (!combinedSpaces.some(s => s.value === option.value)) {
                    combinedSpaces.push(option);
                }
            });
            
            return combinedSpaces.sort((a, b) => a.original.localeCompare(b.original));
        };
    }, []);

    const getSpaceLabel = useCallback((spaceValue) => {
        if (!spaceValue || spaceValue === "all") return "All Spaces";
        const space = allSpaceOptions.find(s => s.value === spaceValue) || 
                     availableSpaces.find(s => s.value === spaceValue);
        return space ? space.original : spaceValue;
    });

    const applyAllFilters = () => {
        let result = [...members];
        
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
        
        if (activeFilters.gender) {
            result = result.filter(member => {
                const memberGender = member.gender?.toLowerCase();
                return activeFilters.gender === 'all' || memberGender === activeFilters.gender;
            });
        }
        
        if (activeFilters.space && activeFilters.space !== 'all') {
            result = result.filter(member => {
                const memberSpace = member.space?.toLowerCase();
                if (!memberSpace) return false;
                
                if (memberSpace === activeFilters.space) return true;
                
                return memberSpace.includes(activeFilters.space) || 
                       activeFilters.space.includes(memberSpace);
            });
        }
        
        setFilteredMembers(result);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilters({ ...filters, search: term });
    };

    const handleGenderFilterChange = (gender) => {
        setActiveFilters(prev => ({
            ...prev,
            gender: prev.gender === gender ? null : gender
        }));
        setFilters({ ...filters, gender: gender || '' });
    };

    const handleSpaceFilterChange = (space) => {
        setActiveFilters(prev => ({
            ...prev,
            space: prev.space === space ? null : space
        }));
        setFilters({ ...filters, space: space || '' });
    };

    const clearAllFilters = useCallback(() => {
        setSearchTerm("");
        setActiveFilters({
            gender: null,
            space: null,
        });
        setFilteredMembers(members);
        setFilters({ search: "", gender: "", space: "" });
        setSelectedMember(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [members, setFilters]);

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

    useEffect(() => {
        if (members.length > 0) {
            const extractedSpaces = extractSpaces(members);
            setAvailableSpaces(extractedSpaces);
        }
    }, [members, extractSpaces]);

    useEffect(() => {
        if (members.length > 0) {
            setFilteredMembers(members);
            applyAllFilters();
        }
    }, [members]);

    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, activeFilters]);

    const memberStats = useMemo(() => {
        if (statsLoading) {
            return [
                {
                    title: "Total Members",
                    value: "Loading...",
                    percentage: "0%",
                    trend: "neutral",
                    icon: Users,
                    color: "blue",
                    description: "Loading..."
                },
                {
                    title: "Active Members",
                    value: "Loading...",
                    percentage: "0%",
                    trend: "neutral",
                    icon: UserCheck,
                    color: "green",
                    description: "Loading..."
                }
            ]
        }

        return [
            {
                title: 'Total Members',
                value: stats.totalMembers.toString(),
                subtitle: activeFilters.space && activeFilters.space !== "all" ? `in ${getSpaceLabel(activeFilters.space)}` : "",
                percentage: `${stats.growthPercentage}%`,
                trend: parseFloat(stats.growthPercentage) > 0 ? "up" :
                        parseFloat(stats.growthPercentage) < 0 ? "down" : "neutral",
                icon: Users,
                color: "blue",
                description: `${stats.growthPercentage}% growth`
            },
            {
                title: "Active Members",
                value: stats.activeMembers.toString(),
                subtitle: activeFilters.space && activeFilters.space !== "all" ? `in ${getSpaceLabel(activeFilters.space)}` : "",
                percentage: `${stats.activePercentage}%`,
                trend: stats.activeMembers > 0 ? "up" : "down",
                icon: UserCheck,
                color: "green",
                description: `${stats.activePercentage}% of total`
            }
        ]
    }, [stats, statsLoading, activeFilters.space, getSpaceLabel])

    const handleAddMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleOpenEditModal = (member) => {
        setEditingMember(member)
        setIsEditModalOpen(true)
    }

    const handleEditMember = async (memberId, memberData) => {
        try {
            const updatedMember = await updateMemberHeteroBanyumas(memberId, memberData)

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
            await addMemberHeteroBanyumas(memberData)
            setIsAddMemberModalOpen(false)
            toast.success('Member added successfully')
            fetchMembers(pagination.page);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            //
        }
    }

    const handleDeleteMember = async (memberId) => {
        if (!selectedMember) return

        if (showConfirm && typeof showConfirm === 'function') {
            showConfirm({
                title: 'Delete Program',
                message: `Are you sure yiu want to delete "${selectedMember.full_name}"? This action cannot be undone`,
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    try {
                        await deleteMemberHeteroBanyumas(memberId)
                        setSelectedMember(null)
                        toast.success('Member deleted successfully')
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                         console.error('Error delete member:', error);
                        toast.error(error.message || 'Failed to delete member');
                    }
                },
                onCancel: () => {
                    toast('Deletion cancelled', { icon: AlertTriangle });
                }
            })
        }
    };

    useEffect(() => {
        if (selectedMember && members.length > 0) {
            const currentSelected = members.find(member => member.id === selectedMember.id)
            if (currentSelected) {
                setSelectedMember(currentSelected)
            } else {
                setSelectedMember(null);
            }
        }
    }, [members, selectedMember?.id])

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        fetchMembers(page)
    }

    const getActiveFiltersCount = () => {
        let count = 0;
        if (activeFilters.gender) count++;
        if (activeFilters.space) count++;
        return count;
    };

    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.gender) count++;
        if (activeFilters.space) count++;
        return count;
    };

    const getGenderLabel = (genderValue) => {
        if (!genderValue) return "";
        if (genderValue === 'male') return 'Male';
        if (genderValue === 'female') return 'Female';
        return genderValue;
    };

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Gender', 'Space', 'Company', 'Duration', 'Status', 'Action'],
        title: 'Hetero Banyumas Management',
        addButton: "Add Member",
        detailTitle: "Member Details"
    }

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
                        {/* {error && (
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
                        )} */}

                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search..."
                                />
                                
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
                                                    checked={activeFilters.gender === option.value}
                                                    onCheckedChange={() => handleGenderFilterChange(option.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Space
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                <DropdownMenuCheckboxItem
                                                    checked={activeFilters.space === 'all'}
                                                    onCheckedChange={() => handleSpaceFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    All Spaces
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
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                                            disabled={loading}
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
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
                                            disabled={loading || filteredMembers.length === 0 || isExporting}
                                            onClick={() => handleExport('excel')}
                                        >
                                            {isExporting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    
                                </DropdownMenu>
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

                                    <MemberTable
                                        members={formattedMembers}
                                        onSelectMember={handleSelectMember}
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
                                        onPageChange={handlePageChange}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div 
                    ref={memberDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <HeteroBanyumasContent
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

                <ConfirmModal 
                    isOpen={isConfirmOpen}
                    config={confirmConfig}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />

                <AddMemberBanyumas 
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

                <Dialog open={isImportModalOpen} onOpenChange={(open) => {
                    if (!open) {
                        resetImportState();
                    }
                    setIsImportModalOpen(open);
                }}>
                    <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                Import Members from Excel
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Upload an Excel file (.xlsx or .xls) to import multiple members at once.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
                                <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                                    <li>Download the template first for correct format</li>
                                    <li>Fill in the data according to the columns</li>
                                    <li>Maximum file size: 10MB</li>
                                    <li>Only Excel files (.xlsx, .xls) are supported</li>
                                    <li>Data must be in the first sheet</li>
                                    <li>First row must contain column headers</li>
                                </ul>
                            </div>
                            
                            <div 
                                ref={dropZoneRef}
                                className={`
                                    border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors max-w-full overflow-hidden
                                    ${isDragging 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : importFile 
                                            ? 'border-green-300 bg-green-50' 
                                            : 'border-gray-300 hover:border-blue-400'
                                    }
                                `}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {importFile ? (
                                    <div className="space-y-3">
                                        <FileText className="h-12 w-12 text-green-500 mx-auto" />
                                        <p className="font-medium text-gray-700 text-lg truncate max-w-full px-2">{importFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(importFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveFile}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove File
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleChangeFile}
                                            >
                                                Change File
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <p className="text-base text-gray-600 mb-3 px-2">
                                            <strong>
                                                {isDragging 
                                                    ? "Drop your Excel file here" 
                                                    : "Drag & drop your Excel file here, or click to browse"
                                                }
                                            </strong>
                                        </p>
                                        {isDragging && (
                                            <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                                                <p className="text-sm text-blue-700 font-medium">
                                                    Release to upload file
                                                </p>
                                            </div>
                                        )}
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="excel-upload"
                                        />
                                        <Button
                                            variant={isDragging ? "default" : "outline"}
                                            onClick={handleTriggerFileInput}
                                            className={`mt-2 px-6 py-2 ${isDragging ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                        >
                                            {isDragging ? 'Or Click to Browse' : 'Select File'}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {validationErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Terdapat {validationErrors.length} error:
                                    </h4>
                                    <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                                        {validationErrors.slice(0, 10).map((error, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="mt-1">•</span>
                                                <span>{error}</span>
                                            </li>
                                        ))}
                                        {validationErrors.length > 10 && (
                                            <li className="text-red-500 text-xs italic">
                                                ... dan {validationErrors.length - 10} error lainnya
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <DialogFooter className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleImportExcel}
                                disabled={!importFile || isImporting}
                                className="flex items-center gap-2 px-6 py-2 w-full justify-center"
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

export default HeteroBanyumas;