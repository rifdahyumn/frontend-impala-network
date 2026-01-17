import toast from "react-hot-toast"
import heteroSemarangService from "../services/heteroSemarangService"
import { useCallback, useEffect, useState } from "react"
import { useConfirmDialog } from "./useConfirmDialog"

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
]

export const useHeteroSemarang = (initialFilters = {}) => {
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

    const fetchSpaceOptions = useCallback(async () => {
        try {
            setLoadingSpaceOptions(true)
            setSpaceOptionsError(null)

            const result = await heteroSemarangService.fetchSpaceOptions()

            if (result && result.success) {
                setSpaceOptions(result.data)
            } else {
                throw new Error(result?.message || 'Failed to fetch space options')
            }

        } catch (error) {
            console.error('Error fetching space options:', error)
            setSpaceOptionsError(error.message)
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
            else if (lowerSpace.includes('rembug 1'));
            else if (lowerSpace.includes('rembug 2'));
            else if (lowerSpace.includes('rembug 3'));
            else if (lowerSpace.includes('private office 1-3'));
            else if (lowerSpace.includes('private office 4-5'));
            else if (lowerSpace.includes('private office 6'));
            else if (lowerSpace.includes('space gatra'));
            else if (lowerSpace.includes('space maneka'));
            else if (lowerSpace.includes('space outdoor'));
            else if (lowerSpace.includes('virtual office'));
            else if (lowerSpace.includes('course'));

            return {
                value: lowerSpace,
                label: `${space}`,
                original: space
            }
        })

        const uniqueDataSPaces = [...new Map(dataSpaces.map(item => [item.value, item])).values()]

        return uniqueDataSPaces.sort((a, b) => a.original.localeCompare(b.original))
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

    const fetchMembers = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters;

            const result = await heteroSemarangService.fetchHeteroSemarang({
                page,
                limit: pagination.limit,
                ...currentFilters
            })

            setMembers(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.metadata?.pagination?.page || page,
                total: result.metadata?.pagination?.total || 0,
                totalPages: result.metadata?.pagination?.totalPages || 0,
            }))

            if (spaceOptions.length === 0 && result.data && result.data.length > 0) {
                const extractedSpaces = extractSpacesFromMembers(result.data)
                setSpaceOptions(extractedSpaces)
            }

        } catch (error) {
            console.error('Error fetching members:', error)
            setError(error.message)
            toast.error('Failed to load member')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit, spaceOptions.length, extractSpacesFromMembers])

    const fetchMemberStats  = useCallback(async () => {
        try {
            setStatsLoading(true)
            const result = await heteroSemarangService.fetchMemberStats()

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
        } catch (error) {
            console.error('Error fetching member stats:', error)
            toast.error('Failed to load statistics')
            
            const total = members.length
            const active = members.filter(m => m.status === 'active').length
            const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : "0.0"

            setStats({
                totalMembers: total,
                activeMembers: active,
                growthPercentage: "0",
                activePercentage
            })
        } finally {
            setStatsLoading(false)
        }
    }, [members.length])

    const refetchWithFilters = useCallback((newFilters) => {
        setFilters(newFilters)
        fetchMembers(1, newFilters)
    }, [fetchMembers])

    const changePage = useCallback((page) => {
        fetchMembers(page)
    }, [fetchMembers])

    useEffect(() => {
        fetchMembers(1)
        fetchMemberStats()
        fetchSpaceOptions()
    }, [fetchMembers, fetchMemberStats, fetchSpaceOptions])

    const addMemberHeteroSemarang = async (memberData) => {
        try {
            const result = await heteroSemarangService.addMemberHeteroSemarang(memberData)
            toast.success('Member add successfully')

            const newSpace = memberData.space
            if (newSpace && !spaceOptions.some(s => s.original === newSpace)) {
                await fetchSpaceOptions()
            }

            await fetchMembers(pagination.page)
            await fetchMemberStats()
            return result
        } catch (error) {
            toast.error('Failed to add member')
            throw error
        }
    }

    const updateMemberHeteroSemarang = async (memberId, memberData) => {
        try {
            setLoading(true)

            const result = await heteroSemarangService.updateMemberHeteroSemarang(memberId, memberData)
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

    const deleteMemberHeteroSemarang = async (memberId) => {
        try {
            setLoading(true)
            await heteroSemarangService.deleteMemberHeteroSemarang(memberId)
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
            fetchMembers(pagination.page),
            fetchMemberStats(),
            fetchSpaceOptions()
        ])
    }, [fetchMembers, pagination.page, fetchMemberStats, fetchSpaceOptions])

    const refetchSpaceOptions = useCallback(async () => {
        await fetchSpaceOptions()
    }, [fetchSpaceOptions])

    return {
        ...confirmDialog, members, loading, error, pagination, filters, spaceOptions, 
        loadingSpaceOptions, spaceOptionsError, genderOptions, setFilters: refetchWithFilters, 
        fetchMembers: changePage, addMemberHeteroSemarang, updateMemberHeteroSemarang, 
        deleteMemberHeteroSemarang, fetchMemberStats, stats, statsLoading, refreshAll, 
        fetchSpaceOptions: refetchSpaceOptions, extractSpacesFromMembers, getSpaceLabel, getGenderLabel
    }
}