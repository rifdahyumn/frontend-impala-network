// components/MemberGrowthDetails.js
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown, Minus, Users, Package, Users2, DollarSign, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import { useMonthlyGrowth } from "../../hooks/useMonthlyGrowth"

const MemberGrowthDetails = () => {
    const {
        selectedMetric,
        selectedYear,
        availableYears,
        growthData,
        loading,
        setSelectedMetric,
        setSelectedYear,
        handleYearChange,
        refreshData,
        formatNumber,
    } = useMonthlyGrowth()

    const metricsConfig = {
        clients: {
            label: 'Clients',
            icon: Users,
            color: 'blue',
            tableTitle: 'Clients Monthly Growth',
            columnTitle: 'Total Clients'
        },
        programs: {
            label: 'Programs',
            icon: Package,
            color: 'green',
            tableTitle: 'Programs Monthly Growth',
            columnTitle: 'Total Programs'
        },
        participants: {
            label: 'Participants',
            icon: Users2,
            color: 'orange',
            tableTitle: 'Participants Monthly Growth',
            columnTitle: 'Total Participants'
        },
        revenue: {
            label: 'Revenue',
            icon: DollarSign,
            color: 'purple',
            tableTitle: 'Revenue Monthly Growth',
            columnTitle: 'Total Revenue'
        }
    }

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />
            default:
                return <Minus className="h-4 w-4 text-gray-500" />
        }
    }

    const getGrowthVariant = (growthRate) => {
        if (growthRate === '0%') return 'secondary'
        if (growthRate.startsWith('-')) return 'destructive'
        return 'default'
    }

    const getNewItemsVariant = (newItems) => {
        if (newItems === '0') return 'secondary'
        if (newItems.startsWith('-')) return 'destructive'
        return 'default'
    }

    const currentMetric = metricsConfig[selectedMetric]
    const MetricIcon = currentMetric.icon

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                
                
            </div>
            
            <Card>
                <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className={`p-2 ${currentMetric.color === 'blue' ? 'bg-blue-100' : currentMetric.color === 'green' ? 'bg-green-100' : currentMetric.color === 'orange' ? 'bg-orange-100' : 'bg-purple-100'} rounded-lg`}>
                                <MetricIcon className={`h-4 w-4 ${currentMetric.color === 'blue' ? 'text-blue-600' : currentMetric.color === 'green' ? 'text-green-600' : currentMetric.color === 'orange' ? 'text-orange-600' : 'text-purple-600'}`} />
                            </div>
                            <div>
                                <p>{currentMetric.tableTitle} - {selectedYear}</p>
                                
                            </div>
                        </div>
                        <div className="flex flex-row gap-3">
                            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                                <SelectTrigger className='w-[180px]'>
                                    <SelectValue placeholder='Select Metric' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='clients'>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <span>Clients</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='programs'>
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            <span>Programs</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='participants'>
                                        <div className="flex items-center gap-2">
                                            <Users2 className="w-4 h-4" />
                                            <span>Participants</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='revenue'>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            <span>Revenue</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => handleYearChange(-1)}
                                    disabled={selectedYear <= (availableYears[0] || new Date().getFullYear() - 4)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                
                                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{selectedYear}</span>
                                </div>
                                
                                <Button
                                    variant='outline'
                                    size='icon'
                                    onClick={() => handleYearChange(1)}
                                    disabled={selectedYear >= new Date().getFullYear()}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                
                                <Select
                                    value={selectedYear.toString()}
                                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                                >
                                    <SelectTrigger className='w-[120px]'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map(year => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                    </CardTitle>
                    
                </CardHeader>
                
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className='h-12 w-full' />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-md border border-gray-200 bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow className={`${currentMetric.color === 'blue' ? 'bg-blue-50/50 hover:bg-blue-50' : currentMetric.color === 'green' ? 'bg-green-50/50 hover:bg-green-50' : currentMetric.color === 'orange' ? 'bg-orange-50/50 hover:bg-orange-50' : 'bg-purple-50/50 hover:bg-purple-50'}`}>
                                        <TableHead>Month</TableHead>
                                        <TableHead>New {currentMetric.label}</TableHead>
                                        <TableHead>{currentMetric.columnTitle}</TableHead>
                                        <TableHead>Growth Rate (%)</TableHead>
                                        <TableHead>Trend</TableHead>
                                    </TableRow>
                                </TableHeader>
                                
                                <TableBody>
                                    {growthData.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            className={`${currentMetric.color === 'blue' ? 'hover:bg-blue-50/30' : currentMetric.color === 'green' ? 'hover:bg-green-50/30' : currentMetric.color === 'orange' ? 'hover:bg-orange-50/30' : 'hover:bg-purple-50/30'} transition-colors`}
                                        >
                                            <TableCell className='font-medium text-gray-900'>
                                                {row.month}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getNewItemsVariant(row.newItems)}
                                                    className='font-mono text-xs'
                                                >
                                                    {row.newItems}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='font-medium text-gray-700'>
                                                {formatNumber(row.totalItems)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getGrowthVariant(row.growthRate)}
                                                    className='font-mono text-xs'
                                                >
                                                    {row.growthRate}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getTrendIcon(row.trend)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    
                    {!loading && growthData.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No growth data available for {selectedYear}
                            <Button 
                                variant="outline" 
                                className="ml-4"
                                onClick={refreshData}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default MemberGrowthDetails