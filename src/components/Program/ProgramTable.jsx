import React, { useMemo } from 'react';
import { Loader2, Users, Plus, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import MemberTable from "../MemberTable/MemberTable";
import Pagination from "../Pagination/Pagination";
import { CheckSquare } from "lucide-react";

const ProgramTable = ({
    programs,
    pagination,
    loading,
    isImporting,
    isShowAllMode,
    handleSelectProgram,
    handlePageChange,
    handleClearAllFilters,
    filters,
    getDisplayStatus
}) => {
    const formattedPrograms = useMemo(() => {
        return programs.map((program, index) => {
            const itemNumber = isShowAllMode() 
                ? index + 1
                : (pagination.page - 1) * pagination.limit + index + 1;
            
            return {
                id: program.id,
                no: itemNumber,
                program_name: program.program_name,
                category: program.category,
                status: getDisplayStatus(program), 
                duration: program.duration,
                start_date: program.start_date,
                end_date: program.end_date,
                price: program.price,
                client: program.client,
                action: 'Detail',
                ...program
            };
        });
    }, [programs, pagination.page, pagination.limit, isShowAllMode, getDisplayStatus]);

    const getTotalActiveCriteria = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    }, [filters]);

    if (loading && programs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading programs...</span>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
            </div>
        );
    }

    if (programs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-700">
                        No programs found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        {getTotalActiveCriteria > 0 
                            ? "No programs match your current filters. Try adjusting your criteria."
                            : "Get started by adding your first program."
                        }
                    </p>
                </div>
                {getTotalActiveCriteria > 0 ? (
                    <Button 
                        className="flex items-center gap-2"
                        onClick={handleClearAllFilters}
                        variant="outline"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Clear Filters
                    </Button>
                ) : (
                    <Button 
                        className="flex items-center gap-2"
                        onClick={() => {}} 
                        variant="outline"
                    >
                        <Plus className="h-4 w-4" />
                        Add Your First Program
                    </Button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Updating data...</span>
                        </div>
                    </div>
                )}
                
                <MemberTable
                    members={formattedPrograms}
                    onSelectMember={handleSelectProgram}
                    headers={['No', 'Program Name', 'Client', 'Category', 'Status', 'Duration', 'Price', 'Action']}
                    isLoading={loading || isImporting}
                    formatFields={{
                        price: (value) => {
                            if (!value) return '-';
                            if (value.includes('Rp.')) return value;
                            
                            const numericValue = value.toString().replace(/\D/g, '');
                            if (numericValue === '') return '-';
                            
                            const numberValue = parseInt(numericValue);
                            if (isNaN(numberValue)) return '-';
                            
                            const formatted = numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                            return `Rp. ${formatted}`;
                        }
                    }}
                />
            </div>

            <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                {!isShowAllMode() && pagination.totalPages > 1 ? (
                    <Pagination 
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={handlePageChange}
                        disabled={loading || isImporting}
                    />
                ) : isShowAllMode() ? (
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        All results shown in one page
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default ProgramTable;