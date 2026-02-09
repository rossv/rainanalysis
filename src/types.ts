/**
 * Core Types for RainCheck Application
 */

// 1. Analysis Settings
export interface AppSettings {
    ietdHours: number; // e.g., 6 (hours of dry time to separate events)
    minRainfallThreshold: number; // e.g., 0.1 inches (ignore trace events)
    proxyUrl: string; // for CORS handling
}

// 2. The fundamental data point
export interface RainDataPoint {
    timestamp: number; // Unix timestamp in seconds or milliseconds (we should standardize on ms for JS Date compatibility)
    value: number; // Inches of rain
    sourceId: string; // e.g., "Manual_Upload" or "USGS_03086000"
}

// 3. A Computed "Storm Event"
export interface StormEvent {
    id: string; // UUID
    startDate: Date;
    endDate: Date;
    totalDepth: number; // Total inches
    peakIntensities: {
        [duration: string]: number; // e.g., "1hr": 1.45
    };
    recurrenceIntervals: {
        [duration: string]: string; // e.g., "1hr": "10-Year"
    };
    maxReturnPeriod: string; // The "Headline" severity (e.g., "50-Year")
}
