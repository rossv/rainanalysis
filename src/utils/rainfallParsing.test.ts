import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseRainDataText } from './rainfallParsing';

const examplesDir = path.join(process.cwd(), 'examples');

describe('rainfallParsing', () => {
  it('parses all bundled example files', () => {
    const files = fs.readdirSync(examplesDir);

    for (const fileName of files) {
      const fullPath = path.join(examplesDir, fileName);
      const text = fs.readFileSync(fullPath, 'utf-8');
      const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

      const parsed = parseRainDataText(text, fileName, extension);

      expect(parsed.length, `${fileName} should produce parsed points`).toBeGreaterThan(0);
      expect(parsed[0].timestamp, `${fileName} should have valid timestamps`).toBeGreaterThan(0);
    }
  });

  it('parses headerless timestamp,value csv', () => {
    const text = ['2025/11/01 00:05,0.0', '2025/11/01 00:10,0.1', '2025/11/01 00:15,0.2'].join('\n');

    const parsed = parseRainDataText(text, 'headerless.csv', 'csv');

    expect(parsed).toHaveLength(3);
    expect(parsed[2].value).toBe(0.2);
  });
});
