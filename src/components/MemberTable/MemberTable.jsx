import React from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import MemberTableRow from "./MemberTableRow";

const MemberTable = ({ members, onSelectMember }) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader className='bg-amber-50'>
                    <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>No Whatsapp</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Date of birth</TableHead>
                        <TableHead className='w-20'>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <MemberTableRow
                        key={member.id}
                        member={member}
                        onSelect={onSelectMember}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default MemberTable;