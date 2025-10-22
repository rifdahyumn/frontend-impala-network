import React from "react";
import { TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

const MemberTableRow = ({ member, headers, onSelect }) => {
    const renderCellContent = (header, member) => {

        const fieldMap = {
            'No': 'id',
            'ID': 'id',
            'Full Name': 'fullName',
            'Email': 'email',
            'Phone': 'phone',
            'Company': 'company',
            'Industry': 'industry',
            'Program': 'program',
            'Status': 'status',
            'Deal': 'dealSize',
            'Gender': 'gender',
            'Business Type': 'business',
            'Company Size': 'companySize',
            'Address': 'address',
            'City': 'city',
            'Country': 'country',
            'Position': 'position',
            'Join Date': 'joinDate',
            'Action': 'action'
        };

        const field = fieldMap[header];
        const value = member[field];

        switch (header) {
            case 'Action':
                return (
                    <Badge
                        variant="default"
                        className="text-xs bg-amber-400 hover:bg-amber-500 text-white cursor-pointer"
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