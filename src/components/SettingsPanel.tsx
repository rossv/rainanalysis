
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export function SettingsPanel() {
    const { settings, setSettings } = useStore();

    const handleIetdChange = (value: number[]) => {
        setSettings({ ietdHours: value[0] });
    };

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setSettings({ minRainfallThreshold: val });
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100 mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Analysis Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* IETD Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label htmlFor="ietd">Inter-Event Time (Hours)</Label>
                        <span className="text-sm font-mono text-blue-400">{settings.ietdHours} hr</span>
                    </div>
                    <Slider
                        id="ietd"
                        min={1}
                        max={24}
                        step={1}
                        value={[settings.ietdHours]}
                        onValueChange={handleIetdChange}
                        className="py-2"
                    />
                    <p className="text-xs text-slate-500">
                        Minimum dry period to separate storm events.
                    </p>
                </div>

                {/* Threshold Input */}
                <div className="space-y-2">
                    <Label htmlFor="threshold">Min Event Depth (in)</Label>
                    <Input
                        id="threshold"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.minRainfallThreshold}
                        onChange={handleThresholdChange}
                        className="bg-slate-950 border-slate-700 text-slate-100"
                    />
                    <p className="text-xs text-slate-500">
                        Events with less total rainfall will be ignored.
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}
