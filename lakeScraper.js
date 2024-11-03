// updateLakeData.js
const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

class LakeDataUpdater {
    constructor() {
        this.baseUrl = 'https://www.lakelevels.info/';
        this.dataDir = path.join(__dirname, 'data');
        this.historyDir = path.join(__dirname, 'history');
        this.logFile = path.join(this.dataDir, 'update.log');
        this.currentDataFile = path.join(this.dataDir, 'lake_levels.json');
    }

    initialize() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.historyDir)) {
            fs.mkdirSync(this.historyDir, { recursive: true });
        }
    }

    log(message, isError = false) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(this.logFile, logMessage);
        if (isError) {
            console.error(message);
        } else {
            console.log(message);
        }
    }

    sanitizeFilename(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_+|_+$)/g, '');
    }

    // Enhanced number parsing function with support for 4+ digit numbers
    parseNumber(value) {
        if (!value) return null;
        
        // Convert to string and clean the input
        let cleanValue = value.toString()
            .trim()
            // Remove all characters except digits, decimal point, and minus sign
            .replace(/[^0-9.-]/g, '');

        // Handle empty or invalid strings
        if (!cleanValue || cleanValue === '-' || cleanValue === '.') {
            return null;
        }

        // Convert to number
        let number = parseFloat(cleanValue);
        
        // Validate the result
        if (isNaN(number) || !isFinite(number)) {
            return null;
        }

        // Handle numbers that should be in thousands (for full pool values)
        // If the number is less than 1000 and appears to be a full pool value
        // multiply by 1000 to get the actual elevation
        if (number < 1000 && cleanValue.length <= 3) {
            number *= 1000;
        }

        return number;
    }

    async updateHistoricalData(lake) {
        try {
            const filename = `${this.sanitizeFilename(lake.name)}.json`;
            const historyFile = path.join(this.historyDir, filename);
            const today = new Date().toISOString().split('T')[0];

            // Read existing history file
            let historyData = {};
            if (fs.existsSync(historyFile)) {
                historyData = JSON.parse(fs.readFileSync(historyFile));
            } else {
                this.log(`Creating new history file for ${lake.name}`);
                historyData = {
                    lakeName: lake.name,
                    state: lake.state,
                    metadata: {
                        created: today,
                        fullPool: lake.fullPool,
                        dataSource: this.baseUrl
                    },
                    readings: {}
                };
            }

            // Add new reading
            historyData.readings[lake.lastUpdated.date] = {
                currentLevel: lake.currentLevel,
                difference: lake.difference,
                timestamp: `${lake.lastUpdated.date} ${lake.lastUpdated.time || '00:00'}`
            };

            // Update statistics
            const levels = Object.values(historyData.readings)
                .map(r => r.currentLevel)
                .filter(l => l !== null && !isNaN(l));

            if (levels.length > 0) {
                historyData.statistics = {
                    recordCount: levels.length,
                    averageLevel: levels.reduce((a, b) => a + b, 0) / levels.length,
                    highestLevel: Math.max(...levels),
                    lowestLevel: Math.min(...levels),
                    lastUpdated: lake.lastUpdated.date
                };
            }

            // Write updated history
            fs.writeFileSync(historyFile, JSON.stringify(historyData, null, 2));
            return true;
        } catch (error) {
            this.log(`Error updating history for ${lake.name}: ${error.message}`, true);
            return false;
        }
    }

    async updateAllData() {
        try {
            this.initialize();
            this.log('Starting lake data update...');

            const response = await axios.get(this.baseUrl, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                }
            });

            const $ = cheerio.load(response.data);
            const lakes = [];
            let updatedHistories = 0;

            $('tr').each((index, element) => {
                if (index === 0) return; // Skip header row

                try {
                    const cells = $(element).find('td');
                    if (cells.length < 4) return;

                    const nameCell = $(cells[0]);
                    const name = nameCell.find('a').first().text().trim() || nameCell.text().trim();
                    
                    // Skip non-lake entries
                    if (!name || 
                        name.includes('adsbygoogle') || 
                        name.includes('LAKES') || 
                        name.includes('RIVERS') ||
                        name.includes('Lakes:')) {
                        return;
                    }

                    const statePart = nameCell.find('font').text().trim();
                    
                    // Parse numeric values with the enhanced parser
                    const currentLevel = this.parseNumber($(cells[1]).text());
                    const fullPool = this.parseNumber($(cells[2]).text());
                    const difference = this.parseNumber($(cells[3]).text());
                    
                    // Debug log for number parsing
                    if (process.env.DEBUG) {
                        this.log(`Parsing numbers for ${name}:`);
                        this.log(`Raw current level: ${$(cells[1]).text()} -> ${currentLevel}`);
                        this.log(`Raw full pool: ${$(cells[2]).text()} -> ${fullPool}`);
                        this.log(`Raw difference: ${$(cells[3]).text()} -> ${difference}`);
                    }

                    const lake = {
                        name: name,
                        state: statePart.replace(/[()]/g, ''),
                        currentLevel: currentLevel,
                        fullPool: fullPool,
                        difference: difference,
                        lastUpdated: {
                            date: $(cells[4]).text().trim().split(/\s+/)[0],
                            time: $(cells[4]).text().trim().split(/\s+/)[1] || null
                        }
                    };

                    // Validate the lake data
                    if (lake.currentLevel !== null) {
                        lakes.push(lake);
                        // Update historical data
                        if (this.updateHistoricalData(lake)) {
                            updatedHistories++;
                        }
                    } else {
                        this.log(`Skipping ${name} due to invalid current level`, true);
                    }

                } catch (error) {
                    this.log(`Error processing lake row ${index}: ${error.message}`, true);
                }
            });

            // Update current data file
            const currentData = {
                metadata: {
                    lastUpdated: new Date().toISOString(),
                    totalLakes: lakes.length,
                    source: this.baseUrl
                },
                lakes: lakes.sort((a, b) => a.name.localeCompare(b.name))
            };

            fs.writeFileSync(this.currentDataFile, JSON.stringify(currentData, null, 2));

            // Update history index
            const indexData = {
                lastUpdated: new Date().toISOString(),
                totalLakes: lakes.length,
                historiesUpdated: updatedHistories,
                lakes: lakes.map(lake => ({
                    name: lake.name,
                    state: lake.state,
                    historyFile: `${this.sanitizeFilename(lake.name)}.json`,
                    lastReading: {
                        level: lake.currentLevel,
                        date: lake.lastUpdated.date
                    }
                }))
            };

            fs.writeFileSync(
                path.join(this.historyDir, 'index.json'),
                JSON.stringify(indexData, null, 2)
            );

            return {
                totalLakes: lakes.length,
                historiesUpdated: updatedHistories
            };

        } catch (error) {
            this.log(`Fatal error during update: ${error.message}`, true);
            throw error;
        }
    }
}

// Execute the updater
async function main() {
    try {
        const updater = new LakeDataUpdater();
        console.log('Starting lake data update...');
        
        const result = await updater.updateAllData();
        
        console.log('\nUpdate Complete!');
        console.log('-----------------');
        console.log(`Total lakes processed: ${result.totalLakes}`);
        console.log(`Historical records updated: ${result.historiesUpdated}`);
        console.log(`\nFiles updated:`);
        console.log(`- Current data: ${updater.currentDataFile}`);
        console.log(`- History files: ${updater.historyDir}`);
        
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

// Add debug mode if needed
// process.env.DEBUG = 'true';

// Only run if directly executed
if (require.main === module) {
    main();
}

module.exports = LakeDataUpdater;
