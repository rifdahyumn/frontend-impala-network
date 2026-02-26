import React from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import MemberTableRow from "./MemberTableRow";

const MemberTable = ({ members, headers, onSelectMember, isLoading = false }) => {

    if (isLoading) {
        return (
            <div className="rounded-md border p-8 text-center">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
            </div>
        );
    }

    if (!members || members.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center">
                <p className="text-gray-500">No users found</p>
            </div>
        );
    }

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
                    {members.map((member, index) => (
                        <MemberTableRow
                            key={member.id || `member-${index}`}
                            member={member}
                            headers={headers}
                            onSelect={onSelectMember}
                            index={index}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default MemberTable;