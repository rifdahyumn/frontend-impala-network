import impalaService from "../services/impalaService"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

export const useImpala = (initialFilters = {}) => {
    const [participant, setParticipant] = useState([])
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
        fetchImpala(1)
    }, [])

    const fetchImpala = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters

            const result = await impalaService.fetchImpala({
                page,
                limit: pagination.limit,
                ...currentFilters
            })

            setParticipant(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.pagination?.page || page,
                total: result.pagination?.total || 0,
                totalPages: result.pagination?.totalPages || 0
            }))
        } catch (error) {
            console.error('Error fetching participant:', error)
            setError(error.message)
            toast.error("Failed to load participant")
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit])



    return {
        participant, loading, error, pagination, filters, fetchImpala: setPagination, refetch: () => fetchImpala(pagination.page)
    }
}