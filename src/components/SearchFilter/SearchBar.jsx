import { Search } from "lucide-react";
import { Input } from "../ui/input";
import React from "react"

const SearchBar = () => {
    return (
        <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
                type="text"
                placeholder="Search"
                className="pl-10"
            />
        </div>
    )
}

export default SearchBar;