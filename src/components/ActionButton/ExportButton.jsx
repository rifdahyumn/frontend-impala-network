import { Download } from "lucide-react";
import { Button } from "../ui/button";
import React from "react"

const ExportButton = () => {
    return (
        <Button variant='outline' className='flex items-center gap-2'>
            <Download className="h-4 w-4" />
            Export Data
        </Button>
    )
}

export default ExportButton;