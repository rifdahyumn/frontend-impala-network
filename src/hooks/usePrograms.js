import toast from "react-hot-toast"
import programService from "../services/programService"
import { useState, useEffect, useCallback, useRef } from "react"
import { debounce } from 'lodash'
import { useConfirmDialog } from "./useConfirmDialog"

export const usePrograms = (initialFilters = {}) => {
    const confirmDialog = useConfirmDialog()

    const [programs, setPrograms] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        isShowAllMode: false,
        showingAllResults: false,
        searchTerm: ''
    })

    const [programStats, setProgramStats] = useState(null)
    const [priceStats, setPriceStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)
    const [showAllOnSearch, setShowAllOnSearch] = useState(false)
    const [allPrograms, setAllPrograms] = useState([])
    const [allProgramsLoading, setAllProgramsLoading] = useState(false)

    const [isImporting, setIsImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);
    const [importError, setImportError] = useState(null);

    const lastFetchTimeRef = useRef(0)
    const lastStatsFetchTimeRef = useRef(0)
    const isMountedRef = useRef(true)
    const initialFetchDoneRef = useRef(false)

    const filtersRef = useRef({
        search: '',
        status: '',
        category: '',
        client: '',
        ...initialFilters
    })
    
    const abortControllerRef = useRef(null)
    const lastRequestIdRef = useRef(0)
    
    const [filters, setFilters] = useState({
        search: filtersRef.current.search,
        status: filtersRef.current.status,
        category: filtersRef.current.category,
        client: filtersRef.current.client
    })

    const fetchAllPrograms = useCallback(async () => {
        try {
            setAllProgramsLoading(true)

            const now = Date.now()
            if (now - lastFetchTimeRef.current < 2000) {
                await new Promise(resolve => setTimeout(resolve, 2000))
            }
            
            const result = await programService.fetchAllPrograms()

            lastFetchTimeRef.current = Date.now()
            
            setAllPrograms(result.data || [])
            return result.data || []
            
        } catch (error) {
            console.error('Error fetching all programs:', error)
            setAllPrograms([])
            return []
        } finally {
            setAllProgramsLoading(false)
        }
    }, [])

    const fetchPrograms = useCallback(async (page = 1, customFilters = null, showAll = false, requestId = null) => {
        try {
            const now = Date.now()
            if (now - lastFetchTimeRef.current < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastFetchTimeRef.current)))
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            abortControllerRef.current = new AbortController()
            
            const currentRequestId = requestId || Date.now()
            lastRequestIdRef.current = currentRequestId
            
            setLoading(true)
            setError(null)

            const currentFilters = customFilters || filtersRef.current

            const params = {
                page,
                limit: pagination.limit,
                ...(currentFilters.search && { search: currentFilters.search }),
                ...(currentFilters.status && { status: currentFilters.status }),
                ...(currentFilters.category && { category: currentFilters.category }),
                ...(currentFilters.client && { client: currentFilters.client }),
                ...(currentFilters.search && showAll && { showAllOnSearch: 'true' })
            }

            const result = await programService.fetchPrograms(params)

            if (currentRequestId !== lastRequestIdRef.current) {
                return
            }

            setPrograms(result.data || [])
            
            const paginationData = result.metadata?.pagination || {}
            setPagination(prev => ({
                ...prev,
                page: paginationData.page || page,
                limit: paginationData.limit || pagination.limit,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0,
                isShowAllMode: paginationData.isShowAllMode || false,
                showingAllResults: paginationData.showingAllResults || false,
                searchTerm: currentFilters.search || ''
            }))

            if (currentFilters.search && paginationData.showingAllResults) {
                setShowAllOnSearch(true)
            } else if (!currentFilters.search) {
                setShowAllOnSearch(false)
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                return
            }
            
            console.error(' Error fetching programs:', error)

            if (error.response?.status === 429 || error.message?.includes('rate limit')) {
                const retryAfter = error.response?.headers?.['retry-after'] || 5
                toast.error(`Too many requests. Please wait ${retryAfter} seconds`)

                setTimeout(() => {
                    if (isMountedRef.current) {
                        fetchPrograms(page, customFilters, showAll, requestId)
                    }
                }, retryAfter * 1000)
                return
            }

            setError(error.message)
            toast.error('Failed to load programs')
        } finally {
            setLoading(false)
        }
    }, [pagination.limit])

    const debouncedFetchRef = useRef(
        debounce((page, customFilters, showAll) => {
            const requestId = Date.now()
            fetchPrograms(page, customFilters, showAll, requestId)
        }, 800)
    )

    useEffect(() => {
        isMountedRef.current = true

        return () => {
            isMountedRef.current = false

            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current.cancel()
            }
        }
    }, [])

    useEffect(() => {
        if (!initialFetchDoneRef.current && isMountedRef.current) {
            initialFetchDoneRef.current = true

            const initialFetch = async () => {
                await new Promise(resolve => setTimeout(resolve, 500))

                if (isMountedRef.current) {
                    try {
                        await Promise.all([
                            fetchPrograms(1, filtersRef.current, false),
                            fetchAllPrograms()
                        ])
                    } catch (error) {
                        console.error('Initial fetch error:', error)
                    }
                }
            }

            initialFetch()
        }
    }, [fetchPrograms, fetchAllPrograms])

    const updateFiltersAndFetch = useCallback((newFilters, showAll = false) => {
        const updatedFilters = {
            ...filtersRef.current,
            ...newFilters
        }
        filtersRef.current = updatedFilters
        
        setFilters(prev => ({
            ...prev,
            search: updatedFilters.search,
            status: updatedFilters.status,
            category: updatedFilters.category,
            client: updatedFilters.client
        }))
        
        if (!newFilters.search && showAllOnSearch) {
            setShowAllOnSearch(false)
        }
        
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, updatedFilters, showAll)
        }
    }, [showAllOnSearch])

    const toggleShowAllOnSearch = useCallback((value) => {
        setShowAllOnSearch(value)
        
        if (filtersRef.current.search) {
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current(1, filtersRef.current, value)
            }
        }
    }, [])

    const clearFilters = useCallback(() => {
        
        const clearedFilters = {
            search: '',
            status: '',
            category: '',
            client: ''
        }
        
        filtersRef.current = clearedFilters
        
        setFilters(clearedFilters)
        setShowAllOnSearch(false)
        
        fetchPrograms(1, clearedFilters, false)
    }, [fetchPrograms])

    const clearSearch = useCallback(() => {
        
        const updatedFilters = {
            ...filtersRef.current,
            search: ''
        }
        
        filtersRef.current = updatedFilters
        
        setFilters(prev => ({
            ...prev,
            search: ''
        }))
        setShowAllOnSearch(false)
        
        fetchPrograms(1, updatedFilters, false)
    }, [fetchPrograms])

    const searchPrograms = useCallback((searchTerm, showAll = false) => {
        
        const searchFilters = {
            ...filtersRef.current,
            search: searchTerm
        }
        
        filtersRef.current = searchFilters
        
        setFilters(prev => ({
            ...prev,
            search: searchTerm
        }))
        
        if (searchTerm) {
            setShowAllOnSearch(showAll)
        } else {
            setShowAllOnSearch(false)
        }
        
        if (debouncedFetchRef.current) {
            debouncedFetchRef.current(1, searchFilters, showAll)
        }
    }, [])

    const refreshData = useCallback(() => {
        fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, pagination.page, showAllOnSearch])

    const refreshAllData = useCallback(async () => {
        try {
            await fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch);
            await fetchAllPrograms();

            return true;
        } catch (error) {
            console.error('Error refreshing all data:', error);
            toast.error('Failed to refresh data');
            throw error;
        }
    }, [fetchPrograms, pagination.page, filtersRef, showAllOnSearch, fetchAllPrograms])

    const handlePageChange = useCallback((newPage) => {
        fetchPrograms(newPage, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, showAllOnSearch])

    const resetToPaginationMode = useCallback(() => {
        setShowAllOnSearch(false)

        if (filtersRef.current.search) {
            if (debouncedFetchRef.current) {
                debouncedFetchRef.current(1, filtersRef.current, false)
            }
        }
    }, [])

    useEffect(() => {
        fetchPrograms(1, filtersRef.current, false)
        fetchAllPrograms()
    }, [])

    const fetchProgramsStats = useCallback(async () => {
        try {
            setStatsLoading(true)
            
            const result = await programService.fetchProgramsStats()

            if (result.success) {
                setProgramStats(result.data)
            } else {
                throw new Error(result.message || 'Failed to fetch program stats')
            }
        } catch (error) {
            console.error('Error fetching program stats:', error)
            toast.error('Failed to load program stats')
        } finally {
            setStatsLoading(false)
        }
    }, [])

    const fetchPriceStats = useCallback(async () => {
        try {
            setStatsLoading(true)

            const result = await programService.fetchPriceStats()

            if (result.success) {
                setPriceStats(result.data)
            } else {
                throw new Error(result.message || 'Failed to fetch price stats')
            }
        } catch (error) {
            console.error('Error fetching price stats:', error)
            toast.error('Failed to load price statistics')
            
            setPriceStats({
                title: "Total Price",
                value: "0",
                subtitle: "from 0 programs",
                percentage: "0%",
                trend: "up",
                period: "Last Month",
                icon: "DollarSign",
                color: "purple",
                description: "0% Last Month"
            })
        } finally {
            setStatsLoading(false)
        }
    }, [])

    const fetchAllStats = useCallback(async () => {
        try {
            const now = Date.now()

            if (now - lastStatsFetchTimeRef.current < 30000) {
                return
            }

            setStatsLoading(true)

            await new Promise(resolve => setTimeout(resolve, 500))

            await Promise.all([
                fetchProgramsStats(),
                fetchPriceStats()
            ])

            lastStatsFetchTimeRef.current = Date.now()
        } catch (error) {
            console.error('Error fetching all stats:', error)
        } finally {
            setStatsLoading(false)
        }
    }, [fetchProgramsStats, fetchPriceStats])

    useEffect(() => {
        if (!isMountedRef.current) return

        const fetchStatsOnMount = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))

            if (isMountedRef.current) {
                await fetchAllStats()
            }
        }

        fetchStatsOnMount()

        const statsInterval = setInterval(() => {
            if (isMountedRef.current) {
                fetchAllStats()
            }
        }, 5 * 60 * 1000)

        return () => clearInterval(statsInterval)
    }, [fetchAllStats])

    const exportPrograms = useCallback(async (format = 'csv') => {
        try {
            setLoading(true)

            await new Promise(resolve => setTimeout(resolve, 1000))

            let dataToExport
            
            if (pagination.showingAllResults && format === 'csv') {
                dataToExport = programs
                
                const csvContent = programService.convertToCSV(dataToExport)
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `programs_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                
                toast.success(`Exported ${dataToExport.length} programs to CSV`)
            } else {
                if (allPrograms.length > 0 && !allProgramsLoading) {
                    dataToExport = allPrograms
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1500))

                    const result = await programService.fetchAllPrograms(filtersRef.current)
                    dataToExport = result.data || []
                }
                
                if (format === 'csv') {
                    const csvContent = programService.convertToCSV(dataToExport)
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', `programs_${filtersRef.current.search || 'all'}_${new Date().toISOString().split('T')[0]}.csv`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    
                    toast.success(`Exported ${dataToExport.length} programs to CSV`)
                } else {
                    toast.success(`Prepared ${dataToExport.length} programs for export`)
                    return dataToExport
                }
            }
            
            return dataToExport
        } catch (error) {
            console.error('Error exporting programs:', error)
            
            if (error.response?.status === 429) {
                toast.error('Too many export requests. PLease wait a minute')
            } else {
                toast.error('Failed to export programs')
            }

            throw error
        } finally {
            setLoading(false)
        }
    }, [programs, pagination.showingAllResults, showAllOnSearch, allPrograms, allProgramsLoading])

    const addProgram = async (programData) => {
        try {
            const result = await programService.addProgram(programData)
            toast.success('Program added successfully')

            await fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
            await fetchAllStats()
            
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
            toast.success("Program updated successfully")

            setPrograms(prevPrograms => 
                prevPrograms.map(program => 
                    program.id === programId
                        ? { ...program, ...programData, ...result.data || result }
                        : program
                )
            );

            if (programData.price !== undefined) {
                await fetchPriceStats()
            }

            return result.data || result;
        } catch (error) {
            toast.error('Failed to update program')
            throw error;
        } finally {
            setLoading(false)
        }
    }

   const deleteProgram = async (programId) => {
        try {
            setLoading(true);
            
            await programService.deleteProgram(programId);

            setPrograms(prevPrograms =>
                prevPrograms.filter(program => program.id !== programId)
            );

            setPagination(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1)
            }));

            try {
                await fetchAllStats();
            } catch (statsError) {
                console.warn('⚠️ Stats update error (non-critical):', statsError);
            }

            toast.success('Program deleted successfully');
            return { success: true };
            
        } catch (error) {
            console.error('Error deleting program:', error);
            toast.error('Failed to delete program');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const bulkImport = useCallback(async (programsData, options = {}) => {
        const {
            mode = 'create',
            overwriteExisting = false,
            chunkSize = 50,
            onProgress
        } = options

        try {
            setIsImporting(true);
            setImportProgress(0);
            setImportError(null);
            setImportResult(null);

            const progressInterval = setInterval(() => {
                setImportProgress(prev => {
                    const newProgress = Math.min(prev + 5, 90);
                    if (onProgress) onProgress(newProgress);
                    return newProgress;
                });
            }, 300)

            const result = await programService.bulkImport(programsData, {
                mode,
                overwriteExisting,
                chunkSize,
                onProgress: (progressInfo) => {
                    if (progressInfo && typeof progressInfo === 'object') {
                        const actualProgress = Math.min(95, progressInfo.progress || importProgress);
                        setImportProgress(actualProgress);
                        if (onProgress) onProgress(actualProgress);
                    }
                }
            })

            clearInterval(progressInterval)
            setImportProgress(100)

            if (!result.success) {
                throw new Error(result.message || 'Import failed');
            }

            setImportResult(result.data || result);

            const successful = result.data?.successful || 0;
            const failed = result.data?.failed || 0;

            if (successful > 0) {
                toast.success(`Successfully imported ${successful} programs`);
            }
            
            if (failed > 0) {
                toast.error(`${failed} programs failed to import`);
            }

            await refreshAllData();

            return result;

        } catch (error) {
            console.error('Bulk import error:', error);
            setImportError(error.message);
            
            if (error.message.includes('Validation')) {
                toast.error(`Validation error: ${error.message.split(':')[1] || error.message}`);
            } else {
                toast.error(`Import failed: ${error.message}`);
            }
            
            throw error;
        } finally {
            setIsImporting(false);
        }
    }, [refreshAllData])

    const parseExcelFile = useCallback(async (file) => {
        try {
            if (!file) {
                throw new Error('Please select an Excel file');
            }

            const validExtensions = ['.xlsx', '.xls'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (!validExtensions.includes(fileExtension)) {
                throw new Error('Only Excel files (.xlsx, .xls) are supported');
            }

            if (file.size > 10 * 1024 * 1024) {
                throw new Error('File size too large. Maximum 10MB');
            }

            const parsedData = await programService.parseImportFile(file);
            
            if (!parsedData || !Array.isArray(parsedData)) {
                throw new Error('Failed to parse Excel file');
            }
            
            if (parsedData.length === 0) {
                throw new Error('No valid data found in Excel file');
            }

            return parsedData;

        } catch (error) {
            console.error('Parse Excel error in hook:', error);
            throw error;
        }
    }, []);

    const validateImportData = useCallback(async (data) => {
        try {
            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            const validationResult = programService.validateImportData(data);

            if (!validationResult || typeof validationResult !== 'object') {
                throw new Error('Invalid validation result structure');
            }

            return validationResult

        } catch (error) {
            console.error('Validation error:', error);
            
            const valid = data.filter(row => row.program_name && row.program_name.trim());
            const invalid = data.filter(row => !row.program_name || !row.program_name.trim());

            return {
                valid,
                invalid: invalid.map((row, index) => ({
                    ...row,
                    _rowNumber: index + 1,
                    _errors: ['Program name is required'],
                    _isValid: false
                })),
                errors: invalid.map((row, index) => ({
                    row: index + 1,
                    program_name: 'Unknown',
                    errors: ['Program name is required']
                }))
            };
        }
    }, [])

    const importFromFile = useCallback(async (file, options = {}) => {
        const {
            mode = 'create',
            overwriteExisting = false,
            chunkSize = 50,
            onProgress
        } = options;

        try {
            setIsImporting(true);
            setImportProgress(0);
            setImportError(null);
            setImportResult(null);

            await new Promise(resolve => setTimeout(resolve, 500));

            const parsedData = await parseExcelFile(file);
            
            if (!parsedData || parsedData.length === 0) {
                throw new Error('No valid data found in Excel file');
            }

            const validationChunks = [];
            const chunkSizeValidation = 100;
            
            for (let i = 0; i < parsedData.length; i += chunkSizeValidation) {
                validationChunks.push(parsedData.slice(i, i + chunkSizeValidation));
            }

            let allValidData = [];
            let allErrors = [];

            for (let i = 0; i < validationChunks.length; i++) {
                const chunk = validationChunks[i];
                
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                const validationResult = await validateImportData(chunk);
                
                if (validationResult?.valid) {
                    allValidData.push(...validationResult.valid);
                }
                if (validationResult?.errors) {
                    allErrors.push(...validationResult.errors);
                }
            }

            if (allValidData.length === 0) {
                throw new Error('No valid data to import');
            }

            const importResult = await programService.bulkImport(
                allValidData, 
                {
                    mode,
                    overwriteExisting,
                    chunkSize: Math.min(chunkSize, 20), 
                    onProgress: (progressInfo) => {
                        const progress = progressInfo?.progress || 0;
                        setImportProgress(progress);
                        if (onProgress) onProgress(progress);
                    }
                }
            );

            if (!importResult.success) {
                throw new Error(importResult.message || 'Import failed');
            }

            setImportResult(importResult.data || importResult);
            
            const successful = importResult.data?.successful || 0;
            const failed = importResult.data?.failed || 0;
            
            if (successful > 0) {
                toast.success(`Successfully imported ${successful} programs`);
            }
            
            if (failed > 0) {
                toast.error(`${failed} programs failed to import`);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            await refreshAllData();

            return importResult;

        } catch (error) {
            console.error('Import from file error:', error);
            setImportError(error.message);

            if (error.message.includes('rate limit') || error.response?.status === 429) {
                toast.error('Import rate limited. Please try again in a minute.');
            } else if (error.message.includes('validation') || error.message.includes('Validation')) {
                toast.error(`Validation error: ${error.message}`);
            } else if (error.message.includes('parse') || error.message.includes('Parse')) {
                toast.error(`File parsing error: ${error.message}`);
            } else {
                toast.error(`Import failed: ${error.message}`);
            }
            
            throw error;
            
        } finally {
            setIsImporting(false);
            setImportProgress(100);
        }
    }, [parseExcelFile, validateImportData, refreshAllData]);

    const downloadImportTemplate = useCallback(() => {
        try {
            programService.downloadExcelTemplate();
            toast.success('Excel template downloaded successfully');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error(`Failed to download template: ${error.message}`);
        }
    }, [])

    const resetImport = useCallback(() => {
        setIsImporting(false);
        setImportProgress(0);
        setImportResult(null);
        setImportError(null);
    }, [])

    const getDisplayText = useCallback(() => {
        if (pagination.showingAllResults && filtersRef.current.search) {
            return `Showing all ${programs.length} results for "${filtersRef.current.search}"`
        } else if (pagination.showingAllResults) {
            return `Showing all ${programs.length} programs`
        } 
    }, [pagination, programs.length])

    const refetch = useCallback(() => {
        fetchPrograms(pagination.page, filtersRef.current, showAllOnSearch)
    }, [fetchPrograms, pagination.page, showAllOnSearch])

    const isShowAllMode = useCallback(() => {
        return pagination.showingAllResults || false
    }, [pagination.showingAllResults])

    const getAvailableFilters = useCallback(() => {
        return programService.extractAvailableFilters(programs)
    }, [programs])

    const getSearchSuggestions = useCallback(async (searchTerm, limit = 5) => {
        return await programService.getSearchSuggestions(searchTerm, limit)
    }, [])

    const getDistinctFilterValues = useCallback(async (field) => {
        return await programService.getDistinctFilterValues(field)
    }, [])

    return { ...confirmDialog, programs, loading, error, pagination, filters, showAllOnSearch, programStats, priceStats,
        statsLoading, isImporting, importProgress, importResult, importError, fetchPrograms: handlePageChange,
        updateFiltersAndFetch, clearFilters, clearSearch, searchPrograms, toggleShowAllOnSearch, isShowAllMode,
        resetToPaginationMode, getDisplayText, refetch, handlePageChange, refreshData, addProgram, 
        updateProgram, deleteProgram, exportPrograms, refetchStats: fetchAllStats, fetchProgramsStats,
        fetchPriceStats, fetchAllStats, getAvailableFilters, getSearchSuggestions, getDistinctFilterValues,
        allPrograms, allProgramsLoading, fetchAllPrograms, refreshAllData, bulkImport, parseExcelFile,
        validateImportData, importFromFile, downloadImportTemplate, resetImport
    }
}