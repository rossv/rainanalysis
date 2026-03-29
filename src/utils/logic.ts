import type { RainDataPoint, StormEvent } from '../types';
import type { IDFRegion } from './idf';
import { calcRecurrenceIntervals } from './idf';

/**
 * Segments rainfall data into storm events based on the Inter-Event Time Definition (IETD).
 * @param data Array of RainDataPoint
 * @param ietdHours The minimum dry period in hours to separate events
 * @param minEventThreshold The minimum total depth (inches) for an event to be included
 * @param idfRegion Optional IDF region for return period estimation
 * @returns Array of StormEvent
 */
export function segmentEvents(
    data: RainDataPoint[],
    ietdHours: number,
    minEventThreshold: number,
    idfRegion?: IDFRegion
): StormEvent[] {
    // Sort data by timestamp and ignore dry points for IETD gap checks
    const sortedData = [...data]
        .filter((point) => point.value > 0)
        .sort((a, b) => a.timestamp - b.timestamp);

    const events: StormEvent[] = [];
    let currentEventPoints: RainDataPoint[] = [];

    const ietdMs = ietdHours * 60 * 60 * 1000;

    for (let i = 0; i < sortedData.length; i++) {
        const point = sortedData[i];

        if (currentEventPoints.length === 0) {
            currentEventPoints.push(point);
        } else {
            const lastPoint = currentEventPoints[currentEventPoints.length - 1];
            const timeDiff = point.timestamp - lastPoint.timestamp;

            if (timeDiff >= ietdMs) {
                finalizeEvent(currentEventPoints, minEventThreshold, events, idfRegion);
                currentEventPoints = [point];
            } else {
                currentEventPoints.push(point);
            }
        }
    }

    if (currentEventPoints.length > 0) {
        finalizeEvent(currentEventPoints, minEventThreshold, events, idfRegion);
    }

    return events;
}

function finalizeEvent(
    points: RainDataPoint[],
    threshold: number,
    events: StormEvent[],
    idfRegion?: IDFRegion
) {
    const totalDepth = points.reduce((sum, p) => sum + p.value, 0);

    if (totalDepth < threshold) {
        return;
    }

    const startDate = new Date(points[0].timestamp);
    const endDate = new Date(points[points.length - 1].timestamp);
    const peakIntensities = calculateRollingPeaks(points);

    let recurrenceIntervals: { [duration: string]: string } = {};
    let maxReturnPeriod = 'N/A';
    let maxReturnPeriodYears = 0;

    if (idfRegion) {
        const result = calcRecurrenceIntervals(peakIntensities, idfRegion);
        recurrenceIntervals = result.recurrenceIntervals;
        maxReturnPeriod = result.maxReturnPeriod;
        maxReturnPeriodYears = result.maxReturnPeriodYears;
    }

    const stormEvent: StormEvent = {
        id: crypto.randomUUID(),
        startDate,
        endDate,
        totalDepth,
        peakIntensities,
        recurrenceIntervals,
        maxReturnPeriod,
        maxReturnPeriodYears,
    };

    events.push(stormEvent);
}

/**
 * Calculates rolling maximum rainfall depths for standard durations.
 * Returns depth (inches) accumulated within each duration window.
 * @param points Array of RainDataPoint for a single event
 */
export function calculateRollingPeaks(points: RainDataPoint[]): { [duration: string]: number } {
    const sortedPoints = [...points].sort((a, b) => a.timestamp - b.timestamp);
    const STANDARD_DURATIONS = [
        { label: '15min', ms: 15 * 60 * 1000 },
        { label: '1hr',  ms: 60 * 60 * 1000 },
        { label: '2hr',  ms: 2 * 60 * 60 * 1000 },
        { label: '6hr',  ms: 6 * 60 * 60 * 1000 },
        { label: '12hr', ms: 12 * 60 * 60 * 1000 },
        { label: '24hr', ms: 24 * 60 * 60 * 1000 },
    ];

    const peaks: { [duration: string]: number } = {};

    STANDARD_DURATIONS.forEach(duration => {
        peaks[duration.label] = getRollingMax(sortedPoints, duration.ms);
    });

    return peaks;
}

function getRollingMax(points: RainDataPoint[], durationMs: number): number {
    if (points.length === 0) return 0;

    let maxDepth = 0;
    let currentSum = 0;
    let left = 0;

    for (let right = 0; right < points.length; right++) {
        currentSum += points[right].value;

        while (points[right].timestamp - points[left].timestamp > durationMs) {
            currentSum -= points[left].value;
            left++;
        }

        if (currentSum > maxDepth) {
            maxDepth = currentSum;
        }
    }

    return maxDepth;
}

/**
 * Appends new data to existing dataset, deduplicating on timestamp.
 */
export function appendData(existing: RainDataPoint[], incoming: RainDataPoint[]): RainDataPoint[] {
    const existingMap = new Map<number, RainDataPoint>();
    existing.forEach(p => existingMap.set(p.timestamp, p));
    incoming.forEach(p => {
        if (!existingMap.has(p.timestamp)) {
            existingMap.set(p.timestamp, p);
        }
    });
    return Array.from(existingMap.values()).sort((a, b) => a.timestamp - b.timestamp);
}
