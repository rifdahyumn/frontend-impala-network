import toast from "react-hot-toast"
import heteroSemarangService from "../services/heteroSemarangService"
import { useCallback, useEffect, useState } from "react"
import { useConfirmDialog } from "./useConfirmDialog"

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
        } catch (error) {
            console.error('Error fetching members:', error)
            setError(error.message)
            toast.error('Failed to load member')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit])

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
    }, [fetchMembers])

    const addMemberHeteroSemarang = async (memberData) => {
        try {
            const result = await heteroSemarangService.addMemberHeteroSemarang(memberData)
            toast.success('Member add successfully')

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
            fetchMemberStats()
        ])
    }, [fetchMembers, pagination.page, fetchMemberStats])

    return {
        ...confirmDialog, members, loading, error, pagination, filters, setFilters: refetchWithFilters, 
        fetchMembers: changePage, addMemberHeteroSemarang, updateMemberHeteroSemarang, deleteMemberHeteroSemarang,
        fetchMemberStats, stats, statsLoading, refreshAll
    }
}