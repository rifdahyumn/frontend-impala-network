import React from "react";
import { TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";
import { Badge } from "../ui/badge";

const MemberTableRow = ({ member, onSelect }) => {
    return (
        <TableRow
            onClick={() =>  onSelect(member)}
            className='cursor-pointer hover:bg-gray-50/50'
        >
            <TableCell className='font-medium'>{member.id}</TableCell>
            <TableCell className='font-medium'>{member.fullName}</TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>{member.whatsapp}</TableCell>
            <TableCell>{member.gender}</TableCell>
            <TableCell>{member.dateOfBirth}</TableCell>
            <TableCell>
                <Badge
                    variant={member.action === 'Detail' ? 'default' : 'secondary'}
                    className='text-xs'
                >
                    {member.action}
                </Badge>
            </TableCell>
        </TableRow>
    )
}

export default MemberTableRow;