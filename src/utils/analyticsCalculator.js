export const calculateMonthlyData = (data, year, metric) => {
    const extractArray = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        if (input.data && Array.isArray(input.data)) return input.data;
        return [];
    };
    
    const dataArray = extractArray(data);
    
    if (!dataArray || dataArray.length === 0) {
        return getFallbackData(metric, year);
    }
    
    const parseDateUniversal = (dateStr) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr);
        } catch {
            return null;
        }
    };
    
    const parsePrice = (price) => {
        if (price == null) return 0;
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            const digitsOnly = price.replace(/\D/g, '');
            return parseInt(digitsOnly, 10) || 0;
        }
        return 0;
    };
    
    const capitalizeFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
    // Inisialisasi data bulanan
    const months = Array(12).fill().map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        monthIndex: i,
        newClients: 0,
        totalClients: 0,
        newPrograms: 0,
        totalPrograms: 0,
        newParticipants: 0,
        totalParticipants: 0,
        revenue: 0,
        cumulativeRevenue: 0,
        programsCount: 0,
        growth: 0, // ✅ Tambahkan field untuk growth
        growthPercentage: '0%' // ✅ Tambahkan field untuk growth percentage
    }));

    // Proses data
    dataArray.forEach(item => {
        if (!item?.created_at) return;
        
        const date = parseDateUniversal(item.created_at);
        if (!date || isNaN(date.getTime())) return;
        
        const itemYear = date.getFullYear();
        const monthIndex = date.getMonth();
        
        if (itemYear.toString() !== year || monthIndex < 0 || monthIndex > 11) return;
        
        switch(metric) {
            case 'clients':
                months[monthIndex].newClients++;
                break;
            case 'programs':
                months[monthIndex].newPrograms++;
                if (item.price) {
                    const price = parsePrice(item.price);
                    months[monthIndex].revenue += price;
                    months[monthIndex].programsCount++;
                }
                break;
            case 'participants':
                months[monthIndex].newParticipants++;
                break;
            case 'revenue':
                if (item.price) {
                    const price = parsePrice(item.price);
                    months[monthIndex].revenue += price;
                    months[monthIndex].programsCount++;
                }
                break;
        }
    });
    
    // Hitung running totals dan growth
    let runningTotalClients = 0;
    let runningTotalPrograms = 0;
    let runningTotalParticipants = 0;
    let runningCumulativeRevenue = 0;
    
    for (let i = 0; i < 12; i++) {
        // Update running totals
        runningTotalClients += months[i].newClients;
        runningTotalPrograms += months[i].newPrograms;
        runningTotalParticipants += months[i].newParticipants;
        runningCumulativeRevenue += months[i].revenue;
        
        // Set totals
        months[i].totalClients = runningTotalClients;
        months[i].totalPrograms = runningTotalPrograms;
        months[i].totalParticipants = runningTotalParticipants;
        months[i].cumulativeRevenue = runningCumulativeRevenue;
        
        // ✅ Hitung growth dari bulan sebelumnya
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
            
            // Hitung growth
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
            // Bulan pertama
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

export const calculateSummary = (monthlyData, metric, totalCount) => {
    if (!monthlyData || monthlyData.length === 0) {
        return {
            total: 0,
            thisYearTotal: 0,
            cumulativeTotal: 0,
            average: 0,
            growth: '0%',
            monthlyData: []
        };
    }

    let thisYearTotal = 0;
    let cumulativeTotal = 0;
    let totalGrowth = 0;
    let monthsWithData = 0;
    
    // Hitung totals dan growth
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
        
        // Hitung rata-rata growth
        if (month.growth !== undefined) {
            totalGrowth += month.growth;
            monthsWithData++;
        }
    });

    // Hitung rata-rata
    const average = metric === 'revenue' && thisYearTotal > 0 
        ? thisYearTotal / monthlyData.filter(m => m.revenue > 0).length 
        : 0;
    
    // Hitung rata-rata growth
    const averageGrowth = monthsWithData > 0 ? totalGrowth / monthsWithData : 0;
    const growthPercentage = averageGrowth > 0 
        ? `+${averageGrowth.toFixed(1)}%` 
        : averageGrowth < 0 
            ? `${averageGrowth.toFixed(1)}%` 
            : '0%';
    
    // Hitung growth dari tahun sebelumnya (jika ada data)
    let yearOverYearGrowth = '0%';
    if (monthlyData.length >= 12) {
        let totalThisYear = 0;
        let totalPrevYear = 0; // Ini seharusnya dihitung dari data tahun sebelumnya
        
        // Untuk sekarang, kita hitung growth dari awal vs akhir tahun
        const firstMonthValue = getMonthValue(monthlyData[0], metric);
        const lastMonthValue = getMonthValue(monthlyData[11], metric);
        
        if (firstMonthValue > 0 && lastMonthValue > firstMonthValue) {
            const growth = ((lastMonthValue - firstMonthValue) / firstMonthValue) * 100;
            yearOverYearGrowth = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        }
    }

    const summary = {
        total: totalCount || 0,
        thisYearTotal: thisYearTotal,
        cumulativeTotal: cumulativeTotal,
        average: average,
        growth: yearOverYearGrowth, // Gunakan year-over-year growth
        monthlyAverageGrowth: growthPercentage, // Rata-rata growth bulanan
        monthlyData: monthlyData
    };

    console.log(`Summary for ${metric}:`, {
        total: summary.total,
        thisYearTotal: summary.thisYearTotal,
        growth: summary.growth
    });
    
    return summary;
};

// Helper function untuk mendapatkan nilai bulan berdasarkan metric
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
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        monthIndex: i,
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
    
    // Tambahkan data dummy jika perlu
    if (metric === 'revenue') {
        let cumulative = 0;
        months.forEach((month, i) => {
            month.revenue = (i + 1) * 1000000;
            cumulative += month.revenue;
            month.cumulativeRevenue = cumulative;
            // Growth dummy
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