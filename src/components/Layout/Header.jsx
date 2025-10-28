import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Header = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(3)
    const [isScrolled, setIsScrolled] = useState(false);

    // Effect untuk menambah shadow saat scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => navigate('/login')
    const handleSettings = () => navigate('/');
    const handleNotifications = () => navigate('/');

    return (
        <div
            className={`fixed top-0 left-80 right-0 z-30 bg-white/90 backdrop-blur-md border-b transition-all duration-300 ${
            isScrolled 
                ? 'border-gray-300 shadow-lg' 
                : 'border-gray-200 shadow-sm'
        }`}>
            <div className='flex justify-between items-center p-4'>
                <div className="flex items-center gap-4">
                    <h1 className='text-3xl font-bold text-gray-900'>Hello Faiz</h1>
                    <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                    >
                        Manager IT
                    </Badge>
                </div>  

                <div className='flex items-center gap-4'>
                    <Button
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
                    </Button>

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
                                            FA
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col items-start mr-2">
                                        <span className="text-sm font-semibold text-gray-800">Faiz</span>
                                        <span className="text-xs text-gray-500">Admin</span>
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
                                    <div className="flex flex-col flex-1">
                                        <p className="text-sm font-semibold text-gray-900">Muhammad Faiz</p>
                                        <p className="text-xs text-gray-600 mt-0.5">faiz@impala.com</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-amber-100" />

                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    className="flex items-center gap-3 py-3 cursor-pointer text-gray-700 hover:bg-amber-50 focus:bg-amber-50"
                                    onClick={handleSettings}
                                >
                                    <Settings className="h-4 w-4 text-gray-500" />
                                    <span>Account Setting</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-amber-100" />

                                <DropdownMenuItem
                                    className="flex items-center gap-3 py-3 cursor-pointer text-gray-700 hover:bg-amber-50 focus:bg-amber-50"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 text-gray-500" />
                                    <span>Log Out</span>
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