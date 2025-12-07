import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3, Users, Package, Users2, DollarSign } from 'lucide-react';
import { METRICS_CONFIG } from "../../utils/constants";
import analyticsService from "../../services/analyticsService";
import YearlyComparisonCard from './YearlyComparisonCard';

const YearlyComparison = ({ selectedYear, refreshTrigger }) => {
    const [yearlyData, setYearlyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState([]);
    
    const YearlyComparisonSkeleton = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gray-200"></div>
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-12"></div>
                            </div>
                            <div className="mb-4">
                                <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="flex items-center gap-2">
                                        <div className="w-10 h-3 bg-gray-200 rounded"></div>
                                        <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                                        <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
    
    const YearlyComparisonEmpty = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    <span>Perbandingan Tahunan</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Data Tidak Tersedia
                    </h3>
                    <p className="text-gray-500 max-w-md">
                        Data perbandingan tahunan tidak dapat diambil. Pastikan backend API berjalan.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
    
    useEffect(() => {
        const fetchYearlyData = async () => {
            try {
                setLoading(true);
                const data = await analyticsService.fetchYearlyComparison({ years: 'auto' });
                const dataYears = Object.keys(data).map(y => parseInt(y)).sort();
                
                setYearlyData(data);
                setYears(dataYears);
                
            } catch (error) {
                console.error('Error mengambil data tahunan:', error);
                const currentYear = new Date().getFullYear();
                const yearList = [currentYear - 2, currentYear - 1, currentYear];
                setYearlyData(analyticsService.getMockData());
                setYears(yearList);
            } finally {
                setLoading(false);
            }
        };
        
        fetchYearlyData();
    }, [selectedYear, refreshTrigger]);
    
    if (loading) return <YearlyComparisonSkeleton />;
    if (!yearlyData || years.length === 0) return <YearlyComparisonEmpty />;
    
    const metrics = [
        {
            id: 'clients',
            title: 'Total Clients',
            icon: Users,
            color: METRICS_CONFIG.clients?.color || '#3b82f6',
            format: (value) => value?.toLocaleString('id-ID') || '0',
            description: 'Number of clients per year'
        },
        {
            id: 'programs',
            title: 'Total Programs',
            icon: Package,
            color: METRICS_CONFIG.programs?.color || '#10b981',
            format: (value) => value?.toLocaleString('id-ID') || '0',
            description: 'Number of programs per year'
        },
        {
            id: 'participants',
            title: 'Total Participant',
            icon: Users2,
            color: METRICS_CONFIG.participants?.color || '#8b5cf6',
            format: (value) => value?.toLocaleString('id-ID') || '0',
            description: 'Number of participants per year'
        },
        {
            id: 'revenue',
            title: 'Total Price',
            icon: DollarSign,
            color: METRICS_CONFIG.revenue?.color || '#f59e0b',
            format: (value) => value ? `Rp ${value.toLocaleString('id-ID')}` : 'Rp 0',
            description: 'Number of price per year'
        }
    ];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span>Year-to-date Comparison ({years[0]} - {years[years.length - 1]})</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map(metric => (
                        <YearlyComparisonCard
                            key={metric.id}
                            metric={metric}
                            yearlyData={yearlyData}
                            years={years}
                        />
                    ))}
                </div>
                
            </CardContent>
        </Card>
    );
};

export default YearlyComparison;