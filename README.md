# 🌊 DamAPI (`usa-dam-data`)

> A modern, developer-first Node.js SDK and database for accessing publicly available United States dam, lake, reservoir, and water level data for free.

[![CI](https://github.com/Kakahaja07/damapi/actions/workflows/ci.yml/badge.svg)](https://github.com/Kakahaja07/damapi/actions)
[![License](https://img.shields.io/github/license/Kakahaja07/damapi)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-success)]()

A lightweight Node.js SDK designed to make U.S. dam and reservoir data easy to access, search, analyze, and integrate into applications.

Whether you're building dashboards, environmental tools, GIS applications, AI agents, research software, or monitoring systems, DamAPI provides a clean developer experience over publicly available datasets.

🌐 **Website / Docs**: [https://kakahaja07.github.io/damapi/](https://kakahaja07.github.io/damapi/)

---

## ✨ Features

- 🇺🇸 349+ United States dams & lakes database
- 🌊 Real-time water level data & full pool measurements
- 📊 Storage & level differences
- 📍 Search & filter by state (e.g. `Texas`, `TX`, `California`, `CA`)
- 🔎 Fuzzy search by dam or lake name
- 📈 Historical datasets for individual lakes
- 📊 Dataset analytics & summary statistics (`getStats()`)
- 🔄 On-demand live scraper & auto updates (`fetchLive()`)
- 📦 Full TypeScript support (`index.d.ts`)
- ⚡ Fast, zero-config JSON responses
- ❤️ Open Source & Free

---

# Installation

```bash
npm install usa-dam-data
```

or

```bash
yarn add usa-dam-data
```

or

```bash
pnpm add usa-dam-data
```

---

# Requirements

- Node.js 18+
- npm 9+

---

# Quick Start

```javascript
const { DamAPI } = require("usa-dam-data");

const api = new DamAPI();

// Get all dams
const dams = api.getDams();
console.log(`Loaded ${dams.length} dams!`);

// Search dams in Texas
const texasLakes = api.getByState("Texas");
console.log(texasLakes);
```

### ESM / TypeScript import

```typescript
import { DamAPI, Dam } from "usa-dam-data";

const api = new DamAPI();
const dams: Dam[] = api.getDams();
```

---

# Examples

## Get All Dams

```javascript
const dams = api.getDams();
```

## Search by State

```javascript
// Accepts full state name or 2-letter postal code
const texas = api.getByState("Texas");
const california = api.getByState("CA");
```

## Search by Name

```javascript
const matches = api.search("Alamo");
```

## Get Dam by ID

```javascript
const dam = api.get("alamo");
```

## Get Dataset Statistics

```javascript
const stats = api.getStats();
console.log(stats);
/*
{
  totalDams: 349,
  totalLakes: 349,
  statesCovered: [ 'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', ... ],
  totalStates: 36,
  averageLevel: 985.42,
  highestLevel: 6710.2,
  lowestLevel: -12.4,
  lastUpdated: '2026-07-29T06:28:23.430Z'
}
*/
```

## Get Historical Data for a Lake

```javascript
const history = api.getHistory("alamo");
console.log(history.readings);
```

## Live Fetch / Update Data

```javascript
// Fetch latest live levels directly from upstream data source
await api.fetchLive();
```

---

# Example Response Object

```json
{
  "id": "alamo",
  "name": "Alamo",
  "state": "ARIZONA",
  "stateCode": "AZ",
  "river": null,
  "latitude": null,
  "longitude": null,
  "owner": "USACE / Local Water Authority",
  "currentLevel": 1100.6,
  "fullPool": 1129,
  "difference": -28.4,
  "waterLevel": {
    "value": 1100.6,
    "unit": "ft"
  },
  "fullPoolLevel": {
    "value": 1129,
    "unit": "ft"
  },
  "lastUpdated": {
    "date": "7/28/2026",
    "time": "9:00"
  },
  "updatedAt": "2026-07-29T06:28:23.430Z"
}
```

---

# API Reference

### `new DamAPI(options?)`
Initializes the SDK. Options include `{ dataFile?, historyDir?, autoLoad? }`.

### `getDams(filter?)` / `getLakes(filter?)`
Returns array of dams. Supports filtering: `{ state, sort, order, limit }`.

### `get(idOrName)`
Returns a single dam object by sanitized ID or exact name.

### `search(query)`
Fuzzy search across dam names.

### `getByState(state)`
Filters dams by state name or 2-letter postal code.

### `getByRiver(river)`
Filters dams by river or river keyword.

### `getStats()`
Returns analytics summary including state counts, average water level, highest/lowest levels.

### `getHistory(lakeNameOrId)`
Loads historical readings for a specific dam/lake.

### `fetchLive()`
Scrapes real-time water level data from source and updates local storage.

---

# Development & Testing

```bash
# Clone the repository
git clone https://github.com/Kakahaja07/damapi.git

# Install dependencies
npm install

# Run tests
npm test

# Run live data updater
npm run update-data
```

---

# Roadmap

- [x] Dam database & JSON storage
- [x] Search & Filter API
- [x] TypeScript SDK definitions
- [x] Historical water level readings
- [x] Dataset statistics & analytics
- [ ] REST API server endpoint
- [ ] Daily automated GitHub Action workflow snapshots
- [ ] CLI tools (`npx usa-dam-data search <name>`)

---

# Data Sources

DamAPI is built using publicly available data from United States government agencies and other public resources where permitted.

---

# Disclaimer

DamAPI is an independent open-source project. It is **not affiliated with, endorsed by, sponsored by, or associated with** any government organization.

---

# License

MIT License. See [LICENSE](LICENSE) file.

---

# Author

**Prashant Sharma**

- GitHub: https://github.com/Kakahaja07
- Website: https://kakahaja07.github.io/damapi/

---

<p align="center">
Built with ❤️ for developers, researchers, and the open-source community.
</p>
