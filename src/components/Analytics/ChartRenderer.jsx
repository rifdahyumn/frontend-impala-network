import { Bar, Line, Pie } from "react-chartjs-2"
import { getBarOptions, getChartOptions, getPieChartOptions, prepareChartData, preparePieChartData } from "../../utils/chartConfig"
import { Loader2 } from "lucide-react"

export const ChartRenderer = ({
    monthlyData, 
    metric, 
    dataType, 
    chartType, 
    loading 
}) => {
    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
                    <p className="mt-2 text-gray-600">Loading chart data...</p>
                </div>
            </div>
        )
    }

    if (metric === 'revenue' && chartType === 'pie') {
        const pieData = preparePieChartData(monthlyData, metric)
        if (!pieData) return null

        return <Pie data={pieData} options={getPieChartOptions} height={400} />
    }

    const chartData = prepareChartData(monthlyData, metric, dataType, chartType)
    const baseOptions = getChartOptions(metric, dataType)
    const options = chartType === 'bar' ? getBarOptions(baseOptions) : baseOptions

    const commonProps = {
        data: chartData,
        options,
        height: 400
    }

    switch (chartType) {
        case 'line':
            return <Line {...commonProps} />
        case 'bar':
            return <Bar {...commonProps} />
        case 'area':
            return <Line {...commonProps} />
        default:
            return <Line {...commonProps} />
    }
}