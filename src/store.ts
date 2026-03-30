import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, RainDataPoint, StormEvent } from './types';
import { appendData, segmentEvents } from './utils/logic';
import { IDF_REGIONS } from './utils/idf';

interface AppState {
    settings: AppSettings;
    rawPoints: RainDataPoint[];
    events: StormEvent[];
    selectedEventId: string | null;

    setSettings: (settings: Partial<AppSettings>) => void;
    addRainData: (newPoints: RainDataPoint[]) => void;
    clearData: () => void;
    setSelectedEventId: (id: string | null) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    ietdHours: 6,
    minRainfallThreshold: 0.1,
    idfRegion: 'midwest',
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            settings: DEFAULT_SETTINGS,
            rawPoints: [],
            events: [],
            selectedEventId: null,

            setSettings: (newSettings) => {
                const currentSettings = get().settings;
                const updatedSettings = { ...currentSettings, ...newSettings };

                const needsRecalc =
                    updatedSettings.ietdHours !== currentSettings.ietdHours ||
                    updatedSettings.minRainfallThreshold !== currentSettings.minRainfallThreshold ||
                    updatedSettings.idfRegion !== currentSettings.idfRegion;

                set({ settings: updatedSettings });

                if (needsRecalc) {
                    const { rawPoints } = get();
                    const idfRegion = IDF_REGIONS[updatedSettings.idfRegion];
                    const events = segmentEvents(
                        rawPoints,
                        updatedSettings.ietdHours,
                        updatedSettings.minRainfallThreshold,
                        idfRegion
                    );
                    set({ events });
                }
            },

            addRainData: (newPoints) => {
                const { rawPoints, settings } = get();
                const updatedPoints = appendData(rawPoints, newPoints);
                const idfRegion = IDF_REGIONS[settings.idfRegion];
                const events = segmentEvents(
                    updatedPoints,
                    settings.ietdHours,
                    settings.minRainfallThreshold,
                    idfRegion
                );
                set({ rawPoints: updatedPoints, events });
            },

            clearData: () => {
                set({ rawPoints: [], events: [], selectedEventId: null });
            },

            setSelectedEventId: (id) => {
                set({ selectedEventId: id });
            },
        }),
        {
            name: 'raincheck-storage',
            // Only persist settings — raw data is not persisted to avoid stale state
            partialize: (state) => ({ settings: state.settings }),
        }
    )
);
