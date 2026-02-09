
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventsTable } from './EventsTable';
import { StormTimeline } from './StormTimeline';
import { useStore } from '@/store';

export function Dashboard() {
    const { events, rawPoints } = useStore();

    const totalRainfall = rawPoints.reduce((sum, p) => sum + p.value, 0);
    const eventCount = events.length;
    // logic to find max return period (placeholder logic for now as we don't have IDF yet)
    const maxReturnPeriod = events.length > 0 ? "N/A" : "-";

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rainfall</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRainfall.toFixed(2)}"</div>
                        <p className="text-xs text-slate-500">Across all events</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storm Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{eventCount}</div>
                        <p className="text-xs text-slate-500">Identified storms</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Max Return Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maxReturnPeriod}</div>
                        <p className="text-xs text-slate-500">Worst storm severity</p>
                    </CardContent>
                </Card>
            </div>

            <StormTimeline />

            <EventsTable />
        </div>
    );
}
