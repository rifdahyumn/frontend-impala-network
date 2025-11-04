// src/components/MemberTable/MemberTable.jsx
import React from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import MemberTableRow from "./MemberTableRow";

const MemberTable = ({ members, headers, onSelectMember }) => {

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader className='bg-amber-50'>
                    <TableRow>
                        {headers.map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <MemberTableRow
                            key={member.id}
                            member={member}
                            headers={headers}
                            onSelect={onSelectMember}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default MemberTable;