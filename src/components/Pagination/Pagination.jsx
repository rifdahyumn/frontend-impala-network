import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage = 20, onPageChange, disabled = false }) => {
    const handlePageChange = (page) => {
        if (!disabled && page >= 1 && page <= totalPages) {
            onPageChange(page)
        }
    }

    const getVisiblePages = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages)
            } else if (currentPage >= totalPages - 1) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
            }
        }

        return pages
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className="flex flex-row items-center justify-between gap-4 w-full">
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                Showing <span className="font-semibold">{startItem}</span> to{' '}
                <span className="font-semibold">{endItem}</span> of{' '}
                <span className="font-semibold">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={disabled || currentPage === 1}
                    className='h-8 w-8'
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                {getVisiblePages().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size='icon'
                            className='h-8 w-8 min-h-8'
                            onClick={() => handlePageChange(page)}
                            disabled={disabled}
                        >
                            {page}
                        </Button>  
                    )
                ))}

                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={disabled || currentPage === totalPages}
                    className='h-8 w-8'
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export default Pagination;