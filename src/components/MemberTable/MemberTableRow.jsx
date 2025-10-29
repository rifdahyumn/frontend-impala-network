import React from "react";
import { TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

const MemberTableRow = ({ member, headers, onSelect }) => {
    const renderCellContent = (header, member) => {

        const fieldMap = {
            'No': 'no',
            'Full Name': 'full_name',
            'NIK': 'nik',
            'Email': 'email',
            'Username': 'username',
            'Password': 'password',
            'Date Of Birth': 'dateOfBirth',
            'Education': 'education',
            'Employee ID': 'employeeId',
            'Role': 'role',
            'Avatar': 'avatar',
            'Last Login': 'lastLogin',
            'Phone': 'phone',
            'Company': 'company',
            'Established Year': 'establishedYear',
            'Industry': 'industry',
            'Program Name': 'programName',
            'Program Code': 'programCode',
            'Bussiness Name': 'bussinessName',
            'Category': 'category',
            'Status': 'status',
            'Deal': 'deal_size',
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
            'Login Attempts': 'loginAttempts',
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
            'Start Date': 'startDate',
            'End Date': 'endDate',
            'Price': 'price',
            'Capacity': 'capacity',
            'Instructor': 'Instructor',
            'Location': 'location',
            'Description': 'description',
            'Tags': 'tags',
            'Action': 'action'
        };

        const field = fieldMap[header];
        const value = member[field];

        switch (header) {
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