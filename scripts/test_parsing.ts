
import { parseRainData } from '../src/utils/rainfallParsing';
import fs from 'fs';
import path from 'path';

// Mock File object since we are running in Node
class MockFile {
    name: string;
    path: string;

    constructor(filePath: string) {
        this.name = path.basename(filePath);
        this.path = filePath;
    }

    text(): Promise<string> {
        return fs.promises.readFile(this.path, 'utf-8');
    }
}

// Polyfill File globally if needed or just cast
global.File = MockFile as any;

async function runTests() {
    const examplesDir = path.join(process.cwd(), 'examples');
    const files = await fs.promises.readdir(examplesDir);

    console.log(`Found ${files.length} example files.`);

    for (const fileName of files) {
        const filePath = path.join(examplesDir, fileName);
        const mockFile = new MockFile(filePath) as unknown as File;

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
