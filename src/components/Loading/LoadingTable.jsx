import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const LoadingTable = ({ columns = 5, rows = 5, showHeader = true }) => {
    return (
        <div className="rounded-md border">
            <Table>
                {showHeader && (
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            {Array.from({ length: columns }).map((_, index) => (
                                <TableHead key={index}>
                                    <LoadingSkeleton type="text" className="w-3/4" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                )}
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <LoadingSkeleton type="text" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default LoadingTable;