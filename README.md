# 🌊 DamAPI

> A modern, developer-first Node.js SDK and REST API for accessing publicly available United States dam, reservoir, and water infrastructure data.

[![CI](https://github.com/Kakahaja07/damapi/actions/workflows/ci.yml/badge.svg)](https://github.com/Kakahaja07/damapi/actions)
[![License](https://img.shields.io/github/license/Kakahaja07/damapi)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-success)]()

A lightweight SDK designed to make U.S. dam and reservoir data easy to access, search, analyze, and integrate into applications.

Whether you're building dashboards, environmental tools, GIS applications, AI agents, research software, or monitoring systems, DamAPI provides a clean developer experience over publicly available datasets.

---

## ✨ Features

- 🇺🇸 United States dam database
- 🌊 Reservoir information
- 📊 Water level data
- 💧 Storage & capacity information
- 📍 Search by state
- 🗺 Search by river
- 🔎 Search by dam name
- 📈 Historical datasets *(coming soon)*
- 📉 Water level trends *(coming soon)*
- ⚡ Fast JSON responses
- 📦 TypeScript support
- 🧩 Developer-friendly API
- 🚀 Zero configuration
- 🛠 REST API + SDK
- ❤️ Open Source

---

# Installation

```bash
npm install damapi
```

or

```bash
yarn add damapi
```

or

```bash
pnpm add damapi
```

---

# Requirements

- Node.js 18+
- npm 9+

---

# Quick Start

```javascript
import { DamAPI } from "damapi";

const api = new DamAPI();

const dams = await api.getDams();

console.log(dams);
```

---

# Examples

## Get All Dams

```javascript
const dams = await api.getDams();
```

---

## Search by State

```javascript
const texas = await api.getByState("Texas");
```

---

## Search by River

```javascript
const colorado = await api.getByRiver("Colorado River");
```

---

## Search by Name

```javascript
const dam = await api.search("Hoover");
```

---

## Get Dam by ID

```javascript
const dam = await api.get("08014500");
```

---

# Example Response

```json
{
  "id": "08014500",
  "name": "Hoover Dam",
  "state": "Nevada",
  "river": "Colorado River",
  "latitude": 36.0155,
  "longitude": -114.7378,
  "owner": "Bureau of Reclamation",
  "waterLevel": {
    "value": 1067.35,
    "unit": "ft"
  },
  "storage": {
    "value": 8234567,
    "unit": "acre-ft"
  },
  "updatedAt": "2026-07-29T12:00:00Z"
}
```

---

# API

## getDams()

Returns all dams.

```javascript
await api.getDams();
```

---

## get(id)

Returns a single dam.

```javascript
await api.get("08014500");
```

---

## search(keyword)

Search by name.

```javascript
await api.search("Hoover");
```

---

## getByState(state)

```javascript
await api.getByState("California");
```

---

## getByRiver(river)

```javascript
await api.getByRiver("Mississippi River");
```

---

# Project Structure

```
damapi
│
├── src/
│   ├── api/
│   ├── parser/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── index.ts
│
├── data/
│
├── examples/
│
├── scripts/
│
├── tests/
│
├── docs/
│
├── package.json
│
├── README.md
│
└── LICENSE
```

---

# Data Model

Every dam includes data similar to:

| Field | Description |
|--------|-------------|
| id | Unique Identifier |
| name | Dam Name |
| state | State |
| river | River |
| latitude | Latitude |
| longitude | Longitude |
| owner | Managing Organization |
| waterLevel | Current Water Level |
| storage | Reservoir Storage |
| updatedAt | Last Update |

---

# Roadmap

## Core

- [x] Dam database
- [x] Search API
- [x] TypeScript SDK
- [ ] REST API
- [ ] Historical water levels
- [ ] Daily snapshots
- [ ] Water storage history
- [ ] Reservoir statistics
- [ ] State summaries
- [ ] River summaries

### CLI

- [ ] Search command
- [ ] Export JSON
- [ ] Export CSV
- [ ] Daily updater

### Developer

- [ ] GraphQL API
- [ ] Python SDK
- [ ] Go SDK
- [ ] Rust SDK
- [ ] Java SDK

---

# Why DamAPI?

Government datasets often provide valuable information but can be difficult to consume due to inconsistent formats, multiple data sources, or limited developer tooling.

DamAPI simplifies access by providing:

- Clean JSON responses
- Consistent field names
- TypeScript support
- Easy search methods
- Ready-to-use SDK
- Developer-focused documentation

---

# Use Cases

Perfect for building:

- Environmental dashboards
- AI Agents
- GIS Applications
- Water Monitoring Systems
- Research Projects
- Government Dashboards
- Educational Projects
- Data Visualization
- Flood Monitoring
- Climate Analysis

---

# Performance Goals

- Lightweight package
- Fast searches
- Cached responses
- Low memory usage
- Tree-shakeable modules

---

# Contributing

Contributions are always welcome.

1. Fork the repository

```bash
git fork
```

2. Create a branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit changes

```bash
git commit -m "Add amazing feature"
```

4. Push branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

# Development

Clone the repository.

```bash
git clone https://github.com/Kakahaja07/damapi.git
```

Install dependencies.

```bash
npm install
```

Run development mode.

```bash
npm run dev
```

Run tests.

```bash
npm test
```

Build.

```bash
npm run build
```

---

# Documentation

Future documentation will include:

- SDK Guide
- REST API
- CLI Guide
- TypeScript Examples
- Advanced Search
- Filtering
- Pagination
- Error Handling

---

# Data Sources

DamAPI is built using publicly available data from United States government agencies and other public resources where permitted.

Potential data providers include:

- U.S. Army Corps of Engineers (USACE)
- Bureau of Reclamation
- USGS
- NOAA
- FEMA
- State Water Agencies

Each source remains the property of its respective owner.

---

# Disclaimer

DamAPI is an independent open-source project.

It is **not affiliated with, endorsed by, sponsored by, or associated with** the U.S. Army Corps of Engineers (USACE), Bureau of Reclamation, USGS, NOAA, FEMA, any state agency, or any other government organization.

The project aggregates and normalizes publicly available information solely for educational, research, and software development purposes.

Users are responsible for complying with the terms of service, licensing requirements, and usage policies of all upstream data providers.

If a data provider requests corrections or removal of content, the project will make reasonable efforts to comply.

---

# License

MIT License

Copyright (c) 2026 Prashant Sharma

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

See the [LICENSE](LICENSE) file for the full license text.

---

# Support

If you find DamAPI useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing code
- 📢 Sharing the project

---

# Author

**Prashant Sharma**

- GitHub: https://github.com/Kakahaja07

---

<p align="center">
Built with ❤️ for developers, researchers, and the open-source community.
</p>
