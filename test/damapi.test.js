const test = require('node:test');
const assert = require('node:assert/strict');
const { DamAPI, STATE_MAP } = require('../src/index.js');

test('DamAPI initialization and default data load', () => {
    const api = new DamAPI();
    const dams = api.getDams();
    
    assert.ok(Array.isArray(dams), 'getDams() should return an array');
    assert.ok(dams.length > 0, 'data set should not be empty');

    const first = dams[0];
    assert.ok(first.id, 'dam should have an id');
    assert.ok(first.name, 'dam should have a name');
    assert.ok(first.state, 'dam should have a state');
    assert.ok(first.waterLevel && typeof first.waterLevel.unit === 'string', 'dam should have waterLevel object');
});

test('DamAPI getByState() filtering', () => {
    const api = new DamAPI();
    const texasDamsByAbbr = api.getByState('TX');
    const texasDamsByName = api.getByState('Texas');

    assert.ok(texasDamsByAbbr.length > 0, 'should return dams for state TX');
    assert.equal(texasDamsByAbbr.length, texasDamsByName.length, 'state abbreviation and full name should return identical results');
    
    texasDamsByAbbr.forEach(dam => {
        assert.equal(dam.stateCode, 'TX');
        assert.equal(dam.state, 'TEXAS');
    });
});

test('DamAPI search() fuzzy search', () => {
    const api = new DamAPI();
    const results = api.search('alamo');
    
    assert.ok(results.length > 0, 'search for "alamo" should return matches');
    assert.ok(results.some(d => d.id === 'alamo'), 'should find alamo lake');
});

test('DamAPI get() single dam lookup', () => {
    const api = new DamAPI();
    const dam = api.get('alamo');
    
    assert.ok(dam !== null, 'get("alamo") should return dam object');
    assert.equal(dam.id, 'alamo');
    assert.equal(dam.name, 'Alamo');

    const nonExistent = api.get('non_existent_dam_12345');
    assert.equal(nonExistent, null, 'non existent dam should return null');
});

test('DamAPI getStats() dataset analytics', () => {
    const api = new DamAPI();
    const stats = api.getStats();

    assert.ok(stats.totalDams > 0, 'totalDams should be greater than 0');
    assert.ok(stats.totalStates > 0, 'totalStates should be greater than 0');
    assert.ok(Array.isArray(stats.statesCovered), 'statesCovered should be an array');
    assert.ok(typeof stats.averageLevel === 'number', 'averageLevel should be a number');
});

test('DamAPI getHistory() lake historical records', () => {
    const api = new DamAPI();
    const history = api.getHistory('alamo');

    assert.ok(history !== null, 'getHistory("alamo") should return history object');
    assert.ok(history.lakeName, 'history should have lakeName');
    assert.ok(history.readings, 'history should have readings object');
});

test('DamAPI sanitizeId helper', () => {
    assert.equal(DamAPI.sanitizeId('Hoover Dam!'), 'hoover_dam');
    assert.equal(DamAPI.sanitizeId('  Lake O\' the Pines  '), 'lake_o_the_pines');
});
