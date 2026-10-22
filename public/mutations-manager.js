import {escapeHTML as e,icon} from './ui.js';
import {defaultSpawnSettings} from './spawn-config.js';
import {formSignature,formBaseline} from './form-state.js';

const typeOrder = ['Standard','Special','Mutated'];
const compareType = (a,b) => (typeOrder.includes(a) ? typeOrder.indexOf(a) : typeOrder.length)-(typeOrder.includes(b) ? typeOrder.indexOf(b) : typeOrder.length) || a.localeCompare(b);
export const mutationTypes = entries => [...new Set([...typeOrder,...entries.map(m=>m.type)])].sort(compareType);

export function filterMutations(entries,query='',type='',sort='az') {
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter(m=>(!type || m.type===type) && words.every(word=>`${m.name} ${m.type} ${m.description || ''}`.toLowerCase().includes(word))).sort((a,b)=>sort==='za' ? b.name.localeCompare(a.name) : sort==='type' ? compareType(a.type,b.type) || a.name.localeCompare(b.name) : sort==='weight' ? Math.abs(b.weight || 0)-Math.abs(a.weight || 0) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
}
export function mutationResults(entries,sort='type') {
  if (sort !== 'type') return mutationCards(entries);
  return mutationTypes(entries).filter(type=>entries.some(m=>m.type===type)).map(type=>`<section class="eye-rarity-section"><h2>${e(type)}</h2><div class="eye-definition-grid mutation-definition-grid">${mutationCards(entries.filter(m=>m.type===type))}</div></section>`).join('');
}
export function mutationCards(entries) {
  return entries.map(m=>`<button type="button" class="panel eye-definition-card mutation-definition-card" data-action="edit-definition" data-kind="mutations" data-id="${e(m.id)}" aria-label="Edit ${e(m.name)}"><span class="eye-card-name">${e(m.name)}</span><span class="mutation-card-description">${e(m.description || 'No description yet.')}</span><span class="mutation-card-meta"><span>${e(m.type)}</span><span>${Math.abs(m.weight || 0).toLocaleString()} Tokens</span></span></button>`).join('');
}
export function mutationsManagerPage(catalog) {
  const standards=catalog.mutations.filter(m=>m.type==='Standard');
  return `<div class="definitions-header eye-manager-header"><h1 class="manager-heading">Mutations Manager</h1><button class="button primary" data-action="new-definition" data-kind="mutations">${icon('spark')} Create Mutation</button></div>
  <form id="spawn-settings-form" class="panel spawn-settings"><p data-copy-skip>Standard pool: ${standards.length} mutations · ${standards.reduce((n,m)=>n+Math.abs(m.weight || 0),0).toLocaleString()} tickets</p><label class="setting-row"><span><strong>ALLOW_DUPLICATE_MUTATIONS</strong><small>Allow the same standard mutation in multiple slots on one horse.</small></span><input type="checkbox" class="toggle" name="ALLOW_DUPLICATE_MUTATIONS" ${(catalog.spawning || defaultSpawnSettings).ALLOW_DUPLICATE_MUTATIONS ? 'checked' : ''}></label><div class="form-actions"><button class="button primary" type="submit">Save Configuration</button><button class="button secondary" type="reset">Cancel Changes</button></div></form>
  <div class="eye-grid-controls"><label class="zone-field">Search<input id="mutation-search" type="search" placeholder="Search..." aria-label="Search mutations"></label><label class="zone-field">Type<select id="mutation-type"><option value="">All Types</option>${mutationTypes(catalog.mutations).map(type=>`<option value="${e(type)}">${e(type)}</option>`).join('')}</select></label><label class="zone-field">Sort By<select id="mutation-sort"><option value="type" selected>Type</option><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="weight">Weight: Highest First</option></select></label></div>
  <div id="mutation-grid">${mutationResults(filterMutations(catalog.mutations,'','','type'))}</div><p id="mutation-empty" role="status" ${catalog.mutations.length ? 'hidden' : ''}>No mutations match your filters.</p>`;
}
export function updateMutationGrid(root,catalog) {
  const entries=filterMutations(catalog.mutations,root.querySelector('#mutation-search').value,root.querySelector('#mutation-type').value,root.querySelector('#mutation-sort').value);
  const sort=root.querySelector('#mutation-sort').value;
  const grid=root.querySelector('#mutation-grid');
  grid.classList.toggle('eye-definition-grid',sort!=='type');
  grid.classList.toggle('mutation-definition-grid',sort!=='type');
  grid.innerHTML=mutationResults(entries,sort);
  root.querySelector('#mutation-empty').hidden=entries.length>0;
}

export function createMutationEditor(renderEditor) {
  const dialog=document.createElement('dialog');
  dialog.className='eye-definition-dialog mutation-definition-dialog';
  dialog.setAttribute('aria-labelledby','mutation-editor-title');
  const prompt=document.createElement('dialog');
  prompt.className='eye-save-confirm';
  prompt.setAttribute('aria-labelledby','mutation-save-title');
  prompt.innerHTML=`<div class="dialog-top"><h2 id="mutation-save-title">Save Changes?</h2></div><p>You have unsaved mutation changes. Save them before closing?</p><div class="form-actions"><button type="button" class="button secondary" data-mutation-decision="keep" autofocus>Keep Editing</button><button type="button" class="button secondary" data-mutation-decision="discard">Discard Changes</button><button type="button" class="button primary" data-mutation-decision="save">Save</button></div>`;
  document.body.append(dialog,prompt);
  function requestClose() {
    const form=dialog.querySelector('form');
    if (!form || formSignature(form)===formBaseline(form)) dialog.close();
    else if (!prompt.open) prompt.showModal();
  }
  prompt.addEventListener('click',event=>{
    const decision=event.target.closest('[data-mutation-decision]')?.dataset.mutationDecision;
    if (!decision) return;
    prompt.close();
    if (decision==='discard') dialog.close();
    if (decision==='save') dialog.querySelector('form')?.requestSubmit();
  });
  dialog.addEventListener('cancel',event=>{event.preventDefault();requestClose();});
  dialog.addEventListener('close',()=>{if (!dialog.open) dialog.replaceChildren();});
  dialog.addEventListener('click',event=>{
    if (event.target.closest('[data-mutation-close]')) return requestClose();
    if (event.target!==dialog) return;
    const bounds=dialog.getBoundingClientRect();
    if (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom) requestClose();
  });
  return {dialog,open(draft) {
    const template=document.createElement('template');
    template.innerHTML=renderEditor(draft);
    const form=template.content.querySelector('#definition-form');
    form.querySelector('.panel-heading')?.remove();
    form.querySelector('[data-action="duplicate-definition"]')?.remove();
    dialog.innerHTML=`<div class="dialog-top"><h2 id="mutation-editor-title">${draft?.id ? `Edit ${e(draft.name)}` : 'Create Mutation'}</h2><button type="button" class="icon-button" data-mutation-close aria-label="Close mutation editor">${icon('close')}</button></div>`;
    const remove=form.querySelector('[data-action="delete-definition"]');
    if (remove) {
      remove.className='icon-button eye-header-delete';
      remove.innerHTML=icon('trash');
      remove.title='Delete Mutation';remove.setAttribute('aria-label',`Delete ${draft.name}`);
      dialog.querySelector('h2').after(remove);
    }
    const fields=form.querySelector('.definition-fields');
    const row=document.createElement('div');row.className='eye-name-rarity';
    row.append(fields.querySelector('[name="name"]').closest('label'),fields.querySelector('[name="type"]').closest('label'));
    fields.prepend(row);
    dialog.append(form);dialog.scrollTop=0;
    if (!dialog.open) dialog.showModal();
    form.elements.name.focus();
  }};
}
