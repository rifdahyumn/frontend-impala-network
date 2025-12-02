import AccountContent from "../components/Content/AccountContent";
import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, UserCheck, AlertCircle, Tag, X, Briefcase } from "lucide-react";
import { Button } from "../components/ui/button"
import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from '../components/SearchFilter/SearchBar';
import ExportButton from '../components/ActionButton/ExportButton';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import FilterButton from '../components/SearchFilter/Filter';
import AddUser from "../components/AddButton/AddUser";
import { useUsers } from "../hooks/useUser";
import toast from "react-hot-toast";

const Account = () => {
    const [selectedUser, setSelectedUser] = useState(null)
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    // ⭐⭐ STATE UNTUK FRONTEND FILTERING
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const { users, loading, error, pagination, filters, setFilters, fetchUser, addUser, updateUser, deleteUser, activateUser } = useUsers()

    // ⭐⭐ DAFTAR POSITION OPTIONS
    const positionOptions = [
        { value: "all", label: "👔 All Positions" },
        { value: "managing director", label: "👑 Managing Director", original: "Managing Director" },
        { value: "director", label: "🎯 Director", original: "Director" },
        { value: "head manager", label: "📊 Head Manager", original: "Head Manager" },
        { value: "finance", label: "💰 Finance", original: "Finance" },
        { value: "legal", label: "⚖️ Legal", original: "Legal" },
        { value: "talent manager", label: "👨‍💼 Talent Manager", original: "Talent Manager" },
        { value: "ecosystem manager", label: "🌐 Ecosystem Manager", original: "Ecosystem Manager" },
        { value: "strategic partnership executive", label: "🤝 Strategic Partnership Executive", original: "Strategic Partnership Executive" },
        { value: "program manager", label: "📋 Program Manager", original: "Program Manager" },
        { value: "space manager", label: "🏢 Space Manager", original: "Space Manager" },
        { value: "creative", label: "🎨 Creative", original: "Creative" }
    ];

    // ⭐⭐ DAFTAR ROLE OPTIONS
    const roleOptions = [
        { value: "all", label: "👥 All Roles" },
        { value: "admin", label: "🔧 Admin", original: "Admin" },
        { value: "user", label: "👤 User", original: "User" },
        { value: "superadmin", label: "👑 Super Admin", original: "Super Admin" }
    ];

    // ⭐⭐ DAFTAR STATUS OPTIONS
    const statusOptions = [
        { value: "all", label: "📊 All Status" },
        { value: "active", label: "🟢 Active", original: "Active" },
        { value: "inactive", label: "🔴 Inactive", original: "Inactive" },
        { value: "pending", label: "🟡 Pending", original: "Pending" }
    ];

    // ⭐⭐ FUNGSI UNTUK GET LABEL
    const getLabel = (value, options) => {
        if (!value || value === "all") return "All";
        const option = options.find(opt => opt.value === value);
        return option ? option.original : value;
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
                subtitle: selectedPosition && selectedPosition !== "all" ? `${getLabel(selectedPosition, positionOptions)}` : "",
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
                subtitle: selectedStatus && selectedStatus !== "all" ? `${getLabel(selectedStatus, statusOptions)}` : "",
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
                subtitle: selectedRole && selectedRole !== "all" ? `${getLabel(selectedRole, roleOptions)}` : "",
                percentage: `${adminPercentage}%`,
                trend: adminUsers > 0 ? "up" : "down",
                period: "Last Month",
                icon: Briefcase,
                color: "purple",
                description: `${adminUsers} admin(s), ${superAdminUsers} super admin(s)`
            }
        ];
    }, [filteredUsers, selectedPosition, selectedRole, selectedStatus]);

    // ⭐⭐ FUNGSI UNTUK APPLY SEARCH & FILTER
    const applyAllFilters = () => {
        let result = [...users];
        
        // 1. Apply Position Filter
        if (selectedPosition && selectedPosition !== "all") {
            result = result.filter(user => {
                const userPosition = user.position?.toLowerCase();
                if (!userPosition) return false;
                
                return userPosition === selectedPosition || 
                       userPosition.includes(selectedPosition) || 
                       selectedPosition.includes(userPosition);
            });
        }
        
        // 2. Apply Role Filter
        if (selectedRole && selectedRole !== "all") {
            result = result.filter(user => {
                const userRole = user.role?.toLowerCase();
                if (!userRole) return false;
                
                return userRole === selectedRole;
            });
        }
        
        // 3. Apply Status Filter
        if (selectedStatus && selectedStatus !== "all") {
            result = result.filter(user => {
                const userStatus = user.status?.toLowerCase();
                if (!userStatus) return false;
                
                return userStatus === selectedStatus;
            });
        }
        
        // 4. Apply Search
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
        
        setFilteredUsers(result);
    };

    // ⭐⭐ HANDLE SEARCH
    const handleSearch = (term) => {
        setSearchTerm(term);
        setFilters({ ...filters, search: term });
        applyAllFilters();
    };

    // ⭐⭐ HANDLE POSITION FILTER CHANGE
    const handlePositionFilterChange = (positionValue) => {
        setSelectedPosition(positionValue);
        setFilters({ ...filters, position: positionValue });
        applyAllFilters();
    };

    // ⭐⭐ HANDLE ROLE FILTER CHANGE
    const handleRoleFilterChange = (roleValue) => {
        setSelectedRole(roleValue);
        setFilters({ ...filters, role: roleValue });
        applyAllFilters();
    };

    // ⭐⭐ HANDLE STATUS FILTER CHANGE
    const handleStatusFilterChange = (statusValue) => {
        setSelectedStatus(statusValue);
        setFilters({ ...filters, status: statusValue });
        applyAllFilters();
    };

    // ⭐⭐ CLEAR ALL FILTERS
    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedPosition(null);
        setSelectedRole(null);
        setSelectedStatus(null);
        setFilteredUsers(users);
        setFilters({ search: "", position: "", role: "", status: "" });
    };

    // ⭐⭐ APPLY FILTERS SETIAP USERS BERUBAH
    useEffect(() => {
        if (users.length > 0) {
            setFilteredUsers(users);
            applyAllFilters();
        }
    }, [users]);

    // ⭐⭐ APPLY FILTERS SETIAP FILTER BERUBAH
    useEffect(() => {
        applyAllFilters();
    }, [searchTerm, selectedPosition, selectedRole, selectedStatus]);

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

    // ⭐⭐ HITUNG JUMLAH ACTIVE FILTERS
    const activeFiltersCount = [
        searchTerm, 
        selectedPosition && selectedPosition !== "all", 
        selectedRole && selectedRole !== "all", 
        selectedStatus && selectedStatus !== "all"
    ].filter(Boolean).length;

    // ⭐⭐ KOMPONEN STATS CARDS (inline karena komponen eksternal tidak ada)
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

                        {/* ⭐⭐ SEARCH & FILTER SECTION */}
                        <div className='flex flex-wrap gap-4 mb-6 justify-between'>
                            <div className='flex gap-2 items-center'>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search users by name, email, employee ID..."
                                />
                                
                                {/* ⭐⭐ FILTER BY POSITION */}
                                <FilterButton 
                                    onFilterChange={handlePositionFilterChange}
                                    filterOptions={positionOptions}
                                    activeFilter={selectedPosition}
                                    buttonText={
                                        selectedPosition && selectedPosition !== "all" 
                                            ? `Position: ${getLabel(selectedPosition, positionOptions)}`
                                            : "Filter by Position"
                                    }
                                    color="blue"
                                />
                                
                                {/* ⭐⭐ FILTER BY ROLE */}
                                <FilterButton 
                                    onFilterChange={handleRoleFilterChange}
                                    filterOptions={roleOptions}
                                    activeFilter={selectedRole}
                                    buttonText={
                                        selectedRole && selectedRole !== "all" 
                                            ? `Role: ${getLabel(selectedRole, roleOptions)}`
                                            : "Filter by Role"
                                    }
                                    color="purple"
                                />
                                
                                {/* ⭐⭐ FILTER BY STATUS */}
                                <FilterButton 
                                    onFilterChange={handleStatusFilterChange}
                                    filterOptions={statusOptions}
                                    activeFilter={selectedStatus}
                                    buttonText={
                                        selectedStatus && selectedStatus !== "all" 
                                            ? `Status: ${getLabel(selectedStatus, statusOptions)}`
                                            : "Filter by Status"
                                    }
                                    color="green"
                                />
                                
                                {/* CLEAR FILTERS BUTTON */}
                                {activeFiltersCount > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={clearAllFilters}
                                        className="text-sm h-10 flex items-center gap-2"
                                        size="sm"
                                    >
                                        <X className="h-3 w-3" />
                                        Clear Filters ({activeFiltersCount})
                                    </Button>
                                )}
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
                        
                        {/* ⭐⭐ ACTIVE FILTERS BADGES */}
                        {activeFiltersCount > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                                {searchTerm && (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Tag className="h-3 w-3" />
                                        <span>Search: "{searchTerm}"</span>
                                        <button 
                                            onClick={() => setSearchTerm("")}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                            title="Remove search"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                                {selectedPosition && selectedPosition !== "all" && (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Briefcase className="h-3 w-3" />
                                        <span>Position: {getLabel(selectedPosition, positionOptions)}</span>
                                        <button 
                                            onClick={() => setSelectedPosition(null)}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                            title="Remove position filter"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                                {selectedRole && selectedRole !== "all" && (
                                    <div className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <Users className="h-3 w-3" />
                                        <span>Role: {getLabel(selectedRole, roleOptions)}</span>
                                        <button 
                                            onClick={() => setSelectedRole(null)}
                                            className="text-purple-600 hover:text-purple-800 ml-1"
                                            title="Remove role filter"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                                {selectedStatus && selectedStatus !== "all" && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                        <UserCheck className="h-3 w-3" />
                                        <span>Status: {getLabel(selectedStatus, statusOptions)}</span>
                                        <button 
                                            onClick={() => setSelectedStatus(null)}
                                            className="text-green-600 hover:text-green-800 ml-1"
                                            title="Remove status filter"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ⭐⭐ FILTER STATUS INFO */}
                        {activeFiltersCount > 0 && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <span>
                                            Showing <span className="font-semibold">{filteredUsers.length}</span> users
                                            {selectedPosition && selectedPosition !== "all" && (
                                                <span> in <span className="font-semibold">{getLabel(selectedPosition, positionOptions)}</span></span>
                                            )}
                                            {selectedRole && selectedRole !== "all" && (
                                                <span> with role <span className="font-semibold">{getLabel(selectedRole, roleOptions)}</span></span>
                                            )}
                                            {selectedStatus && selectedStatus !== "all" && (
                                                <span> with status <span className="font-semibold">{getLabel(selectedStatus, statusOptions)}</span></span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedPosition && selectedPosition !== "all" && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                                                <Briefcase className="h-3 w-3" />
                                                {getLabel(selectedPosition, positionOptions)}
                                            </span>
                                        )}
                                        {selectedRole && selectedRole !== "all" && (
                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {getLabel(selectedRole, roleOptions)}
                                            </span>
                                        )}
                                        {selectedStatus && selectedStatus !== "all" && (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                                                <UserCheck className="h-3 w-3" />
                                                {getLabel(selectedStatus, statusOptions)}
                                            </span>
                                        )}
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
                                        {activeFiltersCount > 0
                                            ? "No users match your current filters. Try adjusting your search or filters."
                                            : "Get started by adding your first user."
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {activeFiltersCount > 0 && (
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
                                        Showing {filteredUsers.length} users
                                        {activeFiltersCount > 0 && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied)
                                            </span>
                                        )}
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