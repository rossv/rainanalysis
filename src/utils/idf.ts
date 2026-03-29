/**
 * IDF (Intensity-Duration-Frequency) curves for return period estimation.
 * Based on representative NOAA Atlas 14 data for US climate regions.
 *
 * Intensities are in inches/hour.
 * Durations are in hours: [0.25, 0.5, 1, 2, 6, 12, 24]
 * Return periods are in years: [2, 5, 10, 25, 50, 100]
 */

export type IDFRegionKey =
    | 'northeast'
    | 'southeast'
    | 'midwest'
    | 'southcentral'
    | 'northwest'
    | 'southwest';

export interface IDFRegion {
    label: string;
    description: string;
    /** Duration breakpoints in hours */
    durations: number[];
    /** Return period breakpoints in years */
    returnPeriods: number[];
    /** intensities[returnPeriodIndex][durationIndex] in in/hr */
    intensities: number[][];
}

// Duration index mapping (hours): 0.25, 0.5, 1, 2, 6, 12, 24
// Return period index mapping (years): 2, 5, 10, 25, 50, 100

export const IDF_REGIONS: Record<IDFRegionKey, IDFRegion> = {
    northeast: {
        label: 'Northeast US',
        description: 'New England, Mid-Atlantic (Boston, NYC, Philadelphia)',
        durations: [0.25, 0.5, 1, 2, 6, 12, 24],
        returnPeriods: [2, 5, 10, 25, 50, 100],
        intensities: [
            // 2-year
            [2.40, 1.55, 1.00, 0.64, 0.34, 0.21, 0.13],
            // 5-year
            [3.10, 2.00, 1.32, 0.85, 0.46, 0.29, 0.18],
            // 10-year
            [3.65, 2.40, 1.58, 1.02, 0.56, 0.35, 0.22],
            // 25-year
            [4.55, 3.00, 2.00, 1.30, 0.72, 0.45, 0.28],
            // 50-year
            [5.25, 3.50, 2.35, 1.53, 0.85, 0.53, 0.34],
            // 100-year
            [6.00, 4.05, 2.75, 1.80, 1.00, 0.63, 0.40],
        ],
    },
    southeast: {
        label: 'Southeast US',
        description: 'Carolinas, Georgia, Florida, Gulf Coast (Atlanta, Miami, Houston)',
        durations: [0.25, 0.5, 1, 2, 6, 12, 24],
        returnPeriods: [2, 5, 10, 25, 50, 100],
        intensities: [
            // 2-year
            [3.25, 2.10, 1.40, 0.90, 0.49, 0.31, 0.19],
            // 5-year
            [4.10, 2.70, 1.80, 1.16, 0.63, 0.40, 0.25],
            // 10-year
            [4.85, 3.20, 2.15, 1.38, 0.75, 0.47, 0.30],
            // 25-year
            [6.05, 4.00, 2.70, 1.75, 0.96, 0.60, 0.39],
            // 50-year
            [7.00, 4.65, 3.15, 2.05, 1.12, 0.70, 0.46],
            // 100-year
            [8.10, 5.40, 3.65, 2.38, 1.30, 0.82, 0.54],
        ],
    },
    midwest: {
        label: 'Midwest US',
        description: 'Great Lakes, Ohio Valley (Chicago, Columbus, Indianapolis)',
        durations: [0.25, 0.5, 1, 2, 6, 12, 24],
        returnPeriods: [2, 5, 10, 25, 50, 100],
        intensities: [
            // 2-year
            [2.80, 1.85, 1.22, 0.78, 0.42, 0.26, 0.17],
            // 5-year
            [3.55, 2.35, 1.55, 1.00, 0.54, 0.34, 0.22],
            // 10-year
            [4.20, 2.80, 1.85, 1.19, 0.65, 0.41, 0.26],
            // 25-year
            [5.25, 3.50, 2.32, 1.50, 0.82, 0.52, 0.34],
            // 50-year
            [6.05, 4.05, 2.70, 1.75, 0.96, 0.61, 0.40],
            // 100-year
            [6.90, 4.60, 3.10, 2.02, 1.11, 0.70, 0.46],
        ],
    },
    southcentral: {
        label: 'South-Central US',
        description: 'Oklahoma, Texas, Arkansas, Louisiana (Dallas, OKC, Little Rock)',
        durations: [0.25, 0.5, 1, 2, 6, 12, 24],
        returnPeriods: [2, 5, 10, 25, 50, 100],
        intensities: [
            // 2-year
            [3.50, 2.30, 1.52, 0.97, 0.52, 0.32, 0.21],
            // 5-year
            [4.50, 2.95, 1.96, 1.25, 0.68, 0.43, 0.28],
            // 10-year
            [5.35, 3.50, 2.34, 1.50, 0.82, 0.52, 0.34],
            // 25-year
            [6.65, 4.40, 2.95, 1.90, 1.04, 0.66, 0.44],
            // 50-year
            [7.70, 5.10, 3.45, 2.22, 1.22, 0.77, 0.51],
            // 100-year
            [8.85, 5.90, 4.00, 2.58, 1.42, 0.90, 0.60],
        ],
    },
    northwest: {
        label: 'Pacific Northwest',
        description: 'Oregon, Washington, Idaho (Seattle, Portland, Boise)',
        durations: [0.25, 0.5, 1, 2, 6, 12, 24],
        returnPeriods: [2, 5, 10, 25, 50, 100],
        intensities: [
            // 2-year
            [1.60, 1.05, 0.70, 0.45, 0.24, 0.15, 0.10],
            // 5-year
            [2.05, 1.35, 0.90, 0.58, 0.31, 0.20, 0.13],
            // 10-year
            [2.40, 1.60, 1.07, 0.69, 0.37, 0.23, 0.15],
            // 25-year
            [2.95, 1.97, 1.33, 0.86, 0.46, 0.29, 0.19],
            // 50-year
            [3.40, 2.28, 1.54, 1.00, 0.54, 0.34, 0.22],
            // 100-year
            [3.90, 2.62, 1.78, 1.16, 0.63, 0.39, 0.26],
        ],
    },
    southwest: {
        label: 'Southwest US',
        description: 'Arizona, Nevada, New Mexico, Utah (Phoenix, Las Vegas, Albuquerque)',
        durations: [0.25, 0.5, 1, 2, 6, 12, 24],
        returnPeriods: [2, 5, 10, 25, 50, 100],
        intensities: [
            // 2-year
            [1.85, 1.22, 0.80, 0.51, 0.27, 0.17, 0.11],
            // 5-year
            [2.55, 1.70, 1.12, 0.72, 0.38, 0.24, 0.16],
            // 10-year
            [3.10, 2.05, 1.36, 0.87, 0.47, 0.29, 0.19],
            // 25-year
            [3.85, 2.58, 1.72, 1.11, 0.60, 0.37, 0.25],
            // 50-year
            [4.50, 3.00, 2.00, 1.30, 0.70, 0.44, 0.29],
            // 100-year
            [5.20, 3.48, 2.32, 1.51, 0.82, 0.51, 0.34],
        ],
    },
};

export const RETURN_PERIOD_LABELS: Record<number, string> = {
    2: '2-Year',
    5: '5-Year',
    10: '10-Year',
    25: '25-Year',
    50: '50-Year',
    100: '100-Year',
};

/**
 * Log-linear interpolation between two points.
 * x-axis is log-scaled (return period), y-axis is linear (intensity).
 */
function logLinearInterp(x: number, x0: number, x1: number, y0: number, y1: number): number {
    if (x0 === x1) return y0;
    const t = (Math.log(x) - Math.log(x0)) / (Math.log(x1) - Math.log(x0));
    return y0 + t * (y1 - y0);
}

/**
 * Get the IDF intensity (in/hr) for a given region, return period, and duration.
 * Uses bilinear interpolation on the log-return-period / linear-duration axes.
 */
export function getIDFIntensity(region: IDFRegion, returnPeriodYrs: number, durationHrs: number): number {
    const { durations, returnPeriods, intensities } = region;

    // Clamp inputs to table bounds
    const clampedRP = Math.max(returnPeriods[0], Math.min(returnPeriods[returnPeriods.length - 1], returnPeriodYrs));
    const clampedDur = Math.max(durations[0], Math.min(durations[durations.length - 1], durationHrs));

    // Find surrounding indices for duration (linear interp)
    let durIdx = durations.length - 2;
    for (let i = 0; i < durations.length - 1; i++) {
        if (clampedDur <= durations[i + 1]) {
            durIdx = i;
            break;
        }
    }

    // Find surrounding indices for return period (log interp)
    let rpIdx = returnPeriods.length - 2;
    for (let i = 0; i < returnPeriods.length - 1; i++) {
        if (clampedRP <= returnPeriods[i + 1]) {
            rpIdx = i;
            break;
        }
    }

    const d0 = durations[durIdx];
    const d1 = durations[durIdx + 1];
    const tDur = (clampedDur - d0) / (d1 - d0);

    // Interpolate intensity at lower RP across durations
    const i_rp0_d0 = intensities[rpIdx][durIdx];
    const i_rp0_d1 = intensities[rpIdx][durIdx + 1];
    const i_rp0 = i_rp0_d0 + tDur * (i_rp0_d1 - i_rp0_d0);

    // Interpolate intensity at upper RP across durations
    const i_rp1_d0 = intensities[rpIdx + 1][durIdx];
    const i_rp1_d1 = intensities[rpIdx + 1][durIdx + 1];
    const i_rp1 = i_rp1_d0 + tDur * (i_rp1_d1 - i_rp1_d0);

    // Log-linear interpolation across return periods
    return logLinearInterp(clampedRP, returnPeriods[rpIdx], returnPeriods[rpIdx + 1], i_rp0, i_rp1);
}

/**
 * Estimate the return period (in years) for a given intensity and duration
 * using inverse log-linear interpolation on the IDF table.
 * Returns the estimated return period, capped at 200 years (extrapolation).
 */
export function estimateReturnPeriod(region: IDFRegion, intensityInPerHr: number, durationHrs: number): number {
    const { durations, returnPeriods, intensities } = region;

    // Clamp duration to table bounds
    const clampedDur = Math.max(durations[0], Math.min(durations[durations.length - 1], durationHrs));

    // Find surrounding duration indices
    let durIdx = durations.length - 2;
    for (let i = 0; i < durations.length - 1; i++) {
        if (clampedDur <= durations[i + 1]) {
            durIdx = i;
            break;
        }
    }

    const d0 = durations[durIdx];
    const d1 = durations[durIdx + 1];
    const tDur = (clampedDur - d0) / (d1 - d0);

    // Build an array of intensities at this duration for each return period
    const intensitiesAtDuration = returnPeriods.map((_, rpIdx) => {
        const i0 = intensities[rpIdx][durIdx];
        const i1 = intensities[rpIdx][durIdx + 1];
        return i0 + tDur * (i1 - i0);
    });

    // If below minimum table intensity, return period < 2 years
    if (intensityInPerHr <= intensitiesAtDuration[0]) {
        // Extrapolate below 2-year
        const ratio = intensityInPerHr / intensitiesAtDuration[0];
        return Math.max(0.5, 2 * ratio);
    }

    // If above maximum table intensity, extrapolate above 100 years
    if (intensityInPerHr >= intensitiesAtDuration[intensitiesAtDuration.length - 1]) {
        const lastRP = returnPeriods[returnPeriods.length - 1];
        const secondLastRP = returnPeriods[returnPeriods.length - 2];
        const lastI = intensitiesAtDuration[intensitiesAtDuration.length - 1];
        const secondLastI = intensitiesAtDuration[intensitiesAtDuration.length - 2];
        // Log-linear extrapolation
        if (lastI > secondLastI) {
            const slope = (Math.log(lastRP) - Math.log(secondLastRP)) / (lastI - secondLastI);
            const extrapolated = Math.exp(Math.log(lastRP) + slope * (intensityInPerHr - lastI));
            return Math.min(500, extrapolated);
        }
        return 200;
    }

    // Find bracketing return period indices
    let rpIdx = returnPeriods.length - 2;
    for (let i = 0; i < intensitiesAtDuration.length - 1; i++) {
        if (intensityInPerHr <= intensitiesAtDuration[i + 1]) {
            rpIdx = i;
            break;
        }
    }

    // Inverse log-linear interpolation
    const rp0 = returnPeriods[rpIdx];
    const rp1 = returnPeriods[rpIdx + 1];
    const i0 = intensitiesAtDuration[rpIdx];
    const i1 = intensitiesAtDuration[rpIdx + 1];

    if (i1 === i0) return rp0;
    const t = (intensityInPerHr - i0) / (i1 - i0);
    return Math.exp(Math.log(rp0) + t * (Math.log(rp1) - Math.log(rp0)));
}

/**
 * Map a numeric return period to a display label.
 */
export function returnPeriodLabel(years: number): string {
    if (years < 1.5) return '<2-Year';
    if (years < 3.5) return '2-Year';
    if (years < 7.5) return '5-Year';
    if (years < 17.5) return '10-Year';
    if (years < 37.5) return '25-Year';
    if (years < 75) return '50-Year';
    if (years < 150) return '100-Year';
    return '>100-Year';
}

/**
 * Severity tier for color-coding.
 * Returns one of: 'low' | 'moderate' | 'high' | 'significant' | 'extreme'
 */
export type SeverityTier = 'low' | 'moderate' | 'high' | 'significant' | 'extreme';

export function returnPeriodToSeverity(years: number): SeverityTier {
    if (years < 2) return 'low';
    if (years < 10) return 'moderate';
    if (years < 25) return 'high';
    if (years < 100) return 'significant';
    return 'extreme';
}

/**
 * Calculate recurrence intervals for all standard durations in an event.
 * peakIntensities: { "1hr": <depth_in_inches>, ... } — depths, not intensities!
 * We convert depth to intensity by dividing by the duration in hours.
 */
export function calcRecurrenceIntervals(
    peakIntensities: { [duration: string]: number },
    region: IDFRegion
): { recurrenceIntervals: { [duration: string]: string }; maxReturnPeriod: string; maxReturnPeriodYears: number } {
    const DURATION_MAP: Record<string, number> = {
        '15min': 0.25,
        '1hr': 1,
        '2hr': 2,
        '6hr': 6,
        '12hr': 12,
        '24hr': 24,
    };

    const recurrenceIntervals: { [duration: string]: string } = {};
    let maxYears = 0;

    for (const [durLabel, depthInches] of Object.entries(peakIntensities)) {
        const durationHrs = DURATION_MAP[durLabel];
        if (durationHrs === undefined || depthInches <= 0) continue;

        const intensityInPerHr = depthInches / durationHrs;
        const years = estimateReturnPeriod(region, intensityInPerHr, durationHrs);
        recurrenceIntervals[durLabel] = returnPeriodLabel(years);
        if (years > maxYears) maxYears = years;
    }

    return {
        recurrenceIntervals,
        maxReturnPeriod: maxYears > 0 ? returnPeriodLabel(maxYears) : 'N/A',
        maxReturnPeriodYears: maxYears,
    };
}
