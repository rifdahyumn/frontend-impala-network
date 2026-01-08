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
<<<<<<< HEAD
    variant = "default"
=======
    variant = "default" 
>>>>>>> c51e5c1beb7040812bb33a425fd6cdfc5b58ac6f
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* ✅ TOMBOL HARUS ADA DI SINI */}
                <Button 
                    className='flex items-center gap-2 transition-all duration-200' 
<<<<<<< HEAD
                    variant={activeFilter ? "default" : variant}
=======
                    variant={activeFilter ? "default" : variant} 
>>>>>>> c51e5c1beb7040812bb33a425fd6cdfc5b58ac6f
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
<<<<<<< HEAD
                {/* ... konten dropdown lainnya ... */}
=======
                <DropdownMenuLabel className="font-semibold text-gray-900">
                    Filter Options
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                    onClick={() => onFilterChange(null)}
                    className={`flex items-center gap-2 cursor-pointer transition-colors ${
                        !activeFilter 
                            ? "bg-blue-50 text-blue-700 font-medium" 
                            : "hover:bg-gray-50"
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${!activeFilter ? "bg-blue-600" : "bg-gray-300"}`} />
                    All Items
                </DropdownMenuItem>
                
                {filterOptions?.map((option) => (
                    <DropdownMenuItem 
                        key={option.value}
                        onClick={() => onFilterChange(option.value)}
                        className={`flex items-center gap-2 cursor-pointer transition-colors ${
                            activeFilter === option.value 
                                ? "bg-blue-50 text-blue-700 font-medium" 
                                : "hover:bg-gray-50"
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${
                            activeFilter === option.value ? "bg-blue-600" : "bg-gray-300"
                        }`} />
                        {option.label}
                    </DropdownMenuItem>
                ))}
                
                {activeFilter && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => onFilterChange(null)}
                            className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Clear Filter
                        </DropdownMenuItem>
                    </>
                )}
>>>>>>> c51e5c1beb7040812bb33a425fd6cdfc5b58ac6f
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default FilterButton;