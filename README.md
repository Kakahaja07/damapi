# Lake Levels Tracker

A Node.js application that tracks and analyzes water levels for lakes across the United States.

## Features

- Scrapes real-time lake level data
- Maintains historical records for each lake
- Tracks water level changes over time
- Provides statistical analysis
- Exports data in multiple formats

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lake-levels-tracker.git
```

2. Install dependencies:
```bash
cd lake-levels-tracker
npm install
```

## Usage

### Initialize Historical Data
First time setup:
```bash
npm run init
```

### Update Lake Data
To update current levels and historical data:
```bash
npm run update
```

### Data Structure

The application maintains two main types of data:

1. Current Levels (`data/lake_levels.json`):
   - Latest readings for all lakes
   - Updated metadata
   - Source information

2. Historical Data (`history/{lake_name}.json`):
   - Complete history for each lake
   - Statistical analysis
   - Trend information

## Directory Structure

```
lake-levels-tracker/
├── data/                  # Current data and logs
├── history/              # Historical data for each lake
├── src/                  # Source code
├── tests/                # Test files
├── .gitignore           # Git ignore file
├── package.json         # Project configuration
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data source: [LakeLevels.info](https://www.lakelevels.info/)