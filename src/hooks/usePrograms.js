import toast from "react-hot-toast"
import programService from "../services/programService"
import { useCallback, useEffect, useState } from "react"

export const usePrograms = (initialFilters = {}) => {
    const [programs, setPrograms] = useState([])
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

    const fetchPrograms = useCallback(async (page = 1, customFilters = null) => {
        try {
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filters

            const result = await programService.fetchPrograms({
                page,
                limit: pagination.limit,
                ...currentFilters  
            })

            setPrograms(result.data || [])
            setPagination(prev => ({
                ...prev,
                page: result.pagination?.page || page,
                total: result.pagination?.total || 0,
                totalPages: result.pagination?.totalPages || 0,
            }))
        } catch (error) {
            console.error('Error fetching programs:', error)
            setError(error.messsage);
            toast.error('Failed to load programs')
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.limit])

    const refetchWithFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        fetchPrograms(1, newFilters)
    }, [fetchPrograms]);

    const changePage = useCallback((page) => {
        fetchPrograms(page);
    }, [fetchPrograms]);

    useEffect(() => {
        fetchPrograms(1);
    }, [fetchPrograms]); 

    const addProgram = async (programData) => {
        try {
            const result = await programService.addProgram(programData)
            toast.success('Client add successfully')

            await fetchPrograms(pagination.page)
            return result;
        } catch (error) {
            toast.error('Failed to add program')
            throw error;
        }
    }

    const updateProgram = async (programId, programData) => {
        try {
            setLoading(true)
            const result = await programService.updateProgram(programId, programData)
            toast.success("Client updated successfully")

            setPrograms(prePrograms => 
                prePrograms.map(program => 
                    program.id === programId
                        ? { ...program, ...programData, ...result.data || result }
                        : program
                )
            );

            return result.data || result;
        } catch (error) {
            toast.error('Failed to update client')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    const deleteProgram = async (programId) => {
        try {
            setLoading(true)
            await programService.deleteProgram(programId)
            toast.success('Client deteled successfully')

            setPrograms(prevPrograms =>
                prevPrograms.filter(program => program.id !== programId)
            )

            setPagination(prev => ({
                ...prev,
                total: prev.total - 1
            }))
        } catch (error) {
            toast.error('Failed to delete program')
            throw error;
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrograms(1)
    }, [])

    return {
        programs, loading, error, pagination, filters, setFilters: refetchWithFilters, fetchPrograms: changePage, addProgram, updateProgram, deleteProgram, setPagination, refetch: () => fetchPrograms(pagination.page)
    }
}