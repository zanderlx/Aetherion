import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createEncounters} from '../src/encounters.js';

test('species draws independently use the entire zone pool and allow repeats', async () => {
  const catalog = JSON.parse(await readFile(new URL('../data/definitions/catalog.json',import.meta.url),'utf8'));
  const location = {id:'test',speciesPool:['Ghoulsteed','Calaverita','Hauntmare'],palettePool:['Natural Gold']};
  for (const draws of [[0,0,0],[1,1,2],[2,0,1]]) {
    let calls = 0;
    const horses = createEncounters(catalog,'test',3,7,location,length => {
      assert.equal(length,3);
      return draws[calls++];
    });
    assert.equal(calls,3);
    assert.deepEqual(horses.map(h => h.species),draws.map(i => location.speciesPool[i]));
    assert.equal(new Set(horses.map(h => h.id)).size,3);
  }
});
