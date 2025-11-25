import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // const [notifications, setNotifications] = useState(3)
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            logout()
            navigate('/login')
        }
    }

    // ✅ PERBAIKI: Navigate ke /account-settings untuk membuka account settings
    const handleSettings = () => navigate('/account-settings');

    const getInitials = (name) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const formatPosition = (position) => {
        if (!position) return 'User'

        return position
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const getShortName = (name) => {
        if (!name) return 'User'

        const words = name.split(' ')
        if (words.length <= 2) {
            return name
        }

        return words.slice(0, 2).join(' ')
    }

    const formatRole = (role) => {
        if (!role) return 'User'

        return role
            .split('_')
            .map(word => {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            })
            .join(' ')
    }

    return (
        <div
            className={`fixed top-0 left-80 right-0 z-30 bg-white/90 backdrop-blur-md border-b transition-all duration-300 ${
            isScrolled 
                ? 'border-gray-300 shadow-lg' 
                : 'border-gray-200 shadow-sm'
        }`}>
            <div className='flex justify-between items-center p-4'>
                <div className="flex items-center gap-4">
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Hello {user?.full_name || 'User'}
                    </h1>
                    <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                    >
                        {user?.position ? formatPosition(user.position) : 'User'}
                    </Badge>
                </div>  

                <div className='flex items-center gap-4'>
                    {/* <Button
                        variant="ghost"
                        icon="icon"
                        className="relative h-10 w-10 rounded-lg hover:bg-amber-50"
                        onClick={handleNotifications}
                    >
                        <Bell className="h-5 w-5 text-amber-600" />
                        {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                {notifications}
                            </span>
                        )}
                    </Button> */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-12 px-4 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-amber-200 group-hover:border-amber-300 transition-colors">
                                        <AvatarImage alt="profil" />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white font-semibold">
                                            {getInitials(user?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col items-start mr-2">
                                        <span className="text-xs text-gray-500">
                                            {formatRole(user?.role)}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-amber-600 transition-transform group-data-[state=open]:rotate-180" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-64 bg-white/95 backdrop-blur-sm border-amber-100 shadow-xl rounded-xl"
                            align="end"
                            forceMount
                        >
                            <DropdownMenuLabel className="font-normal p-0">
                                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-xl border-b border-amber-100">
                                    <Avatar className="h-12 w-12 border-2 border-amber-200">
                                        <AvatarImage alt="profil" />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white font-semibold text-lg">
                                            {getInitials(user?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col flex-1">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {getShortName(user?.full_name)}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            {user?.email}
                                        </p>
                                        <p className="text-xs text-amber-600 font-medium mt-1">
                                            {user?.position ? formatPosition(user.position) : 'User'}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-amber-100" />

                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    className="flex items-center gap-3 py-3 cursor-pointer text-gray-700 hover:bg-amber-50 focus:bg-amber-50 transition-colors"
                                    onClick={handleSettings}
                                >
                                    <Settings className="h-4 w-4 text-amber-600" />
                                    <span>Account Settings</span>
                                    <DropdownMenuShortcut></DropdownMenuShortcut>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-amber-100" />

                                <DropdownMenuItem
                                    className="flex items-center gap-3 py-3 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Log Out</span>
                                    <DropdownMenuShortcut></DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}

export default Header;