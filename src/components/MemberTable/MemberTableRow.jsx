import React from "react";
import { TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format, isToday, isYesterday } from "date-fns";

const MemberTableRow = ({ member, headers, onSelect }) => {
    const renderCellContent = (header, member) => {

        const fieldMap = {
            'No': 'no',
            'Full Name': 'full_name',
            'Member ID' : 'member_id',
            'NIK': 'nik',
            'Email': 'email',
            'Username': 'username',
            'Password': 'password',
            'Date Of Birth': 'date_of_birth',
            'Education': 'education',
            'Employee ID': 'employee_id',
            'Role': 'role',
            'Avatar': 'avatar',
            'Last Login': 'last_login',
            'Phone': 'phone',
            'Company': 'company',
            'Client Company': 'client_company',
            'Client': 'client',
            'Established Year': 'establishedYear',
            'Industry': 'industry',
            'Program Name': 'program_name',
            'Business Name': 'business_name',
            'Category': 'category',
            'Status': 'status',
            // 'Deal': 'deal_size',
            'Gender': 'gender',
            'Email Verified': 'emailVerified',
            'Two Factor Enabled': 'twoFactorEnabled',
            'Has Organization Structur': 'hasOrganizationStructur',
            'Sosial Media': 'sosialMedia',
            'Marketplace': 'marketplace',
            'Google Bussiness': 'google_bussiness',
            'Website': 'website',
            'Owner Photo': 'ownerPhoto',
            'Bussiness Logo': 'bussinessLogo',
            'Product Photo': 'productPhoto',
            'Login Attempts': 'login_attempts',
            'Business Type': 'business',
            'Total Employee': 'total_employee',
            'Address': 'address',
            'Bussiness Address': 'bussinessAddress',
            'Bussiness Form': 'bussinessForm',
            'Certifications': 'certifications',
            'Monthly Revenue': 'monthly_revenue',
            'Subdistrict': 'subdistrict',
            'City': 'city',
            'Province': 'province',
            'Postal Code': 'postalCode',
            'Country': 'country',
            'Position': 'position',
            'Join Date': 'joinDate',
            'Duration': 'duration',
            'Start Date': 'start_date',
            'End Date': 'end_date',
            'Price': 'price',
            'Capacity': 'capacity',
            'Instructors': 'Instructor',
            'Location': 'location',
            'Description': 'description',
            'Tags': 'tags',
            'Institution': 'institution',
            'Enrollment year': 'enrollment_year',
            'Career Interest': 'career_interest',
            'Workplace': 'workplace',
            'Work Duration': 'work_duration',
            'Industry Sector': 'industry_sector',
            'Reason Join Program': 'reason_join_program',
            'Name Community': 'community_name',
            'Focus Area': 'focus_area',
            'Total Members': 'total_members',
            'Operational Area': 'operational_area',
            'Action': 'action',
            'Entity': 'entity',
            'Maneka':'maneka',
            'Rembug':'rembug',
            'Event Space':'eventSpace',
            'Private Office':'privateOffice',
            'Additional Information':'addInformation'
        }

        const field = fieldMap[header];
        const value = member[field];

        switch (header) {
            case 'Entity': {
                const category = member?.category;
                
                if (category?.includes('UMKM') || category?.includes('Usaha') || category?.includes('Wirausaha') || category?.includes('StartUp')) {
                    return member.business_name || '-';
                }

                if (category?.includes('Mahasiswa') || category?.includes('Pelajar') || category?.includes('Pemuda')) {
                    return member.institution || '-';
                }

                if (category?.includes('Profesional') || category?.includes('Karyawan') || category?.includes('ASN') || category?.includes('BUMN')) {
                    return member.workplace || '-'
                }

                if (category?.includes('Komunitas') || category?.includes('Asosiasi') || category?.includes('Organisasi')) {
                    return member.community_name || '-'
                }

                return '-'
            }
               

            case 'Duration':
                return member.duration || '-'

            case 'Action':
                return (
                    <Badge
                        variant="default"
                        className="text-xs bg-amber-500 hover:bg-amber-400 text-white cursor-pointer"
                    >
                        Detail
                    </Badge>
                );
            
            case 'Status':
                return (
                    <Badge
                        variant={value === 'Active' ? 'default' : 'secondary'}
                        className={
                            value === 'Active' ? 
                            'bg-green-100 text-green-800 hover:bg-green-200' : 
                            'bg-red-100 text-red-800 hover:bg-red-200'
                        }
                    >
                        {value}
                    </Badge>
                );

            case 'Last Login': {
                if (!value) return 'Never logged in';

                const loginDate = new Date(value)

                if (isToday(loginDate)) {
                    return 'Today ' + format(loginDate, 'hh:mm a')
                } else if (isYesterday(loginDate)) {
                    return 'Yesterday ' + format(loginDate, 'hh:mm a')
                } else {
                    const daysDiff = Math.floor((new Date() - loginDate) / (1000 * 60 * 60 * 24))
                    if (daysDiff < 7) {
                        return `${daysDiff} days ago`
                    } else {
                        return format(loginDate, 'MM dd, yyyy')
                    }
                }
            }

            case 'Salary':
                if (typeof value === 'number') {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                    }).format(value);
                }
                return value;

            case 'Join Date':
                if (value) {
                    return new Date(value).toLocaleDateString('id-ID');
                }
                return value;

            default:
                return value || '-';
        }
    };

    return (
        <TableRow
            onClick={() => onSelect(member)}
            className='cursor-pointer hover:bg-gray-50/50 transition-colors'
        >
            {headers.map((header, index) => (
                <TableCell key={index} className="py-3">
                    {renderCellContent(header, member)}
                </TableCell>
            ))}
        </TableRow>
    )
}

export default MemberTableRow;