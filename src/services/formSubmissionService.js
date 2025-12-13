// eslint-disable-next-line no-undef
const API_BASE_URL = process.env.BASE_API_URL

class FormSubmissionService {
    async getSubmissionByProgram(programName, options = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                category = '',
                gender = '',
                search = '',
                showAllOnSearch = 'false'
            } = options

            const queryParams = new URLSearchParams({
                program: programName,
                page: page.toString(),
                limit: limit.toString(),
                showAllOnSearch: showAllOnSearch
            })

            if (category && category !== 'all') {
                queryParams.append('category', category)
            }

            if (gender && gender !== 'all') {
                queryParams.append('gender', gender)
            }

            if (search && search.trim()) {
                queryParams.append('search', search.trim())
            }

            const url = `${API_BASE_URL}/impala?${queryParams.toString()}`

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`)
            }

            return result
        } catch (error) {
            console.error('Error fetching submission by program:', error)
            throw error
        }
    }

    async getProgramStats(programName) {
        try {
            const response = await this.getSubmissionByProgram(programName, {
                limit: 10000,
                showAllOnSearch: 'true'
            })

            const data = response.data || []
            const metadata = response.metadata?.pagination || []

            const stats = {
                total: metadata.total || data.length,
                recent: data.filter(sub => {
                    const subDate = new Date(sub.created_at)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return subDate > weekAgo
                }).length,
                byCategory: {},
                byGender: {},
                timeline: {},
                metadata: metadata
            }

            data.forEach(sub => {
                if (sub.category) {
                    stats.byCategory[sub.category] = (stats.byCategory[sub.category] || 0) + 1
                }

                if (sub.category) {
                    stats.byGender[sub.gender] = (stats.byGender[sub.gender] || 0) + 1
                }

                const date = new Date(sub.created_at)
                const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
                stats.timeline[monthYear] = (stats.timeline[monthYear] || 0) + 1
            })

            return {
                success: true,
                data: stats,
                program: programName,
                generatedAt: new Date().toISOString()
            }
        } catch (error) {
            console.error('Error calculating program stats:', error)

            return {
                success: true,
                data: {
                    total: 0,
                    recent: 0,
                    byCategory: {},
                    byGender: {},
                    timeline: {}
                },
                program: programName,
                generatedAt: new Date().toISOString()
            }
        }
    }

    async getMultipleProgramStats(programName) {
        try {
            const statsPromises = programName.map(async (programName) => {
                try {
                    const stats = await this.getProgramStats(programName)
                    return {
                        programName: programName,
                        count: stats.data.total || 0,
                        recent: stats.data.recent || 0,
                        categories: stats.data.byCategory || {}
                    }
                } catch (error) {
                    console.error(`Error getting stats for ${programName}:`, error)
                    return {
                        programName: programName,
                        count: 0,
                        recent: 0,
                        categories: {}
                    }
                }
            })

            const statsResults = await Promise.all(statsPromises)

            const statsMap = {}
            statsResults.forEach(stat => {
                statsMap[stat.programName] = stat
            })

            return {
                success: true,
                data: statsMap,
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            console.error('Error getting multiple program stats:', error)
            throw error
        }
    }

    async exportProgramData(programName, filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                program: programName,
                format: 'csv'
            })

            if (filters.category && filters.category !== 'all') {
                queryParams.append('category', filters.category)
            }

            if (filters.gender && filters.gender !== 'all') {
                queryParams.append('gender', filters.gender)
            }

            if (filters.search && filters.search.trim()) {
                queryParams.append('search', filters.search.trim())
            }

            const url = `${API_BASE_URL}/impala/export?${queryParams.toString()}`

            const response = await fetch(url, {
                method: 'GET'
            })

            if (!response.ok) {
                throw new Error(`HTTP Error! status: ${response.status}`)
            }

            return await response.blob()
        } catch (error) {
            console.error('Error exporting program data:', error)
            throw error
        }
    }

    async getProgramCategories(programName) {
        try {
            const response = await this.getSubmissionByProgram(programName, {
                limit: 1000
            })

            const data = response.data || []

            const categories = new Set()
            data.forEach(sub => {
                if (sub.category && sub.category.trim()) {
                    categories.add(sub.category.trim())
                }
            })

            return {
                success: true,
                data: Array.from(categories),
                program: programName
            }
        } catch (error) {
            console.error('Error getting program categories:', error)
            throw error
        }
    }

    async searchInProgram(programName, searchTerm) {
        try {
            return await this.getSubmissionByProgram(programName, {
                search: searchTerm,
                showAllOnSearch: 'true'
            })
            
        } catch (error) {
            console.error('Error searching in program:', error)
            throw error
        }
    }

    async getSubmissionById(submissionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/impala/${submissionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`)
            }

            return result
        } catch (error) {
            console.error('Error fetching submission by ID:', error)
            throw error
        }
    }
}

export default new FormSubmissionService()