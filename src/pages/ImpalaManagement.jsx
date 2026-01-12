import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, AlertCircle, Tag, Filter, X, RefreshCw, Download, Upload, FileText, FileSpreadsheet, CheckSquare, AlertTriangle, Check } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from "../components/Pagination/Pagination";
import ImpalaContent from '../components/Content/ImpalaContent';
import { useImpala } from "../hooks/useImpala";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem} from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx'
import ConfirmModal from "../components/Content/ConfirmModal";

// ===== IMPORT PROGRAM SERVICE =====
import programService from "../services/programService";

const ImpalaManagement = () => {
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [highlightDetail, setHighlightDetail] = useState(false);
    const participantDetailRef = useRef(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        gender: null,
        category: null,
        program: null, // <=== TAMBAHKAN FILTER PROGRAM
    });
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    
    // ===== STATE UNTUK PROGRAM FILTER =====
    const [availablePrograms, setAvailablePrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);

    // State untuk filter dropdown
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        gender: filters.gender || '',
        category: filters.category || 'all',
        program: filters.program || 'all' // <=== TAMBAHKAN
    });

    const { participant, loading, error, pagination, handlePageChange, refreshData, 
            showConfirm, handleConfirm, handleCancel, isOpen: isConfirmOpen, config: confirmConfig,
            deleteParticipant
     } = useImpala();

    // ===== FUNGSI UNTUK MENGAMBIL DAFTAR PROGRAM =====
    const fetchProgramsFromSystem = async () => {
        setLoadingPrograms(true);
        try {
            // Menggunakan service yang sudah ada untuk mengambil nama program dari client
            const response = await programService.getProgramNamesFromClients('');
            
            if (response.data && Array.isArray(response.data)) {
                const programOptions = response.data.map(item => ({
                    value: item.program_name.toLowerCase().replace(/\s+/g, '_'),
                    label: item.program_name,
                    original: item.program_name,
                    client: item.company || item.client_name || ''
                }));
                
                // Sort alphabetically
                const sortedPrograms = programOptions.sort((a, b) => 
                    a.original.localeCompare(b.original)
                );
                
                setAvailablePrograms(sortedPrograms);
            } else {
                // Fallback: extract dari peserta jika response tidak valid
                fetchProgramsFromParticipants();
            }
        } catch (error) {
            console.error('Error fetching program names:', error);
            // Fallback ke peserta
            fetchProgramsFromParticipants();
        } finally {
            setLoadingPrograms(false);
        }
    };

    // Fallback function: extract program names dari peserta
    const fetchProgramsFromParticipants = () => {
        if (participant.length > 0) {
            const uniquePrograms = [...new Set(participant
                .map(p => p.program_name)
                .filter(name => name && name.trim() !== "")
            )].sort();
            
            const programOptions = uniquePrograms.map(program => ({
                value: program.toLowerCase().replace(/\s+/g, '_'),
                label: program,
                original: program,
                client: ''
            }));
            
            setAvailablePrograms(prev => {
                // Gabungkan dengan existing, hindari duplikat
                const combined = [...prev];
                programOptions.forEach(newProg => {
                    if (!combined.find(p => p.original === newProg.original)) {
                        combined.push(newProg);
                    }
                });
                return combined.sort((a, b) => a.original.localeCompare(b.original));
            });
        }
    };

    // ===== EVENT LISTENER UNTUK REAL-TIME UPDATE =====
    useEffect(() => {
        const handleProgramUpdated = (event) => {
            const { type, program } = event.detail;
            
            setAvailablePrograms(prev => {
                if (type === 'added') {
                    // Cek apakah program sudah ada
                    const exists = prev.find(p => 
                        p.original.toLowerCase() === program.name.toLowerCase()
                    );
                    
                    if (!exists) {
                        const newProgram = {
                            value: program.name.toLowerCase().replace(/\s+/g, '_'),
                            label: program.name,
                            original: program.name,
                            client: program.client || '',
                            isNew: true
                        };
                        
                        toast.success(`Program baru ditambahkan: ${program.name}`);
                        return [...prev, newProgram].sort((a, b) => 
                            a.original.localeCompare(b.original)
                        );
                    }
                }
                
                return prev;
            });
        };
        
        window.addEventListener('programAddedOrUpdated', handleProgramUpdated);
        return () => window.removeEventListener('programAddedOrUpdated', handleProgramUpdated);
    }, []);

    // ===== HANDLER UNTUK REFRESH PROGRAM LIST =====
    const handleRefreshPrograms = () => {
        fetchProgramsFromSystem();
        toast.success('Memperbarui daftar program...');
    };

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
                    'Nama Lengkap': 'Contoh: John Doe',
                    'NIK': 'Contoh: 3275031201990001',
                    'Email': 'Contoh: john@example.com',
                    'Nomor Telepon': 'Contoh: 081234567890',
                    'Jenis Kelamin': 'Contoh: Laki-laki',
                    'Tanggal Lahir': 'Contoh: 1990-01-01',
                    'Pendidikan': 'Contoh: Sarjana (S1)',
                    'Status Disabilitas': 'Contoh: Tidak memiliki disabilitas',
                    'Program': 'Contoh: Enterprise Digital Acceleration 2025',
                    'Alamat': 'Contoh: Jl. Contoh No. 123',
                    'Provinsi': 'Contoh: JAWA BARAT',
                    'Kota/Kabupaten': 'Contoh: KOTA BANDUNG',
                    'Kecamatan': 'Contoh: Batealit',
                    'Kelurahan/Desa': 'Contoh: Bantrung',
                    'Kode Pos': 'Contoh: 40115',
                    'Kategori': 'Contoh: Mahasiswa/UMKM/Profesional/Komunitas',
                    'Alasan Bergabung': 'Contoh: Ingin menambah wawasan dan keterampilan digital',

                    // UMKM 
                    'Nama Usaha': 'Contoh: Toko ABC',
                    'Jenis Usaha': 'Contoh: Retail',
                    'Alamat Usaha': 'Contoh: Jl. Usaha No. 45',
                    'Bentuk Usaha': 'Contoh: Perorangan',
                    'Tahun Berdiri': 'Contoh: 2018',
                    'Pendapatan Bulanan': 'Contoh: 10000000',
                    'Jumlah Karyawan': 'Contoh: 5',
                    'Sertifikasi': 'Contoh: ISO 9001, Halal',
                    'Media Sosial': 'Contoh: Instagram: @johndoe, Facebook: John Doe',
                    'Marketplace': 'Contoh: Tokopedia: tokopedia.com/johndoe, Shopee: shopee.co.id/johndoe',
                    'Website': 'Contoh: johndoe.com, portfolio.johndoe.com',

                    // mahasiswa
                    'Institusi': 'Contoh: Universitas Indonesia',
                    'Jurusan': 'Contoh: Teknik Informatika',
                    'Semester': 'Contoh: 6',
                    'Tahun Masuk': 'Contoh: 2020',
                    'Minat Karir': 'Contoh: Software Development',
                    'Kompetensi Inti': 'Contoh: Programming, Database',

                    // Profesional
                    'Tempat Kerja': 'Contoh: PT. Contoh',
                    'Posisi': 'Contoh: Software Engineer',
                    'Lama Bekerja': 'Contoh: 3 tahun',
                    'Sektor Industri': 'Contoh: Teknologi',
                    'Keahlian': 'Contoh: JavaScript, React, Node.js',

                    // komunitas
                    'Nama Komunitas': 'Contoh: Komunitas Digital Kreatif',
                    'Bidang Fokus': 'Contoh: Teknologi, Pendidikan',
                    'Jumlah Anggota': 'Contoh: 50',
                    'Area Operasional': 'Contoh: Lokal',
                    'Peran dalam Komunitas': 'Contoh: Koordinator',

                    // Umum
                    'Bidang Minta': 'Contoh: Teknologi Informatika',
                    'Latar Belakang': 'Contoh: Freelancer',
                    'Tingkat Pengalaman': 'Contoh: Pemula'
                },
            ];
            
            const dataWorksheet = XLSX.utils.json_to_sheet(templateData)

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
                { wch: 15 },   { wch: 20 },   { wch: 25 },   { wch: 20 },
                { wch: 30 },   { wch: 30 },   { wch: 30 },   { wch: 30 },
                { wch: 30 }    
            ]
            dataWorksheet[!'cols'] = wscols

            const instructionData = [
                { 'KOLOM': 'DESKRIPSI', 'CONTOH': 'FORMAT', 'CATATAN': 'KETERANGAN' },
                { 'KOLOM': 'Nama Lengkap', 'CONTOH': 'John Doe', 'CATATAN': 'Wajib diisi' },
                { 'KOLOM': 'Email', 'CONTOH': 'john@example.com', 'CATATAN': 'Wajib diisi, format email valid' },
                { 'KOLOM': 'Nomor Telepon', 'CONTOH': '081234567890', 'CATATAN': 'Wajib diisi, format angka' },
                { 'KOLOM': 'Jenis Kelamin', 'CONTOH': 'Laki-laki', 'CATATAN': 'Pilihan: Laki-laki, Perempuan' },
                { 'KOLOM': 'Kategori', 'CONTOH': 'Mahasiswa', 'CATATAN': 'Pilihan: Mahasiswa, UMKM, Profesional, Komunitas' },
                { 'KOLOM': 'Program', 'CONTOH': 'Enterprise Digital Acceleration 2025', 'CATATAN': 'Nama program yang diikuti' },
                { 'KOLOM': 'Tanggal Lahir', 'CONTOH': '1990-01-01', 'CATATAN': 'Format: YYYY-MM-DD' },
                { 'KOLOM': 'Usia', 'CONTOH': '34', 'CATATAN': 'Akan dihitung otomatis jika tanggal lahir diisi' },
                { 'KOLOM': 'Alamat', 'CONTOH': 'Jl. Contoh No. 123', 'CATATAN': 'Alamat lengkap' },
                { 'KOLOM': 'Kota/Kabupaten', 'CONTOH': 'KOTA BANDUNG', 'CATATAN': 'Nama kota atau kabupaten' },
                { 'KOLOM': 'Provinsi', 'CONTOH': 'JAWA BARAT', 'CATATAN': 'Nama provinsi' },
                { 'KOLOM': 'Pendidikan', 'CONTOH': 'Sarjana (S1)', 'CATATAN': 'Pilihan: SD/Sederajat, SMP/Sederajat, SMA/Sederajat, Diploma, Sarjana, Magister, Doktor' },
                { 'KOLOM': 'NIK', 'CONTOH': '3275031201990001', 'CATATAN': '16 digit NIK' },
                { 'KOLOM': 'Kode Pos', 'CONTOH': '40115', 'CATATAN': '5 digit kode pos' },
                { 'KOLOM': 'Status Disabilitas', 'CONTOH': 'Tidak memiliki disabilitas', 'CATATAN': 'Opsional' },
                { 'KOLOM': 'Alasan Bergabung', 'CONTOH': 'Ingin menambah wawasan', 'CATATAN': 'Alasan mengikuti program' },
                { 'KOLOM': 'Media Sosial', 'CONTOH': 'Instagram: @johndoe, Facebook: John Doe', 'CATATAN': 'Pisahkan dengan koma untuk multiple' },
                { 'KOLOM': 'Marketplace', 'CONTOH': 'Tokopedia: tokopedia.com/johndoe', 'CATATAN': 'Pisahkan dengan koma untuk multiple' },
                { 'KOLOM': 'Website', 'CONTOH': 'johndoe.com', 'CATATAN': 'Pisahkan dengan koma untuk multiple' }
            ];

            const instructionWorksheet = XLSX.utils.json_to_sheet(instructionData)

            const instructionCols = [
                { wch: 25 },  
                { wch: 40 },  
                { wch: 30 },   
                { wch: 50 }
            ]

            instructionWorksheet['!cols'] = instructionCols

            const categoryData = [
                { 'KATEGORI': 'FIELD YANG WAJIB DIISI', 'KETERANGAN': '' },
                { 'KATEGORI': 'Mahasiswa', 'KETERANGAN': 'Institusi, Jurusan, Semester, Tahun Masuk' },
                { 'KATEGORI': 'UMKM', 'KETERANGAN': 'Nama Usaha, Jenis Usaha, Alamat Usaha' },
                { 'KATEGORI': 'Profesional', 'KETERANGAN': 'Tempat Kerja, Posisi, Lama Bekerja' },
                { 'KATEGORI': 'Komunitas', 'KETERANGAN': 'Nama Komunitas, Bidang Fokus, Jumlah Anggota' }
            ]
            
            const categoryWorksheet = XLSX.utils.json_to_sheet(categoryData)
            const categoryCols = [
                { wch: 25 },
                { wch: 50 }
            ]

            categoryWorksheet['!cols'] = categoryCols

            const workbook = XLSX.utils.book_new()

            XLSX.utils.book_append_sheet(workbook, dataWorksheet, 'Template data')
            XLSX.utils.book_append_sheet(workbook, instructionWorksheet, 'Instruksi')
            XLSX.utils.book_append_sheet(workbook, categoryWorksheet, 'Kategori')

            const formData = [
                { 'JENIS DATA': 'FORMAT', 'CONTOH': 'PENJELASAN' },
                { 'JENIS DATA': 'Tanggal', 'CONTOH': '2024-01-15', 'PENJELASAN': 'YYYY-MM-DD (Tahun-Bulan-Tanggal)' },
                { 'JENIS DATA': 'Angka', 'CONTOH': '1000000', 'PENJELASAN': 'Tanpa titik atau koma pemisah ribuan' },
                { 'JENIS DATA': 'Array/Multiple', 'CONTOH': 'value1, value2, value3', 'PENJELASAN': 'Pisahkan dengan koma untuk multiple values' },
                { 'JENIS DATA': 'Email', 'CONTOH': 'nama@domain.com', 'PENJELASAN': 'Format email yang valid' },
                { 'JENIS DATA': 'Telepon', 'CONTOH': '081234567890', 'PENJELASAN': 'Format angka, tanpa tanda + atau -' }
            ]

            const formatWorksheet = XLSX.utils.json_to_sheet(formData)
            const formatCols = [
                { wch: 20 },
                { wch: 20 },
                { wch: 40 }
            ]

            formatWorksheet['!cols'] = formatCols;
            XLSX.utils.book_append_sheet(workbook, formatWorksheet, 'Format data')

            const emptyData = templateData.map(row => {
                const emptyRow = {}
                Object.keys(row).forEach(key => {
                    emptyRow[key]
                })

                return emptyRow
            })

            const emptyWorksheet = XLSX.utils.json_to_sheet(emptyData)
            emptyWorksheet['!cols'] = wscols
            XLSX.utils.book_append_sheet(workbook, emptyWorksheet, 'Isi data disini')

            if (!dataWorksheet['A1']) dataWorksheet['A1'] = {}
            if (!dataWorksheet['A1'].s) dataWorksheet['A1'].s = {}
            dataWorksheet['A1'].s = {
                fill: { fgColor: { rgb: '#FFFF0000' } },
                font: { color: { rgb: '#FFFFFFFF' }, bold: true }
            }

            XLSX.writeFile(workbook, 'impala_management_template.xlsx')

            toast.success('Template excel berhasil didownload')

        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal mendownload template');
        }
    }, []);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];

        if (!file) {
            toast.error('Tidak ada file yang dipilih');
            return;
        }

        const allowedExtensions = ['.xlsx', '.xls']
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ]
        
        const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()

        if (!allowedExtensions.includes(fileExtension) && !allowedTypes.includes(file.type)) {
            toast.error('Hanya file Excel (.xlsx, .xls) atau csv yang diperbolehkan')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File terlalu besar. Max 10mb')
            return
        }
        
        setImportFile(file);
    }, []);

    const handleImportExcel = useCallback(async () => {
        if (!importFile) {
            toast.error('Pilih file Excel terlebih dahulu');
            return;
        }
        
        setIsImporting(true);
        toast.loading('Mengimport data dari Excel...');
        
        try {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const data = e.target.result;
                    
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    if (jsonData.length === 0) {
                        toast.dismiss();
                        toast.error('Tidak ada data yang ditemukan dalam file Excel');
                        return;
                    }
                    
                    const importedParticipants = jsonData
                        .filter(row => {
                            const name = row['Nama Lengkap'] || row['full_name'] || '';
                            const email = row['Email'] || row['email'] || '';
                            return name && email && 
                                !name.toString().includes('Contoh:') && 
                                !email.toString().includes('Contoh:');
                        })
                        .map(row => {
                            const participant = {
                                full_name: row['Nama Lengkap'] || row['full_name'] || '',
                                email: row['Email'] || row['email'] || '',
                                phone: row['Nomor Telepon'] || row['phone'] || '',
                                gender: row['Jenis Kelamin'] || row['gender'] || '',
                                category: row['Kategori'] || row['category'] || '',
                                program_name: row['Program'] || row['program_name'] || '',
                                date_of_birth: row['Tanggal Lahir'] || row['date_of_birth'] || '',
                                address: row['Alamat'] || row['address'] || '',
                                regency_name: row['Kota/Kabupaten'] || row['regency_name'] || '',
                                province_name: row['Provinsi'] || row['province_name'] || '',
                                education: row['Pendidikan'] || row['education'] || '',
                                nik: row['NIK'] || row['nik'] || '',
                                postal_code: row['Kode Pos'] || row['postal_code'] || '',
                                disability_status: row['Status Disabilitas'] || row['disability_status'] || '',
                                reason_join_program: row['Alasan Bergabung'] || row['reason_join_program'] || '',
                                
                                // Business Information
                                business_name: row['Nama Usaha'] || row['business_name'] || '',
                                business_type: row['Jenis Usaha'] || row['business_type'] || '',
                                business_address: row['Alamat Usaha'] || row['business_address'] || '',
                                business_form: row['Bentuk Usaha'] || row['business_form'] || '',
                                established_year: row['Tahun Berdiri'] || row['established_year'] || '',
                                monthly_revenue: row['Pendapatan Bulanan'] || row['monthly_revenue'] || '',
                                employee_count: row['Jumlah Karyawan'] || row['employee_count'] || '',
                                
                                // Academic Information
                                institution: row['Institusi'] || row['institution'] || '',
                                major: row['Jurusan'] || row['major'] || '',
                                semester: row['Semester'] || row['semester'] || '',
                                enrollment_year: row['Tahun Masuk'] || row['enrollment_year'] || '',
                                career_interest: row['Minat Karir'] || row['career_interest'] || '',
                                core_competency: row['Kompetensi Inti'] || row['core_competency'] || '',
                                
                                // Professional Information
                                workplace: row['Tempat Kerja'] || row['workplace'] || '',
                                position: row['Posisi'] || row['position'] || '',
                                work_duration: row['Lama Bekerja'] || row['work_duration'] || '',
                                industry_sector: row['Sektor Industri'] || row['industry_sector'] || '',
                                
                                // Community Information
                                community_name: row['Nama Komunitas'] || row['community_name'] || '',
                                focus_area: row['Bidang Fokus'] || row['focus_area'] || '',
                                member_count: row['Jumlah Anggota'] || row['member_count'] || '',
                                operational_area: row['Area Operasional'] || row['operational_area'] || '',
                                community_role: row['Peran dalam Komunitas'] || row['community_role'] || '',

                                // umum information
                                areas_interest: row['Bidang Minat'] || row['areas_interest'],
                                backgorund: row['Latar Belakang'] || row['background'],
                                experience_level: row['Tingkat Pengalaman'] || row['experience_level']
                            };
                            
                            const processArrayField = (value) => {
                                if (!value) return [];
                                if (Array.isArray(value)) return value;
                                if (typeof value === 'string') {
                                    return value.split(',')
                                        .map(item => item.trim())
                                        .filter(item => item && !item.includes('Contoh:'));
                                }
                                return [String(value)];
                            };
                            
                            const certValue = row['Sertifikasi'] || row['certifications'];
                            participant.certifications = processArrayField(certValue);
                            
                            const skillsValue = row['Keahlian'] || row['skills'];
                            participant.skills = processArrayField(skillsValue);
                            
                            const smValue = row['Media Sosial'] || row['social_media'];
                            participant.social_media = processArrayField(smValue);
                            
                            const mpValue = row['Marketplace'] || row['marketplace'];
                            participant.marketplace = processArrayField(mpValue);
                            
                            const webValue = row['Website'] || row['website'];
                            participant.website = processArrayField(webValue);
                            
                            participant.created_at = new Date().toISOString();
                            participant.updated_at = new Date().toISOString();
                            
                            return participant;
                        });
                    
                    if (importedParticipants.length === 0) {
                        toast.dismiss();
                        toast.error('Tidak ada data valid yang ditemukan dalam file Excel');
                        return;
                    }
                    
                    const invalidParticipants = importedParticipants.filter(p => 
                        !p.full_name || !p.email || !p.phone || !p.gender || !p.category
                    );
                    
                    if (invalidParticipants.length > 0) {
                        toast.dismiss();
                        toast.error(`${invalidParticipants.length} data tidak valid (nama, email, telepon, gender, atau kategori kosong)`);
                        return;
                    }
                    
                    toast.loading(`Mengirim ${importedParticipants.length} data ke server...`);
                    
                    const response = await fetch('/api/impala/import', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ participants: importedParticipants })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Gagal mengimport data ke server');
                    }
                    
                    
                    setImportFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    setIsImportModalOpen(false);
                    
                    await refreshData();
                    
                    toast.dismiss();
                    toast.success(`Berhasil mengimport ${importedParticipants.length} peserta dari Excel`);
                    
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    toast.dismiss();
                    toast.error('Format file Excel tidak valid atau struktur kolom tidak sesuai');
                }
            };
            
            reader.readAsBinaryString(importFile);
            
        } catch (error) {
            console.error('Import error:', error);
            toast.dismiss();
            toast.error(error.message || 'Gagal mengimport data dari Excel');
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
        { value: 'laki-laki', label: 'Laki-laki' },
        { value: 'perempuan', label: 'Perempuan' },
    ];

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

    // ===== UPDATE APPLY ALL FILTERS UNTUK PROGRAM =====
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
        
        if (filters.gender) {
            result = result.filter(participant => {
                const participantGender = participant.gender?.toLowerCase();
                return participantGender === filters.gender.toLowerCase();
            });
        }
        
        if (filters.category && filters.category !== 'all') {
            result = result.filter(participant => {
                const participantCategory = participant.category;
                if (!participantCategory) return false;
                return participantCategory.toLowerCase() === filters.category.toLowerCase();
            });
        }
        
        // ===== FILTER PROGRAM =====
        if (filters.program && filters.program !== 'all') {
            const selectedProgram = availablePrograms.find(p => p.value === filters.program);
            if (selectedProgram) {
                result = result.filter(participant => {
                    const participantProgram = participant.program_name;
                    if (!participantProgram) return false;
                    return participantProgram.toLowerCase() === selectedProgram.original.toLowerCase();
                });
            }
        }
        // ==========================
        
        setFilteredParticipants(result);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        const lowerTerm = term.toLowerCase();
        if (lowerTerm === 'perempuan' || lowerTerm === 'laki-laki') {
            setFilters(prev => ({
                ...prev,
                gender: lowerTerm
            }));
        }
    };

    // Handler untuk filter sementara
    const handleTempGenderChange = (gender) => {
        setTempFilters(prev => ({ 
            ...prev, 
            gender: prev.gender === gender ? '' : gender 
        }));
    };

    const handleTempCategoryChange = (category) => {
        setTempFilters(prev => ({ ...prev, category }));
    };

    // ===== HANDLER UNTUK PROGRAM FILTER =====
    const handleTempProgramChange = (program) => {
        setTempFilters(prev => ({ ...prev, program }));
    };

    // Handler untuk apply filter
    const handleApplyFilters = () => {
        setFilters({
            gender: tempFilters.gender || null,
            category: tempFilters.category || null,
            program: tempFilters.program || null // <=== TAMBAHKAN
        });
        setIsFilterOpen(false);
    };

    // Handler untuk cancel filter
    const handleCancelFilters = () => {
        setTempFilters({
            gender: filters.gender || '',
            category: filters.category || 'all',
            program: filters.program || 'all' // <=== TAMBAHKAN
        });
        setIsFilterOpen(false);
    };

    // Handler untuk clear semua filter sementara
    const handleClearAllTempFilters = () => {
        setTempFilters({
            gender: '',
            category: 'all',
            program: 'all' // <=== TAMBAHKAN
        });
    };

    // Handler untuk clear semua filter permanen
    const handleClearAllFilters = () => {
        setSearchTerm("");
        setFilters({
            gender: null,
            category: null,
            program: null, // <=== TAMBAHKAN
        });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.gender) count++;
        if (filters.category && filters.category !== 'all') count++;
        if (filters.program && filters.program !== 'all') count++; // <=== TAMBAHKAN
        return count;
    };

    // Handler untuk menghitung filter sementara yang aktif
    const getTempActiveFiltersCount = () => {
        let count = 0;
        if (tempFilters.gender) count++;
        if (tempFilters.category && tempFilters.category !== 'all') count++;
        if (tempFilters.program && tempFilters.program !== 'all') count++; // <=== TAMBAHKAN
        return count;
    };

    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (filters.gender) count++;
        if (filters.category && filters.category !== 'all') count++;
        if (filters.program && filters.program !== 'all') count++; // <=== TAMBAHKAN
        return count;
    };

    // Fungsi clear filter spesifik
    const clearFilter = (filterType) => {
        if (filterType === 'search') {
            setSearchTerm("");
        } else if (filterType === 'gender') {
            setFilters(prev => ({ ...prev, gender: null }));
        } else if (filterType === 'category') {
            setFilters(prev => ({ ...prev, category: null }));
        } else if (filterType === 'program') { // <=== TAMBAHKAN
            setFilters(prev => ({ ...prev, program: null }));
        }
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

    // ===== FUNGSI UNTUK GET PROGRAM LABEL =====
    const getProgramLabel = (programValue) => {
        if (!programValue || programValue === "all") return "All Programs";
        const program = availablePrograms.find(p => p.value === programValue);
        return program ? program.original : programValue;
    };

    // Update tempFilters ketika filters berubah
    useEffect(() => {
        setTempFilters({
            gender: filters.gender || '',
            category: filters.category || 'all',
            program: filters.program || 'all' // <=== TAMBAHKAN
        });
    }, [filters]);

    // ===== LOAD INITIAL DATA PROGRAM =====
    useEffect(() => {
        fetchProgramsFromSystem();
    }, []);

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

    // ===== TAMBAHKAN PROGRAM DARI PESERTA KE LIST =====
    useEffect(() => {
        if (!loading && participant.length > 0) {
            fetchProgramsFromParticipants();
        }
    }, [loading, participant]);

    useEffect(() => {
        if (participant.length > 0) {
            setFilteredParticipants(participant);
            applyAllFilters();
        }
    }, [participant]);

    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, filters]);

    const handleEdit = () => {
        if (selectedParticipant) {
            alert(`Edit participant: ${selectedParticipant.full_name}`);
        }
    };

    const handleDelete = async () => {
        if (!selectedParticipant) return

        if (showConfirm && typeof showConfirm === 'function') {
            showConfirm({
                title: 'Delete Program',
                message: `Are you sure you want to delete "${selectedParticipant.full_name}"? This action cannot be undone.`,
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                onConfirm: async () => {
                    try {
                        await deleteParticipant(selectedParticipant.id);
                        setSelectedParticipant(null);
                        toast.success('Program deleted successfully');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                        console.error('Error deleting program:', error);
                        toast.error(error.message || 'Failed to delete program');
                    }
                },
                onCancel: () => {
                    toast('Deletion cancelled', { icon: AlertTriangle });
                }
            })
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
        handleClearAllFilters();
    }, [refreshData, handleClearAllFilters]);

    const handlePageChangeModified = useCallback((page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handlePageChange(page);
    }, [handlePageChange]);

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
            } else {
                dataToExport = filteredParticipants
            }

            if (!dataToExport || dataToExport.length === 0) {
                toast.dismiss()
                toast.error('No data to export')
                return
            }

            const formatArrayField = (fieldValue) => {
                if (!fieldValue) return '';
                if (Array.isArray(fieldValue)) {
                    return fieldValue.join(', ')
                }

                if (typeof fieldValue === 'string') {
                    try {
                        const parsed = JSON.parse(fieldValue)
                        if (Array.isArray(parsed)) {
                            return parsed.join(', ')
                        }

                    } catch {
                        //
                    }

                    return fieldValue
                }

                return String(fieldValue)
            }

            const formatFieldValue = (fieldValue, fieldName) => {
                if (fieldValue === null || fieldValue === undefined) return ''

                if (['social_media', 'marketplace', 'website', 'skills', 'certifications'].includes(fieldName)) {
                    return formatArrayField(fieldValue)
                }

                if (fieldName.includes('date') || fieldName.includes('created') || fieldName.includes('updated')) {
                    try {
                        return new Date(fieldValue).toLocaleDateString('id-ID')
                    } catch {
                        return fieldValue
                    }
                }

                return String(fieldValue)
            }

            const exportData = dataToExport.map((p, index) => ({
                // Data Primery
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
                'Tanggal Dibuat': formatFieldValue(p.created_at, 'created_at'),
                'Tanggal Diperbarui': formatFieldValue(p.updated_at, 'updated_at'),
                
                // Data UMKM
                'Nama Usaha': p.business_name || '',
                'Jenis Usaha': p.business_type || '',
                'Alamat Usaha': p.business_address || '',
                'Bentuk Usaha': p.business_form || '',
                'Tahun Berdiri': p.established_year || '',
                'Pendapatan Bulanan': p.monthly_revenue || '',
                'Jumlah Karyawan': p.employee_count || '',
                'Sertifikasi': formatFieldValue(p.certifications, 'certifications'),
                'Media Sosial': formatFieldValue(p.social_media, 'social_media'),
                'Marketplace': formatFieldValue(p.marketplace, 'marketplace'),
                'Website': formatFieldValue(p.website, 'website'),
                
                // Data Mahasiswa
                'Institusi': p.institution || '',
                'Jurusan': p.major || '',
                'Semester': p.semester || '',
                'Tahun Masuk': p.enrollment_year || '',
                'Minat Karir': p.career_interest || '',
                'Kompetensi Inti': p.core_competency || '',
                
                // Data Profesional
                'Tempat Kerja': p.workplace || '',
                'Posisi': p.position || '',
                'Lama Bekerja': p.work_duration || '',
                'Sektor Industri': p.industry_sector || '',
                'Keahlian': formatFieldValue(p.skills, 'skills'),
                
                // Data Komunitas
                'Nama Komunitas': p.community_name || '',
                'Bidang Fokus': p.focus_area || '',
                'Jumlah Anggota': p.member_count || '',
                'Area Operasional': p.operational_area || '',
                'Peran dalam Komunitas': p.community_role || '',
                
                // Data Umum
                'Bidang Minat': p.areas_interest || '',
                'Latar Belakang': p.backgorund || '',
                'Tingkat Pengalaman': p.experience_level || ''
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
                { wch: 15 },   { wch: 20 },   { wch: 25 },   { wch: 20 },
                { wch: 30 },   { wch: 30 },   { wch: 30 },   { wch: 30 },
                { wch: 30 }    
            ];
            worksheet['!cols'] = wscols

            worksheet['!autofilter'] = { ref: "A1:AQ1" };
            
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
                                
                                {/* Custom Filter Dropdown - Versi baru seperti ProgramFilter.jsx */}
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
                                        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[450px]">
                                            <div className="p-3 border-b">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-gray-900 text-xs">Filter Options</h3>
                                                    <span className="text-xs text-gray-500">
                                                        {getTempActiveFiltersCount()} filter{getTempActiveFiltersCount() !== 1 ? 's' : ''} selected
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3">
                                                {/* Gender */}
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

                                                {/* Category */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-gray-900 text-xs">CATEGORY</h4>
                                                        {tempFilters.category && tempFilters.category !== 'all' && (
                                                            <button 
                                                                onClick={() => handleTempCategoryChange('all')}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* All Categories */}
                                                    <div className="mb-2">
                                                        <button
                                                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs w-full ${
                                                                !tempFilters.category || tempFilters.category === 'all'
                                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                            }`}
                                                            onClick={() => handleTempCategoryChange('all')}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`h-2 w-2 rounded-full ${
                                                                    !tempFilters.category || tempFilters.category === 'all' 
                                                                        ? 'bg-amber-500' 
                                                                        : 'bg-gray-400'
                                                                }`} />
                                                                <span className="font-medium text-xs">All Categories</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {(!tempFilters.category || tempFilters.category === 'all') && (
                                                                    <Check className="h-3 w-3 text-amber-600" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Categories Grid */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {availableCategories.map((category) => {
                                                            const isSelected = tempFilters.category === category.value;
                                                            
                                                            return (
                                                                <button
                                                                    key={category.value}
                                                                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all text-xs ${
                                                                        isSelected
                                                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                                    }`}
                                                                    onClick={() => handleTempCategoryChange(category.value)}
                                                                >
                                                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                                            isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                                        }`} />
                                                                        <span className="truncate font-medium text-xs">
                                                                            {category.original}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                                                        {isSelected && (
                                                                            <Check className="h-2.5 w-2.5 text-amber-600 flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* ===== PROGRAM NAME FILTER ===== */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-gray-900 text-xs">PROGRAM NAME</h4>
                                                            <button 
                                                                onClick={handleRefreshPrograms}
                                                                className="text-xs text-gray-400 hover:text-blue-500"
                                                                title="Refresh program list"
                                                            >
                                                                <RefreshCw className={`h-3 w-3 ${loadingPrograms ? 'animate-spin' : ''}`} />
                                                            </button>
                                                        </div>
                                                        {tempFilters.program && tempFilters.program !== 'all' && (
                                                            <button 
                                                                onClick={() => handleTempProgramChange('all')}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* All Programs */}
                                                    <div className="mb-2">
                                                        <button
                                                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs w-full ${
                                                                !tempFilters.program || tempFilters.program === 'all'
                                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 text-gray-700'
                                                            }`}
                                                            onClick={() => handleTempProgramChange('all')}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`h-2 w-2 rounded-full ${
                                                                    !tempFilters.program || tempFilters.program === 'all' 
                                                                        ? 'bg-purple-500' 
                                                                        : 'bg-gray-400'
                                                                }`} />
                                                                <span className="font-medium text-xs">All Programs</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {(!tempFilters.program || tempFilters.program === 'all') && (
                                                                    <Check className="h-3 w-3 text-purple-600" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Programs List */}
                                                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                                        {loadingPrograms ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <Loader2 className="h-3 w-3 animate-spin text-purple-600 mr-2" />
                                                                <span className="text-xs text-gray-600">Loading programs...</span>
                                                            </div>
                                                        ) : availablePrograms.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {availablePrograms.map((program) => {
                                                                    const isSelected = tempFilters.program === program.value;
                                                                    
                                                                    return (
                                                                        <button
                                                                            key={program.value}
                                                                            className={`flex items-center justify-between w-full px-2 py-1.5 rounded transition-all text-xs ${
                                                                                isSelected
                                                                                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                                    : 'hover:bg-gray-50 text-gray-700'
                                                                            }`}
                                                                            onClick={() => handleTempProgramChange(program.value)}
                                                                            title={program.client ? `Client: ${program.client}` : ''}
                                                                        >
                                                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                                                    isSelected ? 'bg-purple-500' : 'bg-gray-400'
                                                                                }`} />
                                                                                <span className="truncate text-xs text-left">
                                                                                    {program.original}
                                                                                    {program.isNew && (
                                                                                        <span className="ml-1 bg-green-100 text-green-800 text-[10px] px-1 py-0.5 rounded">
                                                                                            NEW
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                                                                {isSelected && (
                                                                                    <Check className="h-2.5 w-2.5 text-purple-600 flex-shrink-0" />
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4 text-xs text-gray-500">
                                                                No programs available. Add clients with program names first.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* ===== END PROGRAM FILTER ===== */}
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
                                
                                {filters.category && filters.category !== 'all' && (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {getCategoryLabel(filters.category)}
                                        <button 
                                            onClick={() => clearFilter('category')}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.category === 'all' && (
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
                                
                                {/* ===== PROGRAM FILTER DISPLAY ===== */}
                                {filters.program && filters.program !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        📚 {getProgramLabel(filters.program)}
                                        <button 
                                            onClick={() => clearFilter('program')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.program === 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        📚 All Programs
                                        <button 
                                            onClick={() => clearFilter('program')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {/* ===== END PROGRAM FILTER DISPLAY ===== */}
                                
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
                                            onClick={handleClearAllFilters}
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

                <ConfirmModal 
                    isOpen={isConfirmOpen}
                    config={confirmConfig}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />

                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                Import Participants from Excel
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Upload a Excel file to import multiple participants at once.
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
                                            <strong>Drag & drop your Excel file here, or click to browse</strong>
                                        </p>
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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
                                onClick={handleImportExcel}
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