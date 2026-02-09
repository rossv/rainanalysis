
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock File object since we are running in Node
class MockFile {
    constructor(filePath) {
        this.name = path.basename(filePath);
        this.path = filePath;
    }

    text() {
        return fs.promises.readFile(this.path, 'utf-8');
    }
}

// Polyfill File globally
global.File = MockFile;

// DUPLICATED LOGIC FROM rainfallParsing.ts BECAUSE WE CAN'T EASILY IMPORT TS IN NODE WITHOUT SETUP
// This is just for verification
import Papa from 'papaparse';

async function parseRainData(file) {
    return new Promise((resolve, reject) => {
        const textPromise = file.text();

        textPromise.then(text => {
            if (!text) {
                resolve([]);
                return;
            }

            const lines = text.split(/\r?\n/);

            if (file.name.toLowerCase().endsWith('.dat') || text.trim().startsWith(';')) {
                resolve(parseSwmmDat(lines, file.name));
                return;
            }

            if (file.name.toLowerCase().endsWith('.tsf') || text.includes('IDs:') || text.includes('Date/Time')) {
                resolve(parseSwmmTsf(lines, file.name));
                return;
            }

            Papa.parse(text, { // PapaParse in Node takes string directly usually, or stream. Let's pass string.
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const points = [];

                    // Standard header logic
                    if (results.meta.fields && results.meta.fields.length > 0) {
                        results.data.forEach((row) => {
                            let timestamp = 0;
                            let value = NaN;

                            if (row.Year && row.Month && row.Day && row.Hour && row.Minute) {
                                const year = parseInt(row.Year, 10);
                                const month = parseInt(row.Month, 10) - 1;
                                const day = parseInt(row.Day, 10);
                                const hour = parseInt(row.Hour, 10);
                                const minute = parseInt(row.Minute, 10);
                                const second = 0;

                                const date = new Date(year, month, day, hour, minute, second);
                                if (!isNaN(date.getTime())) {
                                    timestamp = date.getTime();
                                }

                                if (row['Rain(inch)'] !== undefined) value = parseFloat(row['Rain(inch)']);
                                else if (row.Rain !== undefined) value = parseFloat(row.Rain);
                                else if (row.Value !== undefined) value = parseFloat(row.Value);
                            }

                            if (timestamp === 0) {
                                const timeKey = Object.keys(row).find(k => /date|time|timestamp/i.test(k));
                                if (timeKey && row[timeKey]) {
                                    const date = new Date(row[timeKey]);
                                    if (!isNaN(date.getTime())) {
                                        timestamp = date.getTime();
                                    }
                                }
                            }

                            if (isNaN(value)) {
                                const valKey = Object.keys(row).find(k => /value|rain|depth/i.test(k));
                                if (valKey && row[valKey] !== undefined) {
                                    value = parseFloat(row[valKey]);
                                }
                            }

                            if (timestamp > 0 && !isNaN(value)) {
                                points.push({
                                    timestamp,
                                    value,
                                    sourceId: file.name
                                });
                            }
                        });
                    }

                    // Fallback for headerless
                    if (points.length === 0 && results.data.length > 0) {
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
                                results.data.forEach((row) => {
                                    const vals = Object.values(row);
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
        }).catch(reject);
    });
}

function parseSwmmDat(lines, sourceId) {
    const points = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(';')) continue;

        const parts = trimmed.split(/\s+/);

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

function parseSwmmTsf(lines, sourceId) {
    const points = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('IDs:') || trimmed.startsWith('Date/Time') || trimmed.startsWith('M/d/yyyy')) continue;

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

async function runTests() {
    const examplesDir = path.join(process.cwd(), 'examples');
    const files = await fs.promises.readdir(examplesDir);

    console.log(`Found ${files.length} example files.`);

    for (const fileName of files) {
        const filePath = path.join(examplesDir, fileName);
        const mockFile = new MockFile(filePath);

        console.log(`\nTesting ${fileName}...`);
        try {
            const start = performance.now();
            const points = await parseRainData(mockFile);
            const duration = performance.now() - start;

            console.log(`  - Parsed ${points.length} points in ${duration.toFixed(2)}ms`);

            if (points.length > 0) {
                const first = points[0];
                const last = points[points.length - 1];
                console.log(`  - First: ${new Date(first.timestamp).toISOString()} = ${first.value}`);
                console.log(`  - Last:  ${new Date(last.timestamp).toISOString()} = ${last.value}`);
            } else {
                console.warn(`  - WARNING: No points parsed!`);
            }
        } catch (err) {
            console.error(`  - FAILED: ${err}`);
        }
    }
}

runTests().catch(console.error);
