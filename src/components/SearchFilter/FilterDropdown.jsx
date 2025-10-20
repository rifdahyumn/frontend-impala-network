import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import React from "react"

const FilterDropdown = () => {
    return (
        <Select>
            <SelectTrigger className="w-48">
                <SelectValue  placeholder="Type of Bussiness" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='All'>All Bussiness</SelectItem>
                <SelectItem value='Retail'>Retail</SelectItem>
                <SelectItem value='Otomotif'>Otomotif</SelectItem>
            </SelectContent>
        </Select>
    )
}

export default FilterDropdown;