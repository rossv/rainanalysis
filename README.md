# RainCheck

RainCheck is a browser-based rainfall analysis tool for exploring rain gauge data, splitting it into storm events, and reviewing event metrics for engineering workflows.

## What It Does

- Upload rainfall files (`.csv`, `.dat`, `.tsf`) directly in the UI.
- Parse and normalize timestamp/value records.
- Segment rainfall into events using an Inter-Event Time Definition (IETD).
- Filter low-depth events with a minimum event depth threshold.
- Visualize rainfall as a timeline chart and review event details in a table.
- Track summary metrics such as total rainfall, event count, and largest event.

## Supported Input Formats

### CSV

RainCheck accepts a range of CSV layouts, including:

- Column-based date parts: `Year`, `Month`, `Day`, `Hour`, `Minute` plus a rain value column (`Rain(inch)`, `Rain`, or `Value`)
- Timestamp/value style columns (header names containing `date`, `time`, `timestamp`, `value`, `rain`, or `depth`)
- Headerless timestamp/value rows as a fallback

### SWMM-style DAT

- Lines beginning with `;` are treated as comments
- Expected data layout is whitespace-delimited and includes date/time parts plus rainfall value

### SWMM-style TSF

- Header rows such as `IDs:`, `Date/Time`, and `M/d/yyyy` are ignored
- Data rows are parsed as datetime + rainfall value (tab or multi-space delimited)

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in terminal output (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Typical Workflow

1. Start the app with `npm run dev`.
2. Load a rainfall file from the **Data Sources** panel.
3. Tune **Inter-Event Time (Hours)** and **Min Event Depth (in)** in **Analysis Settings**.
4. Review summary cards, the timeline chart, and the identified events table.
5. Clear data and repeat with additional files as needed.

## Sample Files

Example datasets are included in the [`examples`](./examples) folder for quick testing.

## Project Structure

- `src/components`: UI and feature components (`Dashboard`, `DataIngestion`, `SettingsPanel`, etc.)
- `src/utils/rainfallParsing.ts`: File parsing and normalization logic
- `src/utils/logic.ts`: Event segmentation and rolling peak calculations
- `src/store.ts`: Global application state (settings, loaded points, computed events)

## Current Limitations

- Return period tagging is currently placeholder-only (`N/A`) and not linked to IDF curves yet.
- Very large datasets may impact chart performance without aggregation/downsampling.
