import { User, Mail, Phone, Calendar, Clock, GraduationCap, MapPin, Building, Award, DollarSign, Users, CheckCircle, Globe, School, Briefcase, Users as UsersIcon } from "lucide-react";

const memberTypeConfigs = {
    umkm: [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'date_of_birth', label: 'Date Of Birth', icon: Calendar },
                { key: 'age', label: 'Age', icon: Clock },
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
                { key: 'province', label: 'Province', icon: MapPin },
            ]
        },
        {
            category: 'Business Information',
            icon: Building,
            fields: [
                { key: 'business_name', label: 'Business Name', icon: Building },
                { key: 'business_type', label: 'Business Type', icon: Building },
                { key: 'business_address', label: 'Business Address', icon: MapPin },
                { key: 'business_form', label: 'Business Form', icon: Building },
                { key: 'established_year', label: 'Established Year', icon: Calendar },
                { key: 'monthly_revenue', label: 'Monthly Revenue', icon: DollarSign },
                { key: 'employee_count', label: 'Total Employee', icon: Users },
                { key: 'certifications', label: 'Certifications', icon: Award }
            ]
        },
        {
            category: 'Digital Presence',
            icon: Globe,
            fields: [
                { key: 'social_media', label: 'Social Media', icon: Globe },
                { key: 'marketplace', label: 'Marketplace', icon: Globe },
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
                { key: 'age', label: 'Age', icon: Clock },
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
                { key: 'semester', label: 'Semester', icon: GraduationCap },
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
                { key: 'age', label: 'Age', icon: Clock },
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
                { key: 'industry_sector', label: 'Industry Sector', icon: Briefcase },
                { key: 'skills', label: 'Skills', icon: Award }
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
                { key: 'age', label: 'Age', icon: Clock },
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
                { key: 'community_name', label: 'Name Community', icon: UsersIcon },
                { key: 'focus_area', label: 'Focus Area', icon: Award },
                { key: 'member_count', label: 'Total Members', icon: Users },
                { key: 'operational_area', label: 'Operational Area', icon: MapPin },
                { key: 'community_role', label: 'Peran Dalam Komunitas', icon: Users },
            ]
        }
    ],

    umum: [
        {
            category: 'Personal Information',
            icon: User,
            fields: [
                { key: 'full_name', label: 'Full Name', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'gender', label: 'Gender', icon: User },
                { key: 'date_of_birth', label: 'Date Of Birth', icon: Calendar },
                { key: 'age', label: 'Age', icon: Clock },
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