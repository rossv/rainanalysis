import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventsTable } from './EventsTable';
import { StormTimeline } from './StormTimeline';
import { useStore } from '@/store';
import { formatDistanceStrict } from 'date-fns';
import { CloudRain, BarChart2, TrendingUp, Droplets, Calendar, Activity } from 'lucide-react';

export function Dashboard() {
    const { events, rawPoints } = useStore();

    const stats = useMemo(() => {
        const totalRainfall = rawPoints.reduce((sum, p) => sum + p.value, 0);
        const eventCount = events.length;
        const averageEventDepth = eventCount > 0 ? totalRainfall / eventCount : 0;
        const largestEvent = eventCount > 0
            ? events.reduce((max, e) => e.totalDepth > max.totalDepth ? e : max, events[0])
            : null;
        const largestEventDepth = largestEvent?.totalDepth ?? 0;

        // Most severe event by return period
        const mostSevere = eventCount > 0
            ? events.reduce((max, e) => e.maxReturnPeriodYears > max.maxReturnPeriodYears ? e : max, events[0])
            : null;

        const dataSpan = rawPoints.length > 1
            ? formatDistanceStrict(rawPoints[0].timestamp, rawPoints[rawPoints.length - 1].timestamp)
            : null;

        // Annual maximum series — highest event per calendar year
        const byYear = new Map<number, number>();
        events.forEach(e => {
            const yr = e.startDate.getFullYear();
            byYear.set(yr, Math.max(byYear.get(yr) ?? 0, e.totalDepth));
        });
        const annualMaxValues = Array.from(byYear.values());
        const medianAnnualMax = annualMaxValues.length > 0
            ? annualMaxValues.sort((a, b) => a - b)[Math.floor(annualMaxValues.length / 2)]
            : null;

        return {
            totalRainfall,
            eventCount,
            averageEventDepth,
            largestEventDepth,
            mostSevere,
            dataSpan,
            medianAnnualMax,
            yearCount: byYear.size,
        };
    }, [events, rawPoints]);

    const hasData = rawPoints.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Analysis Dashboard</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    {hasData
                        ? `${rawPoints.length.toLocaleString()} data points · ${stats.dataSpan ?? ''}`
                        : 'Upload rainfall data to begin analysis'}
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <MetricCard
                    label="Total Rainfall"
                    value={hasData ? `${stats.totalRainfall.toFixed(2)}"` : '—'}
                    detail={stats.dataSpan ? `Over ${stats.dataSpan}` : 'Across all data'}
                    icon={<CloudRain className="w-4 h-4" />}
                    active={hasData}
                    span={2}
                />
                <MetricCard
                    label="Storm Events"
                    value={String(stats.eventCount)}
                    detail={stats.yearCount > 0 ? `${stats.yearCount} calendar year${stats.yearCount !== 1 ? 's' : ''}` : 'With current settings'}
                    icon={<BarChart2 className="w-4 h-4" />}
                    active={hasData}
                    span={1}
                />
                <MetricCard
                    label="Largest Event"
                    value={hasData ? `${stats.largestEventDepth.toFixed(2)}"` : '—'}
                    detail="Maximum total depth"
                    icon={<Droplets className="w-4 h-4" />}
                    active={hasData}
                    span={1}
                />
                <MetricCard
                    label="Avg Event Depth"
                    value={hasData ? `${stats.averageEventDepth.toFixed(2)}"` : '—'}
                    detail="Mean per storm"
                    icon={<Activity className="w-4 h-4" />}
                    active={hasData}
                    span={1}
                />
                <MetricCard
                    label="Most Severe"
                    value={stats.mostSevere?.maxReturnPeriod ?? '—'}
                    detail={stats.mostSevere ? `${stats.mostSevere.totalDepth.toFixed(2)}" depth` : 'No events yet'}
                    icon={<TrendingUp className="w-4 h-4" />}
                    active={hasData && stats.mostSevere !== null}
                    highlight={stats.mostSevere?.maxReturnPeriodYears !== undefined && stats.mostSevere.maxReturnPeriodYears >= 25}
                    span={1}
                />
            </div>

            {/* Annual Max Note */}
            {stats.yearCount >= 2 && stats.medianAnnualMax !== null && (
                <div className="flex items-center gap-3 bg-blue-950/30 border border-blue-900/50 rounded-lg px-4 py-3 text-sm text-blue-300">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                        Median annual maximum storm depth: <strong>{stats.medianAnnualMax.toFixed(2)}"</strong>
                        {' '}across <strong>{stats.yearCount} years</strong> of record.
                    </span>
                </div>
            )}

            <StormTimeline />
            <EventsTable />
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: string;
    detail: string;
    icon: React.ReactNode;
    active?: boolean;
    highlight?: boolean;
    span?: number;
}

function MetricCard({ label, value, detail, icon, active = true, highlight = false }: MetricCardProps) {
    return (
        <Card className={`border transition-colors ${
            highlight
                ? 'bg-orange-950/20 border-orange-900/60'
                : 'bg-slate-900 border-slate-800'
        } text-slate-100`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</CardTitle>
                <div className={active ? (highlight ? 'text-orange-400' : 'text-blue-400') : 'text-slate-600'}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className={`text-2xl font-bold font-mono ${active ? 'text-slate-100' : 'text-slate-600'}`}>
                    {value}
                </div>
                <p className="text-xs text-slate-500 mt-1">{detail}</p>
            </CardContent>
        </Card>
    );
}
