import { METRICS_CONFIG } from "../../utils/constants"

export const DataTable = ({ monthlyData, metric, dataType }) => {
    if (!monthlyData) return null

    const config = METRICS_CONFIG[metric]
    const dataKey = dataType === 'growth' ? config.dataKey : config.cumulativeKey

    return (
        <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4">Monthly Data Breakdown</h4>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border p-3 text-left">Month</th>
                            <th className="border p-3 text-left">
                                {dataType === 'growth' ? 'New' : 'Cumulative'}
                            </th>
                            {metric === 'revenue' && dataType === 'growth' && (
                                <th className="border p-3 text-left">Programs</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((data, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border p-3 font-medium">{data.month}</td>
                                <td className="border p-3">
                                    {metric === 'revenue' ? (
                                        `Rp ${data[dataKey].toLocaleString('id-ID')}`
                                    ) : (
                                        data[dataKey].toLocaleString('id-ID')
                                    )}
                                </td>
                                {metric === 'revenue' && dataType === 'growth' && (
                                    <td className="border p-3">{data.programsCount}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}