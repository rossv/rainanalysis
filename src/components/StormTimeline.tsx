import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export function StormTimeline() {
    const { rawPoints } = useStore();

    // Downsample or aggregate if too many points? 
    // For now, raw points. 
    // Recharts might struggle with thousands of points. 
    // But let's assume reasonable event data for now.

    const data = React.useMemo(() => {
        return rawPoints.map(p => ({
            ...p,
            dateStr: format(p.timestamp, 'yyyy-MM-dd HH:mm'),
        }));
    }, [rawPoints]);

    if (rawPoints.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-800 text-slate-100 min-h-[400px]">
                <CardHeader>
                    <CardTitle>Storm Timeline</CardTitle>
                    <CardDescription className="text-slate-400">Historical rainfall analysis</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-slate-500">
                    Upload rainfall data to view timeline.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100 min-h-[400px]">
            <CardHeader>
                <CardTitle>Storm Timeline</CardTitle>
                <CardDescription className="text-slate-400">
                    {rawPoints.length} data points loaded
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="dateStr"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={50}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}"`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                            itemStyle={{ color: '#60a5fa' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rainfall (in)" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
