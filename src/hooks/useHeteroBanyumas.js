import toast from "react-hot-toast"
import { useCallback, useEffect, useState } from "react"
import heteroBanyumasService from "../services/heteroBanyumasService"
import { useConfirmDialog } from "./useConfirmDialog"

export const useHeteroBanyumas = (initialFilters = {}) => {
    const confirmDialog = useConfirmDialog()

    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        ...initialFilters
    })

    const fetchMembers = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters;

            const result = await heteroBanyumasService.fetchHeteroBanyumas({
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

    const refetchWithFilters = useCallback((newFilters) => {
        setFilters(newFilters)
    }, [])

    const changePage = useCallback((page) => {
        fetchMembers(page)
    }, [fetchMembers])

    useEffect(() => {
        fetchMembers(1)
    }, [])

    const addMemberHeteroBanyumas = async (memberData) => {
        try {
            const result = await heteroBanyumasService.addMemberHeteroBanyumas(memberData)
            toast.success('Member add successfully')

            await fetchMembers(pagination.page)
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
        } catch (error) {
            toast.error('Failed to delete member')
            throw error
        } finally {
            setLoading(false)
        }
    }

    return {
        ...confirmDialog, members, loading, error, pagination, filters, setFilters: refetchWithFilters, 
        fetchMembers: changePage, addMemberHeteroBanyumas, updateMemberHeteroBanyumas, deleteMemberHeteroBanyumas
    }
}