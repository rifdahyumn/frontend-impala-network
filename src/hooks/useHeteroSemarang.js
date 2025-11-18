import toast from "react-hot-toast"
import heteroSemarangService from "../services/heteroSemarangService"
import { useCallback, useEffect, useState } from "react"

export const useHeteroSemarang = (initialFilters = {}) => {
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

    useEffect(() => {
        fetchMembers(1)
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
                page: result.meta?.pagination?.page || page,
                total: result.meta?.pagination?.total || 0,
                totalPages: result.meta?.pagination?.totalPages || 0,
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

    return {
        members, loading, error, pagination, filters, setFilters: refetchWithFilters, fetchMembers: changePage
    }
}