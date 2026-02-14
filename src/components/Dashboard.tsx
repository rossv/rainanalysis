import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventsTable } from './EventsTable';
import { StormTimeline } from './StormTimeline';
import { useStore } from '@/store';
import { formatDistanceStrict } from 'date-fns';

export function Dashboard() {
  const { events, rawPoints } = useStore();

  const totalRainfall = rawPoints.reduce((sum, p) => sum + p.value, 0);
  const eventCount = events.length;
  const averageEventDepth = eventCount > 0 ? totalRainfall / eventCount : 0;
  const largestEventDepth = eventCount > 0 ? Math.max(...events.map((event) => event.totalDepth)) : 0;

  const dataSpan =
    rawPoints.length > 1
      ? formatDistanceStrict(rawPoints[0].timestamp, rawPoints[rawPoints.length - 1].timestamp)
      : '—';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Rainfall"
          value={`${totalRainfall.toFixed(2)}"`}
          detail="Across all loaded data"
        />
        <MetricCard label="Storm Events" value={String(eventCount)} detail="Identified with current settings" />
        <MetricCard
          label="Largest Event"
          value={`${largestEventDepth.toFixed(2)}"`}
          detail="Maximum depth in one event"
        />
        <MetricCard
          label="Avg Event Depth"
          value={`${averageEventDepth.toFixed(2)}"`}
          detail={rawPoints.length > 1 ? `Data span: ${dataSpan}` : 'Load data to calculate'}
        />
      </div>

      <StormTimeline />

      <EventsTable />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
}

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}
