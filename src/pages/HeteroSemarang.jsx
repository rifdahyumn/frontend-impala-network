import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from "../components/SearchFilter/SearchBar";
import MemberTable from "../components/MemberTable/MemberTable";
import Pagination from "../components/Pagination/Pagination";
import { Loader2, Plus, Users, UserCheck, AlertCircle, X, Building2, Filter, Download, Upload, FileText, FileSpreadsheet, AlertTriangle, Check } from "lucide-react"
import { Button } from "../components/ui/button"
import AddMemberSemarang from "../components/AddButton/AddMemberSemarang";
import HeteroSemarangContent from "../components/Content/HeteroSemarangContent";
import { useHeteroSemarang } from "../hooks/useHeteroSemarang";
import toast from "react-hot-toast";
import MemberStatsCards from "../MemberHetero/MemberStatsCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import * as XLSX from 'xlsx';
import ConfirmModal from "../components/Content/ConfirmModal";

const HeteroSemarang = () => {
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
    const filterRef = useRef(null)
    const dropZoneRef = useRef(null);
    
    const [highlightDetail, setHighlightDetail] = useState(false);
    
    const memberDetailRef = useRef(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [tempFilters, setTempFilters] = useState({
        gender: '',
        space: 'all',
        status: ''
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filteredMembers, setFilteredMembers] = useState([]);

    
    const getGenderLabel = (genderValue) => {
        if (!genderValue) return "";
        if (genderValue === 'male') return 'Male';
        if (genderValue === 'female') return 'Female';
        return genderValue;
    };

    const getStatusLabel = (statusValue) => {
        if (!statusValue) return "";
        if (statusValue === 'active') return 'Active';
        if (statusValue === 'inactive') return 'Inactive';
        return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    };

    const { members, loading, error, pagination, fetchMembers, addMemberHeteroSemarang, 
        updateMemberHeteroSemarang, deleteMemberHeteroSemarang, showConfirm, handleConfirm, handleCancel,
        isOpen: isConfirmOpen, config: confirmConfig, stats, statsLoading, spaceOptions, loadingSpaceOptions,
        genderOptions, getSpaceLabel, extractSpacesFromMembers, spaceOptionsError, fetchSpaceOptions,
        filters, setFilters, handlePageChange, fetchAllMembers } = useHeteroSemarang()

    useEffect(() => {
        let result = [...members];
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(member => 
                member.full_name?.toLowerCase().includes(term) ||
                member.email?.toLowerCase().includes(term) ||
                member.phone?.toLowerCase().includes(term) ||
                member.company?.toLowerCase().includes(term) ||
                member.space?.toLowerCase().includes(term) ||
                member.status?.toLowerCase().includes(term)
            );
        }
        
        if (filters.gender) {
            result = result.filter(member => 
                member.gender?.toLowerCase() === filters.gender.toLowerCase()
            );
        }
        
        if (filters.space && filters.space !== 'all') {
            result = result.filter(member => 
                member.space?.toLowerCase() === filters.space.toLowerCase()
            );
        }

        if (filters.status) {
            result = result.filter(member => 
                member.status?.toLowerCase() === filters.status.toLowerCase()
            );
        }
        
        setFilteredMembers(result);
        
        if ((searchTerm || filters.gender || filters.space || filters.status) && pagination.page !== 1) {
            handlePageChange(1);
        }
    }, [members, searchTerm, filters, pagination.page, handlePageChange]);

    useEffect(() => {
        if (filters) {
            setTempFilters({
                gender: filters.gender || '',
                space: filters.space || 'all',
                status: filters.status || ''
            });
        }
    }, [filters]);

    const availableSpaces = useMemo(() => {
        if (spaceOptions.length > 0) {
            return spaceOptions
        }

        if (members.length > 0) {
            return extractSpacesFromMembers(members)
        }

        return []
    }, [spaceOptions, members, extractSpacesFromMembers])

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

    const handleTempStatusChange = (status) => {
        setTempFilters(prev => ({ 
            ...prev, 
            status: prev.status === status ? '' : status 
        }));
    };

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
                    'nik': 'Contoh: 3374092209940007',
                    'email': 'Contoh: john@example.com',
                    'phone': 'Contoh: 081234567890',
                    'gender': 'Contoh: Male/Female',
                    'date_of_birth': 'Contoh: 09/22/1994',
                    'education': 'Contoh: Bachelor Degree',
                    'address': 'Contoh: Jl. Contoh No. 123',
                    'province_name': 'Contoh: Jawa Tengah',
                    'regency_name': 'Contoh: Kota Semarang',
                    'district_name': 'Contoh: Semarang Barat',
                    'village_name': 'Contoh: Kembangarum',
                    'postal_code': 'Contoh: 50183',
                    'company': 'Contoh: PT. Contoh Indonesia',
                    'space': 'Contoh: Maneka Personal',
                    'start_date': 'Contoh: 06/10/2026',
                    'end_date': 'Contoh: 06/10/2026',
                    'status': 'Contoh: Active',
                    'add_on': 'Contoh: Photografi, Videografi, Snack Box',
                    'add_information': 'Contoh: Website, Sosial Media'
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
            
            XLSX.writeFile(wb, `hetero_semarang_import_template_${new Date().getTime()}.xlsx`);
            
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
        } else {
            const email = row.email.toString().trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push(`Baris ${rowIndex}: Format email tidak valid: "${email}"`);
            }
        }
        
        if (!row.phone || row.phone.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "phone" wajib diisi`);
        } else {
            const phone = row.phone.toString().replace(/\D/g, '');
            if (phone.length < 10) {
                errors.push(`Baris ${rowIndex}: Nomor telepon harus minimal 10 digit`);
            }
        }
        
        if (!row.space || row.space.toString().trim() === '') {
            errors.push(`Baris ${rowIndex}: Kolom "space" wajib diisi`);
        }
        
        if (row.nik && row.nik.toString().trim() !== '') {
            const nik = row.nik.toString().replace(/\D/g, '');
            
            if (nik.length === 0) {
                errors.push(`Baris ${rowIndex}: NIK tidak valid (hanya berisi karakter non-digit)`);
            } else if (nik.length < 10) {
                errors.push(`Baris ${rowIndex}: NIK harus minimal 10 digit angka (saat ini ${nik.length} digit)`);
            }
        }
        
        return errors;
    };

    const parseExcel = (data) => {
        try {
            const workbook = XLSX.read(data, { 
                type: 'array', 
                cellDates: true,
                cellNF: false,
                cellText: true 
            });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const rawData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '',
                raw: false, 
                dateNF: 'yyyy-mm-dd'
            });
            
            
            if (rawData.length < 2) {
                throw new Error('File Excel tidak berisi data');
            }
            
            const headers = rawData[0].map(header => 
                header.toString()
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-zA-Z0-9_]/g, '')
            );
            
            
            const dataRows = [];
            const errors = [];
            
            for (let i = 1; i < rawData.length; i++) {
                const rawRow = rawData[i];
                
                try {
                    if (!rawRow || rawRow.every(cell => 
                        cell === '' || 
                        cell === null || 
                        cell === undefined ||
                        cell.toString().trim() === ''
                    )) {
                        continue;
                    }
                    
                    const rowObj = {};
                    headers.forEach((header, index) => {
                        let value = rawRow[index];

                        if (value === undefined || value === null) {
                            value = '';
                        } else if (typeof value === 'object' && value instanceof Date) {
                            const year = value.getFullYear();
                            const month = String(value.getMonth() + 1).padStart(2, '0');
                            const day = String(value.getDate()).padStart(2, '0');
                            value = `${year}-${month}-${day}`;
                        } else {
                            value = value.toString().trim();
                        }
                        
                        rowObj[header] = value;
                    });

                    const cleanRow = {
                        full_name: rowObj.full_name || rowObj.fullname || rowObj.name || rowObj.nama || '',
                        nik: rowObj.nik || rowObj.nik_number || rowObj.nomor_induk || '',
                        email: rowObj.email || rowObj.email_address || '',
                        phone: rowObj.phone || rowObj.phone_number || rowObj.telepon || rowObj.mobile || '',
                        gender: rowObj.gender || rowObj.sex || rowObj.jenis_kelamin || '',
                        date_of_birth: rowObj.date_of_birth || rowObj.dob || rowObj.tanggal_lahir || rowObj.birth_date || '',
                        education: rowObj.education || rowObj.pendidikan || rowObj.last_education || '',
                        address: rowObj.address || rowObj.alamat || '',
                        province_name: rowObj.province_name || rowObj.province || rowObj.provinsi || '',
                        regency_name: rowObj.regency_name || rowObj.city || rowObj.kota || rowObj.kabupaten || '',
                        district_name: rowObj.district_name || rowObj.district || rowObj.kecamatan || '',
                        village_name: rowObj.village_name || rowObj.village || rowObj.kelurahan || rowObj.desa || '',
                        postal_code: rowObj.postal_code || rowObj.postalcode || rowObj.kode_pos || '',
                        company: rowObj.company || rowObj.company_name || rowObj.perusahaan || '',
                        space: rowObj.space || rowObj.space_type || rowObj.package || '',
                        start_date: rowObj.start_date || rowObj.startdate || rowObj.tanggal_mulai || '',
                        end_date: rowObj.end_date || rowObj.enddate || rowObj.tanggal_selesai || '',
                        status: rowObj.status || rowObj.member_status || 'Active',
                        add_on: rowObj.add_on || rowObj.addon || rowObj.additional_services || '',
                        add_information: rowObj.add_information || rowObj.additional_info || rowObj.information || ''
                    };
                    
                    if (Object.values(cleanRow).some(value => 
                        value.toString().toLowerCase().includes('contoh') ||
                        value.toString().toLowerCase().includes('example') ||
                        value.toString().startsWith('Contoh:') ||
                        value.toString().startsWith('Example:')
                    )) {
                        continue;
                    }
                    
                    if (Object.values(cleanRow).every(value => value === '')) {
                        continue;
                    }
                    
                    if (cleanRow.nik) {
                        let nikValue = cleanRow.nik;

                        const cellAddress = XLSX.utils.encode_cell({ r: i, c: headers.indexOf('nik') });
                        if (worksheet[cellAddress] && worksheet[cellAddress].w) {
                            nikValue = worksheet[cellAddress].w;
                        }
                        
                        if (nikValue.includes('E+') || nikValue.includes('e+')) {
                            try {
                                const numericStr = nikValue.replace(',', '.');
                                const num = parseFloat(numericStr);
                                
                                if (!isNaN(num)) {
                                    nikValue = num.toFixed(0);
                                }
                            } catch (e) {
                                console.error(`Error converting scientific notation for row ${i + 1}:`, e);
                            }
                        }
                        
                        cleanRow.nik = nikValue.toString().replace(/\D/g, '');
                    }
                    
                    if (cleanRow.phone) {
                        cleanRow.phone = cleanRow.phone.replace(/[^\d+]/g, '');
                    }
                    
                    const formatDate = (dateStr) => {
                        if (!dateStr || dateStr.toString().trim() === '') {
                            return '';
                        }
                        
                        const str = dateStr.toString().trim();
                        
                        const patterns = [
                            /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                            /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
                            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
                        ];
                        
                        for (const pattern of patterns) {
                            const match = str.match(pattern);
                            if (match) {
                                let year, month, day;
                                
                                if (pattern.source.startsWith('^\\d{4}')) {
                                    year = match[1];
                                    month = match[2].padStart(2, '0');
                                    day = match[3].padStart(2, '0');
                                } else {
                                    const part1 = parseInt(match[1]);
                                    const part2 = parseInt(match[2]);
                                    year = match[3];
                                    
                                    if (part1 > 12) {
                                        day = part1.toString().padStart(2, '0');
                                        month = part2.toString().padStart(2, '0');
                                    } else if (part2 > 12) {
                                        month = part1.toString().padStart(2, '0');
                                        day = part2.toString().padStart(2, '0');
                                    } else {
                                        month = part1.toString().padStart(2, '0');
                                        day = part2.toString().padStart(2, '0');
                                    }
                                }
                                
                                const date = new Date(`${year}-${month}-${day}`);
                                if (!isNaN(date.getTime())) {
                                    return `${year}-${month}-${day}`;
                                }
                            }
                        }
                        
                        const date = new Date(str);
                        if (!isNaN(date.getTime())) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                        }
                        
                        return str; 
                    };
                    
                    cleanRow.date_of_birth = formatDate(cleanRow.date_of_birth);
                    cleanRow.start_date = formatDate(cleanRow.start_date);
                    cleanRow.end_date = formatDate(cleanRow.end_date);
                    
                    if (cleanRow.add_on && typeof cleanRow.add_on === 'string') {
                        cleanRow.add_on = cleanRow.add_on
                            .split(/[,;\n]/)
                            .map(item => item.trim())
                            .filter(item => item.length > 0);
                    } else if (!cleanRow.add_on) {
                        cleanRow.add_on = [];
                    }
                    
                    const rowErrors = validateRowData(cleanRow, i + 1);
                    if (rowErrors.length > 0) {
                        errors.push(...rowErrors);
                        continue;
                    }
                    
                    dataRows.push(cleanRow);
                    
                } catch (error) {
                    console.error(`Error processing row ${i + 1}:`, error);
                    errors.push(`Baris ${i + 1}: ${error.message}`);
                }
            }
            
            return { data: dataRows, errors };
            
        } catch (error) {
            console.error('Excel parsing error:', error);
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
                    const { data: parsedData, errors } = parseExcel(data);
                    
                    if (errors.length > 0) {
                        setValidationErrors(errors);
                        if (parsedData.length === 0) {
                            toast.error('Tidak ada data valid yang ditemukan dalam file');
                        } else {
                            toast.error(`Terdapat ${errors.length} error dalam file`);
                        }
                        setIsImporting(false);
                        return;
                    }
                    
                    if (parsedData.length === 0) {
                        toast.error('Tidak ada data yang bisa diimport');
                        setIsImporting(false);
                        return;
                    }
                    
                    let successCount = 0;
                    let errorCount = 0;
                    const importErrors = [];
                    
                    for (const memberData of parsedData) {
                        try {
                            const importData = {
                                full_name: memberData.full_name,
                                nik: memberData.nik || null,
                                email: memberData.email,
                                phone: memberData.phone,
                                gender: memberData.gender || null,
                                date_of_birth: memberData.date_of_birth || null,
                                education: memberData.education || null,
                                address: memberData.address || null,
                                province_name: memberData.province_name || null,
                                regency_name: memberData.regency_name || null,
                                district_name: memberData.district_name || null,
                                village_name: memberData.village_name || null,
                                postal_code: memberData.postal_code || null,
                                company: memberData.company || null,
                                space: memberData.space,
                                start_date: memberData.start_date || null,
                                end_date: memberData.end_date || null,
                                status: memberData.status || 'Active',
                                add_on: Array.isArray(memberData.add_on) ? memberData.add_on : [],
                                add_information: memberData.add_information || null
                            };
                            
                            const response = await addMemberHeteroSemarang(importData);
                            
                            if (response) {
                                successCount++;
                            } else {
                                errorCount++;
                                importErrors.push(`Gagal mengimport ${memberData.full_name}`);
                            }
                            
                        } catch (memberError) {
                            errorCount++;
                            importErrors.push(`Error mengimport ${memberData.full_name || 'unknown'}: ${memberError.message}`);
                            console.error('Import member error:', memberError);
                        }
                    }
                    
                    setImportFile(null);
                    setValidationErrors(importErrors);
                    setIsDragging(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    setIsImportModalOpen(false);
                    
                    await fetchMembers(pagination.page);
                    
                    if (successCount > 0) {
                        toast.success(`Berhasil mengimport ${successCount} member`);
                    }
                    
                    if (errorCount > 0) {
                        toast.error(`Gagal mengimport ${errorCount} member`);
                    }
                    
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    toast.error('Format file Excel tidak valid');
                    setValidationErrors([parseError.message]);
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
    }, [importFile, fetchMembers, pagination.page, addMemberHeteroSemarang]);

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

    const handleExport = useCallback(async () => {
        try {
            setIsExporting(true)

            const allData = await fetchAllMembers()

            if (!allData || allData.length === 0) {
                toast.error('No data to export');
                setIsExporting(false)
                return;
            }
            
            setIsExporting(true);
            
            const exportData = allData.map((member, index) => ({
                'No': index + 1,
                'Full Name': member.full_name || '-',
                'NIK': member.nik || '-',
                'Email': member.email || '-',
                'Phone': member.phone || '-',
                'Gender': member.gender || '-',
                'Date of Birth': member.date_of_birth || '-',
                'Education': member.education || '-',
                'Address': member.address || '-',
                'Province': member.province_name || '-',
                'Regency': member.regency_name || '-',
                'District': member.district_name || '-',
                'Village': member.village_name || '-',
                'Postal Code': member.postal_code || '-',
                'Company': member.company || '-',
                'Space': member.space || '-',
                'Start Date': member.start_date || '-',
                'End Date': member.end_date || '-',
                'Status': member.status || '-',
                'Add On': Array.isArray(member.add_on) 
                ? member.add_on.join(', ') 
                : member.add_on || '-',
                'Additional Information': member.add_information || '-',
                'Created Date': member.created_at 
                ? new Date(member.created_at).toLocaleDateString('id-ID') 
                : '-',
                'Last Updated': member.updated_at 
                ? new Date(member.updated_at).toLocaleDateString('id-ID') 
                : '-'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            
            const wscols = [
                { wch: 5 },  
                { wch: 25 }, 
                { wch: 20 }, 
                { wch: 30 }, 
                { wch: 15 },
                { wch: 10 }, 
                { wch: 15 }, 
                { wch: 20 }, 
                { wch: 40 }, 
                { wch: 20 },  
                { wch: 20 }, 
                { wch: 20 },
                { wch: 20 }, 
                { wch: 10 },  
                { wch: 30 },  
                { wch: 25 }, 
                { wch: 12 },  
                { wch: 12 },  
                { wch: 10 }, 
                { wch: 30 },  
                { wch: 30 },  
                { wch: 15 }, 
                { wch: 15 },
            ];
            ws['!cols'] = wscols;
            
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: 0 };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (!ws[cell_ref]) continue;
                ws[cell_ref].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F46E5" } },
                alignment: { horizontal: "center" }
                };
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Hetero Surakarta Members");

            const filterInfo = [
                ['HETERO SURAKARTA MEMBERS EXPORT'],
                ['', ''],
                ['Export Date', new Date().toLocaleString()],
                ['Total Records Exported', members.length],
                ['', ''],
                ['APPLIED FILTERS'],
                ['Search Term', searchTerm || 'None'],
                ['Gender Filter', filters.gender ? (filters.gender === 'male' ? 'Male' : 'Female') : 'All'],
                ['Space Filter', filters.space && filters.space !== 'all' ? getSpaceLabel(filters.space) : 'All'],
                ['', ''],
                ['Total Active Members', members.filter(m => m.status === 'active').length],
                ['Total Inactive Members', members.filter(m => m.status !== 'active').length],
                ['', ''],
                ['GENERATED ON', new Date().toLocaleDateString()],
                ['SYSTEM', 'Hetero Surakarta Management System']
            ];
            
            const wsInfo = XLSX.utils.aoa_to_sheet(filterInfo);
            wsInfo['A1'].s = {
                font: { bold: true, sz: 16, color: { rgb: "1E40AF" } }
            };
            XLSX.utils.book_append_sheet(wb, wsInfo, "Export Info");
            
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const fileName = `hetero_semarang_members_export_${dateStr}.xlsx`;
            
            XLSX.writeFile(wb, fileName);
            
            toast.success(`Successfully exported ${exportData.length} members to Excel`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(`Failed to export: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    }, [fetchAllMembers, searchTerm, filters, getSpaceLabel, getGenderLabel, getStatusLabel]);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false)
            }
        }

        if (setIsFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isFilterOpen])

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);

        const apiFilters = {
            search: term.trim() || undefined,
            gender: filters.gender || undefined,
            space: filters.space || undefined,
            status: filters.status || undefined
        };

        Object.keys(apiFilters).forEach(key => {
            if (apiFilters[key] === undefined) {
                delete apiFilters[key];
            }
        });

        setFilters(apiFilters, true);
    }, [filters, setFilters]);

    const handleTempGenderChange = (gender) => {
        setTempFilters(prev => ({ 
            ...prev, 
            gender: prev.gender === gender ? '' : gender 
        }));
    };

    const handleTempSpaceChange = (space) => {
        setTempFilters(prev => ({ ...prev, space }));
    };

    const handleApplyFilters = () => {
        const newFilters = {
            gender: tempFilters.gender || undefined,
            space: tempFilters.space && tempFilters.space !== 'all' ? tempFilters.space : undefined,
            status: tempFilters.status || undefined,
            search: filters.search || undefined 
        };
        
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key] === undefined) {
                delete newFilters[key];
            }
        });
        
        setFilters(newFilters, true); 
        setIsFilterOpen(false);
    };

    const handleCancelFilters = () => {
        setTempFilters({
            gender: filters.gender || '',
            space: filters.space || 'all',
            status: filters.status || ''
        });
        setIsFilterOpen(false);
    };

    const handleClearAllTempFilters = () => {
        setTempFilters({
            gender: '',
            space: 'all',
            status: ''
        });
    };

    const handleClearAllFilters = () => {
        setSearchTerm("");
        const emptyFilters = {};
        setFilters(emptyFilters, true); 
        setTempFilters({
            gender: '',
            space: 'all',
            status: ''
        });
        setSelectedMember(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.gender) count++;
        if (filters.space && filters.space !== 'all') count++;
        if (filters.status) count++;
        return count;
    };

    const getTempActiveFiltersCount = () => {
        let count = 0;
        if (tempFilters.gender) count++;
        if (tempFilters.space && tempFilters.space !== 'all') count++;
        if (tempFilters.status) count++;
        return count;
    };

    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (filters.gender) count++;
        if (filters.space && filters.space !== 'all') count++;
        if (filters.status) count++;
        return count;
    };

    const clearFilter = (filterType) => {
        const newFilters = { ...filters };
        
        if (filterType === 'search') {
            setSearchTerm("");
            delete newFilters.search;
        } else if (filterType === 'gender') {
            delete newFilters.gender;
        } else if (filterType === 'space') {
            delete newFilters.space;
        } else if (filterType === 'status') { 
            delete newFilters.status;
        }
        
        setFilters(newFilters, false);
        
        setTempFilters({
            gender: newFilters.gender || '',
            space: newFilters.space || 'all',
            status: newFilters.status || ''
        });
    };

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    useEffect(() => {
        setTempFilters({
            gender: filters.gender || '',
            space: filters.space || 'all',
            status: filters.status || ''
        });
    }, [filters]);

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
            ];
        }

        const totalMembers = stats?.totalMembers || members .length;
        const activeMembers = stats?.activeMembers || members.filter(member => 
            member.status?.toLowerCase() === 'Active' 
        ).length;
        
        const activePercentage = totalMembers > 0 
            ? ((activeMembers / totalMembers) * 100).toFixed(1) 
            : "0";
        
        const growthPercentage = stats?.growthPercentage || "0";

        return [
            {
                title: "Total Members",
                value: totalMembers.toString(),
                subtitle: filters.space && filters.space !== "all" ? `in ${getSpaceLabel(filters.space)}` : "",
                percentage: `${growthPercentage}%`,
                trend: parseFloat(growthPercentage) > 0 ? "up" :
                        parseFloat(growthPercentage) < 0 ? "down" : "neutral",
                period: "Last Month",
                icon: Users,
                color: "blue",
                description: `${growthPercentage}% Growth`,
                loading: false
            },
            {
                title: "Active Members",
                value: activeMembers.toString(),
                subtitle: filters.space && filters.space !== "all" ? `in ${getSpaceLabel(filters.space)}` : "",
                percentage: `${activePercentage}%`,
                trend: parseFloat(activePercentage) > 70 ? "up" : "down",
                period: "Current",
                icon: UserCheck,
                color: "green",
                description: `${activePercentage}% of total`,
                loading: false
            }
        ];
    }, [members, filters.space, getSpaceLabel, stats, statsLoading]);

    const handleAddMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleOpenEditModal = (member) => {
        setEditingMember(member);
        setIsEditModalOpen(true);
    };

    const handleEditMember = async (memberId, memberData) => {
        try {
            const updatedMember = await updateMemberHeteroSemarang(memberId, memberData);

            if (selectedMember && selectedMember.id === memberId){
                setSelectedMember(prev => ({
                    ...prev,
                    ...memberData,
                    ...updatedMember
                }));
            }

            setIsEditModalOpen(false);
            setEditingMember(null);
            toast.success('Member updated successfully');
            fetchMembers(pagination.page);
        } catch (error) {
            console.error('Error updating', error);
            toast.error(error.message || 'Failed to update member');
        }
    };

    const handleAddNewMember = async (memberData) => {
        try {
            await addMemberHeteroSemarang(memberData);
            setIsAddMemberModalOpen(false);
            toast.success('Member added successfully');
            fetchMembers(pagination.page);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            // 
        }
    };

    const handleDeleteMember = async (memberId) => {
        if (!selectedMember) return;

        if (showConfirm && typeof showConfirm === 'function') {
            showConfirm({
                title: 'Delete Program',
                message: `Are you sure you want to delete "${selectedMember.full_name}"? This action cannot be undone`,
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    try {
                        await deleteMemberHeteroSemarang(memberId);
                        setSelectedMember(null);
                        toast.success('Member deleted successfully');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                        console.error('Error delete member:', error);
                        toast.error(error.message || 'Failed to delete member');
                    }
                },
                onCancel: () => {
                    toast('Deletion cancelled', { icon: AlertTriangle });
                }
            });
        }
    };

    useEffect(() => {
        if (selectedMember && members.length > 0) {
            const currentSelected = members.find(member => member.id === selectedMember.id);
            if (currentSelected) {
                setSelectedMember(currentSelected);
            } else {
                setSelectedMember(null);
            }
        }
    }, [members, selectedMember?.id]);

    const handleRefresh = () => {
        setFilters(filters, false); 
        setSelectedMember(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChangeLocal = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handlePageChange(page);
    };

    const tableConfig = {
        headers: ['No', 'Full Name', 'Email', 'Gender', 'Space', 'Company', 'Duration', 'Status', 'Action'],
        title: 'Hetero Semarang Management',
        addButton: "Add Member",
        detailTitle: "Member Details"
    };

    const formattedMembers = filteredMembers.map((member, index) => {
        const currentPage = pagination.page;
        const itemsPerPage = pagination.limit;
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;

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
        };
    });

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
                                
                                <div className="relative">
                                    <Button 
                                        variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                                        className={`flex items-center gap-2 transition-all duration-200 ${
                                            getActiveFiltersCount() > 0 
                                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                                : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                                        }`}
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
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

                                    {isFilterOpen && (
                                        <div 
                                            ref={filterRef}
                                            className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[450px]"
                                        >
                                            <div className="p-3 border-b">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-gray-900 text-xs">Filter Options</h3>
                                                    <span className="text-xs text-gray-500">
                                                        {getTempActiveFiltersCount()} filter{getTempActiveFiltersCount() !== 1 ? 's' : ''} selected
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3">

                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-gray-900 text-xs">STATUS</h4>
                                                        {tempFilters.status && (
                                                            <button 
                                                                onClick={() => setTempFilters(prev => ({ ...prev, status: '' }))}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {statusOptions.map((option) => {
                                                            const isSelected = tempFilters.status === option.value;
                                                            return (
                                                                <button
                                                                    key={option.value}
                                                                    className={`flex items-center justify-between px-2 py-1.5 rounded-md border transition-all text-xs flex-1 ${
                                                                        isSelected
                                                                            ? option.value === 'active' 
                                                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                                                : 'border-red-500 bg-red-50 text-red-700'
                                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                                                    }`}
                                                                    onClick={() => handleTempStatusChange(option.value)}
                                                                >
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`h-1.5 w-1.5 rounded-full ${
                                                                            isSelected 
                                                                                ? option.value === 'active' ? 'bg-green-500' : 'bg-red-500'
                                                                                : 'bg-gray-400'
                                                                        }`} />
                                                                        <span className="text-xs">{option.label}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {isSelected && (
                                                                            <Check className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-gray-900 text-xs">GENDER</h4>
                                                        {tempFilters.gender && (
                                                            <button 
                                                                onClick={() => handleTempGenderChange('')}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {genderOptions.map((option) => {
                                                            const isSelected = tempFilters.gender === option.value;
                                                            return (
                                                                <button
                                                                    key={option.value}
                                                                    className={`flex items-center justify-between px-2 py-1.5 rounded-md border transition-all text-xs flex-1 ${
                                                                        isSelected
                                                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                                    }`}
                                                                    onClick={() => handleTempGenderChange(option.value)}
                                                                >
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`h-1.5 w-1.5 rounded-full ${
                                                                            isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                                        }`} />
                                                                        <span className="text-xs">{option.label}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {isSelected && (
                                                                            <Check className="h-3 w-3 text-amber-600" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-gray-900 text-xs">SPACE</h4>
                                                        {tempFilters.space && tempFilters.space !== 'all' && (
                                                            <button 
                                                                onClick={() => handleTempSpaceChange('all')}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="mb-2">
                                                        <button
                                                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs w-full ${
                                                                !tempFilters.space || tempFilters.space === 'all'
                                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                            }`}
                                                            onClick={() => handleTempSpaceChange('all')}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`h-2 w-2 rounded-full ${
                                                                    !tempFilters.space || tempFilters.space === 'all' 
                                                                        ? 'bg-amber-500' 
                                                                        : 'bg-gray-400'
                                                                }`} />
                                                                <span className="font-medium text-xs">All Spaces</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {(!tempFilters.space || tempFilters.space === 'all') && (
                                                                    <Check className="h-3 w-3 text-amber-600" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                                        {loadingSpaceOptions ? (
                                                            <div className="col-span-2 flex items-center justify-center py-4">
                                                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                                <span className="ml-2 text-xs text-gray-500">Loading Spaces</span>
                                                            </div>
                                                        ) : spaceOptionsError ? (
                                                            <div className="col-span-2 text-center py-4">
                                                                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                                                                <p className="text-xs text-red-500">Failed to load spaces</p>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => fetchSpaceOptions()}
                                                                    className="mt-2 text-xs"
                                                                >
                                                                    Retry
                                                                </Button>
                                                            </div>
                                                        ) : availableSpaces.length === 0 ? (
                                                            <div className="col-span-2 text-center py-4">
                                                                <p className="text-xs text-gray-500">No spaces available</p>
                                                            </div>
                                                        ) : (
                                                            availableSpaces.map((space) => {
                                                                const isSelected = tempFilters.space === space.value

                                                                return (
                                                                    <button
                                                                        key={space.value}
                                                                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all text-xs ${
                                                                            isSelected
                                                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                                : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                                        }`}
                                                                        onClick={() => handleTempSpaceChange(space.value)}
                                                                        title={space.original}
                                                                    >
                                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                            <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                                                isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                                            }`} />
                                                                            <span className="truncate font-medium text-xs">
                                                                                {space.original}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                                                            {isSelected && (
                                                                                <Check className="h-2.5 w-2.5 text-amber-600 flex-shrink-0" />
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                )
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t p-2">
                                                <div className="flex justify-between items-center">
                                                    <button
                                                        className="text-xs text-gray-600 hover:text-red-600 flex items-center gap-1.5"
                                                        onClick={handleClearAllTempFilters}
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Clear All Filters
                                                    </button>
                                                    <div className="flex gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-7 px-2"
                                                            onClick={handleCancelFilters}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3"
                                                            onClick={handleApplyFilters}
                                                        >
                                                            Apply
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                <Button 
                                    className='flex items-center gap-2 whitespace-nowrap'
                                    onClick={handleAddMember}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
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
                                
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 whitespace-nowrap"
                                    disabled={loading || members.length === 0 || isExporting}
                                    onClick={handleExport}
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
                            </div>
                        </div>
                        
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {searchTerm && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>"{searchTerm}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.gender && (
                                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {getGenderLabel(filters.gender)}
                                        <button 
                                            onClick={() => clearFilter('gender')}
                                            className="text-pink-600 hover:text-pink-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}

                                {filters.status && (
                                    <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {getStatusLabel(filters.status)}
                                        <button 
                                            onClick={() => clearFilter('status')}
                                            className="text-pink-600 hover:text-pink-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.space && filters.space !== 'all' && (
                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {getSpaceLabel(filters.space)}
                                        <button 
                                            onClick={() => clearFilter('space')}
                                            className="text-orange-600 hover:text-orange-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.space === 'all' && (
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
                                    onClick={handleClearAllFilters}
                                    className="text-sm h-8"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {loading && filteredMembers.length === 0 ? (
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
                                            ? `No members match your current filters${filters.space && filters.space !== "all" ? ` in ${getSpaceLabel(filters.space)}` : ""}.`
                                            : "Get started by adding your first member."
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {getTotalActiveCriteria() > 0 && (
                                        <Button 
                                            className="flex items-center gap-2"
                                            onClick={handleClearAllFilters}
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
                                        onPageChange={handlePageChangeLocal}
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
                    <HeteroSemarangContent
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

                <AddMemberSemarang 
                    isAddMemberModalOpen={isAddMemberModalOpen || isEditModalOpen} 
                    setIsAddMemberModalOpen={(open) => {
                        if (!open) {
                            setIsAddMemberModalOpen(false);
                            setIsEditModalOpen(false);
                            setEditingMember(null);
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
    );
};

export default HeteroSemarang;