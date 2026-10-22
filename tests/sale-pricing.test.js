import {test} from 'node:test';
import assert from 'node:assert/strict';
import {horseSalePrice,validateSaleModifiers} from '../public/sale-pricing.js';
import {saleQuoteBreakdown} from '../public/sale-quote.js';

const settings = {sellingPrice:300};
const horse = {traits:{Mane:['Long'],Tail:['Flowing'],'Eye Color':['Amber'],Pattern:['Spotted','Striped'],Paint:['Socks'],Cosmetic:['None','Awaiting species data']},mutations:[{name:'Double Jump'}]};

test('sale price counts assigned optional traits and mutations, excluding essentials and placeholders',()=>{
  const quote = horseSalePrice(horse,settings);
  assert.equal(quote.traitCount,3);
  assert.equal(quote.mutationCount,1);
  assert.equal(quote.total,395);
  assert.equal(horseSalePrice({traits:{},mutations:[]},settings).total,300);
});
test('all five special multipliers apply after additive bonuses and only once',()=>{
  for (const [name,multiplier] of [['Solar',10],['Lunar',15],['Heavenly',20],['Void',25],['Astral',30]]) {
    const quote=horseSalePrice({...horse,specialSpawn:name,mutations:[...horse.mutations,{name}]},settings);
    assert.equal(quote.subtotal,445);
    assert.equal(quote.multiplier,multiplier);
    assert.equal(quote.total,445*multiplier);
  }
  assert.equal(horseSalePrice({...horse,palette:{name:'Solar'}},settings).total,395);
  assert.equal(horseSalePrice({...horse,mutations:['Solar','Void']},settings).total,445*25);
});
test('custom modifiers and duplicate mutations count, with whole-gold rounding',()=>{
  const quote=horseSalePrice({...horse,mutations:['Solar','Double Jump','Double Jump']},{sellingPrice:101,saleModifiers:{traitBonus:2,mutationBonus:3,solarMultiplier:1.5}});
  assert.equal(quote.total,174);
  assert.equal(quote.mutationCount,3);
  assert.equal(horseSalePrice({...horse,specialSpawn:'Solar'},{...settings,saleModifiers:{solarMultiplier:0}}).total,0);
});
test('invalid modifiers are rejected',()=>{
  for (const value of [null,[],{traitBonus:-1},{mutationBonus:0.5},{solarMultiplier:Infinity},{voidMultiplier:1001},{unknown:4}]) assert.throws(()=>validateSaleModifiers(value));
});

test('sale confirmation explains counted bonuses and the special multiplier',()=>{
  const html = saleQuoteBreakdown(horseSalePrice({...horse,specialSpawn:'Solar'},settings));
  assert.match(html,/Traits \(3 × 15\)/);
  assert.match(html,/Mutations \(1 × 50\)/);
  assert.match(html,/Solar Multiplier/);
  assert.match(html,/>×10</);
});
