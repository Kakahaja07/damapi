const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// US State Name <-> Abbreviation mapping
const STATE_MAP = {
    'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR', 'CALIFORNIA': 'CA',
    'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE', 'FLORIDA': 'FL', 'GEORGIA': 'GA',
    'HAWAII': 'HI', 'IDAHO': 'ID', 'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA',
    'KANSAS': 'KS', 'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
    'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS', 'MISSOURI': 'MO',
    'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ',
    'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH',
    'OKLAHOMA': 'OK', 'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
    'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT', 'VERMONT': 'VT',
    'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV', 'WISCONSIN': 'WI', 'WYOMING': 'WY'
};

const STATE_NAMES_BY_ABBR = Object.fromEntries(
    Object.entries(STATE_MAP).map(([name, abbr]) => [abbr, name])
);

class DamAPI {
    /**
     * @param {Object} [options]
     * @param {string} [options.dataFile] Path to custom lake_levels.json
     * @param {string} [options.historyDir] Path to history directory
     * @param {boolean} [options.autoLoad=true] Auto load data on initialization
     */
    constructor(options = {}) {
        this.dataFile = options.dataFile || path.join(__dirname, '..', 'data', 'lake_levels.json');
        this.historyDir = options.historyDir || path.join(__dirname, '..', 'history');
        this.data = null;
        this.metadata = null;

        if (options.autoLoad !== false) {
            this.loadData();
        }
    }

    /**
     * Helper to sanitize names into sluggified IDs
     */
    static sanitizeId(name) {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_+|_+$)/g, '');
    }

    /**
     * Synchronously load data from local JSON storage
     */
    loadData() {
        if (!fs.existsSync(this.dataFile)) {
            this.data = [];
            this.metadata = { lastUpdated: null, totalLakes: 0 };
            return this;
        }

        try {
            const raw = fs.readFileSync(this.dataFile, 'utf8');
            const parsed = JSON.parse(raw);
            this.metadata = parsed.metadata || {};
            this.data = (parsed.lakes || []).map(lake => this.normalizeDam(lake));
        } catch (err) {
            this.data = [];
            this.metadata = { error: err.message };
        }
        return this;
    }

    /**
     * Normalize raw lake item into Dam API schema
     */
    normalizeDam(raw) {
        const id = DamAPI.sanitizeId(raw.name);
        const stateAbbr = (raw.state || '').toUpperCase().trim();
        const fullStateName = STATE_NAMES_BY_ABBR[stateAbbr] || stateAbbr;

        return {
            id: id,
            name: raw.name,
            state: fullStateName,
            stateCode: stateAbbr,
            river: raw.river || null,
            latitude: raw.latitude || null,
            longitude: raw.longitude || null,
            owner: raw.owner || 'USACE / Local Water Authority',
            currentLevel: raw.currentLevel ?? null,
            fullPool: raw.fullPool ?? null,
            difference: raw.difference ?? null,
            waterLevel: {
                value: raw.currentLevel ?? null,
                unit: 'ft'
            },
            fullPoolLevel: {
                value: raw.fullPool ?? null,
                unit: 'ft'
            },
            lastUpdated: raw.lastUpdated || { date: null, time: null },
            updatedAt: this.metadata?.lastUpdated || new Date().toISOString()
        };
    }

    /**
     * Retrieve all dams / lakes
     * @param {Object} [filter]
     * @param {string} [filter.state] State name or code
     * @param {string} [filter.sort] Field to sort by ('name', 'level', 'difference')
     * @param {string} [filter.order='asc'] Sort order ('asc' or 'desc')
     * @param {number} [filter.limit] Limit output count
     * @returns {Array<Object>}
     */
    getDams(filter = {}) {
        if (!this.data) this.loadData();
        let result = [...this.data];

        if (filter.state) {
            const searchState = filter.state.trim().toUpperCase();
            const searchCode = STATE_MAP[searchState] || searchState;
            result = result.filter(d => 
                d.stateCode === searchCode || 
                d.state.toUpperCase() === searchState
            );
        }

        if (filter.sort) {
            const order = filter.order === 'desc' ? -1 : 1;
            result.sort((a, b) => {
                if (filter.sort === 'level') return ((a.currentLevel || 0) - (b.currentLevel || 0)) * order;
                if (filter.sort === 'difference') return ((a.difference || 0) - (b.difference || 0)) * order;
                return (a.name.localeCompare(b.name)) * order;
            });
        }

        if (filter.limit && filter.limit > 0) {
            result = result.slice(0, filter.limit);
        }

        return result;
    }

    /**
     * Alias for getDams()
     */
    getLakes(filter = {}) {
        return this.getDams(filter);
    }

    /**
     * Get a single dam by ID or exact name
     * @param {string} idOrName
     * @returns {Object|null}
     */
    get(idOrName) {
        if (!idOrName) return null;
        if (!this.data) this.loadData();

        const targetId = DamAPI.sanitizeId(idOrName);
        const lowerName = idOrName.toLowerCase().trim();

        return this.data.find(d => 
            d.id === targetId || 
            d.name.toLowerCase() === lowerName
        ) || null;
    }

    /**
     * Fuzzy search dams by name or river
     * @param {string} query
     * @returns {Array<Object>}
     */
    search(query) {
        if (!query) return [];
        if (!this.data) this.loadData();

        const q = query.toLowerCase().trim();
        return this.data.filter(d => 
            d.name.toLowerCase().includes(q) ||
            (d.river && d.river.toLowerCase().includes(q)) ||
            d.id.includes(q)
        );
    }

    /**
     * Filter dams by State
     * @param {string} state - Full state name or 2-letter abbreviation
     * @returns {Array<Object>}
     */
    getByState(state) {
        return this.getDams({ state });
    }

    /**
     * Filter dams by River
     * @param {string} river
     * @returns {Array<Object>}
     */
    getByRiver(river) {
        return this.search(river);
    }

    /**
     * Get overall statistics about the dams and lakes
     * @returns {Object}
     */
    getStats() {
        if (!this.data) this.loadData();

        const total = this.data.length;
        const validLevels = this.data.filter(d => d.currentLevel !== null).map(d => d.currentLevel);
        const states = new Set(this.data.map(d => d.stateCode));

        const avgLevel = validLevels.length > 0
            ? validLevels.reduce((sum, val) => sum + val, 0) / validLevels.length
            : 0;

        return {
            totalDams: total,
            totalLakes: total,
            statesCovered: Array.from(states).sort(),
            totalStates: states.size,
            averageLevel: Math.round(avgLevel * 100) / 100,
            highestLevel: validLevels.length > 0 ? Math.max(...validLevels) : null,
            lowestLevel: validLevels.length > 0 ? Math.min(...validLevels) : null,
            lastUpdated: this.metadata?.lastUpdated || null
        };
    }

    /**
     * Retrieve historical data for a specific lake
     * @param {string} lakeNameOrId
     * @returns {Object|null}
     */
    getHistory(lakeNameOrId) {
        const id = DamAPI.sanitizeId(lakeNameOrId);
        const historyFile = path.join(this.historyDir, `${id}.json`);

        if (!fs.existsSync(historyFile)) {
            return null;
        }

        try {
            const raw = fs.readFileSync(historyFile, 'utf8');
            return JSON.parse(raw);
        } catch (err) {
            return null;
        }
    }

    /**
     * Live fetch latest dam data from lakelevels.info
     * @returns {Promise<Object>}
     */
    async fetchLive() {
        const LakeDataUpdater = require('../updateLakeData');
        const updater = new LakeDataUpdater();
        const result = await updater.updateAllData();
        this.loadData();
        return result;
    }
}

module.exports = { DamAPI, STATE_MAP, STATE_NAMES_BY_ABBR };
