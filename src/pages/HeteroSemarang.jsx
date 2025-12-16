import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from "../components/SearchFilter/SearchBar";
import MemberTable from "../components/MemberTable/MemberTable";
import Pagination from "../components/Pagination/Pagination";
import { Loader2, Plus, Users, UserCheck, AlertCircle, Tag, X, Building2, Filter, User, Download, Upload, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "../components/ui/button"
import AddMember from "../components/AddButton/AddMemberSemarang";
import HeteroContent from "../components/Content/HeteroSemarangContent";
import { useHeteroSemarang } from "../hooks/useHeteroSemarang";
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
import * as XLSX from 'xlsx';

const HeteroSemarang = () => {
    const [selectedMember, setSelectedMember] = useState(null)
    const [editingMember, setEditingMember] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    
    // State untuk modal import (diperbarui)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    
    // Ref untuk upload input
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    
    // State untuk visual feedback auto-scroll
    const [highlightDetail, setHighlightDetail] = useState(false);
    
    // Ref untuk auto-scroll ke detail section
    const memberDetailRef = useRef(null);
    
    // STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        gender: null, // 'male', 'female', atau null
        space: null, // space atau null
    });
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [availableSpaces, setAvailableSpaces] = useState([]);

    const { members, loading, error, pagination, filters, setFilters, fetchMembers, addMemberHeteroSemarang, updateMemberHeteroSemarang, deleteMemberHeteroSemarang } = useHeteroSemarang()

    // Fungsi untuk handle select member dengan auto-scroll
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

    // ===================== IMPORT FUNCTIONS =====================

    // Handle drag events
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

    // Handle file drop
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

    // Process uploaded file
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
        
        // Read and parse file untuk validasi
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

    // Fungsi untuk handle file upload via input
    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        processFile(file);
    }, [processFile]);

    // Fungsi untuk trigger file input click
    const handleTriggerFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    // Fungsi untuk reset file dan kembali ke state awal
    const handleRemoveFile = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Fungsi untuk ganti file
    const handleChangeFile = useCallback(() => {
        handleTriggerFileInput();
    }, [handleTriggerFileInput]);

    // Fungsi untuk download template Excel
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
            
            // Buat worksheet dengan data template
            const wsData = [
                headers.map(header => header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                ...templateData.map(row => 
                    headers.map(header => row[header] || '')
                )
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Set column width
            if (!ws['!cols']) ws['!cols'] = [];
            headers.forEach((_, i) => {
                ws['!cols'][i] = { wch: 25 };
            });
            
            // Buat workbook dan download
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");
            
            // Generate Excel file
            XLSX.writeFile(wb, `hetero_semarang_import_template_${new Date().getTime()}.xlsx`);
            
            toast.success('Template Excel berhasil didownload');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal mendownload template');
        }
    }, []);

    // Validasi file Excel
    const validateExcelFile = (file) => {
        const errors = [];
        
        // Validasi ekstensi file
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            errors.push('File harus berformat Excel (.xlsx atau .xls)');
        }
        
        // Validasi ukuran file (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            errors.push('File terlalu besar. Maksimal 10MB');
        }
        
        // Validasi tipe MIME
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

    // Validasi row data
    const validateRowData = (row, rowIndex) => {
        const errors = [];
        
        // Validasi kolom wajib
        if (!row.full_name || row.full_name.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "full_name" wajib diisi`);
        }
        
        if (!row.email || row.email.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "email" wajib diisi`);
        }
        
        // Validasi format email
        if (row.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email.toString())) {
                errors.push(`Baris ${rowIndex}: Format email tidak valid`);
            }
        }
        
        return errors;
    };

    // Parse Excel file
    const parseExcel = (data) => {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            
            if (jsonData.length === 0) {
                throw new Error('File Excel tidak berisi data');
            }
            
            // Get headers from first row
            const headers = Object.keys(jsonData[0]).map(h => h.trim());
            
            // Parse dan validasi data
            const dataRows = [];
            const errors = [];
            
            jsonData.forEach((row, index) => {
                try {
                    // Bersihkan data
                    const cleanRow = {};
                    headers.forEach(header => {
                        const value = row[header];
                        cleanRow[header] = value !== undefined && value !== null ? 
                            (typeof value === 'string' ? value.trim() : value.toString().trim()) : '';
                    });
                    
                    // Skip contoh data dari template
                    if (Object.values(cleanRow).some(value => 
                        value.toString().includes('Contoh:') || 
                        value.toString().includes('CONTOH:') ||
                        value.toString().includes('contoh:')
                    )) {
                        return;
                    }
                    
                    // Skip baris kosong
                    if (Object.values(cleanRow).every(value => value === '')) {
                        return;
                    }
                    
                    // Validasi row data
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

    // Fungsi untuk import Excel
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
                    const { data: parsedData, errors } = parseExcel(data);
                    
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data yang bisa diimport');
                        setIsImporting(false);
                        return;
                    }
                    
                    // Simpan ke localStorage
                    const existingMembers = JSON.parse(localStorage.getItem('hetero_semarang_members') || '[]');
                    const newMembers = [
                        ...existingMembers,
                        ...parsedData.map((member, index) => ({
                            id: Date.now() + index,
                            ...member,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }))
                    ];
                    localStorage.setItem('hetero_semarang_members', JSON.stringify(newMembers));
                    
                    // Reset form
                    setImportFile(null);
                    setValidationErrors([]);
                    setIsDragging(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    // Close modal
                    setIsImportModalOpen(false);
                    
                    // Refresh data
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

    // Fungsi untuk open import modal
    const handleOpenImportModal = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsImportModalOpen(true);
    }, []);

    // Reset import state
    const resetImportState = useCallback(() => {
        setImportFile(null);
        setValidationErrors([]);
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // ===================== EXPORT FUNCTIONS =====================

    // Fungsi untuk export data ke Excel/CSV
    const handleExport = useCallback(async (format = 'excel') => {
        try {
            if (!filteredMembers || filteredMembers.length === 0) {
                toast.error('No data to export');
                return;
            }
            
            setIsExporting(true);
            
            // Format data untuk export
            const exportData = filteredMembers.map((member, index) => ({
                'No': index + 1,
                'Full Name': member.full_name || '-',
                'Email': member.email || '-',
                'Gender': member.gender || '-',
                'Phone': member.phone || '-',
                'Space': member.space || '-',
                'Company': member.company || '-',
                'Duration': member.duration || '-',
                'Status': member.status || '-',
                'Address': member.address || '-',
                'Notes': member.notes || '-',
                'Created Date': member.created_at 
                    ? new Date(member.created_at).toLocaleDateString() 
                    : '-',
                'Last Updated': member.updated_at 
                    ? new Date(member.updated_at).toLocaleDateString() 
                    : '-'
            }));

            if (format === 'excel') {
                // Buat worksheet
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                // Set column width
                const wscols = [
                    { wch: 5 },   // No
                    { wch: 25 },  // Full Name
                    { wch: 30 },  // Email
                    { wch: 10 },  // Gender
                    { wch: 15 },  // Phone
                    { wch: 25 },  // Space
                    { wch: 30 },  // Company
                    { wch: 15 },  // Duration
                    { wch: 10 },  // Status
                    { wch: 40 },  // Address
                    { wch: 40 },  // Notes
                    { wch: 12 },  // Created Date
                    { wch: 12 }   // Last Updated
                ];
                ws['!cols'] = wscols;
                
                // Tambahkan styling untuk header
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
                
                // Buat workbook
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Hetero Semarang Members");
                
                // Generate nama file
                const dateStr = new Date().toISOString().split('T')[0];
                const fileName = `hetero_semarang_members_export_${dateStr}.xlsx`;
                
                // Export file
                XLSX.writeFile(wb, fileName);
                
                toast.success(`Exported ${exportData.length} members to Excel`);
            } else if (format === 'csv') {
                // Untuk format CSV
                const csvContent = [
                    Object.keys(exportData[0]).join(','),
                    ...exportData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                
                link.setAttribute("href", url);
                link.setAttribute("download", `hetero_semarang_members_export_${new Date().getTime()}.csv`);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success(`Exported ${exportData.length} members to CSV`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(`Failed to export: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    }, [filteredMembers]);

    // Prevent default drag behavior untuk seluruh window
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

    // DAFTAR SPACE FIXED SESUAI PERMINTAAN
    const allSpaceOptions = [
        { value: "maneka personal", label: "🏠 Maneka Personal", original: "Maneka Personal" },
        { value: "maneka group", label: "👥 Maneka Group", original: "Maneka Group" },
        { value: "rembug 1", label: "🗣️ Rembug 1", original: "Rembug 1" },
        { value: "rembug 2", label: "🗣️ Rembug 2", original: "Rembug 2" },
        { value: "rembug 3", label: "🗣️ Rembug 3", original: "Rembug 3" },
        { value: "private office 1-3", label: "🚪 Private Office 1-3", original: "Private Office 1-3" },
        { value: "private office 4&5", label: "🚪 Private Office 4&5", original: "Private Office 4&5" },
        { value: "private office 6", label: "🚪 Private Office 6", original: "Private Office 6" },
        { value: "space gatra", label: "🏛️ Space Gatra", original: "Space Gatra" },
        { value: "space maneka", label: "🏛️ Space Maneka", original: "Space Maneka" },
        { value: "space outdoor", label: "🌳 Space Outdoor", original: "Space Outdoor" },
        { value: "virtual office", label: "💻 Virtual Office", original: "Virtual Office" },
        { value: "course", label: "📚 Course", original: "Course" }
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
                else if (lowerSpace.includes("virtual")) emoji = "💻";
                else if (lowerSpace.includes("course")) emoji = "📚";
                else if (lowerSpace.includes("gatra")) emoji = "🏛️";
                else if (lowerSpace.includes("outdoor")) emoji = "🌳";
                
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
        setSelectedMember(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            const updatedMember = await updateMemberHeteroSemarang(memberId, memberData)

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
            await addMemberHeteroSemarang(memberData)
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

        if (!window.confirm(`Are you sure want to delete ${selectedMember.full_name}?. This Action cannot be undone.`)) {
            return
        }

        try {
            await deleteMemberHeteroSemarang(memberId)
            setSelectedMember(null)
            toast.success('Member deleted successfully')
            fetchMembers(pagination.page);
            
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
        title: 'Hetero Semarang Management',
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
                                
                                {/* Import Button dengan Dropdown (diperbarui) */}
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
                                
                                {/* Export Button dengan Dropdown (diperbarui) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
                                            disabled={loading || filteredMembers.length === 0 || isExporting}
                                        >
                                            {isExporting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        <DropdownMenuItem 
                                            onClick={() => handleExport('excel')}
                                            disabled={filteredMembers.length === 0 || isExporting}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Export as Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleExport('csv')}
                                            disabled={filteredMembers.length === 0 || isExporting}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Export as CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                                    
                                    <MemberTable
                                        members={formattedMembers}
                                        onSelectMember={handleSelectMember}
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

                {/* Wrap HeteroContent dengan div yang memiliki ref untuk auto-scroll */}
                <div 
                    ref={memberDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'ring-2 ring-blue-500 rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
                    <HeteroContent
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

                <AddMember 
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

                {/* Modal Import Excel dengan Drag & Drop (diperbarui) */}
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
                            {/* Petunjuk */}
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
                            
                            {/* Upload Area dengan Drag & Drop */}
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

                            {/* Error Messages */}
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

export default HeteroSemarang;