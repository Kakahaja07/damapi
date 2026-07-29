export interface WaterQuantity {
    value: number | null;
    unit: string;
}

export interface LastUpdatedInfo {
    date: string | null;
    time: string | null;
}

export interface Dam {
    id: string;
    name: string;
    state: string;
    stateCode: string;
    river: string | null;
    latitude: number | null;
    longitude: number | null;
    owner: string;
    currentLevel: number | null;
    fullPool: number | null;
    difference: number | null;
    waterLevel: WaterQuantity;
    fullPoolLevel: WaterQuantity;
    lastUpdated: LastUpdatedInfo;
    updatedAt: string;
}

export interface GetDamsFilter {
    state?: string;
    sort?: 'name' | 'level' | 'difference';
    order?: 'asc' | 'desc';
    limit?: number;
}

export interface DamStats {
    totalDams: number;
    totalLakes: number;
    statesCovered: string[];
    totalStates: number;
    averageLevel: number;
    highestLevel: number | null;
    lowestLevel: number | null;
    lastUpdated: string | null;
}

export interface LakeHistoryReading {
    currentLevel: number | null;
    difference: number | null;
    timestamp: string;
}

export interface LakeHistory {
    lakeName: string;
    state: string;
    metadata: {
        created?: string;
        fullPool?: number | null;
        recordStartDate?: string;
        dataSource?: string;
    };
    readings: Record<string, LakeHistoryReading>;
    statistics?: {
        recordCount: number;
        averageLevel: number;
        highestLevel: number;
        lowestLevel: number;
        lastUpdated: string;
    };
}

export interface DamApiOptions {
    dataFile?: string;
    historyDir?: string;
    autoLoad?: boolean;
}

export class DamAPI {
    constructor(options?: DamApiOptions);
    static sanitizeId(name: string): string;
    loadData(): this;
    getDams(filter?: GetDamsFilter): Dam[];
    getLakes(filter?: GetDamsFilter): Dam[];
    get(idOrName: string): Dam | null;
    search(query: string): Dam[];
    getByState(state: string): Dam[];
    getByRiver(river: string): Dam[];
    getStats(): DamStats;
    getHistory(lakeNameOrId: string): LakeHistory | null;
    fetchLive(): Promise<{ totalLakes: number; historiesUpdated: number }>;
}

export const STATE_MAP: Record<string, string>;
export const STATE_NAMES_BY_ABBR: Record<string, string>;
