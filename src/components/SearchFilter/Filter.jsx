import { Filter } from "lucide-react"; // ✅ Jangan lupa import Filter
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import React from "react";

const FilterButton = ({ 
    onFilterChange, 
    filterOptions, 
    activeFilter,
    buttonText = "Filter",
    variant = "default"
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* ✅ TOMBOL HARUS ADA DI SINI */}
                <Button 
                    className='flex items-center gap-2 transition-all duration-200' 
                    variant={activeFilter ? "default" : variant}
                    size="default"
                >
                    <Filter className="h-4 w-4" />
                    {buttonText}
                    {/* ❌ ChevronDown sudah dihapus */}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="w-56 border shadow-lg"
            >
                {/* ... konten dropdown lainnya ... */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default FilterButton;