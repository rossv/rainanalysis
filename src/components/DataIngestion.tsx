import React, { useCallback } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, AlertTriangle, FlaskConical, X } from 'lucide-react';
import { parseRainData, parseRainDataText } from '@/utils/rainfallParsing';
import { cn } from '@/lib/utils';

// Example datasets bundled with the app (loaded via fetch from /examples/)
const EXAMPLE_FILES = [
    { name: 'Rain - S-24_M-46A.csv', label: 'Station S-24 (CSV)' },
    { name: 'Rain - A-22_M-14.csv', label: 'Station A-22 (CSV)' },
    { name: 'A-22_M-43_Rain.dat', label: 'Station A-22 (DAT)' },
    { name: 'Rain - M-47_M-19.tsf', label: 'Station M-47 (TSF)' },
];

interface LoadedSource {
    name: string;
    count: number;
}

export function DataIngestion() {
    const { addRainData, rawPoints, clearData } = useStore();
    const [isParsing, setIsParsing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [loadedSources, setLoadedSources] = React.useState<LoadedSource[]>([]);

    const handleFiles = useCallback(
        async (files: FileList | File[]) => {
            const fileArr = Array.from(files);
            if (!fileArr.length) return;

            setError(null);
            setIsParsing(true);

            let totalAdded = 0;
            const newSources: LoadedSource[] = [];

            for (const file of fileArr) {
                try {
                    const points = await parseRainData(file);
                    if (points.length === 0) {
                        setError(`No valid rows detected in "${file.name}".`);
                    } else {
                        addRainData(points);
                        totalAdded += points.length;
                        newSources.push({ name: file.name, count: points.length });
                    }
                } catch {
                    setError(`Could not parse "${file.name}". Check format and try again.`);
                }
            }

            if (totalAdded > 0) {
                setLoadedSources(prev => [...prev, ...newSources]);
            }

            setIsParsing(false);
        },
        [addRainData]
    );

    const handleInputChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                await handleFiles(e.target.files);
                e.target.value = '';
            }
        },
        [handleFiles]
    );

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (e.dataTransfer.files) {
                await handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles]
    );

    const loadExample = useCallback(async () => {
        setError(null);
        setIsParsing(true);

        // Load two example files to show multi-source capability
        const toLoad = EXAMPLE_FILES.slice(0, 2);
        const newSources: LoadedSource[] = [];

        for (const example of toLoad) {
            try {
                const base = import.meta.env.BASE_URL ?? '/';
                const url = `${base}examples/${example.name}`;
                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const text = await resp.text();
                const ext = example.name.split('.').pop()?.toLowerCase() ?? 'csv';
                const points = parseRainDataText(text, example.label, ext);
                if (points.length > 0) {
                    addRainData(points);
                    newSources.push({ name: example.label, count: points.length });
                }
            } catch {
                setError(`Could not load example "${example.label}".`);
            }
        }

        if (newSources.length > 0) {
            setLoadedSources(prev => [...prev, ...newSources]);
        }
        setIsParsing(false);
    }, [addRainData]);

    const handleClear = useCallback(() => {
        clearData();
        setLoadedSources([]);
        setError(null);
    }, [clearData]);

    return (
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">

                {/* Drop Zone */}
                <div className="relative">
                    <input
                        type="file"
                        accept=".csv,.dat,.tsf"
                        multiple
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={isParsing}
                    />
                    <div
                        className={cn(
                            'border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-all',
                            'border-slate-700 hover:border-blue-500 hover:bg-slate-800/40',
                            isParsing && 'opacity-50 cursor-wait'
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {isParsing ? (
                            <Loader2 className="w-7 h-7 text-blue-500 animate-spin mb-2" />
                        ) : (
                            <Upload className="w-7 h-7 text-slate-500 mb-2" />
                        )}
                        <span className="text-sm font-medium text-slate-300">
                            {isParsing ? 'Parsing...' : 'Drop files or click to upload'}
                        </span>
                        <span className="text-xs text-slate-600 mt-1">CSV · DAT · TSF · Multiple files OK</span>
                    </div>
                </div>

                {/* Load Example */}
                {rawPoints.length === 0 && !isParsing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700"
                        onClick={loadExample}
                    >
                        <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                        Load Example Data
                    </Button>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2 text-xs text-red-300 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loaded Sources */}
                {loadedSources.length > 0 && (
                    <div className="space-y-1.5">
                        {loadedSources.map((src, i) => (
                            <div key={i} className="bg-slate-950 rounded-lg px-3 py-2 text-xs flex items-center gap-2 border border-slate-800">
                                <FileText className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                <span className="text-slate-300 flex-1 truncate">{src.name}</span>
                                <span className="text-slate-500 font-mono flex-shrink-0">{src.count.toLocaleString()} pts</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-slate-500 font-mono">
                                {rawPoints.length.toLocaleString()} total points
                            </span>
                            <button
                                className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors"
                                onClick={handleClear}
                            >
                                <X className="w-3 h-3" /> Clear all
                            </button>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
