import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

const Pagination = () => {
    return (
        <div className="flex items-center justify-between">
            {/* <div className="text-sm text-gray-600">
                Display 1 to 10 of 200 data
            </div> */}

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {[1, 2, 3, 4, 5].map((page) => (
                    <Button
                        key={page}
                        variant={page === 1 ? 'default' : 'outline'}
                        size='icon'
                        className='w-8 h-8'
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    size="icon"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default Pagination;