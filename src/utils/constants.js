export const METRICS_CONFIG = {
    clients: {
        label: 'Clients',
        icon: 'Users',
        color: '#3b82f6',
        datasetLabel: 'New Clients',
        cumulativeLabel: 'Total Clients',
        dataKey: 'newClients',
        cumulativeKey: 'totalClients',
        chartTypes: ['line', 'bar', 'area']
    },
    programs: {
        label: 'Programs',
        icon: 'Target',
        color: '#10b981',
        datasetLabel: 'New Programs',
        cumulativeLabel: 'Total Programs',
        dataKey: 'newPrograms',
        cumulativeKey: 'totalPrograms',
        chartTypes: ['line', 'bar', 'area']
    },
    participants: {
        label: 'Participants',
        icon: 'FileText',
        color: '#f59e0b',
        datasetLabel: 'New Participants',
        cumulativeLabel: 'Total Participants',
        dataKey: 'newParticipants',
        cumulativeKey: 'totalParticipants',
        chartTypes: ['line', 'bar', 'area']
    },
    revenue: {
        label: 'Revenue',
        icon: 'DollarSign',
        color: '#8b5cf6',
        datasetLabel: 'Monthly Revenue',
        cumulativeLabel: 'Cumulative Revenue',
        dataKey: 'revenue',
        cumulativeKey: 'cumulativeRevenue',
        chartTypes: ['line', 'bar', 'area', 'pie']
    }
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const YEARS = ['2025', '2024', '2023', '2022'];

export const DATA_TYPES = [
    { value: 'growth', label: 'Monthly Growth' },
    { value: 'cumulative', label: 'Cumulative Total' }
]

export const CHART_TYPES = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
    // { value: 'pie', label: 'Pie Chart' }
]