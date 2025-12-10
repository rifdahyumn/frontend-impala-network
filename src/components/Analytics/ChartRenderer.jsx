import { Bar, Line } from "react-chartjs-2"
import { getBarOptions, getChartOptions, prepareChartData } from "../../utils/chartConfig"
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

    if (!monthlyData || monthlyData.length === 0) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-700">No Data Available</h3>
                    <p className="text-gray-500 mt-2">No data found for the selected period.</p>
                </div>
            </div>
        )
    }

    const chartData = prepareChartData(monthlyData, metric, dataType, chartType)
    const baseOptions = getChartOptions(metric, dataType)
    const options = chartType === 'bar' ? getBarOptions(baseOptions) : baseOptions

    const commonProps = {
        data: chartData,
        options: options,
        height: 400
    }

    const renderChart = () => {
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

    return (
        <div className="h-full">
            {renderChart()}
        </div>
    )
}