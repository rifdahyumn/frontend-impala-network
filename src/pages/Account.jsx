import AccountContent from "../components/Content/AccountContent";
import Header from "../components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Loader2, Users, UserCheck, AlertCircle, X, Filter, Briefcase, Check, Building2, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "../components/ui/button";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; 
import SearchBar from '../components/SearchFilter/SearchBar';
import MemberTable from '../components/MemberTable/MemberTable';
import Pagination from '../components/Pagination/Pagination';
import AddUser from "../components/AddButton/AddUser";
import { useUsers } from "../hooks/useUser";
import toast from "react-hot-toast";
import userService from "../services/userService";
import * as XLSX from 'xlsx';

const Account = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [forceRenderKey, setForceRenderKey] = useState(0);
    
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        config: null
    });
    
    const [isExporting, setIsExporting] = useState(false);
    
    const [highlightDetail, setHighlightDetail] = useState(false);
    
    const userDetailRef = useRef(null);
    const filterRef = useRef(null)
    
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1); 
    
    const [filters, setFilters] = useState({
        position: null, 
        role: null, 
    });
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        position: filters.position || '',
        role: filters.role || 'all'
    });
    
    const [isInitialLoad, setIsInitialLoad] = useState(true); 

    const { 
        users, 
        loading, 
        error, 
        pagination, 
        fetchUsers, 
        refreshUsers, 
        addUser, 
        updateUser, 
        totalStats,       
        statsLoading,
        exportUsers,
        updateUserInList  
    } = useUsers();

    const showConfirm = (config) => {
        setConfirmModal({
            isOpen: true,
            config
        });
    };

    const handleConfirm = async () => {
        if (confirmModal.config && confirmModal.config.onConfirm) {
            try {
                await confirmModal.config.onConfirm();
            } catch (error) {
                console.error('Error in confirm action:', error);
                toast.error(error.message || 'Failed to perform action');
            }
        }
        setConfirmModal({ isOpen: false, config: null });
    };

    const handleCancel = () => {
        if (confirmModal.config && confirmModal.config.onCancel) {
            confirmModal.config.onCancel();
        }
        setConfirmModal({ isOpen: false, config: null });
    };

    const getOriginalLabel = (value, options) => {
        if (!value) return "";
        const option = options.find(opt => opt.value === value);
        return option ? option.original || option.label : value;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const positionOptions = [
        { value: 'Managing Director', label: 'Managing Director', original: 'Managing Director' },
        { value: 'Director', label: 'Director', original: 'Director' },
        { value: 'Head Manager', label: 'Head Manager', original: 'Head Manager' },
        { value: 'Finance', label: 'Finance', original: 'Finance' },
        { value: 'Legal', label: 'Legal', original: 'Legal' },
        { value: 'Talent Manager', label: 'Talent Manager', original: 'Talent Manager' },
        { value: 'Ecosystem Manager', label: 'Ecosystem Manager', original: 'Ecosystem Manager' },
        { value: 'Strategic Partnership Executive', label: 'Strategic Partnership Executive', original: 'Strategic Partnership Executive' },
        { value: 'Program Manager', label: 'Program Manager', original: 'Program Manager' },
        { value: 'Space Manager', label: 'Space Manager', original: 'Space Manager' },
        { value: 'Creative', label: 'Creative', original: 'Creative' }
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const roleOptions = [
        { value: 'admin', label: 'Admin', original: 'Admin' },
        { value: 'manajer_program', label: 'Manajer Program', original: 'Manajer Program' },
        { value: 'komunitas', label: 'Komunitas', original: 'Komunitas' }
    ];

const handleExport = useCallback(async () => {
    try {
        if (totalStats.totalUsers === 0) {
            toast.error('No data to export');
            return;
        }
        
        setIsExporting(true);
        toast.loading('Menyiapkan data export...', { id: 'export-toast' });

        const exportFilters = {
            search: searchTerm || undefined,
            position: filters.position || undefined,
            role: filters.role !== 'all' ? filters.role : undefined,
            all: true 
        };

        const result = await exportUsers(exportFilters, true);
        
        if (result?.success) {
            if (result.isBlob) {
                const url = window.URL.createObjectURL(result.data);
                const a = document.createElement('a');
                a.href = url;
                
                const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
                a.download = `user_accounts_export_${dateStr}.xlsx`;
                
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                toast.success(`Berhasil mengexport users ke Excel`, { id: 'export-toast' });
            } else {
                const allUsers = result.data || [];
            }
        } else {
            throw new Error('Export failed');
        }
        
    } catch (error) {
        console.error('Export failed:', error);
        toast.error(`Gagal mengexport data: ${error.message}`, { id: 'export-toast' });
        
        console.warn('Mencoba fallback manual...');
        await manualExportFallback();
        
    } finally {
        setIsExporting(false);
    }
}, [totalStats.totalUsers, searchTerm, filters, exportUsers]);

const fetchAllUsers = useCallback(async (filters = {}) => {
    try {
        if (userService.clearListCache) {
            userService.clearListCache();
        }
        
        let allUsers = [];
        let page = 1;
        const limit = 100; 
        let totalPages = 1;
        
        while (page <= totalPages) {
            const response = await userService.getUsers({
                ...filters,
                page,
                limit
            });
            
            if (response?.success && response.data) {
                const users = response.data;
                allUsers = [...allUsers, ...users];
                
                if (response.pagination) {
                    totalPages = response.pagination.totalPages || 1;
                }
                
                if (users.length < limit) {
                    break;
                }
            } else {
                break;
            }
            
            page++;
        }
        
        return allUsers;
        
    } catch (error) {
        console.error('Error fetching all users:', error);
        toast.error('Gagal mengambil data untuk export');
        return [];
    }
}, []);

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

    const getFilterLabel = (filterType) => {
        if (filterType === 'position' && filters.position) {
            return getOriginalLabel(filters.position, positionOptions);
        }
        if (filterType === 'role' && filters.role) {
            return filters.role === 'all' ? 'All Roles' : getOriginalLabel(filters.role, roleOptions);
        }
        return '';
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.position) count++;
        if (filters.role && filters.role !== 'all') count++;
        return count;
    };

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

    const userStats = useMemo(() => {
        if (loading && isInitialLoad) {
            return [
                {
                    title: "Total Users (All Pages)",
                    value: "...",
                    subtitle: "Loading...",
                    percentage: "...",
                    trend: "neutral",
                    period: "Total",
                    icon: Users,
                    color: "blue",
                    description: "Fetching data...",
                    loading: true
                },
                {
                    title: "Active Users (All Pages)",
                    value: "...",
                    subtitle: "",
                    percentage: "...",
                    trend: "neutral",
                    period: "Total", 
                    icon: UserCheck,
                    color: "green",
                    description: "Fetching data...",
                    loading: true
                }
            ];
        }

        const totalUsers = totalStats.totalUsers || 0;
        const activeUsers = totalStats.totalActive || 0;
        
        const activePercentage = totalUsers > 0 
            ? ((activeUsers / totalUsers) * 100).toFixed(1) 
            : "0";

        const currentPageActive = users.filter(user => 
            user.status?.toLowerCase() === 'active'
        ).length;

        let trend = "neutral";
        const percentageValue = parseFloat(activePercentage);
        if (percentageValue > 70) {
            trend = "up";
        } else if (percentageValue < 30) {
            trend = "down";
        }

        return [
            {
                title: "Total Users",
                value: totalUsers.toString(),
                subtitle: getTotalActiveCriteria() > 0 
                    ? `Showing ${users.length} filtered` 
                    : `Page ${pagination.page || 1} of ${pagination.totalPages || 1}`,
                percentage: "100%",
                trend: "neutral",
                period: "Total",
                icon: Users,
                color: "blue",
                description: getTotalActiveCriteria() > 0 
                    ? `${users.length} users match current filters`
                    : `Total registered users in system`,
                loading: statsLoading
            },
            {
                title: "Active Users",
                value: activeUsers.toString(),
                subtitle: getTotalActiveCriteria() > 0 
                    ? `${currentPageActive} active in current page` 
                    : "",
                percentage: `${activePercentage}%`,
                trend: trend,
                period: "Total", 
                icon: UserCheck,
                color: "green",
                description: getTotalActiveCriteria() > 0
                    ? `${currentPageActive} of ${users.length} filtered users are active`
                    : `${activePercentage}% of total users are active`,
                loading: statsLoading
            }
        ];
    }, [totalStats, users, loading, isInitialLoad, pagination.page, pagination.totalPages, getTotalActiveCriteria, statsLoading]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);

        fetchUsers(1, {
            search: term,
            position: filters.position || '',
            role: filters.role || ''
        });
    };

    const handleTempPositionChange = (position) => {
        setTempFilters(prev => ({ 
            ...prev, 
            position: prev.position === position ? '' : position 
        }));
    };

    const handleTempRoleChange = (role) => {
        setTempFilters(prev => ({ ...prev, role }));
    };

    const handleApplyFilters = () => {
        setFilters({
            position: tempFilters.position || null,
            role: tempFilters.role || null
        });

        setIsFilterOpen(false);
        setCurrentPage(1);
        
        const roleToSend = tempFilters.role === 'all' ? '' : tempFilters.role;
        
        fetchUsers(1, {
            search: searchTerm,
            position: tempFilters.position || '',
            role: roleToSend,  
            limit: 100
        });
    };

    const handleCancelFilters = () => {
        setTempFilters({
            position: filters.position || '',
            role: filters.role || 'all'
        });
        setIsFilterOpen(false);
    };

    const handleClearAllTempFilters = () => {
        setTempFilters({
            position: '',
            role: 'all'
        });
    };

    const handleClearAllFilters = () => {
        setSearchTerm("");
        setFilters({
            position: null,
            role: null,
        });
        setSelectedUser(null);
        setCurrentPage(1);
        
        fetchUsers(1, {
            search: '',
            position: '',
            role: ''
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilter = (filterType) => {
        let newFilters = { ...filters };
        let newSearchTerm = searchTerm;
        
        if (filterType === 'search') {
            setSearchTerm("");
            newSearchTerm = "";
        } else if (filterType === 'position') {
            newFilters.position = null;
        } else if (filterType === 'role') {
            newFilters.role = null;
        }
        
        setFilters(newFilters);
        setCurrentPage(1);
        
        fetchUsers(1, {
            search: filterType === 'search' ? '' : newSearchTerm,
            position: filterType === 'position' ? '' : (newFilters.position || ''),
            role: filterType === 'role' ? '' : (newFilters.role || '')
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false)
            }
        }

        if (setIsFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isFilterOpen])

    useEffect(() => {
        setTempFilters({
            position: filters.position || '',
            role: filters.role || 'all'
        });
    }, [filters]);

    useEffect(() => {
        if (users && users.length > 0) {
            setIsInitialLoad(false);
        }
    }, [users]);

    useEffect(() => {
        fetchUsers(1, {
            search: '',
            position: '',
            role: ''
        });
    }, []); 

    const handleAddUser = () => {
        setIsAddUserModalOpen(true);
    };

    const handleAddUserSuccess = async (userData) => {
        try {
            await addUser(userData);
            setIsAddUserModalOpen(false);
            toast.success('User added successfully');
            
            fetchUsers(currentPage, {
                search: searchTerm,
                position: filters.position || '',
                role: filters.role || ''
            });
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error(error.message || 'Failed to add user');
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditUser = async (userId, userData) => {
        try {
            const updatedUser = await updateUser(userId, userData);

            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(prev => ({
                    ...prev,
                    ...userData,
                    ...updatedUser
                }));
            }

            setIsEditModalOpen(false);
            setEditingUser(null);
            toast.success('User updated successfully');
            
            fetchUsers(currentPage, {
                search: searchTerm,
                position: filters.position || '',
                role: filters.role || ''
            });
        } catch (error) {
            console.error('Error updating', error);
            toast.error(error.message || 'Failed to update user');
        }
    };

    const handleUserUpdated = useCallback(async (updatedDataFromChild) => {       
        if (updatedDataFromChild) {
            const selectedId = updatedDataFromChild.id;
            
            setSelectedUser(updatedDataFromChild);
            
            if (updateUserInList) {
                updateUserInList(selectedId, updatedDataFromChild);
            }
            
            setForceRenderKey(prev => prev + 1);
            
            toast.success('User status updated successfully', { id: 'user-update' });
            return;
        }
        
        const selectedId = selectedUser?.id;
        
        if (!selectedId) return;
        
        try {
            toast.loading('Updating user status...', { id: 'user-update' });
            
            const response = await userService.getUserById(selectedId);
            
            if (response?.success && response.data) {
                const updatedUserData = response.data;
                
                setSelectedUser(updatedUserData);
                
                if (updateUserInList) {
                    updateUserInList(selectedId, updatedUserData);
                }
                
                setForceRenderKey(prev => prev + 1);
                
                toast.success('User status updated successfully', { id: 'user-update' });
            }
            
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update user status', { id: 'user-update' });
        }
    }, [selectedUser, updateUserInList]);

    const handlePageChange = (page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(page);
        
        fetchUsers(page, {
            search: searchTerm,
            position: filters.position || '',
            role: filters.role || ''
        });
    };

    const tableConfig = {
        headers: ['No', 'Employee ID', 'Full Name', 'Email', 'Position', 'Role', 'Status', 'Last Login', 'Action'],
        title: 'User Account Management',
        addButton: 'Add User',
        detailTitle: 'User Details'
    };

    const formattedUsers = useMemo(() => {
        if (!users || users.length === 0) {
            return [];
        }

        return users.map((user, index) => {
            const itemNumber = (currentPage - 1) * (pagination.limit || 10) + index + 1;

            return {
                id: user.id,
                no: itemNumber,
                employee_id: user.employee_id || '-',
                full_name: user.full_name || '-',
                email: user.email || '-',
                password: user.password || '',
                role: user.role || '-',
                last_login: user.last_login || '-',
                status: user.status || '-',
                phone: user.phone || '-',
                position: user.position || '-',
                avatar: user.avatar || null,
                action: 'Detail',
                ...user
            };
        });
    }, [users, currentPage, pagination.limit]);

    const UserStatsCards = ({ statsData }) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {statsData.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border relative">
                        {stat.loading && (
                            <div className="absolute top-2 right-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-2xl font-bold text-gray-800">
                                            {stat.value}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading && isInitialLoad) {
        return (
            <div className="flex pt-20 min-h-screen bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
                        <Users className="h-8 w-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Loading User Account</h3>
                    <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data...</p>
                    <div className="mt-6 w-64 bg-gray-200 rounded-full h-2 mx-auto">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div key={forceRenderKey} className='flex pt-20 min-h-screen bg-gray-100'>
            <div className='flex-1 p-6'>
                <Header />
                
                <UserStatsCards statsData={userStats} />

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{tableConfig.title}</CardTitle>
                        <div className="flex items-center gap-2">
                            {loading && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Loading users...</span>
                                </div>
                            )}
                            {statsLoading && !loading && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Updating global stats...</span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Connection Error</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                        <div className="mt-3 flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
                                            >
                                                <Loader2 className="h-3 w-3" />
                                                Retry Connection
                                            </Button>
                                        </div>
                                    </div>
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
                                        <div 
                                            ref={filterRef}
                                            className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[450px]"
                                        >
                                            <div className="p-3 border-b">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-gray-900 text-xs">Filter Options</h3>
                                                    <span className="text-xs text-gray-500">
                                                        {getTempActiveFiltersCount()} filter{getTempActiveFiltersCount() !== 1 ? 's' : ''} selected
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3">
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
                                
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 whitespace-nowrap"
                                    disabled={loading || totalStats.totalUsers === 0 || isExporting}
                                    onClick={handleExport}
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    {isExporting ? 'Exporting...' : 'Export'}
                                </Button>
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

                        {/* GANTI filteredUsers dengan users */}
                        {!loading && users.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        {error ? "Connection Failed" : "No users found"}
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        {error 
                                            ? "Unable to connect to server. Please check your connection."
                                            : getTotalActiveCriteria() > 0 
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
                        )}

                        {/* GANTI filteredUsers dengan users */}
                        {users.length > 0 && (
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
                                    <Pagination 
                                        currentPage={pagination.page || 1}
                                        totalPages={pagination.totalPages || 1}
                                        totalItems={pagination.total || 0}
                                        itemsPerPage={pagination.limit || 10}
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
                        key={selectedUser?.id + selectedUser?.status}
                        selectedUser={selectedUser}
                        onOpenEditModal={handleOpenEditModal}
                        detailTitle={tableConfig.detailTitle}
                        onUserUpdated={handleUserUpdated}
                        onClientDeleted={() => {
                            refreshUsers();
                            setSelectedUser(null);
                        }}
                        showConfirm={showConfirm}
                        handleConfirm={handleConfirm}
                        handleCancel={handleCancel}
                        isOpen={confirmModal.isOpen}
                        config={confirmModal.config}
                    />
                </div>
                
                <AddUser 
                    isAddUserModalOpen={isAddUserModalOpen || isEditModalOpen} 
                    setIsAddUserModalOpen={(open) => {
                        if (!open) {
                            setIsAddUserModalOpen(false);
                            setIsEditModalOpen(false);
                            setEditingUser(null);
                        }
                    }}
                    onAddUser={handleAddUserSuccess}
                    editData={editingUser}
                    onEditUser={handleEditUser}
                />
            </div>
        </div>
    );
};

export default Account;