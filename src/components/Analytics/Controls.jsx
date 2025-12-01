import { Download, RefreshCw } from "lucide-react"
import { CHART_TYPES, DATA_TYPES, METRICS_CONFIG, YEARS } from "../../utils/constants"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export const Controls = ({
    selectedYear,
    onYearChange,
    chartType,
    onChartTypeChange,
    selectedDataType,
    onDataTypeChange,
    selectedMetric,
    loading,
    onExport,
    onRefreshAll
}) => {
    const currentMetric = METRICS_CONFIG[selectedMetric]
    const availableChartType = currentMetric?.chartTypes || ['line', 'bar', 'area']

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentMetric.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                        {selectedDataType === 'growth' ? currentMetric.datasetLabel : currentMetric.cumulativeLabel}
                    </span>
                </div>

                <Select
                    value={selectedDataType}
                    onValueChange={onDataTypeChange}
                    disabled={loading}
                >
                    <SelectTrigger className='w-36'>
                        <SelectValue placeholder='Data Type' />
                    </SelectTrigger>
                    <SelectContent>
                        {DATA_TYPES.map(({ value, label }) => (
                            <SelectItem key={value} value={value} >{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-4">
                <Select
                    value={selectedYear}
                    onValueChange={onYearChange}
                    disabled={loading}
                >
                    <SelectTrigger className='w-28'>
                        <SelectValue placeholder='Year' />
                    </SelectTrigger>
                    <SelectContent>
                        {YEARS.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={chartType}
                    onValueChange={onChartTypeChange}
                    disabled={loading || !availableChartType.includes(chartType)}
                >
                    <SelectTrigger className='w-32'>
                        <SelectValue placeholder='Chart Type' />
                    </SelectTrigger>
                    <SelectContent>
                        {CHART_TYPES
                            .filter(({ value }) => availableChartType.includes(value))
                            .map(({ value, label }) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>

                <Button
                    variant='default'
                    className='flex items-center gap-2'
                    onClick={onExport}
                    disabled={loading}
                    style={{ backgroundColor: currentMetric.color }}
                >
                    <Download className="w-4 h-4" />
                    Export
                </Button>

                <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                    onClick={onRefreshAll}
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
        </div>
    )
}