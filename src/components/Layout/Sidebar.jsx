import { Phone, ClipboardList, BarChart3, Building2, FileSpreadsheet, User, Home } from 'lucide-react';
import React from 'react'
import { Button } from '../ui/button';
import { RiDashboardFill } from "react-icons/ri";
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const Sidebar = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const menuItems = [
            {icon: Home, label: 'Home', path: '/'},
            {icon: Phone, label: 'Program Client', path: '/client'},
            {icon: ClipboardList, label: 'Program', path: '/program'},
            {icon: BarChart3, label: 'Impala Management', path: '/impala'},
            {icon: Building2, label: 'Hetero Management', path: '/hetero'},
            {icon: FileSpreadsheet, label: 'Form Builder', path: '/form'},
            {icon: User, label: 'Account', path: '/user'},
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className='w-64 bg-white border-gray-400 p-4 sticky h-screen top-0 overflow-y-auto'>
            <div className='h-24 flex items-center justify-center -mt-4 gap-1'>
                <RiDashboardFill className='w-6 h-6 text-amber-400' />
                <h2 className='text-xl font-semibold text-gray-800'>Dashboard</h2>
                
            </div>

            <div className='h-px bg-amber-400 mb-8 -mt-2' /> 

            <nav className='space-y-1'>
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.path)

                    return (
                        <Button
                            key={item.label}
                            variant={item.active ? "default" : "ghost"}
                            className={cn('w-full p-8 justify-start items-center', active && 'text-white bg-gradient-to-r from-amber-400 to-pink-600 ')}
                            onClick={() => navigate(item.path)}
                        >   
                            <Icon />
                            {item.label}
                        </Button>
                    )
                })}
            </nav>
        </div>
    )
}

export default Sidebar;