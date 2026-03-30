import React from 'react';
import { useStore } from '@/store';
import { format } from 'date-fns';
import { X, Clock, Droplets, Zap, TrendingUp } from 'lucide-react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { returnPeriodToSeverity } from '@/utils/idf';

const SEVERITY_COLORS: Record<string, string> = {
    low:         'text-slate-400',
    moderate:    'text-sky-400',
    high:        'text-yellow-400',
    significant: 'text-orange-400',
    extreme:     'text-red-400',
};

const SEVERITY_BG: Record<string, string> = {
    low:         'bg-slate-800 border-slate-700',
    moderate:    'bg-sky-950 border-sky-800',
    high:        'bg-yellow-950 border-yellow-800',
    significant: 'bg-orange-950 border-orange-800',
    extreme:     'bg-red-950 border-red-800',
};

interface StatPillProps {
    label: string;
    value: string;
    icon: React.ReactNode;
}

function StatPill({ label, value, icon }: StatPillProps) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 flex items-center gap-3 min-w-[140px]">
            <div className="text-blue-400">{icon}</div>
            <div>
                <div className="text-xs text-slate-400">{label}</div>
                <div className="text-sm font-semibold text-slate-100 font-mono">{value}</div>
            </div>
        </div>
    );
}

export function EventHyetograph() {
    const { events, rawPoints, selectedEventId, setSelectedEventId } = useStore();

    const event = events.find(e => e.id === selectedEventId);

    if (!event) return null;

    const durationHrs = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60);
    const severity = returnPeriodToSeverity(event.maxReturnPeriodYears);

    // Extract raw points for this event window (with a small buffer)
    const bufferMs = 15 * 60 * 1000;
    const eventPoints = rawPoints
        .filter(
            p =>
                p.timestamp >= event.startDate.getTime() - bufferMs &&
                p.timestamp <= event.endDate.getTime() + bufferMs
        )
        .sort((a, b) => a.timestamp - b.timestamp);

    // Build chart data with cumulative depth
    let cumulative = 0;
    const chartData = eventPoints.map(p => {
        cumulative += p.value;
        return {
            time: format(p.timestamp, 'HH:mm'),
            timestamp: p.timestamp,
            depth: parseFloat(p.value.toFixed(3)),
            cumulative: parseFloat(cumulative.toFixed(3)),
        };
    });

    // Peak 1-hour intensity in in/hr
    const peak1hr = event.peakIntensities['1hr'] ?? 0;

    // Duration breakdown table
    const durationRows = [
        { label: '15-min', key: '15min', hrs: 0.25 },
        { label: '1-hour', key: '1hr', hrs: 1 },
        { label: '2-hour', key: '2hr', hrs: 2 },
        { label: '6-hour', key: '6hr', hrs: 6 },
        { label: '12-hour', key: '12hr', hrs: 12 },
        { label: '24-hour', key: '24hr', hrs: 24 },
    ].filter(d => d.hrs <= Math.max(1, durationHrs * 1.5));

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedEventId(null); }}
        >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className={`p-6 border-b border-slate-800 rounded-t-2xl`}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-slate-100">
                                    Storm Event Analysis
                                </h2>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SEVERITY_BG[severity]} ${SEVERITY_COLORS[severity]}`}>
                                    {event.maxReturnPeriod}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">
                                {format(event.startDate, "MMMM d, yyyy HH:mm")} — {format(event.endDate, "HH:mm, MMM d")}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedEventId(null)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="px-6 pt-5 pb-4 flex flex-wrap gap-3">
                    <StatPill
                        label="Total Depth"
                        value={`${event.totalDepth.toFixed(2)}"`}
                        icon={<Droplets className="w-4 h-4" />}
                    />
                    <StatPill
                        label="Duration"
                        value={`${durationHrs.toFixed(1)} hr`}
                        icon={<Clock className="w-4 h-4" />}
                    />
                    <StatPill
                        label="Peak 1-hr Intensity"
                        value={`${peak1hr.toFixed(2)}" / hr`}
                        icon={<Zap className="w-4 h-4" />}
                    />
                    <StatPill
                        label="Avg Intensity"
                        value={`${durationHrs > 0 ? (event.totalDepth / durationHrs).toFixed(3) : '—'}" / hr`}
                        icon={<TrendingUp className="w-4 h-4" />}
                    />
                </div>

                {/* Hyetograph Chart */}
                <div className="px-6 pb-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Hyetograph &amp; Cumulative Depth</p>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#475569"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    yAxisId="depth"
                                    stroke="#475569"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `${v}"`}
                                    width={40}
                                />
                                <YAxis
                                    yAxisId="cumul"
                                    orientation="right"
                                    stroke="#475569"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `${v}"`}
                                    width={42}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                    itemStyle={{ color: '#94a3b8' }}
                                    labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}
                                    formatter={(value: number | string | undefined) => [
                                        typeof value === 'number' ? `${value.toFixed(3)}"` : `${value}`,
                                    ]}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
                                    formatter={(value) => value === 'depth' ? 'Incremental Depth' : 'Cumulative Depth'}
                                />
                                <Bar
                                    yAxisId="depth"
                                    dataKey="depth"
                                    fill="#3b82f6"
                                    radius={[3, 3, 0, 0]}
                                    maxBarSize={20}
                                />
                                <Line
                                    yAxisId="cumul"
                                    type="monotone"
                                    dataKey="cumulative"
                                    stroke="#34d399"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#34d399' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* IDF Duration Table */}
                {Object.keys(event.recurrenceIntervals).length > 0 && (
                    <div className="px-6 pb-6 pt-2">
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Peak Intensity by Duration</p>
                        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Duration</th>
                                        <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Peak Depth</th>
                                        <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Avg Intensity</th>
                                        <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Return Period</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {durationRows.map(({ label, key, hrs }) => {
                                        const depth = event.peakIntensities[key] ?? 0;
                                        const intensity = depth / hrs;
                                        const rp = event.recurrenceIntervals[key];
                                        if (!depth) return null;
                                        const rpSeverity = rp ? returnPeriodToSeverity(
                                            rp.includes('>') ? 200 :
                                            rp.includes('<') ? 1 :
                                            parseInt(rp)
                                        ) : 'low';
                                        return (
                                            <tr key={key} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-900/50">
                                                <td className="px-4 py-2.5 text-slate-300 font-medium">{label}</td>
                                                <td className="px-4 py-2.5 text-right text-slate-300 font-mono">{depth.toFixed(3)}"</td>
                                                <td className="px-4 py-2.5 text-right text-slate-400 font-mono">{intensity.toFixed(3)}" /hr</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <span className={`text-xs font-semibold ${SEVERITY_COLORS[rpSeverity]}`}>
                                                        {rp ?? '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
