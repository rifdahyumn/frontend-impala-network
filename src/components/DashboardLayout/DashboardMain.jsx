import React, { useState } from 'react';
import UserAccountSettings from '../UserAccountSettings/UserAccountSettings';

const DashboardMain = () => {
    const [showAccountSettings, setShowAccountSettings] = useState(false);

    if (showAccountSettings) {
        return <UserAccountSettings onBack={() => setShowAccountSettings(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-3 cursor-pointer">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">Alexander Ratouli</p>
                                    <p className="text-xs text-gray-500">Ecosystem Manager</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    AR
                                </div>
                            </div>

                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                    onClick={() => setShowAccountSettings(true)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Account Settings
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Hello Alexander Ratouli
                    </h2>
                    <p className="text-gray-600">Ecosystem Manager</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        User Account Management
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Type of Business</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Filter</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Employee ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Full Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Position</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Log Out</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">1</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">IMP-013</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Alexander Ratouli</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">helloadmin@gmail.com</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Ecosystem Manager</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">admin</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Today 01:00 PM</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">2</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">IMP-004</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Muhammad Fati Ali Izza</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">mfatalizzo@gmail.com</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Manager IT</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">admin</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Today 12:16 PM</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        Showing 2 of 2 program
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">User Details</h3>
                    <p className="text-gray-600">Select a client to view details</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardMain;