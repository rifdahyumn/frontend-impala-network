import { ChevronDown, User } from "lucide-react"

const Header = () => {
    return (
        <div className='mb-6 flex justify-between'>
            <h1 className='text-3xl font-bold text-gray-900'>Hello Faiz</h1>
            <div className='flex items-center justify-center gap-4 mr-4'>
                <User className='text-amber-400 text-lg' />
                <h2 className='text-lg font-semibold'>Faiz</h2>
                <ChevronDown className='text-amber-400 text-lg' />
            </div>
        </div>
    )
}

export default Header;