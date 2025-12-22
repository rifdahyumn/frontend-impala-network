    export const getDefaultFormConfig = () => ({
        programName: "",
        title: "Pendaftaran Program",
        sections: {
            programInfo: {
                id: "programInfo",
                name: "Informasi Program",
                description: "Detail program pendaftaran",
                locked: true,
                fields: [
                    {
                        id: 'program_name',
                        type: 'program_dropdown',
                        name: 'program_name',
                        label: 'Nama Program',
                        required: true,
                        placeholder: 'Pilih nama program',
                        options: [],
                        loading: false,
                        locked: true
                    }
                ],
                fieldWa: [
                    {
                        id: 'program_name',
                        type: 'program_dropdown',
                        name: 'program_name',
                        label: 'Group WA ',
                        required: true,
                        placeholder: 'Pilih nama program',
                        options: [],
                        loading: false,
                        locked: true
                    }
                ],
            }
        },
        personalInfo: {
            id: "personalInfo",
            name: "Informasi Pribadi",
            description: "Data diri peserta",
            locked: true,
            fields: [
                {
                    id: 'full_name',
                    type: 'text',
                    name: 'full_name',
                    label: 'Nama Lengkap',
                    required: true,
                    placeholder: 'Masukkan nama lengkap sesuai KTP',
                    locked: true
                },
                { 
                    id: 'nik', 
                    type: 'number', 
                    name: 'nik', 
                    label: 'NIK (Nomor Induk Kependudukan)', 
                    required: true,
                    placeholder: 'Masukkan NIK 16 digit',
                    locked: true
                },
                {
                    id: 'email',
                    type: 'email',
                    name: 'email',
                    label: 'Email',
                    required: true,
                    placeholder: 'email@example.com',
                    locked: true
                },
                {
                    id: 'phone',
                    type: 'number',
                    name: 'phone',
                    label: 'Nomor WhatsApp',
                    required: true,
                    locked: true
                },
                {
                    id: 'gender',
                    type: 'select',
                    name: 'gender',
                    label: 'Jenis Kelamin',
                    required: true,
                    options: ['Laki-laki', 'Perempuan'],
                    locked: true
                },
                {
                    id: 'date_of_birth',
                    type: 'date',
                    name: 'date_of_birth',
                    label: 'Tanggal Lahir',
                    required: true,
                    locked: true
                },
                {
                    id: 'education',
                    type: 'select',
                    name: 'education',
                    label: 'Pendidikan Terakhir',
                    required: true,
                    options: [ 'Sekolah Menengah Atas (SMA/SMK/MA)', 'Diploma (D3)', 'Sarjana (S1)', 'Magister (S2)', 'Doctor (S3)'],
                    locked: true
                },
                {
                    id: 'disability_status',
                    type: 'select',
                    name: 'disability_status',
                    label: 'Status Disabilitas',
                    required: false,
                    placeholder: 'Pilih status disabilitas Anda',
                    options: [
                        'Tidak memiliki disabilitas',
                        'Disabilitas Fisik/Motorik',
                        'Disabilitas Penglihatan (Tuna Netra/Low Vision)',
                        'Disabilitas Pendengaran (Tuna Rungu/Tuli)',
                        'Disabilitas Bicara/Komunikasi',
                        'Disabilitas Intelektual',
                        'Disabilitas Mental/Psikososial',
                        'Disabilitas Ganda/Multiple',
                        'Disabilitas Neurologis/Perkembangan (Autisme, ADHD, dll)',
                        'Penyakit Kronis/Disabilitas Laten',
                        'Lainnya'
                    ],
                    locked: true
                },
                
                {
                    id: 'province_id',
                    name: 'province_id',
                    label: 'Provinsi',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Province',
                    options: []
                },
                {
                    id: 'regency_id',
                    name: 'regency_id',
                    label: 'Kota / Kabupaten',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Regency',
                    options: []
                },
                {
                    id: 'district_id',
                    name: 'district_id',
                    label: 'Kecamatan',
                    type: 'select',
                    required: true,
                    placeholder: 'Select District',
                    options: [] 
                },
                {
                    id: 'village_id',
                    name: 'village_id',
                    label: 'Kelurahan',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Village',
                    options: [] 
                },
                {
                    id: 'address',
                    type: 'text',
                    name: 'address',
                    label: 'Alamat Lengkap',
                    required: true,
                    placeholder: 'Jl. Contoh No. 123, Kota, Provinsi',
                    locked: true
                },
                {
                    id: 'postal_code',
                    type: 'text',
                    name: 'postal_code',
                    label: 'Kode Pos',
                    required: true,
                    locked: true
                },
                {
                    id: 'reason', 
                    type: 'textarea', 
                    name: 'reason_join_program', 
                    label: 'Alasan Bergabung Program',
                    rows: 3,
                    required: false,
                    placeholder: 'Ingin menambah wawasan',
                    locked: true
                }
            ]
        },
        categories: {
            umkm: {
                id: "umkm",
                name: "UMKM",
                description: "Usaha Mikro, Kecil, dan Menengah",
                icon: "🏢",
                locked: true,
                fields: [
                    {
                        id: 'business_name',
                        type: 'text',
                        name: 'business_name',
                        label: 'Nama Bisnis / Usaha',
                        required: false,
                        placeholder: 'Masukkan nama bisnis / usaha',
                        locked: true
                    },
                    {
                        id: 'business_type',
                        type: 'select',
                        name: 'business_type',
                        label: 'Jenis Bisnis',
                        required: false,
                        options: ['Retail', 'Manufacturing', 'Service', 'Food & Beverage', 'Teknologi'],
                        locked: true
                    },
                    {
                        id: 'business_form',
                        type: 'select',
                        name: 'business_form',
                        label: 'Struktur Badan Usaha',
                        required: false,
                        options: ['Perusahaan Perseorangan', 'Firma', 'CV', 'PT', 'Koperasi'],
                        locked: true
                    },
                    {
                        id: 'business_address',
                        type: 'text',
                        name: 'business_address',
                        label: 'Alamat Usaha',
                        required: false,
                        placeholder: 'Masukkan alamat usaha anda',
                        locked: true
                    },
                    {
                        id: 'established_year',
                        type: 'number',
                        name: 'established_year',
                        label: 'Tahun Berdiri',
                        required: false,
                        placeholder: 'Masukkan tahun berdiri usaha',
                        locked: true
                    },
                    {
                        id: 'monthly_revenue',
                        type: 'select',
                        name: 'monthly_revenue',
                        label: 'Pendapatan Bulanan',
                        required: false,
                        options: ['< Rp 5 juta', 'Rp 5-10 juta', 'Rp 10-50 juta', '> Rp 50 juta'],
                        locked: true
                    },
                    {
                        id: 'employee_count',
                        type: 'number',
                        name: 'employee_count',
                        label: 'Jumlah Karyawan',
                        required: false,
                        placeholder: 'Masukkan jumlah karyawan',
                        locked: true
                    },
                    {
                        id: 'certifications',
                        type: 'text',
                        name: 'certifications',
                        label: 'Nomor Sertifikat Usaha',
                        required: false,
                        placeholder: 'Masukkan nomor sertifikat',
                        locked: true
                    },
                    {
                        id: 'social_media',
                        type: 'text',
                        name: 'social_media',
                        label: 'Sosial Media',
                        required: false,
                        placeholder: 'Masukkan nama sosial media',
                        locked: true
                    },
                    {
                        id: 'marketplace',
                        type: 'text',
                        name: 'marketplace',
                        label: 'Marketplace',
                        required: false,
                        placeholder: 'Masukkan nama marketplace',
                        locked: true
                    },
                    {
                        id: 'website',
                        type: 'text',
                        name: 'website',
                        label: 'Website',
                        required: false,
                        placeholder: 'Masukkan link website',
                        locked: true
                    },
                ]
            },
            mahasiswa: {
                id: "mahasiswa",
                name: "Mahasiswa",
                description: "Pelajar/Mahasiswa Aktif", 
                icon: "🎓",
                locked: true,
                fields: [
                    {
                        id: 'institution',
                        type: 'text',
                        name: 'institution',
                        label: 'Institusi Pendidikan',
                        required: false,
                        placeholder: 'Masukkan nama institusi',
                        locked: true
                    },
                    {
                        id: 'major',
                        type: 'text', 
                        name: 'major',
                        label: 'Jurusan',
                        required: false,
                        placeholder: 'Masukkan nama jurusan',
                        locked: true
                    },
                    {
                        id: 'enrollment_year',
                        type: 'number',
                        name: 'enrollment_year',
                        label: 'Tahun Masuk',
                        required: false,
                        placeholder: 'Masukkan tahun masuk',
                        locked: true
                    },
                    {
                        id: 'semester',
                        type: 'number',
                        name: 'semester',
                        label: 'Semester',
                        required: false,
                        placeholder: 'Masukkan semester saat ini',
                        locked: true
                    },
                    {
                        id: 'career_interest',
                        type: 'text',
                        name: 'career_interest',
                        label: 'Minat Karir',
                        required: false,
                        placeholder: 'Contoh: Data Analyst, Marketing',
                        locked: true
                    },
                    {
                        id: 'core_competency',
                        type: 'text',
                        name: 'core_competency',
                        label: 'Keahlian Utama',
                        required: false,
                        placeholder: 'Contoh: Kepemimpinan, Kreativitas',
                        locked: true
                    }
                ]
            },
            profesional: {
                id: "profesional",
                name: "Profesional",
                description: "Pekerja/Karyawan/Profesional",
                icon: "💼",
                locked: true,
                fields: [
                    {
                        id: 'workplace',
                        type: 'text',
                        name: 'workplace',
                        label: 'Nama Perusahaan',
                        required: false,
                        placeholder: 'Masukkan nama perusahaan',
                        locked: true
                    },
                    {
                        id: 'position',
                        type: 'text',
                        name: 'position',
                        label: 'Posisi/Jabatan',
                        required: false,
                        placeholder: 'Masukkan posisi/jabatan',
                        locked: true
                    },
                    {
                        id: 'work_duration',
                        type: 'text',
                        name: 'work_duration',
                        label: 'Pengalaman Kerja',
                        required: false,
                        placeholder: 'Masukkan lama bekerja',
                        locked: true
                    },
                    {
                        id: 'industry_sector',
                        type: 'text',
                        name: 'industry_sector',
                        label: 'Sektor Industri',
                        required: false,
                        placeholder: 'Contoh: Pendidikan, Keuangan & Perbankan',
                        locked: true
                    },
                    {
                        id: 'skills',
                        type: 'text',
                        name: 'skills',
                        label: 'Keahlian Utama',
                        required: false,
                        placeholder: 'Jelaskan keahlian utama Anda',
                        locked: true
                    }
                ]
            },
            komunitas: {
                id: "komunitas", 
                name: "Komunitas",
                description: "Organisasi/Komunitas",
                icon: "👥",
                locked: true,
                fields: [
                    {
                        id: 'community_name',
                        type: 'text',
                        name: 'community_name',
                        label: 'Nama Komunitas',
                        required: false,
                        placeholder: 'Masukkan nama komunitas',
                        locked: true
                    },
                    {
                        id: 'community_role',
                        type: 'text',
                        name: 'community_role',
                        label: 'Peran dalam Komunitas',
                        required: false,
                        placeholder: 'Masukkan peran Anda',
                        locked: true
                    },
                    {
                        id: 'member_count',
                        type: 'number',
                        name: 'member_count',
                        label: 'Jumlah Anggota',
                        required: false,
                        placeholder: 'Masukkan jumlah anggota',
                        locked: true
                    },
                    {
                        id: 'focus_area',
                        type: 'text',
                        name: 'focus_area',
                        label: 'Area Fokus',
                        required: false,
                        placeholder: 'Contoh: Pendidikan, Lingkungan, Teknologi',
                        locked: true
                    },
                    {
                        id: 'operational_area',
                        type: 'select',
                        name: 'operational_area',
                        label: 'Area Operasional',
                        required: false,
                        options: ['Lokal', 'Nasional', 'Internasional'],
                        locked: true
                    }
                ]
            },
            umum: {
                id: "umum", 
                name: "Umum",
                description: "Umum",
                icon: "👤",
                locked: true,
                fields: [
                    {
                        id: 'areas_interest',
                        type: 'select',
                        name: 'areas_interest',
                        label: 'Bidang Minat',
                        required: false,
                        options: ['Teknologi & Informatika', 'Bisnis & Manajemen', 'Keuangan & Akuntansi', 'Desain & Kreatif', 'Ilmu Sosial & Humaniora', 'Sains & Teknik', 'Kesehatan', 'Pendidikan', 'Bahasa & Komunikasi', 'Hukum & Administrasi Publik'],
                        locked: true
                    },
                ]
            }
        }
    });

    export const FIELD_TYPES = {
        TEXT: 'text',
        EMAIL: 'email',
        NUMBER: 'number',
        SELECT: 'select',
        TEXTAREA: 'textarea',
        DATE: 'date',
        PROGRAM_DROPDOWN: 'program_dropdown'
    };

    export const CATEGORIES = {
        UMKM: 'umkm',
        MAHASISWA: 'mahasiswa',
        PROFESIONAL: 'profesional',
        KOMUNITAS: 'komunitas',
        UMUM: 'umum'
    };