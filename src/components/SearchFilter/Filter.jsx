import { Filter } from "lucide-react"
import { Button } from "../ui/button"
import React from "react"

const FilterButton = () => {
    return (
        <Button className='flex items-center gap-2'>
            <Filter className="h-4 w-4" />
            Filter
        </Button>
    )
}

export default FilterButton;