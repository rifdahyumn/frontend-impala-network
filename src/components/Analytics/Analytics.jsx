import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import toast from "react-hot-toast";
import { usePrograms } from "../../hooks/usePrograms";
import { Chart as ChartJS, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { Controls } from "./Controls";
import { ChartRenderer } from "./ChartRenderer";
import { calculateMonthlyData, calculateSummary } from "../../utils/analyticsCalculator";
import { METRICS_CONFIG } from "../../utils/constants";
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
    
    const { allPrograms, refreshAllData,  } = usePrograms();

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            
            let dataSource;
            let totalCount;
            
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
                }
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
            
            const mockMonthlyData = Array(12).fill().map((_, i) => ({
                month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                newClients: 0,
                totalClients: 0,
                newPrograms: 0,
                totalPrograms: 0,
                newParticipants: 0,
                totalParticipants: 0,
                revenue: selectedMetric === 'revenue' ? (i + 1) * 1000000 : 0,
                cumulativeRevenue: selectedMetric === 'revenue' ? ((i + 1) * (i + 2) / 2) * 1000000 : 0,
                programsCount: 0
            }));
            
            setAnalyticsData({
                monthlyData: mockMonthlyData,
                summary: {
                    total: 0,
                    thisYearTotal: 0,
                    growth: '0',
                    average: 0
                },
                metric: selectedMetric,
                year: selectedYear
            });
        } finally {
            setLoading(false);
        }
    }, [selectedMetric, selectedYear, allPrograms]);

    const handleExport = () => {
        const chartElement = document.querySelector('canvas');
        if (chartElement) {
            const image = chartElement.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${selectedMetric}-analytics-${selectedYear}.png`;
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

    return (
        <div className="space-y-6 py-6 -mt-10">
            <div className="hidden">
                <p>All programs: {allPrograms?.length || 0}</p>
                <p>Selected metric: {selectedMetric}</p>
                <p>Selected year: {selectedYear}</p>
                <p>Loading: {loading.toString()}</p>
            </div>

            <StatsCards 
                selectedMetric={selectedMetric}
                onMetricSelect={setSelectedMetric}
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
                                        <span>Total: {analyticsData.summary.total?.toLocaleString('id-ID') || '0'}</span>
                                        <span>•</span>
                                        <span>This Year: {analyticsData.summary.thisYearTotal?.toLocaleString('id-ID') || '0'}</span>
                                        
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
                        onDataTypeChange={setSelectedDataType}
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