export const calculateMonthlyData = (data, year, metric) => {
    if (!data || data.length === 0) {
        return getFallbackData(metric, year)
    }

    const months = Array(12).fill().map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        [`new${capitalizeFirst(metric)}`]: 0,
        [`total${capitalizeFirst(metric)}`]: 0,
        revenue: 0,
        cumulativeRevenue: 0,
        programsCount: 0
    }))

    let runningTotal = 0

    const yearData = data
        .filter(item => {
            if (!item.created_at) return false
            const itemDate = new Date(item.created_at)
            return itemDate.getFullYear().toString() === year
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    yearData.forEach(item => {
        if (item.created_at) {
            const date = new Date(item.created_at)
            const monthIndex = date.getMonth()

            if (monthIndex >= 0 && monthIndex < 12) {
                if (metric === 'revenue' && item.price) {
                    const price = parsePrice(item.price)
                    if (price > 0) {
                        months[monthIndex].revenue += price
                        months[monthIndex].programsCount++
                    }
                } else {
                    const key = `new${capitalizeFirst(metric)}`
                    months[monthIndex][key]++
                }
            }
        }
    })

    for (let i = 0; i < 12; i++) {
        if (metric === 'revenue') {
            runningTotal += months[i].revenue
            months[i].cumulativeRevenue = runningTotal
        } else {
            const newKey = `new${capitalizeFirst(metric)}`
            const totalKey = `total${capitalizeFirst(metric)}`
            runningTotal += months[i][newKey]
            months[i][totalKey] = runningTotal
        }
    }

    return months
}

export const calculateSummary = (monthlyData, metric, totalCount) => {
    if (!monthlyData) return {}

    const summary = {
        total: totalCount || 0,
        thisYearTotal: monthlyData.reduce((sum, month) => {
            if (metric === 'revenue') return sum + month.revenue
            const key = `new${capitalizeFirst(metric)}`
            return sum + month[key]
        }, 0)
    }

    const recentMonths = monthlyData.filter(m => {
        if (metric === 'revenue') return m.revenue > 0
        const key = `new${capitalizeFirst(metric)}`
        return m[key] > 0
    })

    if (recentMonths.length >= 2) {
        const lastMonth = recentMonths[recentMonths.length - 1]
        const prevMonth = recentMonths[recentMonths.length - 2]

        let lastValue, prevValue
        if (metric === 'revenue') {
            lastValue = lastMonth.revenue
            prevValue = prevMonth.revenue
        } else {
            const key = `new ${capitalizeFirst(metric)}`
            lastValue = lastMonth[key]
            prevValue = prevMonth[key]
        }

        if (prevValue > 0) {
            summary.growth = ((lastValue - prevValue) / prevValue * 100).toFixed(1)
        }
    }

    if (metric === 'revenue') {
        const monthWithRevenue = monthlyData.filter(m => m.revenue > 0)
        summary.average = monthWithRevenue.length > 0
            ? summary.thisYearTotal / monthWithRevenue.length
            : 0
    }

    return summary
}

const parsePrice = (price) => {
    if (typeof price === 'string') {
        return parseInt(price.replace(/[^\d]/g, '')) || 0
    } else if (typeof price === 'number') {
        return price
    }
    return 0
}

const capitalizeFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

const getFallbackData = (metric, year) => {
    return Array(12).fill().map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        [`new${capitalizeFirst(metric)}`]: Math.floor(Math.random() * 50) + 20,
        [`total${capitalizeFirst(metric)}`]: (i + 1) * 100 + Math.floor(Math.random() * 200),
        revenue: Math.floor(Math.random() * 50000000) + 10000000,
        cumulativeRevenue: (i + 1) * 100000000 + Math.floor(Math.random() * 50000000),
        programsCount: Math.floor(Math.random() * 10) + 3
    }))
}