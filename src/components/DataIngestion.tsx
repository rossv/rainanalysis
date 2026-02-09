import React, { useCallback } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from 'lucide-react';
import { parseRainData } from '@/utils/rainfallParsing';
import { cn } from '@/lib/utils'; // Keep this imports
// import { parse } from 'date-fns'; // removed unused import

export function DataIngestion() {
    const { addRainData, rawPoints, clearData } = useStore();
    const [isParsing, setIsParsing] = React.useState(false);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);

        parseRainData(file)
            .then((points) => {
                addRainData(points);
                setIsParsing(false);
                e.target.value = '';
            })
            .catch((error) => {
                console.error("Parse Error", error);
                setIsParsing(false);
            });
    }, [addRainData]);

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                <div className="relative">
                    <input
                        type="file"
                        accept=".csv,.dat,.tsf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={isParsing}
                    />
                    <div className={cn(
                        "border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center transition-colors hover:border-blue-500 hover:bg-slate-800/50",
                        isParsing && "opacity-50 cursor-wait"
                    )}>
                        {isParsing ? (
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        ) : (
                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                        )}
                        <span className="text-sm font-medium text-slate-300">
                            {isParsing ? "Parsing..." : "Drop CSV or Click"}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">
                            Format: Timestamp, Value (in)
                        </span>
                    </div>
                </div>

                {rawPoints.length > 0 && (
                    <div className="bg-slate-950 rounded p-3 text-xs flex items-center justify-between border border-slate-800">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span>Loaded {rawPoints.length.toLocaleString()} points</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-500 hover:text-red-400" onClick={clearData}>
                            ×
                        </Button>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
