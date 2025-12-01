// src/components/Analytics/Analytics.jsx
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useClients } from "../../hooks/useClients";
import { usePrograms } from "../../hooks/usePrograms";
import { useImpala } from "../../hooks/useImpala";
import { Chart as ChartJS, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";

// Import components
import { MetricCards } from "./MetricCards";
import { Controls } from "./Controls";
import { ChartRenderer } from "./ChartRenderer";
import { DataTable } from "./DataTable";
import { calculateMonthlyData, calculateSummary } from "../../utils/analyticsCalculator";
import { METRICS_CONFIG } from "../../utils/constants";
import StatsCards  from "../Home/StatsCards";

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
    
    const { clients, refetch: refetchClients } = useClients();
    const { programs, refetch: refetchPrograms } = usePrograms();
    const { participant: participants, refetch: refetchParticipants } = useImpala();

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            
            let dataSource;
            let totalCount;
            
            switch (selectedMetric) {
                case 'clients':
                    dataSource = clients || [];
                    totalCount = clients?.length || 0;
                    break;
                case 'programs':
                    dataSource = programs || [];
                    totalCount = programs?.length || 0;
                    break;
                case 'participants':
                    dataSource = participants || [];
                    totalCount = participants?.length || 0;
                    break;
                case 'revenue':
                    dataSource = programs || [];
                    totalCount = programs?.length || 0;
                    break;
                default:
                    dataSource = clients || [];
                    totalCount = clients?.length || 0;
            }

            const monthlyData = calculateMonthlyData(dataSource, selectedYear, selectedMetric);
            const summary = calculateSummary(monthlyData, selectedMetric, totalCount);
            
            setAnalyticsData({
                monthlyData,
                summary,
                metric: selectedMetric,
                year: selectedYear
            });
            
            toast.success(`Analytics data loaded for ${METRICS_CONFIG[selectedMetric].label}`);
            
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics data');
            
            // Fallback data
            const mockMonthlyData = Array(12).fill().map((_, i) => ({
                month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                newClients: 0,
                totalClients: 0,
                newPrograms: 0,
                totalPrograms: 0,
                newParticipants: 0,
                totalParticipants: 0,
                revenue: 0,
                cumulativeRevenue: 0,
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
    }, [selectedMetric, selectedYear, clients, programs, participants]);

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
            await Promise.all([
                refetchClients(),
                refetchPrograms(),
                refetchParticipants()
            ]);
            await fetchAnalyticsData();
        } catch (error) {
            toast.error('Failed to refresh data', error);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const currentMetric = METRICS_CONFIG[selectedMetric];

    return (
        <div className="space-y-6 py-6">
            {/* Metric Selection Cards */}
            <StatsCards 
                selectedMetric={selectedMetric}
                onMetricSelect={setSelectedMetric}
                interactive={true} // Aktifkan mode interaktif
            />

            {/* Analytics Dashboard */}
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
                                        <span>Total: {analyticsData.summary.total?.toLocaleString('id-ID')}</span>
                                        <span>•</span>
                                        <span>This Year: {analyticsData.summary.thisYearTotal?.toLocaleString('id-ID')}</span>
                                        {selectedMetric === 'revenue' && analyticsData.summary.average && (
                                            <>
                                                <span>•</span>
                                                <span>Average: Rp {Math.round(analyticsData.summary.average).toLocaleString('id-ID')}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefreshAll}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh All Data
                            </Button>
                        </div>
                        <div className="h-px mt-4" style={{ backgroundColor: currentMetric.color, opacity: 0.3 }} />
                    </CardHeader>

                    {/* Controls */}
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

                    {/* Chart */}
                    <div className="h-80">
                        <ChartRenderer 
                            monthlyData={analyticsData?.monthlyData}
                            metric={selectedMetric}
                            dataType={selectedDataType}
                            chartType={chartType}
                            loading={loading}
                        />
                    </div>

                    {/* Data Table */}
                    {/* <DataTable 
                        monthlyData={analyticsData?.monthlyData}
                        metric={selectedMetric}
                        dataType={selectedDataType}
                    /> */}
                </CardContent>
            </Card>
        </div>
    );
};

export default Analytics;