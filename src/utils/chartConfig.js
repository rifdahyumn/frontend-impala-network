
import { METRICS_CONFIG } from "./constants";

export const getChartOptions = (metric, dataType) => {
    const config = METRICS_CONFIG[metric]

    return {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: metric === 'revenue' ? 'Amount (in Millions)' : 'Count'
                },
                grid: { color: 'rgba(0, 0, 0, 0.05' },
                ticks: {
                    callback: function(value) {
                        if (metric === 'revenue') {
                            return 'Rp ' + value + 'M'
                        }
                        return value
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#374151', font: { size: 12 } }
            },
            tooltip: {
                backgroundColor: 'rbga(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || ''
                        if (label) label += ': '
                        if (metric === 'revenue') {
                            label += 'Rp. ' + (context.parsed.y * 1000000).toLocaleString('id-ID')
                        } else {
                            label += context.parsed.y.toLocaleString('id-ID')
                        }
                        return label
                    }
                }
            }
        },
        maintainAspectRatio: false
    }
}

export const getPieChartOptions = {
    responsive: true,
    plugins: {
        legend : {
            position: 'right',
            label: { color: '#374151', font: { size: 11 } }
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    const label = context.label || ''
                    const value = context.parsed
                    return `${label}: Rp ${(value * 1000000).toLocaleString('id-ID')}`
                }
            }
        }
    },
    maintainAspectRatio: false
}

export const getBarOptions = (baseOptions) => ({
    ...baseOptions,
    scales: {
        ...baseOptions.scales,
        x: { ...baseOptions.scales.x, stacked: false },
        y: { ...baseOptions.scales.y, stacked: false }
    }
});

export const prepareChartData = (monthlyData, metric, dataType, chartType) => {
    if (!monthlyData) return { label: [], datasets: [] }

    const config = METRICS_CONFIG[metric]
    const dataKey = dataType === 'growth' ? config.dataKey : config.cumulativeKey
    const label = dataType === 'growth' ? config.datasetLabel : config.cumulativeLabel

    const data = monthlyData.map(data => {
        const value = data[dataKey]
        return metric === 'revenue' ? value / 1000000 : value
    })

    return {
        labels: monthlyData.map(data => data.month),
        datasets: [{
            label,
            data,
            borderColor: config.color,
            backgroundColor: `${config.color}20`,
            fill: chartType === 'area',
            tension: 0.4,
            borderWidth: 2 
        }]
    }
}

export const preparePieChartData = (monthlyData, metric) => {
    if (!monthlyData || metric !== 'revenue') return null

    const monthsWithRevenue = monthlyData.filter(m => m.revenue > 0)

    return {
        labels: monthsWithRevenue.map(data => data.month),
        datasets: [{
            data: monthsWithRevenue.map(data => data.revenue / 1000000),
            backgroundColor: [
                '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#f5f3ff',
                '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed',
                '#6d28d9', '#5b21b6'
            ],
            borderWidth: 1,
            borderColor: '#ffffff'
        }]
    }
}