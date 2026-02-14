import Papa from 'papaparse';
import type { RainDataPoint } from '@/types';

type CsvRow = Record<string, string | undefined>;

/**
 * Parse uploaded rainfall files into normalized data points.
 */
export async function parseRainData(file: File): Promise<RainDataPoint[]> {
  const text = await file.text();
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  return parseRainDataText(text, file.name, extension);
}

/**
 * Pure parser utility that can be used in browser and tests.
 */
export function parseRainDataText(
  text: string,
  sourceId: string,
  extension = ''
): RainDataPoint[] {
  if (!text.trim()) {
    return [];
  }

  const lines = text.split(/\r?\n/);

  if (extension === 'dat' || text.trim().startsWith(';')) {
    return sortPoints(parseSwmmDat(lines, sourceId));
  }

  if (extension === 'tsf' || text.includes('IDs:') || text.includes('Date/Time')) {
    return sortPoints(parseSwmmTsf(lines, sourceId));
  }

  return sortPoints(parseCsv(text, sourceId));
}

function parseCsv(text: string, sourceId: string): RainDataPoint[] {
  const results = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const points: RainDataPoint[] = [];

  for (const row of results.data) {
    const point = parseCsvRow(row, sourceId);
    if (point) {
      points.push(point);
    }
  }

  if (points.length === 0) {
    return parseHeaderlessCsvFallback(results, sourceId);
  }

  return points;
}

function parseCsvRow(row: CsvRow, sourceId: string): RainDataPoint | null {
  let timestamp = Number.NaN;
  let value = Number.NaN;

  if (row.Year && row.Month && row.Day && row.Hour && row.Minute) {
    const year = Number.parseInt(row.Year, 10);
    const month = Number.parseInt(row.Month, 10) - 1;
    const day = Number.parseInt(row.Day, 10);
    const hour = Number.parseInt(row.Hour, 10);
    const minute = Number.parseInt(row.Minute, 10);

    const date = new Date(year, month, day, hour, minute);
    timestamp = date.getTime();

    value = Number.parseFloat(
      row['Rain(inch)'] ?? row.Rain ?? row.Value ?? ''
    );
  }

  if (!Number.isFinite(timestamp)) {
    const timeEntry = Object.entries(row).find(([key]) => /date|time|timestamp/i.test(key));
    if (timeEntry?.[1]) {
      timestamp = new Date(timeEntry[1]).getTime();
    }
  }

  if (!Number.isFinite(value)) {
    const valueEntry = Object.entries(row).find(([key]) => /value|rain|depth/i.test(key));
    if (valueEntry?.[1] !== undefined) {
      value = Number.parseFloat(valueEntry[1]);
    }
  }

  if (!Number.isFinite(timestamp) || !Number.isFinite(value)) {
    return null;
  }

  return {
    timestamp,
    value,
    sourceId,
  };
}

function parseHeaderlessCsvFallback(
  results: Papa.ParseResult<CsvRow>,
  sourceId: string
): RainDataPoint[] {
  const points: RainDataPoint[] = [];
  const potentialHeaders = results.meta.fields;

  if (!potentialHeaders || potentialHeaders.length < 2) {
    return points;
  }

  const firstDate = new Date(potentialHeaders[0]);
  const firstValue = Number.parseFloat(potentialHeaders[1]);

  if (Number.isFinite(firstDate.getTime()) && Number.isFinite(firstValue)) {
    points.push({
      timestamp: firstDate.getTime(),
      value: firstValue,
      sourceId,
    });
  }

  for (const row of results.data) {
    const values = Object.values(row);
    if (values.length < 2 || !values[0] || !values[1]) {
      continue;
    }

    const timestamp = new Date(values[0]).getTime();
    const value = Number.parseFloat(values[1]);

    if (Number.isFinite(timestamp) && Number.isFinite(value)) {
      points.push({ timestamp, value, sourceId });
    }
  }

  return points;
}

function parseSwmmDat(lines: string[], sourceId: string): RainDataPoint[] {
  const points: RainDataPoint[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';')) {
      continue;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length < 7) {
      continue;
    }

    const year = Number.parseInt(parts[1], 10);
    const month = Number.parseInt(parts[2], 10) - 1;
    const day = Number.parseInt(parts[3], 10);
    const hour = Number.parseInt(parts[4], 10);
    const minute = Number.parseInt(parts[5], 10);
    const value = Number.parseFloat(parts[6]);

    const timestamp = new Date(year, month, day, hour, minute).getTime();

    if (Number.isFinite(timestamp) && Number.isFinite(value)) {
      points.push({ timestamp, value, sourceId });
    }
  }

  return points;
}

function parseSwmmTsf(lines: string[], sourceId: string): RainDataPoint[] {
  const points: RainDataPoint[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith('IDs:') ||
      trimmed.startsWith('Date/Time') ||
      trimmed.startsWith('M/d/yyyy')
    ) {
      continue;
    }

    const parts = trimmed.split(/\t+/);
    if (parts.length < 2) {
      continue;
    }

    const timestamp = new Date(parts[0]).getTime();
    const value = Number.parseFloat(parts[1]);

    if (Number.isFinite(timestamp) && Number.isFinite(value)) {
      points.push({ timestamp, value, sourceId });
    }
  }

  return points;
}

function sortPoints(points: RainDataPoint[]): RainDataPoint[] {
  return points.sort((a, b) => a.timestamp - b.timestamp);
}
