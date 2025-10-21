import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

const MemberGrowthDetails = () => {
    const growthData = [
        { month: 'Oct 2024', newMembers: '+15', totalMembers: 900, growthRate: '1,69%', trend: 'up' },
        { month: 'Sep 2024', newMembers: '+23', totalMembers: 885, growthRate: '2,67%', trend: 'up' },
        { month: 'Aug 2024', newMembers: '-18', totalMembers: 862, growthRate: '-2,05%', trend: 'down' },
        { month: 'Jul 2024', newMembers: '+10', totalMembers: 880, growthRate: '1,15%', trend: 'up' },
        { month: 'Jun 2024', newMembers: '+5', totalMembers: 870, growthRate: '0,58%', trend: 'up' },
        { month: 'May 2024', newMembers: '+37', totalMembers: 865, growthRate: '4,47%', trend: 'up' },
        { month: 'Apr 2024', newMembers: '+8', totalMembers: 828, growthRate: '0,98%', trend: 'up' },
        { month: 'Mar 2024', newMembers: '+2', totalMembers: 820, growthRate: '0,24%', trend: 'up' },
        { month: 'Feb 2024', newMembers: '+18', totalMembers: 818, growthRate: '2,25%', trend: 'up' },
        { month: 'Jan 2024', newMembers: '-', totalMembers: 800, growthRate: '-', trend: '-' },
    ]

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />
            default:
                return <Minus className="h-4 w-4 text-gray-500" />
        }
    };

    const getGrowthVariant = (growthRate) => {
        if (growthRate === '-') return 'secondary'
        if (growthRate.startsWith('-')) return 'destructive'
        return 'default';
    }

    const getNewMembersVariant = (newMembers) => {
        if (newMembers === '-') return 'secondary';
        if (newMembers.startsWith('-')) return 'destructive';
        return 'default';
    }

    return (
        <div className="space-y-6 py-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-amber-600" />
                        </div>
                        <p>Member Growth Details</p>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border border-gray-200 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-amber-50/50 hover:bg-amber-50">
                                    <TableHead>Month</TableHead>
                                    <TableHead>New Members</TableHead>
                                    <TableHead>Total Members</TableHead>
                                    <TableHead>Growth Rate (%)</TableHead>
                                    <TableHead>Trend</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {growthData.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-amber-50/30 transition-colors"
                                    >
                                        <TableCell className="font-medium text-gray-900">{row.month}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getNewMembersVariant(row.newMembers)}
                                                className="font-mono text-xs"
                                            >
                                                {row.newMembers}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-700">
                                            {row.totalMembers.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getGrowthVariant(row.growthRate)}
                                                className="font-mono text-xs"
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
                </CardContent>
            </Card>
        </div>
    )
}

export default MemberGrowthDetails