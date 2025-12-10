// src/components/Home/QuarterSummaryCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown, Minus, Users, DollarSign, ShoppingCart } from 'lucide-react';

const QuarterSummaryCard = ({ quarter, data }) => {
    if (!data) return null;

    const getQuarterColor = (q) => {
        switch (q) {
            case 'Q1': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Q2': return 'bg-green-100 text-green-800 border-green-300';
            case 'Q3': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Q4': return 'bg-purple-100 text-purple-800 border-purple-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getQuarterIcon = (q) => {
        switch (q) {
            case 'Q1': return '🌸';
            case 'Q2': return '☀️';
            case 'Q3': return '🍂';
            case 'Q4': return '❄️';
            default: return '📊';
        }
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-500" />;
    };

    const getTrendText = (trend) => {
        if (trend > 0) return `+${Math.abs(trend)}%`;
        if (trend < 0) return `-${Math.abs(trend)}%`;
        return 'Stabil';
    };

    const getTrendColor = (trend) => {
        if (trend > 0) return 'text-green-600';
        if (trend < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Rp 0';
        
        if (amount >= 1000000000) {
            return `Rp ${(amount / 1000000000).toFixed(1)}M`;
        }
        if (amount >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
        }
        if (amount >= 1000) {
            return `Rp ${(amount / 1000).toFixed(1)}Rb`;
        }
        
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}Jt`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}Rb`;
        }
        
        return num.toLocaleString('id-ID');
    };

    const safeData = {
        revenue: data.revenue || { value: 0, trend: 0 },
        customers: data.customers || { value: 0, trend: 0 },
        transactions: data.transactions || { value: 0, trend: 0 },
        averageTransaction: data.averageTransaction || 0,
        performance: data.performance || 'fair'
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{getQuarterIcon(quarter)}</span>
                        <div>
                            <CardTitle className="text-lg">{quarter}</CardTitle>
                            <div className="text-xs text-gray-500">
                                {quarter === 'Q1' && 'Januari - Maret'}
                                {quarter === 'Q2' && 'April - Juni'}
                                {quarter === 'Q3' && 'Juli - September'}
                                {quarter === 'Q4' && 'Oktober - Desember'}
                            </div>
                        </div>
                    </div>
                    <Badge className={getQuarterColor(quarter)} variant="outline">
                        {quarter}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-4">
                    {/* Pendapatan */}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Pendapatan</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {getTrendIcon(safeData.revenue.trend)}
                                <span className={`text-sm font-medium ${getTrendColor(safeData.revenue.trend)}`}>
                                    {getTrendText(safeData.revenue.trend)}
                                </span>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(safeData.revenue.value)}
                        </div>
                    </div>

                    {/* Pelanggan */}
                    <div className="p-3 bg-gradient-to-r from-green-50 to-white rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Pelanggan</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {getTrendIcon(safeData.customers.trend)}
                                <span className={`text-sm font-medium ${getTrendColor(safeData.customers.trend)}`}>
                                    {getTrendText(safeData.customers.trend)}
                                </span>
                            </div>
                        </div>
                        <div className="text-xl font-semibold text-gray-900">
                            {formatNumber(safeData.customers.value)}
                        </div>
                    </div>

                    {/* Rata-rata Transaksi */}
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Rata-rata Transaksi</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {safeData.transactions.value} transaksi
                            </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(safeData.averageTransaction)}
                        </div>
                    </div>

                    {/* Status Kinerja */}
                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status Kinerja</span>
                            <Badge
                                variant={
                                    safeData.performance === 'excellent' ? 'default' :
                                    safeData.performance === 'good' ? 'secondary' :
                                    safeData.performance === 'fair' ? 'outline' : 'destructive'
                                }
                                className={
                                    safeData.performance === 'excellent' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                    safeData.performance === 'good' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                                    safeData.performance === 'fair' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                                    'bg-gradient-to-r from-red-500 to-pink-600'
                                }
                            >
                                {safeData.performance === 'excellent' ? 'Unggul' :
                                 safeData.performance === 'good' ? 'Baik' :
                                 safeData.performance === 'fair' ? 'Cukup' : 'Perlu Perbaikan'}
                            </Badge>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Target</span>
                                <span>
                                    {safeData.performance === 'excellent' ? '100%' :
                                     safeData.performance === 'good' ? '75%' :
                                     safeData.performance === 'fair' ? '50%' : '25%'}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        safeData.performance === 'excellent' ? 'bg-green-500' :
                                        safeData.performance === 'good' ? 'bg-blue-500' :
                                        safeData.performance === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{
                                        width: safeData.performance === 'excellent' ? '100%' :
                                               safeData.performance === 'good' ? '75%' :
                                               safeData.performance === 'fair' ? '50%' : '25%'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default QuarterSummaryCard;