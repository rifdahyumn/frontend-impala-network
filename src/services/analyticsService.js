const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class AnalyticsService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.cache = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000;
        this.requestQueue = new Map();
    }

    async fetchMonthlyGrowthData(metric, year) {
        try {
            const url = `${this.baseURL}/analytics/monthly-growth?metric=${metric}&year=${year}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch monthly growth data');
            }

            return {
                success: true,
                data: this.extractMonthlyGrowthData(result),
                metadata: {
                    metric: metric,
                    year: year,
                    summary: result.message?.summary || result.data?.summary
                },
                rawResponse: result
            };
        } catch (error) {
            console.error(`Error fetching monthly growth data for ${metric} ${year}:`, error);
            
            return {
                success: false,
                data: this.getMockMonthlyGrowthData(metric, year),
                error: error.message,
                metadata: {
                    metric: metric,
                    year: year,
                    isFallback: true
                }
            };
        }
    }

    debounceRequest(key, fn, delay = 500) {
        if (this.requestQueue.has(key)) {
            clearTimeout(this.requestQueue.get(key));
        }
        
        const timeoutId = setTimeout(async () => {
            this.requestQueue.delete(key);
            return await fn();
        }, delay);
        
        this.requestQueue.set(key, timeoutId);
    }

    async fetchQuarterOptimized(params = {}) {
        try {
            const cacheKey = `quarterly-optimized-${JSON.stringify(params)}`;
            const cached = this.getFromCache(cacheKey);

            if (cached) {
                return cached;
            }

            const queryParams = new URLSearchParams();

            if (params.years) {
                queryParams.append('years', params.years);
            }

            const response = await fetch(`${this.baseURL}/analytics/quarterly-optimized?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
            });

            if (response.status === 429) {
                throw new Error('Rate limited. Please try again later.');
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch optimized quarterly data');
            }

            const formattedResult = {
                success: true,
                data: {
                    yearlyData: result.data?.yearlyData || {},
                    years: result.data?.years || [],
                    preCalculated: result.data?.preCalculated || {},
                    summary: result.data?.summary || {},
                    hasData: result.data?.hasData || false,
                    latestYear: result.data?.latestYear,
                    currentYear: result.data?.currentYear,
                },
                message: result.message || 'Quarterly data retrieved successfully',
                metadata: {
                    isOptimized: true,
                    cacheable: true,
                    timestamp: Date.now()
                }
            };

            this.saveToCache(cacheKey, formattedResult);
            return formattedResult;

        } catch (error) {
            console.error('Error fetching optimized quarterly data:', error);
            throw error
        }
    }

        async fetchYearlyComparison(options = {}) {
        try {
            const cacheKey = `yearly-comparison-${JSON.stringify(options)}`;
            const cached = this.getFromCache(cacheKey);

            if (cached) {
                return cached;
            }

            const {
                years = 'auto',
                includeMonthly = false,
                includeQuarterly = true
            } = options;

            const queryParams = new URLSearchParams();

            if (years === 'auto') {
                queryParams.append('auto', 'true');
            } else if (Array.isArray(years)) {
                queryParams.append('years', years.join(','));
            }

            if (includeMonthly) {
                queryParams.append('includeMonthly', 'true');
            }
            
            if (includeQuarterly) {
                queryParams.append('includeQuarterly', 'true');
            }

            // PERBAIKAN: Tambahkan endpoint yang benar
            const response = await fetch(`${this.baseURL}/analytics/yearly-comparison?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch yearly comparison');
            }

            const formattedData = this.formatBackendResponse(result.data, result.years);

            const finalResult = {
                success: true,
                data: formattedData,
                years: result.years || [],
                message: result.message || 'Yearly comparison data retrieved successfully',
                metadata: {
                    isOptimized: false,
                    cacheable: true,
                    timestamp: Date.now()
                }
            };

            this.saveToCache(cacheKey, finalResult);

            return finalResult;
        } catch (error) {
            console.error('Error fetching yearly comparison:', error);

            const mockData = this.getMockYearlyComparisonDataWithQuarterly();
            const currentYear = new Date().getFullYear();
            const years = [currentYear - 2, currentYear - 1, currentYear];

            return {
                success: false,
                data: mockData,
                years: years,
                message: 'Using mock data due to API error', 
                metadata: {
                    isFallback: true,
                    error: error.message
                }
            };
        }
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
            return cached.data;
        }

        this.cache.delete(key);
        return null;
    }

    saveToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        if (this.cache.size > 50) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }

    async fetchYearlyComparisonWithFallback(options = {}) {
        try {
            if (options.useOptimized !== false) {
                const optimizedResult = await this.fetchQuarterOptimized({
                    years: options.customYears
                });

                if (optimizedResult.success && optimizedResult.data.hasData) {
                    return optimizedResult;
                }
            }

            return await this.fetchYearlyComparison(options);
        } catch (error) {
            console.error('Error in fetchYearlyComparisonWithFallback:', error);
            
            const mockData = this.getMockYearlyComparisonDataWithQuarterly();
            const currentYear = new Date().getFullYear();
            const years = [currentYear - 2, currentYear - 1, currentYear];

            return {
                success: false,
                data: mockData,
                years: years,
                message: 'Using mock data as fallback',
                metadata: {
                    isFallback: true,
                    error: error.message
                }
            };
        }
    }

    extractMonthlyGrowthData(result) {
        let data = null;
        
        if (result.message?.data && Array.isArray(result.message.data)) {
            data = result.message.data;
        } else if (result.data && Array.isArray(result.data)) {
            data = result.data;
        } else if (Array.isArray(result.message)) {
            data = result.message;
        } else if (result.message && typeof result.message === 'object') {
            const possibleKeys = ['data', 'items', 'records', 'monthlyData'];
            for (const key of possibleKeys) {
                if (result.message[key] && Array.isArray(result.message[key])) {
                    data = result.message[key];
                    break;
                }
            }
        }

        if (!data || !Array.isArray(data)) {
            throw new Error('Invalid monthly growth data structure received from API');
        }
        return data;
    }

    getMockMonthlyGrowthData(metric, year) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const baseData = months.map((month, index) => {
            const baseNew = Math.floor(Math.random() * 25) + 5;
            const baseTotal = 100 + (index * 20);
            
            return {
                month: `${month} ${year}`,
                monthNumber: index + 1,
                newCount: metric === 'revenue' ? baseNew * 10000 : baseNew,
                totalCount: baseTotal + (metric === 'revenue' ? baseNew * 10000 : baseNew),
                growthRate: index > 0 ? `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 15 + 5).toFixed(2)}%` : '0%',
                trend: index > 0 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'
            };
        });
        
        const multipliers = {
            clients: 1,
            programs: 0.7,
            participants: 2,
            revenue: 1
        };
        
        return baseData.map(item => ({
            ...item,
            totalCount: Math.round(item.totalCount * (multipliers[metric] || 1))
        }));
    }

    formatYearlyComparisonForFrontend(apiData, years) {
        const formatted = {};

        years.forEach(year => {
            const yearData = apiData[year];
            if (yearData) {
                formatted[year] = {
                    clients: {
                        total: yearData.clients?.total || 0,
                        growth: yearData.clients?.growth || { 
                            percentage: '0%', 
                            isPositive: true 
                        }
                    },
                    programs: {
                        total: yearData.programs?.total || 0,
                        growth: yearData.programs?.growth || { 
                            percentage: '0%', 
                            isPositive: true 
                        }
                    },
                    participants: {
                        total: yearData.participants?.total || 0,
                        growth: yearData.participants?.growth || { 
                            percentage: '0%', 
                            isPositive: true 
                        }
                    },
                    revenue: {
                        total: yearData.revenue?.total || 0,
                        growth: yearData.revenue?.growth || { 
                            percentage: '0%', 
                            isPositive: true 
                        }
                    },
                };
            } else {
                formatted[year] = {
                    clients: { total: 0, growth: { percentage: '0%', isPositive: false } },
                    programs: { total: 0, growth: { percentage: '0%', isPositive: false } },
                    participants: { total: 0, growth: { percentage: '0%', isPositive: false } },
                    revenue: { total: 0, growth: { percentage: '0%', isPositive: false } }
                };
            }
        });
        return formatted;
    }

    getMockYearlyComparisonData() {
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 2, currentYear - 1, currentYear];

        const mockData = {};

        years.forEach((year, index) => {
            const hasData = Math.random() > 0.3;
            
            if (hasData) {
                const baseValue = {
                    clients: 15 + (index * 5),
                    programs: 8 + (index * 3),
                    participants: 30 + (index * 15),
                    revenue: 150000000 + (index * 50000000)
                };

                mockData[year] = {
                    clients: {
                        total: baseValue.clients,
                        growth: {
                            percentage: index > 0 ? '+25%' : '0%',
                            isPositive: true
                        }
                    },
                    programs: {
                        total: baseValue.programs,
                        growth: {
                            percentage: index > 0 ? '+20%' : '0%',
                            isPositive: true
                        }
                    },
                    participants: {
                        total: baseValue.participants,
                        growth: {
                            percentage: index > 0 ? '+30%' : '0%',
                            isPositive: true
                        }
                    },
                    revenue: {
                        total: baseValue.revenue,
                        growth: {
                            percentage: index > 0 ? '+35%' : '0%',
                            isPositive: true
                        }
                    }
                };
            } else {
                mockData[year] = {
                    clients: { total: 0, growth: { percentage: '0%', isPositive: false } },
                    programs: { total: 0, growth: { percentage: '0%', isPositive: false } },
                    participants: { total: 0, growth: { percentage: '0%', isPositive: false } },
                    revenue: { total: 0, growth: { percentage: '0%', isPositive: false } }
                };
            }
        });

        return mockData;
    }

    formatNumber(number, metric = null) {
        if (metric === 'revenue') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number);
        }
        
        return new Intl.NumberFormat('id-ID').format(number);
    }

    getAvailableYears() {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        for (let i = 4; i >= 0; i--) {
            years.push(currentYear - i);
        }
        
        return years;
    }

    formatMonthlyGrowthForFrontend(data) {
        if (!data || !Array.isArray(data)) {
            return [];
        }

        return data.map(item => ({
            month: item.month,
            newItems: item.newCount >= 0 ? `+${item.newCount}` : `${item.newCount}`,
            totalItems: item.totalCount || item.total || 0,
            growthRate: item.growthRate || '0%',
            trend: item.trend || (item.growthRate?.startsWith('+') ? 'up' : 
                   item.growthRate?.startsWith('-') ? 'down' : 'stable'),
            rawData: item
        }));
    }

    getMockYearlyComparisonDataWithQuarterly() {
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 2, currentYear - 1, currentYear];

        const mockData = {};

        years.forEach((year, index) => {
            const hasData = Math.random() > 0.2;

            if (hasData) {
                const baseValue = {
                    clients: 50 + (index * 20),
                    programs: 25 + (index * 10),
                    participants: 100 + (index * 40),
                    revenue: 250000000 + (index * 80000000)
                };

                const quarterlyData = {};
                const metrics = ['clients', 'programs', 'participants', 'revenue'];

                metrics.forEach(metric => {
                    quarterlyData[metric] = {};
                    const quarterMultipliers = [0.2, 0.3, 0.25, 0.25];

                    quarterMultipliers.forEach((multiplier, qIndex) => {
                        const quarter = `q${qIndex + 1}`;
                        const value = Math.round(baseValue[metric] * multiplier * (0.8 + Math.random() * 0.4));

                        quarterlyData[metric][quarter] = {
                            total: value,
                            count: Math.round(value / (metric === 'revenue' ? 1000000 : 1)),
                            average: metric === 'revenue' ? Math.round(value / 5) : Math.round(value / 2)
                        };
                    });
                });

                mockData[year] = {
                    clients: {
                        total: baseValue.clients,
                        count: baseValue.clients,
                        average: Math.round(baseValue.clients / 2),
                        growth: {
                            percentage: index > 0 ? `+${(20 + index * 5)}%` : '0%',
                            value: index > 0 ? baseValue.clients * 0.2 : 0,
                            isPositive: true,
                            comparedTo: index > 0 ? years[index - 1] : null
                        }
                    },
                    programs: {
                        total: baseValue.programs,
                        count: baseValue.programs,
                        average: Math.round(baseValue.programs / 2),
                        growth: {
                            percentage: index > 0 ? `+${(15 + index * 5)}%` : '0%',
                            value: index > 0 ? baseValue.programs * 0.15 : 0,
                            isPositive: true,
                            comparedTo: index > 0 ? years[index - 1] : null
                        }
                    },
                    participants: {
                        total: baseValue.participants,
                        count: baseValue.participants,
                        average: Math.round(baseValue.participants / 3),
                        growth: {
                            percentage: index > 0 ? `+${(25 + index * 5)}%` : '0%',
                            value: index > 0 ? baseValue.participants * 0.25 : 0,
                            isPositive: true,
                            comparedTo: index > 0 ? years[index - 1] : null
                        }
                    },
                    revenue: {
                        total: baseValue.revenue,
                        count: Math.round(baseValue.revenue / 1000000),
                        average: Math.round(baseValue.revenue / 5),
                        growth: {
                            percentage: index > 0 ? `+${(30 + index * 5)}%` : '0%',
                            value: index > 0 ? baseValue.revenue * 0.3 : 0,
                            isPositive: true,
                            comparedTo: index > 0 ? years[index - 1] : null
                        }
                    },
                    quarterly: quarterlyData
                };
            } else {
                mockData[year] = this.getEmptyYearData();
            }
        });

        return mockData;
    }

    formatBackendResponse(apiData, years) {
        const formatted = {};
        
        if (!apiData || typeof apiData !== 'object') {
            console.error('Invalid API data format:', apiData);
            return this.getMockYearlyComparisonDataWithQuarterly();
        }
        
        Object.keys(apiData).forEach(yearKey => {
            const year = parseInt(yearKey);
            const yearData = apiData[yearKey];
            
            if (!yearData) {
                console.warn(`No data for year ${year}`);
                formatted[year] = this.getEmptyYearData();
                return;
            }
            
            formatted[year] = {
                clients: {
                    total: yearData.clients?.total || 0,
                    count: yearData.clients?.count || 0,
                    average: yearData.clients?.average || 0,
                    growth: yearData.clients?.growth || {
                        percentage: '0%',
                        value: 0,
                        isPositive: false,
                        comparedTo: null
                    }
                },
                programs: {
                    total: yearData.programs?.total || 0,
                    count: yearData.programs?.count || 0,
                    average: yearData.programs?.average || 0,
                    growth: yearData.programs?.growth || {
                        percentage: '0%',
                        value: 0,
                        isPositive: false,
                        comparedTo: null
                    }
                },
                participants: {
                    total: yearData.participants?.total || 0,
                    count: yearData.participants?.count || 0,
                    average: yearData.participants?.average || 0,
                    growth: yearData.participants?.growth || {
                        percentage: '0%',
                        value: 0,
                        isPositive: false,
                        comparedTo: null
                    }
                },
                revenue: {
                    total: yearData.revenue?.total || 0,
                    count: yearData.revenue?.count || 0,
                    average: yearData.revenue?.average || 0,
                    growth: yearData.revenue?.growth || {
                        percentage: '0%',
                        value: 0,
                        isPositive: false,
                        comparedTo: null
                    }
                },
                quarterly: yearData.quarterly || {
                    clients: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } },
                    programs: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } },
                    participants: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } },
                    revenue: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } }
                }
            };
        });
        
        years.forEach(year => {
            if (!formatted[year]) {
                formatted[year] = this.getEmptyYearData();
            }
        });
        
        return formatted;
    }

    getEmptyYearData() {
        return {
            clients: { total: 0, count: 0, average: 0, growth: { percentage: '0%', value: 0, isPositive: false, comparedTo: null } },
            programs: { total: 0, count: 0, average: 0, growth: { percentage: '0%', value: 0, isPositive: false, comparedTo: null } },
            participants: { total: 0, count: 0, average: 0, growth: { percentage: '0%', value: 0, isPositive: false, comparedTo: null } },
            revenue: { total: 0, count: 0, average: 0, growth: { percentage: '0%', value: 0, isPositive: false, comparedTo: null } },
            quarterly: {
                clients: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } },
                programs: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } },
                participants: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } },
                revenue: { q1: { total: 0, count: 0, average: 0 }, q2: { total: 0, count: 0, average: 0 }, q3: { total: 0, count: 0, average: 0 }, q4: { total: 0, count: 0, average: 0 } }
            }
        };
    }
}

export default new AnalyticsService();