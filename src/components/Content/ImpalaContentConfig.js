import { User, Mail, Phone, Calendar, GraduationCap, MapPin, Building, Award, DollarSign, Users, CheckCircle, Globe, School, Briefcase, Users as UsersIcon } from "lucide-react";

const memberTypeConfigs = {
    umkm: [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                // { key: 'nik', label: 'NIK', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'date_of_birth', label: 'Date Of Birth', icon: Calendar },
                // { key: 'education', label: 'Education', icon: GraduationCap },
                { key: 'program_name', label: 'Program Name', icon: Award },
                // { key: 'status', label: 'Status', icon: CheckCircle }
            ]
        },
        {
            category: 'Personal Address',
            icon: MapPin,
            fields: [
                { key: 'address', label: 'Address', icon: MapPin },
                // { key: 'subdistrict', label: 'Subdistrict', icon: MapPin },
                { key: 'city', label: 'City', icon: MapPin },
                { key: 'province', label: 'Province', icon: MapPin },
                // { key: 'postalCode', label: 'Postal Code', icon: MapPin }
            ]
        },
        {
            category: 'Business Information',
            icon: Building,
            fields: [
                { key: 'bussinessName', label: 'Business Name', icon: Building },
                { key: 'business', label: 'Business Type', icon: Building },
                { key: 'bussinessAddress', label: 'Business Address', icon: MapPin },
                { key: 'bussinessForm', label: 'Business Form', icon: Building },
                { key: 'establishedYear', label: 'Established Year', icon: Calendar },
                { key: 'certifications', label: 'Certifications', icon: Award }
            ]
        },
        {
            category: 'Business Performance',
            icon: DollarSign,
            fields: [
                { key: 'monthly_revenue', label: 'Monthly Revenue', icon: DollarSign },
                { key: 'total_employee', label: 'Total Employee', icon: Users },
                { key: 'hasOrganizationStructur', label: 'Has Organization Structure', icon: CheckCircle }
            ]
        },
        {
            category: 'Digital Presence',
            icon: Globe,
            fields: [
                { key: 'sosialMedia', label: 'Social Media', icon: Globe },
                { key: 'marketplace', label: 'Marketplace', icon: Globe },
                // { key: 'google_bussiness', label: 'Google Business', icon: Globe },
                { key: 'website', label: 'Website', icon: Globe }
            ]
        }
    ],

    mahasiswa: [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'date_of_birth', label: 'Date Of Birth', icon: Calendar },
                { key: 'program_name', label: 'Program Name', icon: Award },
                { key: 'reason_join_program', label: 'Reason Join Program', icon: Award }
            ]
        },
        {
            category: 'Personal Address',
            icon: MapPin,
            fields: [
                { key: 'address', label: 'Address', icon: MapPin },
                { key: 'city', label: 'City', icon: MapPin },
                { key: 'province', label: 'Province', icon: MapPin }
            ]
        },
        {
            category: 'Academic Information',
            icon: School,
            fields: [
                { key: 'institution', label: 'Institution', icon: School },
                { key: 'major', label: 'Major', icon: GraduationCap },
                { key: 'enrollment_year', label: 'Enrollment Year', icon: Calendar },
                { key: 'career_interest', label: 'Career Interest', icon: Briefcase },
                { key: 'core_competency', label: 'Core Competency', icon: Award }
            ]
        }
    ],

    profesional: [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'date_of_birth', label: 'Date Of Birth', icon: Calendar },
                { key: 'program_name', label: 'Program Name', icon: Award },
                { key: 'reason_join_program', label: 'Reason Join Program', icon: Award }
            ]
        },
        {
            category: 'Personal Address',
            icon: MapPin,
            fields: [
                { key: 'address', label: 'Address', icon: MapPin },
                { key: 'city', label: 'City', icon: MapPin },
                { key: 'province', label: 'Province', icon: MapPin }
            ]
        },
        {
            category: 'Professional Information',
            icon: Briefcase,
            fields: [
                { key: 'workplace', label: 'Workplace', icon: Building },
                { key: 'position', label: 'Position', icon: User },
                { key: 'work_duration', label: 'Work Duration', icon: Calendar },
                { key: 'industry_sector', label: 'Industry Sector', icon: Briefcase }
            ]
        }
    ],

    komunitas: [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'date_of_birth', label: 'Date Of Birth', icon: Calendar },
                { key: 'program_name', label: 'Program Name', icon: Award },
                { key: 'reason_join_program', label: 'Reason Join Program', icon: Award }
            ]
        },
        {
            category: 'Personal Address',
            icon: MapPin,
            fields: [
                { key: 'address', label: 'Address', icon: MapPin },
                { key: 'city', label: 'City', icon: MapPin },
                { key: 'province', label: 'Province', icon: MapPin }
            ]
        },
        {
            category: 'Community Information',
            icon: UsersIcon,
            fields: [
                { key: 'name_community', label: 'Community Name', icon: UsersIcon },
                { key: 'focus_area', label: 'Focus Area', icon: Award },
                { key: 'total_members', label: 'Total Members', icon: Users },
                { key: 'operational_area', label: 'Operational Area', icon: MapPin }
            ]
        }
    ]
};

export const useDetailFields = () => {
    const getDetailFields = (selectedMember) => {
        if (!selectedMember) return [];
        
        const category = selectedMember.category;
        
        if (category?.includes('UMKM') || category?.includes('Usaha') || category?.includes('Wirausaha') || category?.includes('StartUp')) {
            return memberTypeConfigs.umkm;
        }
        
        if (category?.includes('Mahasiswa') || category?.includes('Pelajar') || category?.includes('Pemuda')) {
            return memberTypeConfigs.mahasiswa;
        }
        
        if (category?.includes('Profesional') || category?.includes('Karyawan') || category?.includes('ASN') || category?.includes('BUMN')) {
            return memberTypeConfigs.profesional;
        }
        
        if (category?.includes('Komunitas') || category?.includes('Asosiasi') || category?.includes('Organisasi')) {
            return memberTypeConfigs.komunitas;
        }
        
        return memberTypeConfigs.umkm;
    };

    return { getDetailFields };
};