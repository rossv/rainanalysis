import { create } from 'zustand';
import type { AppSettings, RainDataPoint, StormEvent } from './types';
import { appendData, segmentEvents } from './utils/logic';

interface AppState {
    settings: AppSettings;
    rawPoints: RainDataPoint[];
    events: StormEvent[];

    setSettings: (settings: Partial<AppSettings>) => void;
    addRainData: (newPoints: RainDataPoint[]) => void;
    clearData: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    ietdHours: 6,
    minRainfallThreshold: 0.1,
    proxyUrl: '',
};

export const useStore = create<AppState>((set, get) => ({
    settings: DEFAULT_SETTINGS,
    rawPoints: [],
    events: [],

    setSettings: (newSettings) => {
        const currentSettings = get().settings;
        const updatedSettings = { ...currentSettings, ...newSettings };

        const needsRecalc =
            updatedSettings.ietdHours !== currentSettings.ietdHours ||
            updatedSettings.minRainfallThreshold !== currentSettings.minRainfallThreshold;

        set({ settings: updatedSettings });

        if (needsRecalc) {
            const { rawPoints } = get();
            const events = segmentEvents(rawPoints, updatedSettings.ietdHours, updatedSettings.minRainfallThreshold);
            set({ events });
        }
    },

    addRainData: (newPoints) => {
        const { rawPoints, settings } = get();
        const updatedPoints = appendData(rawPoints, newPoints);
        const events = segmentEvents(updatedPoints, settings.ietdHours, settings.minRainfallThreshold);

        set({ rawPoints: updatedPoints, events });
    },

    clearData: () => {
        set({ rawPoints: [], events: [] });
    }
}));
