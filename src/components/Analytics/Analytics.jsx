/* eslint-disable no-undef */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import toast from "react-hot-toast";
import { usePrograms } from "../../hooks/usePrograms";
import { Chart as ChartJS, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { Controls } from "./Controls";
import { ChartRenderer } from "./ChartRenderer";
import { calculateMonthlyData, calculateSummary } from "../../utils/analyticsCalculator";
import { METRICS_CONFIG, formatNumber } from "../../utils/constants";
import StatsCards from "../Home/StatsCards";
import clientService from "../../services/clientService";
import impalaService from "../../services/impalaService";

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler 
);

const Analytics = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [chartType, setChartType] = useState('line');
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('clients');
    const [selectedDataType, setSelectedDataType] = useState('growth');
    
    const { allPrograms, refreshAllData, allProgramsLoading } = usePrograms();

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            
            let dataSource;
            let totalCount = 0;
            
            switch (selectedMetric) {
                case 'clients': {
                    const clientResult = await clientService.fetchClients({
                        page: 1,
                        limit: 1000
                    });
                    dataSource = clientResult.data || [];
                    totalCount = clientResult.data?.length || 0;
                    break;
                }

                case 'programs': {
                    dataSource = allPrograms || [];
                    totalCount = allPrograms?.length || 0;
                    break;
                }

                case 'participants': {
                    const participantResult = await impalaService.fetchImpala({
                        page: 1,
                        limit: 1000
                    });
                    dataSource = participantResult.data || [];
                    totalCount = dataSource.length;
                    break;
                }

                case 'revenue': {
                    dataSource = allPrograms || [];
                    totalCount = allPrograms?.length || 0;
                    break;
                }
            }
            
            if (dataSource && dataSource.length > 0) {
                const dates = dataSource.slice(0, 5).map(item => ({
                    raw: item.created_at,
                    parsed: new Date(item.created_at),
                    year: new Date(item.created_at).getFullYear()
                }));
            } else {
                console.warn('⚠️ No data source found!');
            }
            
            const monthlyData = calculateMonthlyData(dataSource, selectedYear, selectedMetric);
            
            const summary = calculateSummary(monthlyData, selectedMetric, totalCount);
            
            setAnalyticsData({
                monthlyData,
                summary,
                metric: selectedMetric,
                year: selectedYear
            });
            toast.success(`Analytics data loaded for ${METRICS_CONFIG[selectedMetric]?.label || selectedMetric}`);
            
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics data');
            
            setAnalyticsData({
                monthlyData: [],
                summary: {
                    total: 0,
                    thisYearTotal: 0,
                    cumulativeTotal: 0,
                    average: 0,
                    growth: '0%',
                    monthlyAverageGrowth: '0%',
                    quarterlyData: {
                        q1: { total: 0, average: 0, growth: 0, growthPercentage: '0%', months: ['Jan', 'Feb', 'Mar'], monthData: [] },
                        q2: { total: 0, average: 0, growth: 0, growthPercentage: '0%', months: ['Apr', 'May', 'Jun'], monthData: [] },
                        q3: { total: 0, average: 0, growth: 0, growthPercentage: '0%', months: ['Jul', 'Aug', 'Sep'], monthData: [] },
                        q4: { total: 0, average: 0, growth: 0, growthPercentage: '0%', months: ['Oct', 'Nov', 'Dec'], monthData: [] }
                    },
                    monthlyData: []
                },
                metric: selectedMetric,
                year: selectedYear
            });
        } finally {
            setLoading(false);
        }
    }, [selectedMetric, selectedYear, allPrograms]);

    const handleDataTypeChange = (type) => {
        setSelectedDataType(type);
    };

    const handleMetricSelect = (metric) => {
        setSelectedMetric(metric);
    };

    const handleExport = () => {
        const chartElement = document.querySelector('canvas');
        if (chartElement) {
            const image = chartElement.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${selectedMetric}-${selectedDataType}-${selectedYear}.png`;
            link.href = image;
            link.click();
            toast.success('Chart exported successfully');
        }
    };

    const handleRefreshAll = async () => {
        try {
            setLoading(true);
            if (refreshAllData) {
                await refreshAllData();
            }
            await fetchAnalyticsData();
            toast.success('All data refreshed');
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const currentMetric = METRICS_CONFIG[selectedMetric] || { label: selectedMetric, color: '#3b82f6' };
    const isQuarterView = selectedDataType && ['q1', 'q2', 'q3', 'q4'].includes(selectedDataType);

    return (
        <div className="space-y-6 py-6 -mt-4">
            <StatsCards 
                selectedMetric={selectedMetric}
                onMetricSelect={handleMetricSelect}
                interactive={true}
            />

            <Card>
                <CardContent>
                    <CardHeader className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span 
                                        className="w-5 h-5 rounded-full"
                                        style={{ backgroundColor: currentMetric.color }}
                                    />
                                    {currentMetric.label} Analytics - {selectedYear}
                                    
                                </CardTitle>
                                {analyticsData?.summary && (
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span>Total: {formatNumber(analyticsData.summary.total, selectedMetric)}</span>
                                        <span>•</span>
                                        <span>This Year: {formatNumber(analyticsData.summary.thisYearTotal, selectedMetric)}</span>
                                        {isQuarterView && analyticsData.summary.quarterlyData && (
                                            <>
                                                <span>•</span>
                                                <span className="font-medium">
                                                    Quarter Total: {formatNumber(
                                                        analyticsData.summary.quarterlyData[selectedDataType]?.total || 0, 
                                                        selectedMetric
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="h-px mt-4" style={{ backgroundColor: currentMetric.color, opacity: 0.3 }} />
                    </CardHeader>

                    <Controls 
                        selectedYear={selectedYear}
                        onYearChange={setSelectedYear}
                        chartType={chartType}
                        onChartTypeChange={setChartType}
                        selectedDataType={selectedDataType}
                        onDataTypeChange={handleDataTypeChange}
                        selectedMetric={selectedMetric}
                        loading={loading}
                        onExport={handleExport}
                        onRefreshAll={handleRefreshAll}
                    />

                    <div className="h-80">
                        <ChartRenderer 
                            monthlyData={analyticsData?.monthlyData}
                            metric={selectedMetric}
                            dataType={selectedDataType}
                            chartType={chartType}
                            loading={loading}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Analytics;