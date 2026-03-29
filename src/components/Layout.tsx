import React from 'react';
import { CloudRain } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LayoutProps {
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
}

export function Layout({ children, sidebarContent }: LayoutProps) {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col flex-shrink-0">
                {/* Brand */}
                <div className="p-5 pb-4">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg shadow-blue-900/40">
                            <CloudRain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white leading-none">RainCheck</h1>
                            <p className="text-xs text-slate-400 mt-0.5">H&amp;H Storm Analysis</p>
                        </div>
                    </div>
                    <Separator className="bg-slate-800" />
                </div>

                <ScrollArea className="flex-1 px-5 pb-4">
                    {sidebarContent}
                </ScrollArea>

                <div className="p-4 border-t border-slate-800/80 text-xs text-slate-600 text-center">
                    v0.2.0 · IDF curves: NOAA Atlas 14 (approximate)
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
                <ScrollArea className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 pb-20">
                        {children}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}
