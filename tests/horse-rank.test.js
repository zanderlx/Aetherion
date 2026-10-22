import {test} from 'node:test';
import assert from 'node:assert/strict';
import {horseCardRank} from '../public/horse-rank.js';

test('common and event species have no glow; rarity tiers map to green and purple ranks',()=>{
  assert.equal(horseCardRank({rarityTier:4}).key,'none');
  assert.equal(horseCardRank({rarityTier:3}).key,'uncommon');
  assert.equal(horseCardRank({rarityTier:2}).key,'rare');
  assert.deepEqual(horseCardRank({rarityTier:1}),{key:'rare',label:'Ultra Rare'});
  assert.equal(horseCardRank({rarityTier:2,speciesEvent:'Halloween'}).key,'none');
});
test('five special mutations glow gold even on event species, without confusing palette names',()=>{
  for (const name of ['Solar','Lunar','Heavenly','Void','Astral']) {
    assert.equal(horseCardRank({specialSpawn:name,speciesEvent:'Halloween'}).key,'mutated');
    assert.equal(horseCardRank({mutations:[{name}]}).key,'mutated');
    assert.equal(horseCardRank({mutations:[name]}).key,'mutated');
  }
  assert.equal(horseCardRank({palette:{name:'Solar'},mutations:['Mutated']}).key,'none');
});
test('legacy horses resolve species ranks while new snapshots retain their captured rank',()=>{
  const catalog={species:[{id:'one',name:'Unicorn',rarityTier:3,event:null}]};
  assert.equal(horseCardRank({species:'Unicorn'},catalog).key,'uncommon');
  assert.equal(horseCardRank({speciesId:'one'},catalog).key,'uncommon');
  assert.equal(horseCardRank({speciesId:'one',rarityTier:2,speciesEvent:null},catalog).key,'rare');
  assert.equal(horseCardRank({species:'Unknown'},catalog).key,'none');
});
