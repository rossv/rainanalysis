import { useState, useMemo } from 'react';
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
import { format } from 'date-fns';
import { Download, ChevronUp, ChevronDown, ChevronsUpDown, BarChart2 } from 'lucide-react';
import { returnPeriodToSeverity } from '@/utils/idf';

type SortKey = 'startDate' | 'duration' | 'totalDepth' | 'maxIntensity' | 'returnPeriod';
type SortDir = 'asc' | 'desc';

const SEVERITY_BADGE: Record<string, string> = {
    low:         'bg-slate-800 text-slate-400 border-slate-700',
    moderate:    'bg-sky-950 text-sky-400 border-sky-800',
    high:        'bg-yellow-950 text-yellow-400 border-yellow-800',
    significant: 'bg-orange-950 text-orange-400 border-orange-800',
    extreme:     'bg-red-950 text-red-400 border-red-800',
};

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
    if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 ml-1 text-slate-600 inline" />;
    return dir === 'asc'
        ? <ChevronUp className="w-3 h-3 ml-1 text-blue-400 inline" />
        : <ChevronDown className="w-3 h-3 ml-1 text-blue-400 inline" />;
}

export function EventsTable() {
    const { events, setSelectedEventId } = useStore();
    const [sortKey, setSortKey] = useState<SortKey>('startDate');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir(key === 'returnPeriod' || key === 'totalDepth' ? 'desc' : 'asc');
        }
    };

    const sorted = useMemo(() => {
        const copy = [...events];
        copy.sort((a, b) => {
            let av: number, bv: number;
            switch (sortKey) {
                case 'startDate':
                    av = a.startDate.getTime(); bv = b.startDate.getTime(); break;
                case 'duration':
                    av = a.endDate.getTime() - a.startDate.getTime();
                    bv = b.endDate.getTime() - b.startDate.getTime(); break;
                case 'totalDepth':
                    av = a.totalDepth; bv = b.totalDepth; break;
                case 'maxIntensity':
                    av = a.peakIntensities['1hr'] ?? 0; bv = b.peakIntensities['1hr'] ?? 0; break;
                case 'returnPeriod':
                    av = a.maxReturnPeriodYears; bv = b.maxReturnPeriodYears; break;
                default:
                    return 0;
            }
            return sortDir === 'asc' ? av - bv : bv - av;
        });
        return copy;
    }, [events, sortKey, sortDir]);

    const exportCSV = () => {
        const headers = ['Start Date', 'End Date', 'Duration (hr)', 'Total Depth (in)',
            'Peak 15-min (in)', 'Peak 1-hr (in)', 'Peak 2-hr (in)', 'Peak 6-hr (in)',
            'Peak 12-hr (in)', 'Peak 24-hr (in)', 'Return Period'];
        const rows = events.map(e => {
            const dur = ((e.endDate.getTime() - e.startDate.getTime()) / 3_600_000).toFixed(2);
            return [
                format(e.startDate, 'yyyy-MM-dd HH:mm'),
                format(e.endDate, 'yyyy-MM-dd HH:mm'),
                dur,
                e.totalDepth.toFixed(4),
                (e.peakIntensities['15min'] ?? '').toString(),
                (e.peakIntensities['1hr'] ?? '').toString(),
                (e.peakIntensities['2hr'] ?? '').toString(),
                (e.peakIntensities['6hr'] ?? '').toString(),
                (e.peakIntensities['12hr'] ?? '').toString(),
                (e.peakIntensities['24hr'] ?? '').toString(),
                e.maxReturnPeriod,
            ].join(',');
        });
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `storm_events_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (events.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardContent className="p-12 text-center">
                    <BarChart2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No storm events identified.</p>
                    <p className="text-slate-600 text-xs mt-1">Upload data or adjust the IETD/threshold settings.</p>
                </CardContent>
            </Card>
        );
    }

    const ThCell = ({ col, label }: { col: SortKey; label: string }) => (
        <TableHead
            className="text-slate-400 cursor-pointer select-none hover:text-slate-200 transition-colors whitespace-nowrap"
            onClick={() => handleSort(col)}
        >
            {label}
            <SortIcon col={col} sortKey={sortKey} dir={sortDir} />
        </TableHead>
    );

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">
                        Identified Events ({events.length})
                    </CardTitle>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md px-3 py-1.5 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow className="hover:bg-slate-900 border-slate-800">
                            <ThCell col="startDate" label="Date" />
                            <ThCell col="duration" label="Duration" />
                            <ThCell col="totalDepth" label="Total Depth" />
                            <ThCell col="maxIntensity" label="Peak 1-hr" />
                            <ThCell col="returnPeriod" label="Return Period" />
                            <TableHead className="text-slate-400 w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.map((event) => {
                            const durationHrs = (event.endDate.getTime() - event.startDate.getTime()) / 3_600_000;
                            const severity = returnPeriodToSeverity(event.maxReturnPeriodYears);
                            const peak1hr = event.peakIntensities['1hr'];
                            return (
                                <TableRow
                                    key={event.id}
                                    className="hover:bg-slate-800 border-slate-800 cursor-pointer group transition-colors"
                                    onClick={() => setSelectedEventId(event.id)}
                                >
                                    <TableCell className="font-medium text-slate-200 group-hover:text-white">
                                        {format(event.startDate, "MMM d, yyyy")}
                                        <span className="text-slate-500 text-xs ml-2 font-mono">
                                            {format(event.startDate, "HH:mm")}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-400 font-mono text-sm">
                                        {durationHrs < 1
                                            ? `${Math.round(durationHrs * 60)} min`
                                            : `${durationHrs.toFixed(1)} hr`}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-200 font-mono font-semibold">
                                        {event.totalDepth.toFixed(2)}"
                                    </TableCell>
                                    <TableCell className="text-right text-slate-400 font-mono text-sm">
                                        {peak1hr != null ? `${peak1hr.toFixed(3)}"` : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_BADGE[severity]}`}>
                                            {event.maxReturnPeriod}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600 group-hover:text-slate-400 text-xs pr-4">
                                        ›
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
