import AccountContent from "../components/Content/AccountContent";
import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, UserCheck, AlertCircle, X, Filter, Briefcase, Check, Building2 } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; 
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import AddUser from "../components/AddButton/AddUser";
import { useUsers } from "../hooks/useUser";
import toast from "react-hot-toast";

const Account = () => {
    const [selectedUser, setSelectedUser] = useState(null)
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    const [highlightDetail, setHighlightDetail] = useState(false);
    
    const userDetailRef = useRef(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    
    // State untuk filter permanen dan sementara (seperti HeteroSurakarta.jsx)
    const [filters, setFilters] = useState({
        position: null, 
        role: null, 
    });
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        position: filters.position || '',
        role: filters.role || 'all'
    });
    
    const [filteredUsers, setFilteredUsers] = useState([]);

    const { users, loading, error, pagination, fetchFilters, setFilters: setHookFilters, fetchUser, addUser, updateUser, deleteUser, activateUser } = useUsers()

    const handleSelectUser = useCallback((user) => {
        setSelectedUser(user);
        
        setHighlightDetail(true);
        
        setTimeout(() => {
            if (userDetailRef.current) {
                userDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                userDetailRef.current.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    setHighlightDetail(false);
                }, 2000);
            }
        }, 150); 
    }, []);

    // Opsi filter asli (tidak diubah)
    const positionOptions = [
        { value: 'managing director', label: 'Managing Director' },
        { value: 'director', label: 'Director' },
        { value: 'head manager', label: 'Head Manager' },
        { value: 'finance', label: 'Finance' },
        { value: 'legal', label: 'Legal' },
        { value: 'talent manager', label: 'Talent Manager' },
        { value: 'ecosystem manager', label: 'Ecosystem Manager' },
        { value: 'strategic partnership executive', label: 'Strategic Partnership Executive' },
        { value: 'program manager', label: 'Program Manager' },
        { value: 'space manager', label: 'Space Manager' },
        { value: 'creative', label: 'Creative' }
    ];

    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'superadmin', label: 'Super Admin' }
    ];

    const statusOptions = [
        { value: "all", label: "📊 All Status" },
        { value: "active", label: "🟢 Active", original: "Active" },
        { value: "inactive", label: "🔴 Inactive", original: "Inactive" },
        { value: "pending", label: "🟡 Pending", original: "Pending" }
    ];

    const getLabel = (value, options) => {
        if (!value) return "";
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    const getOriginalLabel = (value, options) => {
        if (!value) return "";
        const option = options.find(opt => opt.value === value);
        return option ? option.original || option.label : value;
    };

    // Fungsi untuk mendapatkan label filter yang sedang aktif
    const getFilterLabel = (filterType) => {
        if (filterType === 'position' && filters.position) {
            return getOriginalLabel(filters.position, positionOptions);
        }
        if (filterType === 'role' && filters.role) {
            return filters.role === 'all' ? 'All Roles' : getOriginalLabel(filters.role, roleOptions);
        }
        return '';
    };

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
                subtitle: filters.position ? `${getOriginalLabel(filters.position, positionOptions)}` : "",
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
                subtitle: filters.role ? `${filters.role === 'all' ? 'All Roles' : getOriginalLabel(filters.role, roleOptions)}` : "",
                percentage: `${adminPercentage}%`,
                trend: adminUsers > 0 ? "up" : "down",
                period: "Last Month",
                icon: Briefcase,
                color: "purple",
                description: `${adminUsers} admin(s), ${superAdminUsers} super admin(s)`
            }
        ];
    }, [filteredUsers, filters.position, filters.role]);

    // Fungsi applyAllFilters seperti di HeteroSurakarta.jsx
    const applyAllFilters = () => {
        let result = [...users];
        
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
        
        if (filters.position) {
            result = result.filter(user => {
                const userPosition = user.position?.toLowerCase();
                if (!userPosition) return false;
                
                return userPosition === filters.position ||
                       userPosition.includes(filters.position) ||
                       filters.position.includes(userPosition);
            });
        }
        
        if (filters.role && filters.role !== 'all') {
            result = result.filter(user => {
                const userRole = user.role?.toLowerCase();
                if (!userRole) return false;
                
                return userRole === filters.role;
            });
        }
        
        setFilteredUsers(result);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // Handler untuk filter sementara (seperti HeteroSurakarta.jsx)
    const handleTempPositionChange = (position) => {
        setTempFilters(prev => ({ 
            ...prev, 
            position: prev.position === position ? '' : position 
        }));
    };

    const handleTempRoleChange = (role) => {
        setTempFilters(prev => ({ ...prev, role }));
    };

    // Handler untuk apply filter
    const handleApplyFilters = () => {
        setFilters({
            position: tempFilters.position || null,
            role: tempFilters.role || null
        });
        setIsFilterOpen(false);
    };

    // Handler untuk cancel filter
    const handleCancelFilters = () => {
        setTempFilters({
            position: filters.position || '',
            role: filters.role || 'all'
        });
        setIsFilterOpen(false);
    };

    // Handler untuk clear semua filter sementara
    const handleClearAllTempFilters = () => {
        setTempFilters({
            position: '',
            role: 'all'
        });
    };

    // Handler untuk clear semua filter permanen
    const handleClearAllFilters = () => {
        setSearchTerm("");
        setFilters({
            position: null,
            role: null,
        });
        setSelectedUser(null); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handler untuk menghitung filter aktif
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.position) count++;
        if (filters.role && filters.role !== 'all') count++;
        return count;
    };

    // Handler untuk menghitung filter sementara yang aktif
    const getTempActiveFiltersCount = () => {
        let count = 0;
        if (tempFilters.position) count++;
        if (tempFilters.role && tempFilters.role !== 'all') count++;
        return count;
    };

    const getTotalActiveCriteria = () => {
        let count = 0;
        if (searchTerm) count++;
        if (filters.position) count++;
        if (filters.role && filters.role !== 'all') count++;
        return count;
    };

    // Fungsi clear filter spesifik
    const clearFilter = (filterType) => {
        if (filterType === 'search') {
            setSearchTerm("");
        } else if (filterType === 'position') {
            setFilters(prev => ({ ...prev, position: null }));
        } else if (filterType === 'role') {
            setFilters(prev => ({ ...prev, role: null }));
        }
    };

    // Update tempFilters ketika filters berubah
    useEffect(() => {
        setTempFilters({
            position: filters.position || '',
            role: filters.role || 'all'
        });
    }, [filters]);

    useEffect(() => {
        if (users.length > 0) {
            setFilteredUsers(users);
            applyAllFilters();
        }
    }, [users]);

    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, filters]);

    const handleAddUser = () => {
        setIsAddUserModalOpen(true);
    };

    const handleAddUserSuccess = async (userData) => {
        try {
            await addUser(userData);
            setIsAddUserModalOpen(false);
            toast.success('User added successfully');
            fetchUser(pagination.page);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            // 
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
            toast.success('User deleted successfully')
            fetchUser(pagination.page);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            } else {
                setSelectedUser(null);
            }
        }
    }, [users, selectedUser?.id])

    const handleRefresh = () => {
        fetchUser(pagination.page);
        handleClearAllFilters();
    };

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchUser(page);
    };

    const tableConfig = {
        headers: ['No', 'Employee ID', 'Full Name', 'Email', 'Position', 'Role', 'Status', 'Last Login', 'Action'],
        title: 'User Account Management',
        addButton: 'Add User',
        detailTitle: 'User Details'
    }

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

                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap'>
                                <div className="w-full sm:w-auto min-w-[250px]">
                                    <SearchBar 
                                        onSearch={handleSearch}
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                
                                {/* Custom Filter Dropdown - Versi baru seperti HeteroSurakarta.jsx */}
                                <div className="relative">
                                    <Button 
                                        variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                                        className={`flex items-center gap-2 transition-all duration-200 ${
                                            getActiveFiltersCount() > 0 
                                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-amber-500" 
                                                : "text-gray-700 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 border-gray-300"
                                        }`}
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
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

                                    {isFilterOpen && (
                                        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[450px]">
                                            <div className="p-3 border-b">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-gray-900 text-xs">Filter Options</h3>
                                                    <span className="text-xs text-gray-500">
                                                        {getTempActiveFiltersCount()} filter{getTempActiveFiltersCount() !== 1 ? 's' : ''} selected
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3">
                                                {/* Position Filter */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-gray-900 text-xs">POSITION</h4>
                                                        {tempFilters.position && (
                                                            <button 
                                                                onClick={() => handleTempPositionChange('')}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* All Positions */}
                                                    <div className="mb-2">
                                                        <button
                                                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs w-full ${
                                                                !tempFilters.position
                                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                            }`}
                                                            onClick={() => handleTempPositionChange('')}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`h-2 w-2 rounded-full ${
                                                                    !tempFilters.position
                                                                        ? 'bg-amber-500' 
                                                                        : 'bg-gray-400'
                                                                }`} />
                                                                <span className="font-medium text-xs">All Positions</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {!tempFilters.position && (
                                                                    <Check className="h-3 w-3 text-amber-600" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Positions Grid */}
                                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                                        {positionOptions.map((position) => {
                                                            const isSelected = tempFilters.position === position.value;
                                                            
                                                            return (
                                                                <button
                                                                    key={position.value}
                                                                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all text-xs ${
                                                                        isSelected
                                                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                                    }`}
                                                                    onClick={() => handleTempPositionChange(position.value)}
                                                                >
                                                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                                            isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                                        }`} />
                                                                        <span className="truncate font-medium text-xs">
                                                                            {position.label}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                                                        {isSelected && (
                                                                            <Check className="h-2.5 w-2.5 text-amber-600 flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Role Filter */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold text-gray-900 text-xs">ROLE</h4>
                                                        {tempFilters.role && tempFilters.role !== 'all' && (
                                                            <button 
                                                                onClick={() => handleTempRoleChange('all')}
                                                                className="text-xs text-gray-400 hover:text-red-500"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* All Roles */}
                                                    <div className="mb-2">
                                                        <button
                                                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs w-full ${
                                                                !tempFilters.role || tempFilters.role === 'all'
                                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                            }`}
                                                            onClick={() => handleTempRoleChange('all')}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`h-2 w-2 rounded-full ${
                                                                    !tempFilters.role || tempFilters.role === 'all' 
                                                                        ? 'bg-amber-500' 
                                                                        : 'bg-gray-400'
                                                                }`} />
                                                                <span className="font-medium text-xs">All Roles</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {(!tempFilters.role || tempFilters.role === 'all') && (
                                                                    <Check className="h-3 w-3 text-amber-600" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Roles Grid */}
                                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                                        {roleOptions.map((role) => {
                                                            const isSelected = tempFilters.role === role.value;
                                                            
                                                            return (
                                                                <button
                                                                    key={role.value}
                                                                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all text-xs ${
                                                                        isSelected
                                                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-gray-700'
                                                                    }`}
                                                                    onClick={() => handleTempRoleChange(role.value)}
                                                                >
                                                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                                                            isSelected ? 'bg-amber-500' : 'bg-gray-400'
                                                                        }`} />
                                                                        <span className="truncate font-medium text-xs">
                                                                            {role.label}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                                                        {isSelected && (
                                                                            <Check className="h-2.5 w-2.5 text-amber-600 flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t p-2">
                                                <div className="flex justify-between items-center">
                                                    <button
                                                        className="text-xs text-gray-600 hover:text-red-600 flex items-center gap-1.5"
                                                        onClick={handleClearAllTempFilters}
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Clear All Filters
                                                    </button>
                                                    <div className="flex gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-7 px-2"
                                                            onClick={handleCancelFilters}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3"
                                                            onClick={handleApplyFilters}
                                                        >
                                                            Apply
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                <Button 
                                    className='flex items-center gap-2 whitespace-nowrap'
                                    onClick={handleAddUser}
                                >
                                    <Plus className="h-4 w-4" />
                                    {tableConfig.addButton}
                                </Button>
                                <ExportButton data={formattedUsers} />
                            </div>
                        </div>
                        
                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                
                                {searchTerm && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <span>"{searchTerm}"</span>
                                        <button 
                                            onClick={() => clearFilter('search')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.position && (
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        {getFilterLabel('position')}
                                        <button 
                                            onClick={() => clearFilter('position')}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.role && filters.role !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {getFilterLabel('role')}
                                        <button 
                                            onClick={() => clearFilter('role')}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                
                                {filters.role === 'all' && (
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
                                
                                <Button 
                                    variant="ghost" 
                                    onClick={handleClearAllFilters}
                                    className="text-sm h-8"
                                    size="sm"
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}

                        {getTotalActiveCriteria() > 0 && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <span>
                                            Showing <span className="font-semibold">{filteredUsers.length}</span> users
                                            {filters.position && (
                                                <span> in <span className="font-semibold">{getFilterLabel('position')}</span> position</span>
                                            )}
                                            {filters.role && filters.role !== 'all' && (
                                                <span> with role <span className="font-semibold">{getFilterLabel('role')}</span></span>
                                            )}
                                            {filters.role === 'all' && (
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
                                            onClick={handleClearAllFilters}
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
                                        onSelectMember={handleSelectUser} 
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

                <div 
                    ref={userDetailRef}
                    className={`
                        transition-all duration-500 ease-in-out
                        ${highlightDetail ? 'rounded-xl p-1 -m-1 bg-blue-50/50' : ''}
                    `}
                >
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
                </div>
                
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