import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { IDF_REGIONS, type IDFRegionKey } from '@/utils/idf';

const REGION_OPTIONS = Object.entries(IDF_REGIONS).map(([key, region]) => ({
    value: key as IDFRegionKey,
    label: region.label,
    description: region.description,
}));

export function SettingsPanel() {
    const { settings, setSettings } = useStore();

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100 mb-5">
            <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Analysis Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

                {/* IETD Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="ietd" className="text-sm text-slate-300">Inter-Event Time (IETD)</Label>
                        <span className="text-sm font-mono font-semibold text-blue-400">{settings.ietdHours} hr</span>
                    </div>
                    <Slider
                        id="ietd"
                        min={1}
                        max={24}
                        step={1}
                        value={[settings.ietdHours]}
                        onValueChange={(value) => setSettings({ ietdHours: value[0] })}
                        className="py-1"
                    />
                    <p className="text-xs text-slate-600">
                        Dry period required to separate storm events.
                    </p>
                </div>

                {/* Threshold Input */}
                <div className="space-y-2">
                    <Label htmlFor="threshold" className="text-sm text-slate-300">Min Event Depth (inches)</Label>
                    <Input
                        id="threshold"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.minRainfallThreshold}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) setSettings({ minRainfallThreshold: val });
                        }}
                        className="bg-slate-950 border-slate-700 text-slate-100 font-mono h-8 text-sm"
                    />
                    <p className="text-xs text-slate-600">
                        Events below this threshold are excluded.
                    </p>
                </div>

                {/* IDF Region */}
                <div className="space-y-2">
                    <Label htmlFor="idf-region" className="text-sm text-slate-300">IDF Region</Label>
                    <select
                        id="idf-region"
                        value={settings.idfRegion}
                        onChange={(e) => setSettings({ idfRegion: e.target.value as IDFRegionKey })}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                        {REGION_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-600">
                        {IDF_REGIONS[settings.idfRegion]?.description}
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}
