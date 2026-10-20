import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackForms, updateFormState, formBaseline, restoreBaseline } from '../public/form-state.js';
test('save and cancel controls follow real changes, reverting values and transferred baselines', () => {
  const fields = [
    {tagName:'INPUT',name:'gold',type:'number',value:'300'},
    {tagName:'INPUT',name:'enabled',type:'checkbox',checked:false},
    {tagName:'TEXTAREA',name:'about',value:'Hello'}
  ];
  const buttons = [{hidden:false},{hidden:false}];
  const form = {elements:fields,querySelectorAll:() => buttons};
  trackForms({querySelectorAll:() => [form]});
  assert.ok(buttons.every(b => b.hidden));
  fields[0].value = '400';
  updateFormState(form);
  assert.ok(buttons.every(b => !b.hidden));
  fields[0].value = '300';
  updateFormState(form);
  assert.ok(buttons.every(b => b.hidden));
  fields[1].checked = true;
  updateFormState(form);
  assert.ok(buttons.every(b => !b.hidden));
  const freshForm = {...form,elements:structuredClone(fields)};
  trackForms({querySelectorAll:() => [freshForm]});
  restoreBaseline(freshForm,formBaseline(form));
  assert.ok(buttons.every(b => !b.hidden));
});
