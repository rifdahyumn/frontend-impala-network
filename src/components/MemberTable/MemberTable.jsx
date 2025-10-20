import React from "react"
import { Table, TableHead, TableHeader, TableRow } from "../ui/table";

const MemberTable = () => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead></TableHead>
                        <TableHead>FullName</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>No Whatsapp</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Date of birth</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
            </Table>
        </div>
    )
}

export default MemberTable;