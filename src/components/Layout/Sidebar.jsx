import { Phone, ClipboardList, BarChart3, Building2, FileSpreadsheet, User, Home, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { RiDashboardFill } from "react-icons/ri";
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isHeteroOpen, setIsHeteroOpen] = useState(false)
    const { user } = useAuth()

    const menuItems = 
        user?.role === 'komunitas'
            ? [
                {
                    icon: Building2,
                    label: 'Hetero Management',
                    path: '/hetero',
                    hasSubmenu: true,
                    submenu: [
                        { label: 'Hetero Semarang', path: '/hetero/semarang' },
                        { label: 'Hetero Surakarta', path: '/hetero/surakarta' },
                        { label: 'Hetero Banyumas', path: '/hetero/banyumas' }
                    ]
                }
            ]
            :
            [
                { icon: Home, label: 'Home', path: '/' },
                { icon: Phone, label: 'Client', path: '/client' },
                { icon: ClipboardList, label: 'Program', path: '/program' },
                { icon: BarChart3, label: 'Impala Management', path: '/impala' },

                ...(user?.role !== 'manajer_program'
                    ? [
                        {
                            icon: Building2,
                            label: 'Hetero Management',
                            path: '/hetero',
                            hasSubmenu: true,
                            submenu: [
                                { label: 'Hetero Semarang', path: '/hetero/semarang' },
                                { label: 'Hetero Surakarta', path: '/hetero/surakarta' },
                                { label: 'Hetero Banyumas', path: '/hetero/banyumas' }
                            ]
                        }
                    ]
                    : []
                ),

                { icon: FileSpreadsheet, label: 'Form Builder', path: '/form-builder' },

                ...(user?.role === 'admin'
                    ? [{ icon: User, label: 'Account', path: '/user' }]
                    : []
                )
            ];


    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(path)
    }

    const toggleHeteroSubmenu = () => {
        setIsHeteroOpen(!isHeteroOpen)
    }

    const handleHeteroClick = (item) => {
        if (item.hasSubmenu) {
            toggleHeteroSubmenu()
        } else {
            navigate(item.path)
        }
    }

    return (
        <div className='w-80 bg-white border-r border-gray-200 p-6 fixed h-screen top-0 left-0 overflow-hidden flex flex-col'>

            <div className='flex items-center gap-3 mb-8'>
                <RiDashboardFill className='w-8 h-8 text-amber-400' />
                <h2 className='text-2xl font-bold text-gray-800'>Dashboard</h2>
            </div>

            <div className='h-px bg-amber-400 mb-8' /> 

            <nav className='space-y-2'>
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.path)
                    const isHeteroItem = item.label === 'Hetero Management'

                    return (
                        <div key={item.label} className='w-full'>
                            <Button
                                variant={active ? "default" : "ghost"}
                                className={cn(
                                    'w-full h-12 justify-start items-center text-base font-medium transition-all duration-200', 
                                    active && 'text-white bg-gradient-to-r from-amber-400 to-pink-600 hover:text-white shadow-md',
                                    !active && 'hover:bg-gray-100 text-gray-700',
                                    isHeteroItem && 'flex justify-between pr-4'
                                )}
                                onClick={() => handleHeteroClick(item)}
                            >   
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5" />
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </div>
                                {isHeteroItem && (
                                    isHeteroOpen ? 
                                        <ChevronDown className="h-4 w-4" /> : 
                                        <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>

                            {isHeteroItem && isHeteroOpen && (
                                <div className="ml-6 mt-2 space-y-1 border-l-2 border-amber-200 pl-3">
                                    {item.submenu.map((subItem) => {
                                        const subActive = isActive(subItem.path)
                                        return (
                                            <Button
                                                key={subItem.path}
                                                variant={subActive ? "default" : "ghost"}
                                                className={cn(
                                                    'w-full h-10 justify-start items-center text-sm font-normal transition-all duration-200',
                                                    subActive && 'text-white bg-gradient-to-r from-amber-400 to-pink-600 hover:text-white shadow-md',
                                                    !subActive && 'hover:bg-gray-100 text-gray-600'
                                                )}
                                                onClick={() => navigate(subItem.path)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full transition-all duration-200",
                                                        subActive ? "bg-white" : "bg-gray-400"
                                                    )} />
                                                    <span className="whitespace-nowrap">{subItem.label}</span>
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>
        </div>
    )
}

export default Sidebar;