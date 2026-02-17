import { describe, it, expect } from 'vitest';
import { segmentEvents, calculateRollingPeaks, appendData } from './logic';
import type { RainDataPoint } from '../types';

describe('Logic Utils', () => {

    describe('segmentEvents', () => {
        it('should segment events based on IETD', () => {
            // Easier to construct timestamps relative to start
            const baseTime = new Date('2023-01-01T00:00:00Z').getTime();
            const hour = 3600 * 1000;

            const points: RainDataPoint[] = [
                { timestamp: baseTime, value: 0.5, sourceId: '1' },
                { timestamp: baseTime + 1 * hour, value: 0.5, sourceId: '1' }, // 1 hour later

                // Gap of 7 hours (start of next is +8 hours from previous)
                { timestamp: baseTime + 8 * hour, value: 0.5, sourceId: '1' },
                { timestamp: baseTime + 9 * hour, value: 0.5, sourceId: '1' },
            ];

            const ietd = 6; // 6 hours
            const threshold = 0; // 0 threshold

            const events = segmentEvents(points, ietd, threshold);

            expect(events.length).toBe(2);
            expect(events[0].totalDepth).toBe(1.0);
            expect(events[1].totalDepth).toBe(1.0);
        });

        it('should filter events below threshold', () => {
            const baseTime = new Date('2023-01-01T00:00:00Z').getTime();
            const points: RainDataPoint[] = [
                { timestamp: baseTime, value: 0.05, sourceId: '1' },
            ];
            // Threshold 0.1
            const events = segmentEvents(points, 6, 0.1);
            expect(events.length).toBe(0);
        });

        it('should split events when dry gap equals IETD', () => {
            const baseTime = new Date('2023-01-01T00:00:00Z').getTime();
            const hour = 3600 * 1000;

            const points: RainDataPoint[] = [
                { timestamp: baseTime, value: 0.5, sourceId: '1' },
                { timestamp: baseTime + 6 * hour, value: 0.5, sourceId: '1' },
            ];

            const events = segmentEvents(points, 6, 0);

            expect(events.length).toBe(2);
            expect(events[0].totalDepth).toBe(0.5);
            expect(events[1].totalDepth).toBe(0.5);
        });
    });

    describe('calculateRollingPeaks', () => {
        it('should calculate correct max for 1hr', () => {
            // 3 points of 0.5 inches spaced by 30 mins
            // 0min: 0.5, 30min: 0.5, 60min: 0.5
            // Max 1hr sum should be 0.5+0.5 = 1.0 (covering [0,60] includes 3 points? or strict > duration?)
            // Logic: while (right - left > duration)
            // T=0, val=0.5. Sum=0.5.
            // T=30, val=0.5. diff=30 <= 60. Sum=1.0. Max=1.0.
            // T=60, val=0.5. diff=60 <= 60. Sum=1.5. Max=1.5.
            // Wait, if window is exactly duration, do we include endpoints?
            // Usually [t, t+d]. Point at t and point at t+d are separated by d.
            // If duration is 1hr (60min), 0 and 60 are 60min apart. They fit in 1hr window?
            // Yes, [0, 60] is length 60.
            // So 1.5 is correct if we assume points are instantaneous impulses.
            // If points represent accumulation over previous interval, it's different.
            // Assuming instantaneous impulses (tips).

            const baseTime = 0;
            const min = 60 * 1000;
            const points: RainDataPoint[] = [
                { timestamp: baseTime, value: 0.5, sourceId: '1' },
                { timestamp: baseTime + 30 * min, value: 0.5, sourceId: '1' },
                { timestamp: baseTime + 60 * min, value: 0.5, sourceId: '1' },
            ];

            const peaks = calculateRollingPeaks(points);
            // 1hr = 60min.
            // Window [0, 60] contains 0, 30, 60. Sum 1.5.
            // Wait, usually standard engineering practice:
            // 1-hr rainfall is max rain in any 60-minute window.
            // If we have rain at 0, 30, 60.
            // Window [0, 60] includes all 3? Duration = 60-0 = 60.
            // Window (0, 60]? 
            // Logic constraint: timestamp[right] - timestamp[left] <= duration.
            // 60 - 0 <= 60. True.
            // So 1.5.

            expect(peaks['1hr']).toBe(1.5);

            // 15min. Each point is isolated (30min gap).
            // Max should be 0.5.
            expect(peaks['15min']).toBe(0.5);
        });
    });

    describe('appendData', () => {
        it('should deduplicate based on timestamp', () => {
            const existing: RainDataPoint[] = [
                { timestamp: 100, value: 1, sourceId: '1' },
                { timestamp: 200, value: 2, sourceId: '1' },
            ];
            const incoming: RainDataPoint[] = [
                { timestamp: 200, value: 2, sourceId: '2' }, // Duplicate time
                { timestamp: 300, value: 3, sourceId: '2' },
            ];

            const merged = appendData(existing, incoming);
            expect(merged.length).toBe(3);
            expect(merged[1].timestamp).toBe(200);
            expect(merged[1].value).toBe(2); // Keeps existing (value is 2)
        });
    });
});
