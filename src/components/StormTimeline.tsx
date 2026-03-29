import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { format } from 'date-fns';
import { returnPeriodToSeverity } from '@/utils/idf';

const SEVERITY_COLORS: Record<string, string> = {
    low:         '#475569',
    moderate:    '#38bdf8',
    high:        '#facc15',
    significant: '#fb923c',
    extreme:     '#f87171',
};

interface ChartPoint {
    dateStr: string;
    timestamp: number;
    value: number;
    eventId: string | null;
    severity: string;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs shadow-xl">
            <p className="text-slate-300 font-semibold mb-1">{format(d.timestamp, 'MMM d, yyyy HH:mm')}</p>
            <p className="text-blue-300 font-mono">{d.value.toFixed(3)}" rainfall</p>
            {d.eventId && (
                <p className="text-slate-500 mt-1">Part of a storm event</p>
            )}
        </div>
    );
}

// Downsample large datasets for chart performance
function downsample(points: ChartPoint[], maxPoints: number): ChartPoint[] {
    if (points.length <= maxPoints) return points;
    const step = points.length / maxPoints;
    const result: ChartPoint[] = [];
    for (let i = 0; i < maxPoints; i++) {
        const start = Math.floor(i * step);
        const end = Math.min(Math.floor((i + 1) * step), points.length);
        // Aggregate: sum values in bucket, take last timestamp for display
        const bucket = points.slice(start, end);
        const sumValue = bucket.reduce((s, p) => s + p.value, 0);
        const last = bucket[bucket.length - 1];
        const hasEvent = bucket.some(p => p.eventId !== null);
        result.push({
            ...last,
            value: sumValue,
            eventId: hasEvent ? last.eventId : null,
            color: hasEvent ? last.color : SEVERITY_COLORS.low,
        });
    }
    return result;
}

export function StormTimeline() {
    const { rawPoints, events, setSelectedEventId } = useStore();

    // Build a lookup: timestamp -> event info
    const pointEventMap = React.useMemo(() => {
        const map = new Map<number, { id: string; severity: string }>();
        events.forEach(event => {
            const severity = returnPeriodToSeverity(event.maxReturnPeriodYears);
            rawPoints
                .filter(p => p.timestamp >= event.startDate.getTime() && p.timestamp <= event.endDate.getTime())
                .forEach(p => {
                    const existing = map.get(p.timestamp);
                    // Keep highest severity
                    if (!existing) {
                        map.set(p.timestamp, { id: event.id, severity });
                    }
                });
        });
        return map;
    }, [rawPoints, events]);

    const data = React.useMemo((): ChartPoint[] => {
        const raw = rawPoints.map(p => {
            const eventInfo = pointEventMap.get(p.timestamp);
            const severity = eventInfo?.severity ?? 'low';
            return {
                dateStr: format(p.timestamp, 'MM/dd HH:mm'),
                timestamp: p.timestamp,
                value: p.value,
                eventId: eventInfo?.id ?? null,
                severity,
                color: eventInfo ? SEVERITY_COLORS[severity] : SEVERITY_COLORS.low,
            };
        });
        return downsample(raw, 800);
    }, [rawPoints, pointEventMap]);

    // Vertical reference lines at event starts
    const eventStartLines = React.useMemo(() => {
        if (data.length === 0 || events.length === 0) return [];
        // Only show lines for events that fall within the downsampled range
        return events.slice(0, 50).map(e => ({
            x: format(e.startDate, 'MM/dd HH:mm'),
            id: e.id,
        }));
    }, [events, data]);

    if (rawPoints.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-800 text-slate-100 min-h-[340px]">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Rainfall Timeline</CardTitle>
                    <CardDescription className="text-slate-400 text-sm">Historical rainfall visualization</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[240px] text-slate-600 text-sm">
                    Upload rainfall data to view the timeline.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">Rainfall Timeline</CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-0.5">
                            {rawPoints.length.toLocaleString()} data points
                            {events.length > 0 && ` · ${events.length} storm event${events.length !== 1 ? 's' : ''} identified`}
                        </CardDescription>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        {Object.entries(SEVERITY_COLORS).map(([key, color]) => (
                            <span key={key} className="flex items-center gap-1.5 capitalize">
                                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
                                {key}
                            </span>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-[300px] w-full px-2 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} onClick={(e: Record<string, unknown>) => {
                        const ap = e?.activePayload as Array<{ payload: ChartPoint }> | undefined;
                        const payload = ap?.[0]?.payload;
                        if (payload?.eventId) setSelectedEventId(payload.eventId);
                    }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="dateStr"
                            stroke="#334155"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={60}
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis
                            stroke="#334155"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}"`}
                            tick={{ fill: '#64748b' }}
                            width={38}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {eventStartLines.map(line => (
                            <ReferenceLine
                                key={line.id}
                                x={line.x}
                                stroke="#334155"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                        ))}
                        <Bar
                            dataKey="value"
                            radius={[2, 2, 0, 0]}
                            maxBarSize={12}
                            cursor="pointer"
                            name="Rainfall (in)"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
