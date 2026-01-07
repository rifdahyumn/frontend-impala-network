import { METRICS_CONFIG, getQuarterLabel, getMonthsInQuarter } from "./constants";

export const getChartOptions = (metric, dataType) => {
    const config = METRICS_CONFIG[metric]
    const isQuarterView = dataType && ['q1', 'q2', 'q3', 'q4'].includes(dataType)

    return {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
            x: { 
                grid: { display: false },
                ticks: {
                    maxRotation: isQuarterView ? 0 : 45,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: metric === 'revenue' ? 'Amount (in Millions)' : 'Count'
                },
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                    callback: function(value) {
                        if (metric === 'revenue') {
                            if (value >= 1000) return 'IDR ' + (value / 1000).toFixed(1) + 'B'
                            if (value >= 1) return 'IDR ' + value + 'M'
                            return 'IDR ' + value
                        }
                        
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
                        return value
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { 
                    color: '#374151', 
                    font: { size: 12 },
                    padding: 20,
                    usePointStyle: true 
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                            label += 'IDR ' + (context.parsed.y * 1000000).toLocaleString('id-ID')
                        } else {
                            label += context.parsed.y.toLocaleString('id-ID')
                        }
                        return label
                    },
                    title: function(tooltipItems) {
                        if (isQuarterView) {
                            return `Month: ${tooltipItems[0].label}`
                        }
                        return tooltipItems[0].label
                    }
                }
            }
        },
        maintainAspectRatio: false
    }
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
    if (!monthlyData) return { labels: [], datasets: [] }

    const config = METRICS_CONFIG[metric]
    const isQuarterView = dataType && ['q1', 'q2', 'q3', 'q4'].includes(dataType)

    if (isQuarterView) {
        return prepareQuarterChartData(monthlyData, config, dataType, chartType, metric)
    }

    return prepareMonthlyChartData(monthlyData, config, dataType, chartType, metric)
}

const prepareMonthlyChartData = (monthlyData, config, dataType, chartType, metric) => {
    const dataKey = dataType === 'growth' ? config.dataKey : config.cumulativeKey
    const label = dataType === 'growth' ? config.datasetLabel : config.cumulativeLabel

    const data = monthlyData.map(data => {
        const value = data[dataKey] || 0
        return metric === 'revenue' ? value / 1000000 : value
    })

    return {
        labels: monthlyData.map(data => data.month),
        datasets: [{
            label,
            data,
            borderColor: config.color,
            backgroundColor: chartType === 'bar' ? config.color : `${config.color}20`,
            fill: chartType === 'area',
            tension: 0.4,
            borderWidth: 2
        }]
    }
}

const prepareQuarterChartData = (monthlyData, config, quarter, chartType, metric) => {
    const quarterMonths = getMonthsInQuarter(quarter)

    const filteredData = monthlyData.filter(month => 
        quarterMonths.includes(month.month)
    )

    if (filteredData.length === 0) {
        const data = quarterMonths.map(() => 0);
        return {
            labels: quarterMonths,
            datasets: [
                {
                    label: config.datasetLabel,
                    data,
                    borderColor: config.color,
                    backgroundColor: chartType === 'bar' ? config.color : `${config.color}20`,
                    fill: chartType === 'area',
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        }
    }

    const labels = filteredData.map(month => month.month)
    const dataKey = config.dataKey;
    const data = filteredData.map(month => {
        const value = month[dataKey] || 0;
        return metric === 'revenue' ? value / 1000000 : value;
    });

    return {
        labels,
        datasets: [
            {
                label: config.datasetLabel,
                data,
                borderColor: config.color,
                backgroundColor: chartType === 'bar' ? config.color : `${config.color}20`,
                fill: chartType === 'area',
                tension: 0.4,
                borderWidth: 2
            }
        ]
    }
}

export const getQuarterSummaryData = (monthlyData, metric) => {
    if (!monthlyData) return null
    
    const quarters = ['q1', 'q2', 'q3', 'q4']
    const quarterData = {}
    
    quarters.forEach(quarter => {
        const quarterMonths = getMonthsInQuarter(quarter)
        const filteredData = monthlyData.filter(month => 
            quarterMonths.includes(month.month)
        )
        
        if (filteredData.length === 0) {
            quarterData[quarter] = {
                label: quarter.toUpperCase(),
                fullLabel: getQuarterLabel(quarter),
                total: 0,
                average: 0,
                growth: 0,
                growthPercentage: '0%',
                months: quarterMonths,
                monthData: []
            }
            return
        }
        
        let total = 0
        const dataKey = getDataKeyForMetric(metric)
        
        filteredData.forEach(month => {
            total += month[dataKey] || 0
        })
        
        let growth = 0
        if (filteredData.length >= 2) {
            const firstMonthValue = filteredData[0][dataKey] || 0
            const lastMonthValue = filteredData[filteredData.length - 1][dataKey] || 0
            
            if (firstMonthValue > 0) {
                growth = ((lastMonthValue - firstMonthValue) / firstMonthValue) * 100
            } else if (lastMonthValue > 0) {
                growth = 100
            }
        } else if (filteredData.length === 1 && filteredData[0][dataKey] > 0) {
            growth = 100
        }
        
        quarterData[quarter] = {
            label: quarter.toUpperCase(),
            fullLabel: getQuarterLabel(quarter),
            total: total,
            average: total / filteredData.length,
            growth: growth,
            growthPercentage: `${growth >= 0 ? '+' : ''}${Math.abs(growth).toFixed(1)}%`,
            months: quarterMonths,
            monthData: filteredData
        }
    })
    
    return quarterData
}

const getDataKeyForMetric = (metric) => {
    const config = METRICS_CONFIG[metric]
    return config?.dataKey || 'newClients'
}