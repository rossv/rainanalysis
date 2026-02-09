
import { CloudRain } from 'lucide-react';

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface LayoutProps {
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
}

export function Layout({ children, sidebarContent }: LayoutProps) {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <CloudRain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">RainCheck</h1>
                            <p className="text-xs text-slate-400 font-medium">Hydrology Analysis</p>
                        </div>
                    </div>
                    <Separator className="bg-slate-800" />
                </div>

                <ScrollArea className="flex-1 px-6">
                    {sidebarContent}
                </ScrollArea>

                <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                    v0.1.0 • Engineering Standards
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
                <ScrollArea className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">
                        {children}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}
