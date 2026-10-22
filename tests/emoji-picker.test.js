import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emojiChoices,filterEmojiChoices} from '../public/emoji-picker.js';
import {mutationEmoji} from '../public/mutations-manager.js';
import {createDefinitionDocument,readDefinitionDocument} from '../public/definition-transfer.js';
test('emoji picker has broad searchable choices with category filters',()=>{
 assert.ok(emojiChoices.length>140);
 assert.ok(filterEmojiChoices('lungs').some(entry=>entry.emoji==='🫁'));
 assert.ok(filterEmojiChoices('jump','Animals').some(entry=>entry.emoji==='🐰'));
 assert.equal(filterEmojiChoices('not-a-real-emoji-name').length,0);
 assert.ok(filterEmojiChoices('','Nature').every(entry=>entry.category==='Nature'));
});
test('chosen mutation emojis override defaults and round-trip through imports',()=>{
 const value={name:'Solar',type:'Standard',description:'Test',weight:1,thresholds:{},sizeShift:0,emoji:'🐴'};
 assert.equal(mutationEmoji(value),'🐴');
 const document=createDefinitionDocument('mutations',value);
 assert.equal(readDefinitionDocument('mutations',document,{mutations:[]}).emoji,'🐴');
 assert.equal(mutationEmoji({...value,name:'Other mutation'}),'🐴');
});