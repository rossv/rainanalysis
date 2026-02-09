
import { useStore } from '@/store';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export function EventsTable() {
    const { events } = useStore();

    if (events.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardContent className="p-8 text-center text-slate-500 text-sm">
                    No storm events identified. Upload data or adjust settings.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Identified Events ({events.length})</CardTitle>
                    {/* Future: Export button */}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow className="hover:bg-slate-900 border-slate-800">
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Duration</TableHead>
                            <TableHead className="text-slate-400 text-right">Total Depth</TableHead>
                            <TableHead className="text-slate-400 text-right">Max Intensity (1hr)</TableHead>
                            <TableHead className="text-slate-400">Severity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event) => {
                            const durationHrs = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60);
                            return (
                                <TableRow key={event.id} className="hover:bg-slate-800 border-slate-800 group transition-colors">
                                    <TableCell className="font-medium text-slate-200">
                                        {format(event.startDate, "MMM d, yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell className="text-slate-400">
                                        {durationHrs.toFixed(1)} hr
                                    </TableCell>
                                    <TableCell className="text-right text-slate-300 font-mono">
                                        {event.totalDepth.toFixed(2)}"
                                    </TableCell>
                                    <TableCell className="text-right text-slate-300 font-mono">
                                        {event.peakIntensities['1hr']?.toFixed(2) ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-slate-700 text-slate-400">
                                            {event.maxReturnPeriod}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
