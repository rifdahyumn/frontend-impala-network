import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Download } from "lucide-react"
import { Chart as ChartJS, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js"
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register (
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler 
)

const Analytics = () => {
    const [selectedYear, setSelectedYear] = useState('2025')
    const [chartType, setChartType] = useState('line')

    const yearlyData  = {
        '2025': [
            { month: 'Jan', newMembers: 45, totalMembers: 1200 },
            { month: 'Feb', newMembers: 52, totalMembers: 1252 },
            { month: 'Mar', newMembers: 48, totalMembers: 1300 },
            { month: 'Apr', newMembers: 65, totalMembers: 1365 },
            { month: 'May', newMembers: 58, totalMembers: 1423 },
            { month: 'Jun', newMembers: 72, totalMembers: 1495 },
            { month: 'Jul', newMembers: 68, totalMembers: 1563 },
            { month: 'Aug', newMembers: 75, totalMembers: 1638 },
            { month: 'Sep', newMembers: 80, totalMembers: 1718 },
            { month: 'Oct', newMembers: 85, totalMembers: 1803 },
        ],
        '2024': [
            { month: 'Jan', newMembers: 35, totalMembers: 1000 },
            { month: 'Feb', newMembers: 42, totalMembers: 1042 },
            { month: 'Mar', newMembers: 38, totalMembers: 1080 },
            { month: 'Apr', newMembers: 55, totalMembers: 1135 },
            { month: 'May', newMembers: 48, totalMembers: 1183 },
            { month: 'Jun', newMembers: 62, totalMembers: 1245 },
            { month: 'Jul', newMembers: 58, totalMembers: 1303 },
            { month: 'Aug', newMembers: 65, totalMembers: 1368 },
            { month: 'Sep', newMembers: 70, totalMembers: 1438 },
            { month: 'Oct', newMembers: 75, totalMembers: 1513 },
            { month: 'Nov', newMembers: 68, totalMembers: 1581 },
            { month: 'Dec', newMembers: 72, totalMembers: 1653 },
        ]
    }

    const currentData = yearlyData[selectedYear] || yearlyData['2025'];

    const chartData = {
        labels: currentData.map(data => data.month),
        datasets: [
            {
                label: 'New Members',
                data: currentData.map(data => data.newMembers),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: chartType === 'area',
                tension: 0.4
            },
            {
                label: 'Total Members',
                data: currentData.map(data => data.totalMembers),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: chartType === 'area',
                tension: 0.4,
                yAxisID: 'y1'
            },
        ]
    }

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                grid: {
                    display: false,
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title : {
                    display: true,
                    text: 'New Members'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title : {
                    display: true,
                    text: 'Total Members'
                },
                grid: {
                    drawOnChartArea: false,
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true
            }
        },
        maintainAspectRatio: false
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales.x,
                stacked: false
            },
            y: {
                ...chartOptions.scales.y,
                stacked: false
            }
        }
    }

    const handleExport = () => {
        const chartElement = document.querySelector('canvas');
        if (chartElement) {
            const image = chartElement.toDataURL('image/png');
            const link = document.createElement('a')
            link.download = `member-growth-${selectedYear}.png`
            link.href = image;
            link.click()
        }
    }

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            options: chartType === 'bar' ? barOptions : chartOptions,
            height: 400
        }

        switch (chartType) {
            case 'line':
                return <Line {...commonProps} />;
            case 'bar':
                return <Bar {...commonProps} />
            case 'area':
                return <Line {...commonProps} />
            default:
                return <Line {...commonProps} />
        }
    }

    return (
        <div className="space-y-6 py-6">
            <Card>
                <CardContent>
                    <CardHeader className="p-6">
                        <CardTitle>Member Growth Analytics</CardTitle>
                        <div className="h-px bg-amber-400 mt-2" />
                    </CardHeader>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center ml-6 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-700">New Members</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-700">Total Members</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Select
                                value={selectedYear}
                                onValueChange={setSelectedYear}
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                    <SelectItem value="2022">2022</SelectItem>
                                    <SelectItem value="2021">2021</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={chartType}
                                onValueChange={setChartType}
                            >
                                <SelectTrigger className="w-36" >
                                    <SelectValue placeholder="Chart Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                    <SelectItem value="bar">Bar Chart</SelectItem>
                                    <SelectItem value="area">Area Chart</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="default"
                                className="flex items-center gap-2"
                                onClick={handleExport}
                            >
                                <Download className="w-4 h-4" />
                                Export Graphics
                            </Button>
                        </div>
                    </div>
                    <div>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Member Growth Trend - {selectedYear}</CardTitle>
                        </CardHeader>

                        <div className="h-80">
                            {renderChart()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Analytics