import AccountContent from "../components/Content/AccountContent";
import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, UserCheck, AlertCircle, Tag, X, Filter, Briefcase } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import AddUser from "../components/AddButton/AddUser";
import { useUsers } from "../hooks/useUser";
import toast from "react-hot-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger // ⭐⭐ TAMBAHKAN INI
} from "../components/ui/dropdown-menu";

const Account = () => {
    const [selectedUser, setSelectedUser] = useState(null)
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    // ⭐⭐ STATE UNTUK FRONTEND FILTERING (disesuaikan dengan ImpalaManagement)
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilters, setActiveFilters] = useState({
        position: null, // 'director', 'manager', atau null
        role: null, // 'admin', 'user', 'superadmin', atau null
    });
    const [filteredUsers, setFilteredUsers] = useState([]);

    const { users, loading, error, pagination, filters, setFilters, fetchUser, addUser, updateUser, deleteUser, activateUser } = useUsers()

    // ⭐⭐ POSITION OPTIONS (disesuaikan dengan genderOptions di ImpalaManagement)
    const positionOptions = [
        { value: 'managing director', label: '👑 Managing Director' },
        { value: 'director', label: '🎯 Director' },
        { value: 'head manager', label: '📊 Head Manager' },
        { value: 'finance', label: '💰 Finance' },
        { value: 'legal', label: '⚖️ Legal' },
        { value: 'talent manager', label: '👨‍💼 Talent Manager' },
        { value: 'ecosystem manager', label: '🌐 Ecosystem Manager' },
        { value: 'strategic partnership executive', label: '🤝 Strategic Partnership Executive' },
        { value: 'program manager', label: '📋 Program Manager' },
        { value: 'space manager', label: '🏢 Space Manager' },
        { value: 'creative', label: '🎨 Creative' }
    ];

    // ⭐⭐ ROLE OPTIONS (disesuaikan dengan categoryOptions di ImpalaManagement)
    const roleOptions = [
        { value: 'admin', label: '🔧 Admin' },
        { value: 'user', label: '👤 User' },
        { value: 'superadmin', label: '👑 Super Admin' }
    ];

    // ⭐⭐ DAFTAR STATUS OPTIONS (untuk statistik saja, bukan untuk filter button)
    const statusOptions = [
        { value: "all", label: "📊 All Status" },
        { value: "active", label: "🟢 Active", original: "Active" },
        { value: "inactive", label: "🔴 Inactive", original: "Inactive" },
        { value: "pending", label: "🟡 Pending", original: "Pending" }
    ];

    // ⭐⭐ FUNGSI UNTUK GET LABEL
    const getLabel = (value, options) => {
        if (!value) return "";
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    // ⭐⭐ FUNGSI UNTUK GET ORIGINAL LABEL
    const getOriginalLabel = (value, options) => {
        if (!value) return "";
        const option = options.find(opt => opt.value === value);
        return option ? option.original || option.label : value;
    };

    // ⭐⭐ STATISTIK USER
    const userStats = useMemo(() => {
        const totalUsers = filteredUsers.length;
        const activeUsers = filteredUsers.filter(user => user.status === 'active').length;
        const adminUsers = filteredUsers.filter(user => user.role === 'admin').length;
        const superAdminUsers = filteredUsers.filter(user => user.role === 'superadmin').length;
        
        const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0";
        const adminPercentage = totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : "0";

        return [
            {
                title: "Total Users",
                value: totalUsers.toString(),
                subtitle: activeFilters.position ? `${getOriginalLabel(activeFilters.position, positionOptions)}` : "",
                percentage: `${totalUsers > 0 ? "8.5" : "0"}%`,
                trend: totalUsers > 0 ? "up" : "neutral",
                period: "Last Month",
                icon: Users,
                color: "blue",
                description: `${totalUsers > 0 ? "8.5" : "0"}% Growth`
            },
            {
                title: "Active Users",
                value: activeUsers.toString(),
                subtitle: "",
                percentage: `${activePercentage}%`,
                trend: activeUsers > 0 ? "up" : "down",
                period: "Last Month",
                icon: UserCheck,
                color: "green",
                description: `${activePercentage}% of total`
            },
            {
                title: "Admin Users",
                value: adminUsers.toString(),
                subtitle: activeFilters.role ? `${getOriginalLabel(activeFilters.role, roleOptions)}` : "",
                percentage: `${adminPercentage}%`,
                trend: adminUsers > 0 ? "up" : "down",
                period: "Last Month",
                icon: Briefcase,
                color: "purple",
                description: `${adminUsers} admin(s), ${superAdminUsers} super admin(s)`
            }
        ];
    }, [filteredUsers, activeFilters.position, activeFilters.role]);

    // ⭐⭐ FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...users];
        
        // 1. Apply Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user =>
                user.full_name?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.employee_id?.toLowerCase().includes(term) ||
                user.position?.toLowerCase().includes(term) ||
                user.phone?.toLowerCase().includes(term)
            );
        }
        
        // 2. Apply Position Filter
        if (activeFilters.position) {
            result = result.filter(user => {
                const userPosition = user.position?.toLowerCase();
                if (!userPosition) return false;
                
                return userPosition === activeFilters.position ||
                       userPosition.includes(activeFilters.position) ||
                       activeFilters.position.includes(userPosition);
            });
        }
        
        // 3. Apply Role Filter
        if (activeFilters.role) {
            result = result.filter(user => {
                const userRole = user.role?.toLowerCase();
                if (!userRole) return false;
                
                return userRole === activeFilters.role;
            });
        }
        
        setFilteredUsers(result);
    };

    // ⭐⭐ HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilters({ ...filters, search: term });
    };

    // ⭐⭐ HANDLE POSITION FILTER CHANGE
    const handlePositionFilterChange = (position) => {
        setActiveFilters(prev => ({
            ...prev,
            position: prev.position === position ? null : position
        }));
        setFilters({ ...filters, position: position });
    };

    // ⭐⭐ HANDLE ROLE FILTER CHANGE
    const handleRoleFilterChange = (role) => {
        setActiveFilters(prev => ({
            ...prev,
            role: prev.role === role ? null : role
        }));
        setFilters({ ...filters, role: role });
    };

    // ⭐⭐ CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setActiveFilters({
            position: null,
            role: null,
        });
        setFilters({ search: "", position: "", role: "", status: "" });
        setFilteredUsers(users);
    };

    // ⭐⭐ CLEAR SPECIFIC FILTER
    const clearFilter = (filterType) => {
        if (filterType === 'position') {
            setActiveFilters(prev => ({ ...prev, position: null }));
            setFilters({ ...filters, position: "" });
        } else if (filterType === 'role') {
            setActiveFilters(prev => ({ ...prev, role: null }));
            setFilters({ ...filters, role: "" });
        } else if (filterType === 'search') {
            setSearchTerm("");
            setFilters({ ...filters, search: "" });
        }
    };

    // ⭐⭐ APPLY FILTERS SETIAP USERS BERUBAH
    useEffect(() => {
        if (users.length > 0) {
            setFilteredUsers(users);
            applyAllFilters();
        }
    }, [users]);

    // ⭐⭐ APPLY FILTERS SETIAP SEARCH ATAU FILTER BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, activeFilters]);

    const handleAddUser = () => {
        setIsAddUserModalOpen(true);
    };

    const handleAddUserSuccess = async (userData) => {
        try {
            await addUser(userData);
            setIsAddUserModalOpen(false);
            fetchUser(pagination.page);
        } catch {
            // Error sudah dihandle di hook
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditUser = async (userId, userData) => {
        try {
            const updatedUser = await updateUser(userId, userData)

            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(prev => ({
                    ...prev,
                    ...userData,
                    ...updatedUser
                }))
            }

            setIsEditModalOpen(false)
            setEditingUser(null)
            toast.success('User updated successfully')
            fetchUser(pagination.page);
        } catch (error) {
            console.error('Error updating', error)
            toast.error(error.message || 'Failed to update user')
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!selectedUser) return

        if (!window.confirm(`Are you sure want to delete ${selectedUser.full_name}? This action cannot be undone`)) {
            return
        }

        try {
            await deleteUser(userId)
            setSelectedUser(null)
            fetchUser(pagination.page);
        } catch {
            //
        }
    }

    const handleActivate = async (userId) => {
        try {
            await activateUser(userId);
            fetchUser(pagination.page);
        } catch (error) {
            console.error('❌ Error activating user from parent:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (selectedUser && users.length > 0) {
            const currentSelected = users.find(member => member.id === selectedUser.id)
            if (currentSelected) {
                setSelectedUser(currentSelected)
            }
        }
    }, [users, selectedUser?.id])

    const handleRefresh = () => {
        fetchUser(pagination.page);
        clearAllFilters();
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchUser(page);
    };

    // ⭐⭐ GET ACTIVE FILTERS COUNT - HANYA POSITION DAN ROLE
    const getActiveFiltersCount = () => {
        let count = 0;
        if (activeFilters.position) count++;
        if (activeFilters.role) count++;
        return count;
    };

    // ⭐⭐ GET TOTAL ACTIVE CRITERIA (SEARCH + FILTERS) UNTUK DISPLAY
    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilters.position) count++;
        if (activeFilters.role) count++;
        return count;
    };

    const tableConfig = {
        headers: ['No', 'Employee ID', 'Full Name', 'Email', 'Position', 'Role', 'Status', 'Last Login', 'Action'],
        title: 'User Account Management',
        addButton: 'Add User',
        detailTitle: 'User Details'
    }

    // ⭐⭐ FORMAT USER DARI filteredUsers
    const formattedUsers = filteredUsers.map((user, index) => {
        const currentPage = pagination.page
        const itemsPerPage = pagination.limit
        const itemNumber = (currentPage - 1) * itemsPerPage + index + 1

        return {
            id: user.id,
            no: itemNumber,
            employee_id: user.employee_id,
            full_name: user.full_name,
            email: user.email,
            password: user.password,
            role: user.role,
            last_login: user.last_login,
            status: user.status,
            phone: user.phone,
            position: user.position,
            avatar: user.avatar,
            action: 'Detail',
            ...user
        }
    })

    // ⭐⭐ KOMPONEN STATS CARDS
    const UserStatsCards = ({ statsData }) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {statsData.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : stat.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {stat.percentage}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            {stat.description}
                            {stat.subtitle && (
                                <span className="block text-xs text-gray-400 mt-1">{stat.subtitle}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                
                {/* Stats Cards */}
                <UserStatsCards statsData={userStats} />

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>
                        {loading && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading users...</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Failed to load users</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefresh}
                                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        Reload Page
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ⭐⭐ SEARCH & FILTER SECTION - DIUBAH SEPERTI IMPALAMANAGEMENT */}
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search..."
                                />
                                
                                {/* ⭐⭐ FILTER DROPDOWN DENGAN WARNA AMBER - SEPERTI IMPALAMANAGEMENT */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                                            className={`flex items-center gap-2 transition-all duration-200 ${
                                                getActiveFiltersCount() > 0 
                                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                                    : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                                            }`}
                                        >
                                            <Filter className={`h-4 w-4 ${
                                                getActiveFiltersCount() > 0 ? "text-white" : "text-gray-500"
                                            }`} />
                                            Filter
                                            {getActiveFiltersCount() > 0 && (
                                                <span className="ml-1 bg-white text-amber-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                                    {getActiveFiltersCount()}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 shadow-lg border border-gray-200">
                                        <DropdownMenuLabel className="text-gray-700 font-semibold">Filter Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        {/* ⭐⭐ POSITION FILTER (SEPERTI GENDER DI IMPALAMANAGEMENT) */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Position
                                            </DropdownMenuLabel>
                                            {positionOptions.map((option) => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={activeFilters.position === option.value}
                                                    onCheckedChange={() => handlePositionFilterChange(option.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* ⭐⭐ ROLE FILTER (SEPERTI CATEGORY DI IMPALAMANAGEMENT) */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                                                Role
                                            </DropdownMenuLabel>
                                            <div className="max-h-48 overflow-y-auto">
                                                {/* ALL ROLES OPTION */}
                                                <DropdownMenuCheckboxItem
                                                    checked={activeFilters.role === 'all'}
                                                    onCheckedChange={() => handleRoleFilterChange('all')}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    👥 All Roles
                                                </DropdownMenuCheckboxItem>
                                                
                                                {roleOptions.map((role) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={role.value}
                                                        checked={activeFilters.role?.toLowerCase() === role.value.toLowerCase()}
                                                        onCheckedChange={() => handleRoleFilterChange(role.value)}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        {role.label}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </div>
                                        </DropdownMenuGroup>
                                        
                                        <DropdownMenuSeparator />
                                        
                                        {/* CLEAR FILTERS - HANYA CLEAR POSITION & ROLE */}
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setActiveFilters({
                                                    position: null,
                                                    role: null,
                                                });
                                                setFilters({ ...filters, position: "", role: "" });
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-medium"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className='flex gap-2'>
                                <Button 
                                    className='flex items-center gap-2'
                                    onClick={handleAddUser}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton data={formattedUsers} />
                            </div>
                        </div>
                        
                        {/* ⭐⭐ ACTIVE FILTERS BADGES - TAMPILKAN JIKA ADA SEARCH ATAU FILTER */}
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {/* SEARCH BADGE */}
                                {searchTerm && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>🔍 "{searchTerm}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* POSITION FILTER BADGE */}
                                {activeFilters.position && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        {getOriginalLabel(activeFilters.position, positionOptions)}
                                        <button 
                                            onClick={() => clearFilter('position')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* ROLE FILTER BADGE */}
                                {activeFilters.role && activeFilters.role !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {getOriginalLabel(activeFilters.role, roleOptions)}
                                        <button 
                                            onClick={() => clearFilter('role')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* ALL ROLES BADGE */}
                                {activeFilters.role === 'all' && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        All Roles
                                        <button 
                                            onClick={() => clearFilter('role')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {/* CLEAR ALL - CLEARS BOTH SEARCH AND FILTERS */}
                                <Button 
                                    variant="ghost" 
                                    onClick={clearAllFilters}
                                    className="text-sm h-8"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {/* ⭐⭐ FILTER STATUS INFO (DIHAPUS ATAU DISEDERHANAKAN) */}
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <span>
                                            Showing <span className="font-semibold">{filteredUsers.length}</span> users
                                            {activeFilters.position && (
                                                <span> in <span className="font-semibold">{getOriginalLabel(activeFilters.position, positionOptions)}</span> position</span>
                                            )}
                                            {activeFilters.role && activeFilters.role !== 'all' && (
                                                <span> with role <span className="font-semibold">{getOriginalLabel(activeFilters.role, roleOptions)}</span></span>
                                            )}
                                            {activeFilters.role === 'all' && (
                                                <span> in all roles</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-gray-600">Loading users...</span>
                                <div className="w-64 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                                </div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No users found
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {getTotalActiveCriteria() > 0 
                                            ? "No users match your current filters. Try adjusting your criteria."
                                            : "Get started by adding your first user."
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {getTotalActiveCriteria() > 0 && (
                                        <Button 
                                            className="flex items-center gap-2"
                                            onClick={clearAllFilters}
                                            variant="outline"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button 
                                        className="flex items-center gap-2"
                                        onClick={handleAddUser}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New User
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    {loading && (
                                        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                <span className="text-sm text-gray-600">Updating data...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <MemberTable
                                        members={formattedUsers}
                                        onSelectMember={setSelectedUser}
                                        headers={tableConfig.headers}
                                        isLoading={loading}
                                    />
                                </div>

                                <div className='mt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredUsers.length} of {users.length} users
                                        {getTotalActiveCriteria() > 0 && " (filtered)"}
                                    </div>
                                    
                                    <Pagination 
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.total}
                                        itemsPerPage={pagination.limit}
                                        onPageChange={handlePageChange}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}
                        
                    </CardContent>
                </Card>

                <AccountContent
                    selectedUser={selectedUser}
                    onOpenEditModal={handleOpenEditModal}
                    onDelete={handleDeleteUser}
                    onActivateUser={handleActivate}
                    detailTitle={tableConfig.detailTitle}
                    onUserUpdated={() => fetchUser(pagination.page)}
                    onClientDeleted={() => {
                        fetchUser(pagination.page);
                        setSelectedUser(null);
                    }}
                />
                
                {/* Add User Modal */}
                <AddUser 
                    isAddUserModalOpen={isAddUserModalOpen || isEditModalOpen} 
                    setIsAddUserModalOpen={(open) => {
                        if (!open) {
                            setIsAddUserModalOpen(false)
                            setIsEditModalOpen(false)
                            setEditingUser(null)
                        }
                    }}
                    onAddUser={handleAddUserSuccess}
                    editData={editingUser}
                    onEditUser={handleEditUser}
                />
            </div>
        </div>
    )
}

export default Account;