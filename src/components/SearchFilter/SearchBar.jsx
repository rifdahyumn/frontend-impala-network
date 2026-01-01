import { Search } from "lucide-react";
import { Input } from "../ui/input";
import React, { useState } from "react";

const SearchBar = ({ onSearch, placeholder = "Search...", value }) => {
    // const [query, setQuery] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
                type="text"
                placeholder={placeholder}
                className="pl-10"
                value={value}
                onChange={handleChange}
            />
        </form>
    );
};

export default SearchBar;