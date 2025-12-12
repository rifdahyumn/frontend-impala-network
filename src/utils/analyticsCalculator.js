import { MONTHS, getQuarterFromMonth, getMonthsInQuarter, getMonthIndicesInQuarter, getQuarterLabel } from './constants'

export const calculateMonthlyData = (data, year, metric) => {
    
    const extractArray = (input) => {
        if (!input) {
            return [];
        }
        
        if (Array.isArray(input)) {
            return input;
        }
        
        if (input.data && Array.isArray(input.data)) {
            return input.data;
        }
        
        const possibleFields = ['items', 'results', 'list', 'records', 'programs', 'revenues', 'clients', 'participants'];
        
        for (const field of possibleFields) {
            if (input[field] && Array.isArray(input[field])) {
                return input[field];
            }
        }
        
        for (const key in input) {
            if (Array.isArray(input[key])) {
                return input[key];
            }
        }
        return [];
    };
    
    const dataArray = extractArray(data);
    if (!dataArray || dataArray.length === 0) {
        return getFallbackData(metric, year);
    }
    
    const parseDateUniversal = (dateStr) => {
        if (!dateStr) {
            return null;
        }
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return null;
            }
            return date;
        } catch {
            return null;
        }
    };
    
    const parsePrice = (price) => {
        if (price == null) {
            return 0;
        }
        if (typeof price === 'number') {
            return price;
        }
        if (typeof price === 'string') {
            const digitsOnly = price.replace(/\D/g, '');
            const parsed = parseInt(digitsOnly, 10) || 0;
            return parsed;
        }
        return 0;
    };
    
    const months = Array(12).fill().map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        monthIndex: i,
        quarter: getQuarterFromMonth(i),
        newClients: 0,
        totalClients: 0,
        newPrograms: 0,
        totalPrograms: 0,
        newParticipants: 0,
        totalParticipants: 0,
        revenue: 0,
        cumulativeRevenue: 0,
        programsCount: 0,
        growth: 0,
        growthPercentage: '0%'
    }));

    let itemsProcessed = 0;
    let itemsFilteredOut = 0;
    
    dataArray.forEach((item, index) => {
        itemsProcessed++;
        
        if (!item?.created_at) {
            itemsFilteredOut++;
            return;
        }
        
        const date = parseDateUniversal(item.created_at);
        if (!date || isNaN(date.getTime())) {
            itemsFilteredOut++;
            return;
        }
        
        const itemYear = date.getFullYear();
        const monthIndex = date.getMonth();
        
        if (itemYear.toString() !== year) {
            itemsFilteredOut++;
            return;
        }
        
        if (monthIndex < 0 || monthIndex > 11) {
            itemsFilteredOut++;
            return;
        }
        
        switch(metric) {
            case 'clients':
                months[monthIndex].newClients++;
                break;
            case 'programs':
                months[monthIndex].newPrograms++;
                if (item.price !== undefined) {
                    const price = parsePrice(item.price);
                    months[monthIndex].revenue += price;
                    months[monthIndex].programsCount++;
                }
                break;
            case 'participants':
                months[monthIndex].newParticipants++;
                break;
            case 'revenue':
                if (item.price !== undefined) {
                    const price = parsePrice(item.price);
                    months[monthIndex].revenue += price;
                    months[monthIndex].programsCount++;
                }
                break;
        }
    });
    
    let runningTotalClients = 0;
    let runningTotalPrograms = 0;
    let runningTotalParticipants = 0;
    let runningCumulativeRevenue = 0;
    
    for (let i = 0; i < 12; i++) {
        runningTotalClients += months[i].newClients;
        runningTotalPrograms += months[i].newPrograms;
        runningTotalParticipants += months[i].newParticipants;
        runningCumulativeRevenue += months[i].revenue;
        
        months[i].totalClients = runningTotalClients;
        months[i].totalPrograms = runningTotalPrograms;
        months[i].totalParticipants = runningTotalParticipants;
        months[i].cumulativeRevenue = runningCumulativeRevenue;
        
        if (i > 0) {
            let previousValue, currentValue;
            
            switch(metric) {
                case 'clients':
                    previousValue = months[i-1].newClients;
                    currentValue = months[i].newClients;
                    break;
                case 'programs':
                    previousValue = months[i-1].newPrograms;
                    currentValue = months[i].newPrograms;
                    break;
                case 'participants':
                    previousValue = months[i-1].newParticipants;
                    currentValue = months[i].newParticipants;
                    break;
                case 'revenue':
                    previousValue = months[i-1].revenue;
                    currentValue = months[i].revenue;
                    break;
                default:
                    previousValue = 0;
                    currentValue = 0;
            }
            
            if (previousValue > 0) {
                const growthValue = ((currentValue - previousValue) / previousValue) * 100;
                months[i].growth = growthValue;
                months[i].growthPercentage = `${growthValue >= 0 ? '+' : ''}${growthValue.toFixed(1)}%`;
            } else if (currentValue > 0) {
                months[i].growth = 100;
                months[i].growthPercentage = '+100%';
            } else {
                months[i].growth = 0;
                months[i].growthPercentage = '0%';
            }
        } else {
            let currentValue;
            switch(metric) {
                case 'clients': currentValue = months[i].newClients; break;
                case 'programs': currentValue = months[i].newPrograms; break;
                case 'participants': currentValue = months[i].newParticipants; break;
                case 'revenue': currentValue = months[i].revenue; break;
                default: currentValue = 0;
            }
            
            months[i].growth = currentValue > 0 ? 100 : 0;
            months[i].growthPercentage = currentValue > 0 ? '+100%' : '0%';
        }
    }
    
    return months;
};

export const calculateQuarterlyData = (monthlyData, metric) => {
    if (!monthlyData || monthlyData.length === 0) {
        return getFallbackQuarterData(metric)
    }

    const quarters = ['q1', 'q2', 'q3', 'q4']
    const quarterData = {}

    quarters.forEach(quarter => {
        const monthIndices = getMonthIndicesInQuarter(quarter)
        const quarterMonths = monthlyData.filter(m => 
            monthIndices.includes(m.monthIndex)
        )

        let total = 0;
        let previousQuarterTotal = 0;
        let growth = 0

        quarterMonths.forEach(month => {
            total += getMonthValueForMetric(month, metric)
        })

        const quarterIndex = quarters.indexOf(quarter)
        if (quarterIndex > 0) {
            const prevQuarter = quarters[quarterIndex - 1]
            const prevQuarterMonths = monthlyData.filter(m => 
                getMonthIndicesInQuarter(prevQuarter).includes(m.monthIndex)
            )

            prevQuarterMonths.forEach(month => {
                previousQuarterTotal += getMonthValueForMetric(month, metric)
            })

            if (previousQuarterTotal > 0) {
                growth = ((total - previousQuarterTotal) / previousQuarterTotal) * 100
            } else if (total > 0) {
                growth = 100
            }
        } else if (total > 0) {
            growth = 100;
        }

        quarterData[quarter] = {
            label: quarter.toUpperCase(),
            fullLabel: getQuarterLabel(quarter),
            total,
            average: total / quarterMonths.length || 0,
            growth,
            growthPercentage: `${growth >= 0 ? '+' : ''}${Math.abs(growth).toFixed(1)}%`,
            months: quarterMonths.map(m => m.month),
            monthData: quarterMonths
        }
    })

    return quarterData;
}

const getMonthValueForMetric = (month, metric) => {
    switch(metric) {
        case 'clients': return month.newClients || 0;
        case 'programs': return month.newPrograms || 0;
        case 'participants': return month.newParticipants || 0;
        case 'revenue': return month.revenue || 0;
        default: return 0
    }
}

export const calculateSummary = (monthlyData, metric, totalCount) => {
    if (!monthlyData || monthlyData.length === 0) {
        return {
            total: 0,
            thisYearTotal: 0,
            cumulativeTotal: 0,
            average: 0,
            growth: '0%',
            quarterlyData: getFallbackQuarterData(metric),
            monthlyData: []
        };
    }

    let thisYearTotal = 0;
    let cumulativeTotal = 0;
    let totalGrowth = 0;
    let monthsWithData = 0;
    
   
    monthlyData.forEach((month, index) => {
        switch(metric) {
            case 'clients':
                thisYearTotal += month.newClients;
                cumulativeTotal = month.totalClients;
                break;
            case 'programs':
                thisYearTotal += month.newPrograms;
                cumulativeTotal = month.totalPrograms;
                break;
            case 'participants':
                thisYearTotal += month.newParticipants;
                cumulativeTotal = month.totalParticipants;
                break;
            case 'revenue':
                thisYearTotal += month.revenue;
                cumulativeTotal = month.cumulativeRevenue;
                break;
        }
        
       
        if (month.growth !== undefined) {
            totalGrowth += month.growth;
            monthsWithData++;
        }
    });
   
    const average = metric === 'revenue' && thisYearTotal > 0 
        ? thisYearTotal / monthlyData.filter(m => m.revenue > 0).length 
        : 0;
    
   
    const averageGrowth = monthsWithData > 0 ? totalGrowth / monthsWithData : 0;
    const growthPercentage = averageGrowth > 0 
        ? `+${averageGrowth.toFixed(1)}%` 
        : averageGrowth < 0 
            ? `${averageGrowth.toFixed(1)}%` 
            : '0%';
    
    let yearOverYearGrowth = '0%';
    if (monthlyData.length >= 12) {
        let totalThisYear = 0;
        let totalPrevYear = 0; 
        
       
        const firstMonthValue = getMonthValue(monthlyData[0], metric);
        const lastMonthValue = getMonthValue(monthlyData[11], metric);
        
        if (firstMonthValue > 0 && lastMonthValue > firstMonthValue) {
            const growth = ((lastMonthValue - firstMonthValue) / firstMonthValue) * 100;
            yearOverYearGrowth = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        }
    }

    const quarterlyData = calculateQuarterlyData(monthlyData, metric)

    const summary = {
        total: totalCount || 0,
        thisYearTotal: thisYearTotal,
        cumulativeTotal: cumulativeTotal,
        average: average,
        growth: yearOverYearGrowth, 
        monthlyAverageGrowth: growthPercentage, 
        quarterlyData: quarterlyData,
        monthlyData: monthlyData
    };
    
    return summary;
};


const getMonthValue = (month, metric) => {
    switch(metric) {
        case 'clients': return month.newClients;
        case 'programs': return month.newPrograms;
        case 'participants': return month.newParticipants;
        case 'revenue': return month.revenue;
        default: return 0;
    }
};

const getFallbackData = (metric, year) => {
    const months = Array(12).fill().map((_, i) => ({
        month: MONTHS[i],
        monthIndex: i,
        quarter: getQuarterFromMonth(i),
        newClients: 0,
        totalClients: 0,
        newPrograms: 0,
        totalPrograms: 0,
        newParticipants: 0,
        totalParticipants: 0,
        revenue: 0,
        cumulativeRevenue: 0,
        programsCount: 0,
        growth: 0,
        growthPercentage: '0%'
    }));
    
    if (metric === 'revenue') {
        let cumulative = 0;
        months.forEach((month, i) => {
            month.revenue = (i + 1) * 1000000;
            cumulative += month.revenue;
            month.cumulativeRevenue = cumulative;
            if (i > 0) {
                month.growth = 10;
                month.growthPercentage = '+10%';
            } else {
                month.growth = 100;
                month.growthPercentage = '+100%';
            }
        });
    }
    
    return months;
};

const getFallbackQuarterData = (metric) => {
    const quarters = ['q1', 'q2', 'q3', 'q4']
    const quarterData = {}

    quarters.forEach((quarter, index) => {
        quarterData[quarter] = {
            label: quarter.toUpperCase(),
            fullLabel: getQuarterLabel(quarter),
            total: index * 1000000,
            average: (index * 1000000) / 3,
            growth: index > 0 ? 10 : 100,
            growthPercentage: index > 0 ? '+10%' : '+100%',
            months: getMonthsInQuarter(quarter),
            monthData: []
        }
    })

    return quarterData
}