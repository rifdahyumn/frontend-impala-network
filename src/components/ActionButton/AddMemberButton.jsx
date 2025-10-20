import { Plus } from "lucide-react"
import { Button } from "../ui/button"
import React from "react"

const AddMemberButton = () => {
    return (
        <Button className='flex items-center gap-2'>
            <Plus className="h-4 w-4" />
            Add Member
        </Button>
    )
}

export default AddMemberButton