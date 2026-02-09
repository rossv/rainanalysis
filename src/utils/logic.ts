import type { RainDataPoint, StormEvent } from '../types';

/**
 * Segments rainfall data into storm events based on the Inter-Event Time Definition (IETD).
 * @param data Array of RainDataPoint
 * @param ietdHours The minimum dry period in hours to separate events
 * @param minEventThreshold The minimum total depth (inches) for an event to be included
 * @returns Array of StormEvent
 */
export function segmentEvents(
    data: RainDataPoint[],
    ietdHours: number,
    minEventThreshold: number
): StormEvent[] {
    // 1. Sort data by timestamp just in case
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

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

            if (timeDiff > ietdMs) {
                // Gap > IETD, finalize current event
                finalizeEvent(currentEventPoints, minEventThreshold, events);
                // Start new event
                currentEventPoints = [point];
            } else {
                // Gap <= IETD, continue event
                currentEventPoints.push(point);
            }
        }
    }

    // Finalize last event
    if (currentEventPoints.length > 0) {
        finalizeEvent(currentEventPoints, minEventThreshold, events);
    }

    return events;
}

function finalizeEvent(
    points: RainDataPoint[],
    threshold: number,
    events: StormEvent[]
) {
    const totalDepth = points.reduce((sum, p) => sum + p.value, 0);

    // Filter based on total depth threshold
    if (totalDepth < threshold) {
        return;
    }

    const startDate = new Date(points[0].timestamp);
    const endDate = new Date(points[points.length - 1].timestamp);

    // Calculate peaks
    const peakIntensities = calculateRollingPeaks(points);

    // Recurrance intervals and max return period logic to be implemented later
    // Or handled outside if IDF curves are needed.
    // For now, we return placeholders or pass IDF object if available.
    // The requirement says "Assign a 'Return Period' tag... based on worst-case duration found."
    // But IDF JSON is needed for that. The function signature didn't include it.
    // We can leave `recurrenceIntervals` and `maxReturnPeriod` empty/mocked here, and update them separately.

    const stormEvent: StormEvent = {
        id: crypto.randomUUID(),
        startDate,
        endDate,
        totalDepth,
        peakIntensities,
        recurrenceIntervals: {}, // To be populated
        maxReturnPeriod: "N/A", // To be populated
    };

    events.push(stormEvent);
}

/**
 * Calculates rolling maximum rainfall sums for standard durations.
 * @param points Array of RainDataPoint for a single event
 * @returns Object mapping duration string (e.g., "15min") to max depth (inches)
 */
export function calculateRollingPeaks(points: RainDataPoint[]): { [duration: string]: number } {
    const STANDARD_DURATIONS = [
        { label: "15min", ms: 15 * 60 * 1000 },
        { label: "1hr", ms: 60 * 60 * 1000 },
        { label: "2hr", ms: 2 * 60 * 60 * 1000 },
        { label: "6hr", ms: 6 * 60 * 60 * 1000 },
        { label: "12hr", ms: 12 * 60 * 60 * 1000 },
        { label: "24hr", ms: 24 * 60 * 60 * 1000 },
    ];

    const peaks: { [duration: string]: number } = {};

    STANDARD_DURATIONS.forEach(duration => {
        peaks[duration.label] = getRollingMax(points, duration.ms);
    });

    return peaks;
}

function getRollingMax(points: RainDataPoint[], durationMs: number): number {
    if (points.length === 0) return 0;

    let maxDepth = 0;
    let currentSum = 0;


    // Since points are irregular, we can't just use a fixed window of indices.
    // We use a sliding window based on time.
    // BUT the 'value' is associated with a timestamp. Is it rainfall accumulated up to that timestamp? Or rainfall at that instant?
    // Usually rain gauges record "tips" or accumulated over 15min intervals.
    // If data is "15-min interval data", then point.value is rain in [t-15m, t].
    // But here we have raw points. Let's assume point.value is rain that fell AT 'timestamp' (or just before).
    // Time-based rolling sum: sum of values where t_start <= t <= t_start + duration.

    // Algorithm:
    // Iterate through all possible start times? No, start times are driven by data points?
    // Or simply: For each window [t, t+duration], sum up points inside.
    // The max sum generally starts near a data point.
    // Let's use two pointers: left and right.
    // Expand right until time[right] - time[left] > duration.
    // Then shrink from left.

    // Wait, if we want max distinct window? No, rolling implies any window.
    // If data is point-based (tips), then sum of points in window.

    let left = 0;
    let right = 0;

    // To handle exact duration edge implementation correctly:
    // A window of 1 hour starting at T includes points in [T, T + 1hr].
    // Efficient algorithm:
    // Iterate right from 0 to N-1.
    // Update sum by adding points[right].
    // While (points[right].timestamp - points[left].timestamp > durationMs), remove points[left] and increment left.
    // Keep track of max sum.
    // This finds max sum ending at 'right', with duration constraint.
    // Is this covering all windows? Yes.

    for (right = 0; right < points.length; right++) {
        currentSum += points[right].value;

        while (points[right].timestamp - points[left].timestamp > durationMs) {
            currentSum -= points[left].value;
            left++;
        }

        // Check if current window actually spans close to duration? No, rolling max definition is "max depth in ANY X-hour period".
        // Even if we have only 5 minutes of rain, it fits in 24-hr window.
        // So simple max is correct.
        if (currentSum > maxDepth) {
            maxDepth = currentSum;
        }
    }

    return maxDepth;
}

/**
 * Appends new data to existing dataset, removing duplicates based on timestamp.
 */
export function appendData(existing: RainDataPoint[], incoming: RainDataPoint[]): RainDataPoint[] {
    const existingMap = new Map<number, RainDataPoint>();

    // Populate map
    existing.forEach(p => existingMap.set(p.timestamp, p));

    // Add new points if timestamp not exists
    incoming.forEach(p => {
        if (!existingMap.has(p.timestamp)) {
            existingMap.set(p.timestamp, p);
        }
    });

    // Convert back to array and sort
    const merged = Array.from(existingMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    return merged;
}
