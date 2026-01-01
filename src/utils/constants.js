export const METRICS_CONFIG = {
    clients: {
        label: 'Clients',
        icon: 'Users',
        color: '#3b82f6',
        datasetLabel: 'New Clients',
        cumulativeLabel: 'Total Clients',
        dataKey: 'newClients',
        cumulativeKey: 'totalClients',
        chartTypes: ['line', 'bar', 'area'],
        quarterColors: {
            q1: '#3b82f6',
            q2: '#10b981',
            q3: '#f59e0b',
            q4: '#8b5cf6'
        }
    },
    programs: {
        label: 'Programs',
        icon: 'Target',
        color: '#10b981',
        datasetLabel: 'New Programs',
        cumulativeLabel: 'Total Programs',
        dataKey: 'newPrograms',
        cumulativeKey: 'totalPrograms',
        chartTypes: ['line', 'bar', 'area'],
        quarterColors: {
            q1: '#10b981',
            q2: '#3b82f6',
            q3: '#8b5cf6',
            q4: '#f59e0b'
        }
    },
    participants: {
        label: 'Participants',
        icon: 'FileText',
        color: '#f59e0b',
        datasetLabel: 'New Participants',
        cumulativeLabel: 'Total Participants',
        dataKey: 'newParticipants',
        cumulativeKey: 'totalParticipants',
        chartTypes: ['line', 'bar', 'area'],
        quarterColors: {
            q1: '#f59e0b',
            q2: '#10b981',
            q3: '#3b82f6',
            q4: '#8b5cf6'
        }
    },
    revenue: {
        label: 'Revenue',
        icon: 'DollarSign',
        color: '#8b5cf6',
        datasetLabel: 'Monthly Revenue',
        cumulativeLabel: 'Cumulative Revenue',
        dataKey: 'revenue',
        cumulativeKey: 'cumulativeRevenue',
        chartTypes: ['line', 'bar', 'area'],
        quarterColors: {
            q1: '#8b5cf6',
            q2: '#3b82f6',
            q3: '#10b981',
            q4: '#f59e0b'
        }
    }
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const YEARS = ['2026', '2025', '2024', '2023', '2022'];

export const DATA_TYPES = [
    { value: 'growth', label: 'Monthly Growth' },
    { value: 'cumulative', label: 'Cumulative Total' },
    { value: 'q1', label: 'Q1 (Jan-Mar)' },
    { value: 'q2', label: 'Q2 (Apr-Jun)' },
    { value: 'q3', label: 'Q3 (Jul-Sep)' },
    { value: 'q4', label: 'Q4 (Oct-Dec)' }
]

export const CHART_TYPES = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
]

export const QUARTERS = {
    q1: {
        label: 'Q1',
        fullLabel: 'Q1 (January - March)',
        months: ['Jan', 'Feb', 'Mar'],
        monthIndices: [0, 1, 2],
        color: '#3b82f6'
    },
    q2: {
        label: 'Q2',
        fullLabel: 'Q2 (April - June)',
        months: ['Apr', 'May', 'Jun'],
        monthIndices: [3, 4, 5],
        color: '#10b981'
    },
    q3: {
        label: 'Q3',
        fullLabel: 'Q3 (July - September)',
        months: ['Jul', 'Aug', 'Sep'],
        monthIndices: [6, 7, 8],
        color: '#f59e0b'
    },
    q4: {
        label: 'Q4',
        fullLabel: 'Q4 (October - December)',
        months: ['Oct', 'Nov', 'Dec'],
        monthIndices: [9, 10, 11],
        color: '#8b5cf6'
    },
}

export const getQuarterFromMonth = (monthIndex) => {
    if (monthIndex >= 0 && monthIndex <= 2) return 'q1'
    if (monthIndex >= 3 && monthIndex <= 5) return 'q2'
    if (monthIndex >= 6 && monthIndex <= 8) return 'q3'
    if (monthIndex >= 9 && monthIndex <= 11) return 'q4'
    return 'q1'
}

export const getQuarterLabel = (quarter) => {
    return QUARTERS[quarter]?.fullLabel || `${quarter.toUpperCase()}`
}

export const getMonthsInQuarter = (quarter) => {
    return QUARTERS[quarter]?.months || ['Jan', 'Feb', 'Mar']
}

export const getMonthIndicesInQuarter = (quarter) => {
    return QUARTERS[quarter]?.monthIndices || [0, 1, 2]
}

export const getQuarterColor = (quarter, metric = null) => {
    if (metric && METRICS_CONFIG[metric]?.quarterColors?.[quarter]) {
        return QUARTERS[quarter]?.color || '#3b82f6'
    }
}

export const formatNumber  = (num, metric = 'default') => {
    if (num === null || num === undefined) return '0'

    if (metric === 'revenue') {
        if (num >= 1000000000) {
            return `IDR ${(num / 1000000000).toFixed(1)}B`
        }
        if (num >= 1000000) {
            return `IDR ${(num / 1000000).toFixed(1)}M`
        }
        if (num >= 1000) {
            return `IDR ${(num / 1000).toFixed(0)}K`
        }
        return `IDR ${num.toLocaleString('id-ID')}`
    }

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`
    }
    return num.toLocaleString('id-ID')
}

export const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%'
    const sign = value > 0 ? '+' : value < 0 ? '-' : ''
    return `${sign}${Math.abs(value).toFixed(1)}%`
}

export const QUARTER_FALLBACK_DATA = {
    q1: { total: 0, growth: 0, average: 0, months: ['Jan', 'Feb', 'Mar'] },
    q2: { total: 0, growth: 0, average: 0, months: ['Apr', 'May', 'Jun'] },
    q3: { total: 0, growth: 0, average: 0, months: ['Jul', 'Aug', 'Sep'] },
    q4: { total: 0, growth: 0, average: 0, months: ['Oct', 'Nov', 'Dec'] }
}