
import Papa from 'papaparse';

// Define the RainDataPoint interface locally to avoid import issues if it's not exported correctly or path issues
// In a real scenario, correct the import path.
export interface RainDataPoint {
    timestamp: number;
    value: number;
    sourceId: string;
}

/**
 * Parses rainfall data from a file specifically handling:
 * - Standard CSV (Timestamp, Value)
 * - SWMM .dat (ID Year Month Day Hour Minute Value)
 * - SWMM .tsf (Header lines, then Date/Time Value)
 * - Detailed CSV (Month,Day,Year,Hour,Minute,Rain)
 */
export function parseRainData(file: File): Promise<RainDataPoint[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                if (!text) {
                    resolve([]);
                    return;
                }

                const lines = text.split(/\r?\n/);

                // Check if it's a SWMM .dat file
                // Format: StationID Year Month Day Hour Minute Value
                // Or looking for ';Rainfall' at start
                if (file.name.toLowerCase().endsWith('.dat') || text.trim().startsWith(';')) {
                    resolve(parseSwmmDat(lines, file.name));
                    return;
                }

                // Check if it's a SWMM .tsf file
                // Format: header meta, then tab separated Date/Time Value
                if (file.name.toLowerCase().endsWith('.tsf') || text.includes('IDs:') || text.includes('Date/Time')) {
                    resolve(parseSwmmTsf(lines, file.name));
                    return;
                }

                // Default to CSV parsing
                // We use PapaParse for CSVs
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const points: RainDataPoint[] = [];

                        if (results.meta.fields && results.meta.fields.length > 0) {
                            // Start with header logic
                            results.data.forEach((row: any) => {
                                let timestamp = 0;
                                let value = NaN;

                                // 1. Logic for Detailed CSV (Month, Day, Year...) - unchanged
                                if (row.Year && row.Month && row.Day && row.Hour && row.Minute) {
                                    const year = parseInt(row.Year, 10);
                                    const month = parseInt(row.Month, 10) - 1;
                                    const day = parseInt(row.Day, 10);
                                    const hour = parseInt(row.Hour, 10);
                                    const minute = parseInt(row.Minute, 10);
                                    const date = new Date(year, month, day, hour, minute);
                                    if (!isNaN(date.getTime())) timestamp = date.getTime();

                                    if (row['Rain(inch)'] !== undefined) value = parseFloat(row['Rain(inch)']);
                                    else if (row.Rain !== undefined) value = parseFloat(row.Rain);
                                    else if (row.Value !== undefined) value = parseFloat(row.Value);
                                }

                                // 2. Standard timestamp column search
                                if (timestamp === 0) {
                                    const timeKey = Object.keys(row).find(k => /date|time|timestamp/i.test(k));
                                    if (timeKey && row[timeKey]) {
                                        const date = new Date(row[timeKey]);
                                        if (!isNaN(date.getTime())) timestamp = date.getTime();
                                    }
                                }

                                // 3. Standard value column search
                                if (isNaN(value)) {
                                    const valKey = Object.keys(row).find(k => /value|rain|depth/i.test(k));
                                    if (valKey && row[valKey] !== undefined) value = parseFloat(row[valKey]);
                                }

                                if (timestamp > 0 && !isNaN(value)) {
                                    points.push({ timestamp, value, sourceId: file.name });
                                }
                            });
                        }

                        // Fallback: If no valid points found using headers, try position-based (Col 0 = Date, Col 1 = Value)
                        // This handles cases where header:true was used on a headerless file,
                        // causing the first data row to be interpreted as headers.
                        if (points.length === 0 && results.data.length > 0) {
                            // If header: true, and file was:
                            // 2025/11/01 00:05,0.0
                            // 2025/11/01 00:10,0.1
                            // PapaParse will treat "2025/11/01 00:05" and "0.0" as headers.
                            // results.meta.fields will be ["2025/11/01 00:05", "0.0"]
                            // results.data will contain subsequent rows, e.g.,
                            // [{ "2025/11/01 00:05": "2025/11/01 00:10", "0.0": "0.1" }]

                            const potentialHeaders = results.meta.fields;

                            if (potentialHeaders && potentialHeaders.length >= 2) {
                                const firstKeyAsDate = new Date(potentialHeaders[0]);

                                if (!isNaN(firstKeyAsDate.getTime())) {
                                    // It's likely a headerless file where the first line was data.
                                    // Recover the first data point from the "headers"
                                    const val1 = parseFloat(potentialHeaders[1]);
                                    if (!isNaN(val1)) {
                                        points.push({ timestamp: firstKeyAsDate.getTime(), value: val1, sourceId: file.name });
                                    }

                                    // Process the rest of the data.
                                    // For each row in results.data, the values are mapped to the "header" keys.
                                    // So, Object.values(row) will give us the actual data values for that row.
                                    results.data.forEach((row: any) => {
                                        const vals = Object.values(row) as string[];
                                        if (vals.length >= 2) {
                                            const d = new Date(vals[0]);
                                            const v = parseFloat(vals[1]);
                                            if (!isNaN(d.getTime()) && !isNaN(v)) {
                                                points.push({ timestamp: d.getTime(), value: v, sourceId: file.name });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        resolve(points);
                    },
                    error: (err) => reject(err)
                });

            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
}

function parseSwmmDat(lines: string[], sourceId: string): RainDataPoint[] {
    const points: RainDataPoint[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(';')) continue;

        // Split by whitespace
        const parts = trimmed.split(/\s+/);

        // Expected: StationID Year Month Day Hour Minute Value
        // Example: A-22_M-43_Rain 2022 3 1 0 0 0
        if (parts.length >= 7) {
            const year = parseInt(parts[1], 10);
            const month = parseInt(parts[2], 10) - 1;
            const day = parseInt(parts[3], 10);
            const hour = parseInt(parts[4], 10);
            const minute = parseInt(parts[5], 10);
            const value = parseFloat(parts[6]);

            if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(value)) {
                const date = new Date(year, month, day, hour, minute);
                points.push({
                    timestamp: date.getTime(),
                    value,
                    sourceId
                });
            }
        }
    }
    return points;
}

function parseSwmmTsf(lines: string[], sourceId: string): RainDataPoint[] {
    const points: RainDataPoint[] = [];

    // TSF format usually has headers then data
    // IDs: ...
    // Date/Time	Rainfall
    // M/d/yyyy	in
    // 3/1/2022 12:05:00 AM	0

    // Heuristic: skip lines that don't look like data (Date Value)
    // We can try to regex match the date at start of line

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Skip header metadata lines
        if (trimmed.startsWith('IDs:') || trimmed.startsWith('Date/Time') || trimmed.startsWith('M/d/yyyy')) continue;

        // Split by tab or multiple spaces
        // Valid line: "3/1/2022 12:05:00 AM\t0"
        const parts = trimmed.split(/\t+/);

        if (parts.length >= 2) {
            const dateStr = parts[0];
            const valStr = parts[1];

            const date = new Date(dateStr);
            const value = parseFloat(valStr);

            if (!isNaN(date.getTime()) && !isNaN(value)) {
                points.push({
                    timestamp: date.getTime(),
                    value,
                    sourceId
                });
            }
        }
    }

    return points;
}
