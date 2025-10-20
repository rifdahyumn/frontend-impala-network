import { LayoutDashboard } from 'lucide-react';
import React from 'react'
import { Button } from '../ui/button';

const Sidebar = () => {
    const menuItems = [
            {icon: LayoutDashboard, label: 'Program Client', active: true},
            {icon: LayoutDashboard, label: 'Program', active: false},
            {icon: LayoutDashboard, label: 'Impala Managaement', active: false},
            {icon: LayoutDashboard, label: 'Hetero Management', active: false},
            {icon: LayoutDashboard, label: 'Form Builder', active: false},
            {icon: LayoutDashboard, label: 'Account', active: false},
    ]

    return (
        <div className='w-64 bg-white border-r border-gray-400 p-4'>
            <div className='mb-8'>
                <h2 className='text-lg font-semibold text-gray-800'>Navigation</h2>
            </div>

            <nav className='space-y-1'>
                {menuItems.map((item) => {
                    const Icon = item.icon

                    return (
                        <Button
                            key={item.label}
                            variant={item.active ? "default" : "ghost"}
                            className={`w-full justify-start ${item.active ? 'bg-blue-50 text-blue-700' : ''}`}
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