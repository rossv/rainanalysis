import { parseRainData } from '../src/utils/rainfallParsing';
import fs from 'fs';
import path from 'path';

class MockFile implements Partial<File> {
  name: string;
  private readonly filePath: string;

  constructor(filePath: string) {
    this.name = path.basename(filePath);
    this.filePath = filePath;
  }

  async text(): Promise<string> {
    return fs.promises.readFile(this.filePath, 'utf-8');
  }
}

(globalThis as { File?: unknown }).File = MockFile;

async function runTests() {
  const examplesDir = path.join(process.cwd(), 'examples');
  const files = await fs.promises.readdir(examplesDir);

  console.log(`Found ${files.length} example files.`);

  for (const fileName of files) {
    const filePath = path.join(examplesDir, fileName);
    const mockFile = new MockFile(filePath) as File;

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
        console.warn('  - WARNING: No points parsed!');
      }
    } catch (err) {
      console.error(`  - FAILED: ${String(err)}`);
    }
  }
}

runTests().catch(console.error);
