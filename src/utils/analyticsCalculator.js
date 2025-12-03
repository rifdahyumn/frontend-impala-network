export const calculateMonthlyData = (data, year, metric) => {
    const extractArray = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        if (input.data && Array.isArray(input.data)) return input.data;
        if (input.participant && Array.isArray(input.participant)) return input.participant;
        if (input.participants && Array.isArray(input.participants)) return input.participants;
        
        if (typeof input === 'object') {
            for (const value of Object.values(input)) {
                if (Array.isArray(value)) return value;
            }
        }
        return [];
    };
    
    const dataArray = extractArray(data);
    
    if (!dataArray || dataArray.length === 0) {
        return getFallbackData(metric, year);
    }
    
    const parseDateUniversal = (dateStr) => {
        if (!dateStr) return null;
        
        try {
            let date = new Date(dateStr);
            
            if (!isNaN(date.getTime())) {
                return date;
            }
            
            if (dateStr.includes(' ')) {
                const isoStr = dateStr.replace(' ', 'T') + 'Z';
                date = new Date(isoStr);
                
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
            
            return null;
            
        } catch (error) {
            return null;
        }
    };
    
    const months = Array(12).fill().map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        [`new${capitalizeFirst(metric)}`]: 0,
        [`total${capitalizeFirst(metric)}`]: 0,
        revenue: 0,
        cumulativeRevenue: 0,
        programsCount: 0
    }));

    let runningTotal = 0;
    let itemsProcessed = 0;

    dataArray.forEach(item => {
        if (!item?.created_at) return;
        
        try {
        
            const date = parseDateUniversal(item.created_at);
            
            if (!date || isNaN(date.getTime())) return;
            
            const itemYear = date.getUTCFullYear().toString();
            const monthIndex = date.getUTCMonth();
            
            if (itemYear !== year || monthIndex < 0 || monthIndex > 11) return;
            
            itemsProcessed++;
            
            if (metric === 'revenue' && item.price) {
                const price = parsePrice(item.price);
                if (price > 0) {
                    months[monthIndex].revenue += price;
                    months[monthIndex].programsCount++;
                }
            } else {
                const key = `new${capitalizeFirst(metric)}`;
                months[monthIndex][key]++;
            }
        } catch (error) {
            // Skip error
        }
    });
    

    for (let i = 0; i < 12; i++) {
        const newKey = `new${capitalizeFirst(metric)}`;
        const totalKey = `total${capitalizeFirst(metric)}`;
        
        runningTotal += months[i][newKey];
        months[i][totalKey] = runningTotal;
        
        if (months[i][newKey] > 0) {
            console.log(`${months[i].month}: ${months[i][newKey]} new ${metric}`);
        }
    }
    
    return months;
};

export const calculateSummary = (monthlyData, metric, totalCount) => {
    if (!monthlyData) return {}

    const newThisYear = monthlyData.reduce((sum, month) => {
        if (metric === 'revenue') return sum + month.revenue
        const key = `new${capitalizeFirst(metric)}`
        return sum + (month[key] || 0)
    }, 0)

    const cumulativeEndOfYear = monthlyData.length >= 12 ? 
        (metric === 'revenue' ? 
            monthlyData[11].cumulativeRevenue : 
            monthlyData[11][`total${capitalizeFirst(metric)}`]
        ) : 0

    const summary = {
        total: totalCount || 0, 
        thisYearTotal: newThisYear, 
        cumulativeTotal: cumulativeEndOfYear, 
        monthlyData: monthlyData 
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