import toast from "react-hot-toast"
import { useCallback, useEffect, useRef, useState } from "react"
import heteroBanyumasService from "../services/heteroBanyumasService"
import { useConfirmDialog } from "./useConfirmDialog"

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
]

export const useHeteroBanyumas = (initialFilters = {}) => {
    const confirmDialog = useConfirmDialog()

    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        ...initialFilters
    })

    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        growthPercentage: '0%',
        activePercentage: '0%'
    })

    const [statsLoading, setStatsLoading] = useState(false)
    const [spaceOptions, setSpaceOptions] = useState([])
    const [loadingSpaceOptions, setLoadingSpaceOptions] = useState(false)
    const [spaceOptionsError, setSpaceOptionsError] = useState(null)

    const [allMembers, setAllMembers] = useState([])
    const [isFetchingAll, setIsFetchingAll] = useState(false)

    const filtersRef = useRef(filters)
    const paginationRef = useRef(pagination)
    const spaceOptionsRef = useRef(spaceOptions)

    useEffect(() => {
        filtersRef.current = filters
    }, [filters])

    useEffect(() => {
        paginationRef.current = pagination
    }, [pagination])

    useEffect(() => {
        spaceOptionsRef.current = spaceOptions
    }, [spaceOptions])

    const fetchSpaceOptions = useCallback(async () => {
        try {
            setLoadingSpaceOptions(true)
            setSpaceOptionsError(null)

            const result = await heteroBanyumasService.fetchSpaceOptions()

            if (result && result.success) {
                setSpaceOptions(result.data)
            } else {
                throw new Error(result?.message || 'Failed to fetch space options')
            }

        } catch (err) {
            setSpaceOptionsError(err.message)
            setSpaceOptions([])
        } finally {
            setLoadingSpaceOptions(false)
        }
    }, [])

    const extractSpacesFromMembers = useCallback((membersList) => {
        if (!membersList.length) return []

        const existingSpaces = membersList
            .map(member => member.space)
            .filter(space => space && space.trim() !== "")

        const dataSpaces = existingSpaces.map(space => {
            const lowerSpace = space.toLowerCase()

            if (lowerSpace.includes('maneka personal'));
            else if (lowerSpace.includes('maneka group'));
            else if (lowerSpace.includes('rembug meeting room'));
            else if (lowerSpace.includes('rembug meeting room (weekend)'));
            else if (lowerSpace.includes('private office 1'));
            else if (lowerSpace.includes('private office 2'));
            else if (lowerSpace.includes('private office 3 & 4'));
            else if (lowerSpace.includes('private office 5'));
            else if (lowerSpace.includes('private office 6'));
            else if (lowerSpace.includes('virtual office'));
            else if (lowerSpace.includes('gatra event space'));
            else if (lowerSpace.includes('gatra wedding hall'));
            else if (lowerSpace.includes('outdoorspace'));
            else if (lowerSpace.includes('amphitheater'));
            else if (lowerSpace.includes('basketball court personal'));
            else if (lowerSpace.includes('basketball court membership'));
            else if (lowerSpace.includes('futsal court personal'));
            else if (lowerSpace.includes('futsal court membership'));
            else if (lowerSpace.includes('tennis court personal'));
            else if (lowerSpace.includes('tennis court membership'));
            else if (lowerSpace.includes('co-living room 1'));
            else if (lowerSpace.includes('co-living room 2'));
            else if (lowerSpace.includes('co-living room 3'));
            else if (lowerSpace.includes('co-living room 4'));
            else if (lowerSpace.includes('makerspace'));

            return {
                value: lowerSpace,
                label: `${space}`,
                original: space
            }
        })

        const uniqueDataSpaces = [...new Map(dataSpaces.map(item => [item.value, item])).values()]

        return uniqueDataSpaces.sort((a, b) => a.original.localeCompare(b.original))
    }, [])

    const getSpaceLabel = useCallback((spaceValue) => {
        if (!spaceValue || spaceValue === 'all') return 'All Spaces'

        const space = spaceOptions.find(s => s.value === spaceValue)
        return space ? space.original : spaceValue
    }, [spaceOptions])

    const getGenderLabel = useCallback((genderValue) => {
        if (!genderValue) return ""
        const gender = genderOptions.find(g => g.value === genderValue)
        return gender ? gender.label : genderValue
    }, [])

    const fetchAllMembers = useCallback(async (customFilters = null) => {
        try {
            setIsFetchingAll(true)

            const currentFilters = customFilters !== null ? customFilters : filtersRef.current

            const serviceParams = {
                page: 1,
                limit: 10000, 
                search: currentFilters.search || '',
                gender: currentFilters.gender || '',
                space: currentFilters.space || '',
                status: currentFilters.status || '',
                showAllOnSearch: 'true',
                export: true 
            }

            let result;
            try {
                if (heteroBanyumasService.fetchAllMembers) {
                    result = await heteroBanyumasService.fetchAllMembers({
                        search: currentFilters.search || '',
                        gender: currentFilters.gender || '',
                        space: currentFilters.space || '',
                        status: currentFilters.status || ''
                    });
                } else {
                    result = await heteroBanyumasService.fetchHeteroBanyumas(serviceParams);
                }
            } catch (error) {
                console.error('Service error:', error);
                throw error;
            }

            if (result && result.data) {
                setAllMembers(result.data);
                return result.data;
            } else if (result && Array.isArray(result)) {
                setAllMembers(result);
                return result;
            }

            console.warn('[fetchAllMembers] No data returned from service');
            toast.error('Tidak ada data yang ditemukan untuk diexport');
            return [];

        } catch (error) {
            console.error('Error fetching all members:', error)
            toast.error('Failed to fetch all members')
            return []
        } finally {
            setIsFetchingAll(false)
        }
    }, [])

    const fetchMembers = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters !== null ? customFilters : filtersRef.current

            const serviceParams = {
                page,
                limit: paginationRef.current.limit,
                search: currentFilters.search || '',
                gender: currentFilters.gender || '',
                space: currentFilters.space || '',
                status: currentFilters.status || '',
                showAllOnSearch: 'false'
            }

            const result = await heteroBanyumasService.fetchHeteroBanyumas(serviceParams)

            setMembers(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.metadata?.pagination?.page || page,
                total: result.metadata?.pagination?.total || 0,
                totalPages: result.metadata?.pagination?.totalPages || 0,
            }))

        } catch (error) {
            console.error('Error fetching members:', error)
            setError(error.message)
            toast.error('Failed to load member')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchMemberStats  = useCallback(async () => {
            try {
                setStatsLoading(true)
                const result = await heteroBanyumasService.fetchMemberStats()
    
                if (result.success) {
                    setStats(result.data)
                } else {
                    const total = members.length
                    const active = members.filter(m => m.status === 'Active').length
                    const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : '0%'
    
                    setStats({
                        totalMembers: total,
                        activeMembers: active,
                        growthPercentage: '0%',
                        activePercentage
                    })
                }
            } catch {
                const total = members.length
                const active = members.filter(m => m.status === 'active').length
                const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : "0.0"
    
                setStats({
                    totalMembers: total,
                    activeMembers: active,
                    growthPercentage: "0",
                    activePercentage
                })
                toast.error('Failed to load statistics')
            } finally {
                setStatsLoading(false)
            }
        }, [members.length])

    const refetchWithFilters = useCallback((newFilters, resetPage = true) => {
        setFilters(newFilters)
    
        if (resetPage) {
            const newPagination = { ...paginationRef.current, page: 1 }
            setPagination(newPagination)
            paginationRef.current = newPagination
            
            fetchMembers(1, newFilters)
        } else {
            fetchMembers(paginationRef.current.page, newFilters)
        }
    }, [fetchMembers])

    const searchAndFilter = useCallback((searchTerm, filterOptions = {}) => {
        const newFilters = {
            search: searchTerm || undefined,
            status: filterOptions.status || undefined,
            gender: filterOptions.gender || undefined,
            space: filterOptions.space || undefined
        }
        
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key] === undefined) {
                delete newFilters[key]
            }
        })
        
        setFilters(newFilters)
        
        const newPagination = { ...paginationRef.current, page: 1 }
        setPagination(newPagination)
        paginationRef.current = newPagination
        
        fetchMembers(1, newFilters)
    }, [fetchMembers])

    const changePage = useCallback((page) => {
        setPagination(prev => ({ ...prev, page }))
        fetchMembers(page, filtersRef.current)
    }, [fetchMembers])

    useEffect(() => {
        const initializeData = async () => {
            try {
                await fetchMembers(1)
                await fetchMemberStats()
                await fetchSpaceOptions()
            } catch {
                // 
            }
        }
        initializeData()
    }, [])

    const addMemberHeteroBanyumas = async (memberData) => {
        try {
            const result = await heteroBanyumasService.addMemberHeteroBanyumas(memberData)
            toast.success('Member add successfully')

            const newSpace = memberData.space
            if (newSpace && !spaceOptions.some(s => s.original === newSpace)) {
                await fetchSpaceOptions()
            }

            await fetchMembers(paginationRef.current.page)
            await fetchMemberStats()
            return result
        } catch (error) {
            toast.error('Failed to add member')
            throw error
        }
    }

    const updateMemberHeteroBanyumas = async (memberId, memberData) => {
        try {
            setLoading(true)

            const result = await heteroBanyumasService.updateMemberHeteroBayumas(memberId, memberData)
            toast.success('Member updated successfully')

            setMembers(preMembers =>
                preMembers.map(member =>
                    member.id === memberId
                        ? { ...member, ...memberData, ...result.data || result }
                        : member
                )
            )

            const newSpace = memberData.space
            if (newSpace && !spaceOptions.some(s => s.original === newSpace)) {
                await fetchSpaceOptions()
            }

            await fetchMemberStats()
            return result.data || result
        } catch (error) {
            toast.error('Failed to update member')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteMemberHeteroBanyumas = async (memberId) => {
        try {
            setLoading(true)
            await heteroBanyumasService.deleteMemberHeteroBanyumas(memberId)
            toast.success('Member deleted successfully')

            setMembers(prevMembers => 
                prevMembers.filter(member => member.id !== memberId)
            )

            setPagination(prev => ({
                ...prev,
                total: prev.total - 1
            }))

            await fetchMemberStats()
        } catch (error) {
            toast.error('Failed to delete member')
            throw error
        } finally {
            setLoading(false)
        }
    }

    const refreshAll = useCallback(async () => {
        await Promise.all([
            fetchMembers(paginationRef.current.page),
            fetchMemberStats(),
            fetchSpaceOptions()
        ])
    }, [fetchMembers, fetchMemberStats, fetchSpaceOptions])

    const refetchSpaceOptions = useCallback(async () => {
        await fetchSpaceOptions()
    }, [fetchSpaceOptions])

    return {
        ...confirmDialog, members, loading, error, pagination, filters, spaceOptions, loadingSpaceOptions,
        genderOptions, allMembers, isFetchingAll, fetchAllMembers, setFilters: refetchWithFilters, updateFilters: refetchWithFilters,
        fetchMembers, handlePageChange: changePage, addMemberHeteroBanyumas, updateMemberHeteroBanyumas, deleteMemberHeteroBanyumas,
        fetchMemberStats, stats, statsLoading, refreshAll, searchAndFilter, fetchSpaceOptions: refetchSpaceOptions,
        extractSpacesFromMembers, getSpaceLabel, getGenderLabel, spaceOptionsError
    }
}