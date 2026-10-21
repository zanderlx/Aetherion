import {escapeHTML as e,icon} from './ui.js';
import {colorControl} from './library-editor.js';
import {trackForms,updateFormState,restoreBaseline,formSignature,formBaseline} from './form-state.js';

export function labelEyeColors(root) {
  const rows = [...root.querySelectorAll('.eye-color-row')];
  rows.forEach((row,index) => {
    const label = rows.length === 1 ? 'Eye Color' : `Eye Color ${index+1}`;
    row.querySelector('.color-control > span').textContent = label;
    row.querySelector('[type="color"]').setAttribute('aria-label',`${label} color picker`);
    row.querySelector('[data-color-hex]').setAttribute('aria-label',`${label} hex value`);
  });
}

const rarityOrder = ['common','uncommon','rare','ultra rare','epic','legendary','mythic'];
const eyeRarityChances = {common:60,uncommon:35,rare:5};
const rarityRank = rarity => { const rank = rarityOrder.indexOf(rarity.toLowerCase()); return rank < 0 ? rarityOrder.length : rank; };
const compareRarity = (a,b) => rarityRank(a)-rarityRank(b) || a.localeCompare(b);

export function filterEyes(eyes,query = '',rarity = '',sort = 'az') {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return eyes.filter(eye => (!rarity || eye.rarity === rarity) && words.every(word => [eye.name,eye.rarity,...eye.colors].join(' ').toLowerCase().includes(word))).sort((a,b) => sort === 'za' ? b.name.localeCompare(a.name) : sort === 'rarity' ? compareRarity(a.rarity,b.rarity) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
}

export function eyeResults(eyes,sort = 'az',allEyes = eyes,showPercent = true) {
  if (sort !== 'rarity') return eyeCards(eyes,allEyes,showPercent);
  const groups = new Map();
  for (const eye of eyes) {
    if (!groups.has(eye.rarity)) groups.set(eye.rarity,[]);
    groups.get(eye.rarity).push(eye);
  }
  return [...groups].sort(([a],[b]) => compareRarity(a,b)).map(([rarity,entries]) => `<section class="eye-rarity-section"><h2>${e(rarity)}${eyeRarityChances[rarity.toLowerCase()] === undefined ? '' : ` <span class="eye-rarity-chance">(${eyeRarityChances[rarity.toLowerCase()]}%)</span>`}</h2><div class="eye-definition-grid">${eyeCards(entries,allEyes,showPercent)}</div></section>`).join('');
}

export function updateEyeGrid(root,catalog) {
  const eyes = filterEyes(catalog.eyes,root.querySelector('#eye-search').value,root.querySelector('#eye-rarity').value,root.querySelector('#eye-sort').value);
  const grid = root.querySelector('#eye-grid');
  const sort = root.querySelector('#eye-sort').value;
  grid.classList.toggle('eye-definition-grid',sort !== 'rarity');
  grid.innerHTML = eyeResults(eyes,sort,catalog.eyes,root.querySelector('#eye-percent').checked);
  root.querySelector('#eye-empty').hidden = eyes.length > 0;
}

export function eyesManagerPage(catalog) {
  return `<div class="definitions-header"><h1 class="manager-heading">Eye Color Manager</h1><button class="button primary" data-action="new-definition" data-kind="eyes">Create Eye Color</button><p class="configuration-path">data/config/eyes.json</p></div>
    <div class="eye-grid-controls"><label class="zone-field">Search<input id="eye-search" type="search" placeholder="Search name, rarity, or hex…" aria-label="Search eye colors"></label><label class="zone-field">Rarity<select id="eye-rarity"><option value="">All Rarities</option>${[...new Set(catalog.eyes.map(eye => eye.rarity))].sort((a,b) => a.localeCompare(b)).map(rarity => `<option value="${e(rarity)}">${e(rarity)}</option>`).join('')}</select></label><label class="zone-field eye-percent-control"><span><input id="eye-percent" type="checkbox"> Show Percentages</span></label><label class="zone-field">Sort By<select id="eye-sort"><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="rarity" selected>Rarity</option></select></label></div>
    <div id="eye-grid">${eyeResults(filterEyes(catalog.eyes,'','','rarity'),'rarity',catalog.eyes,false)}</div><p id="eye-empty" role="status" hidden>No eye colors match your filters.</p>`;
}

export function eyeIndividualChance(eye,allEyes) {
  const chance = eyeRarityChances[eye.rarity.toLowerCase()];
  if (chance === undefined) return '';
  const count = allEyes.filter(item => item.rarity.toLowerCase() === eye.rarity.toLowerCase()).length;
  return count ? ` · ${Number((chance/count).toFixed(4))}%` : '';
}

function eyeCards(eyes,allEyes,showPercent = true) { return eyes.map(eye => `<button type="button" class="panel eye-definition-card" data-action="edit-definition" data-kind="eyes" data-id="${e(eye.id)}" aria-label="Edit ${e(eye.name)}"><span class="eye-card-name">${e(eye.name)}</span><span class="eye-card-hex">${eye.colors.map(color => e(color.toUpperCase())).join(' · ')}</span><span class="eye-swatches" aria-label="Eye colors">${eye.colors.map(color => `<span style="background:${e(color)}" title="${e(color)}"></span>`).join('')}</span><span class="eye-card-rarity">${e(eye.rarity)}${showPercent ? eyeIndividualChance(eye,allEyes) : ''}</span></button>`).join(''); }

export const randomEyeColor = (rng = Math.random) => `#${Math.floor(rng()*16777216).toString(16).padStart(6,'0').toUpperCase()}`;

export function randomEyeDraft(eyes,rng = Math.random) {
  const source = eyes[Math.floor(rng()*eyes.length)];
  let name = `${source.name.slice(0,60)} Variation`, suffix = 1;
  while (eyes.some(eye => eye.name.toLowerCase() === name.toLowerCase())) name = `${source.name.slice(0,60)} Variation ${++suffix}`;
  const count = 1+Math.floor(rng()*3);
  return {...structuredClone(source),id:undefined,systemId:'',textureId:'',layers:[],name,rarity:'Uncommon',colors:Array.from({length:count},() => randomEyeColor(rng))};
}

export function createEyeEditor(renderEditor,getEyes) {
  const dialog = document.createElement('dialog');
  dialog.id = 'eye-definition-dialog';
  dialog.className = 'eye-definition-dialog';
  dialog.setAttribute('aria-labelledby','eye-editor-title');
  document.body.append(dialog);
  const savePrompt = document.createElement('dialog');
  savePrompt.className = 'eye-save-confirm';
  savePrompt.setAttribute('aria-labelledby','eye-save-title');
  savePrompt.innerHTML = `<div class="dialog-top"><h2 id="eye-save-title">Save Changes?</h2></div><p>You have unsaved eye color changes. Save them before closing?</p><div class="form-actions"><button type="button" class="button secondary" data-eye-decision="keep" autofocus>Keep Editing</button><button type="button" class="button secondary" data-eye-decision="discard">Discard Changes</button><button type="button" class="button primary" data-eye-decision="save">Save</button></div>`;
  document.body.append(savePrompt);
  const minimumPrompt = document.createElement('dialog');
  minimumPrompt.className = 'eye-save-confirm';
  minimumPrompt.setAttribute('aria-labelledby','eye-minimum-title');
  minimumPrompt.innerHTML = `<div class="dialog-top"><h2 id="eye-minimum-title">Eye Color Required</h2></div><p>There needs to be at least 1 eye color.</p><div class="form-actions"><button type="button" class="button primary" autofocus>OK</button></div>`;
  minimumPrompt.querySelector('button').addEventListener('click',() => minimumPrompt.close());
  document.body.append(minimumPrompt);
  function requestClose() {
    const form = dialog.querySelector('form');
    if (!form || formSignature(form) === formBaseline(form)) dialog.close();
    else if (!savePrompt.open) savePrompt.showModal();
  }
  savePrompt.addEventListener('click',event => {
    const decision = event.target.closest('[data-eye-decision]')?.dataset.eyeDecision;
    if (!decision) return;
    savePrompt.close();
    if (decision === 'discard') dialog.close();
    if (decision === 'save') dialog.querySelector('form')?.requestSubmit();
  });
  dialog.addEventListener('cancel',event => {event.preventDefault(); requestClose();});
  dialog.addEventListener('close',() => { if (!dialog.open) dialog.replaceChildren(); });
  dialog.addEventListener('click',event => {
    if (event.target.closest('[data-action="close-eye-editor"]')) {requestClose(); return;}
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
    }
    const button = event.target.closest('[data-eye-add]');
    if (!button) return;
    event.stopPropagation();
    const rows = dialog.querySelector('#eye-color-rows');
    if (rows.querySelectorAll('.eye-color-row').length >= 6) return;
    const colors = getEyes().flatMap(eye => eye.colors);
    const color = button.dataset.eyeAdd === 'manual' ? '#FFFFFF' : colors[Math.floor(Math.random()*colors.length)] || '#FFFFFF';
    const row = document.createElement('div');
    row.className = 'eye-color-row';
    row.innerHTML = `${colorControl(crypto.randomUUID(),color,'Eye Color')}<button type="button" class="text-button" data-action="remove-eye-color">Remove Color</button>`;
    rows.insertBefore(row,rows.querySelector('.eye-add-tile'));
    labelEyeColors(rows);
    rows.querySelector('.eye-add-tile').hidden = rows.querySelectorAll('.eye-color-row').length >= 6;
    const picker = row.querySelector('[type="color"]');
    picker.focus();
    updateFormState(dialog.querySelector('form'));
  });
  const editor = {
    dialog,
    showMinimumColorMessage() { if (!minimumPrompt.open) minimumPrompt.showModal(); },
    open(draft) {
      if (!draft?.id && !draft?.name) draft = {...draft,rarity:'Uncommon',colors:[randomEyeColor()]};
      const template = document.createElement('template');
      template.innerHTML = renderEditor(draft);
      dialog.innerHTML = `<div class="dialog-top"><h2 id="eye-editor-title">${draft?.id ? `Edit ${e(draft.name)}` : 'Create Eye Color'}</h2><button type="button" class="icon-button" data-action="close-eye-editor" aria-label="Close eye color editor">${icon('close')}</button></div>`;
      const form = template.content.querySelector('#definition-form');
      form.querySelector('.panel-heading')?.remove();
      const deleteButton = form.querySelector('[data-action="delete-definition"]');
      if (deleteButton) {
        deleteButton.className = 'icon-button eye-header-delete';
        deleteButton.innerHTML = icon('trash');
        deleteButton.setAttribute('aria-label',`Delete ${draft.name}`);
        deleteButton.title = 'Delete Eye Color';
        dialog.querySelector('#eye-editor-title').after(deleteButton);
      }
      form.querySelector('[data-action="duplicate-definition"]')?.remove();
      form.querySelector('[data-action="add-eye-color"]')?.remove();
      const colors = form.querySelector('#eye-color-rows');
      labelEyeColors(colors);
      colors.insertAdjacentHTML('beforeend',`<div class="eye-add-tile" ${colors.children.length >= 6 ? 'hidden' : ''}><span class="eye-add-label" aria-hidden="true">Eye Color</span><div class="eye-add-actions"><button type="button" class="icon-button" data-eye-add="manual" title="Add a white color to customize" aria-label="Add a white color to customize">${icon('plus')}</button><button type="button" class="icon-button" data-eye-add="random" title="Add a random existing eye color" aria-label="Add a random existing eye color">${icon('refresh')}</button></div></div>`);
      if (!draft?.id) {
        const random = document.createElement('button');
        random.type = 'button'; random.className = 'button secondary';
        random.textContent = 'Randomize';
        random.addEventListener('click',() => {
          editor.open(randomEyeDraft(getEyes()));
          trackForms(dialog);
          restoreBaseline(dialog.querySelector('form'),'random-eye-draft');
        });
        form.querySelector('.form-actions').append(random);
      }
      const fields = form.querySelector('.definition-fields');
      const name = fields.querySelector('[name="name"]').closest('label');
      const rarity = fields.querySelector('[name="rarity"]').closest('label');
      const row = document.createElement('div');
      row.className = 'eye-name-rarity';
      row.append(name,rarity);
      fields.prepend(row);
      dialog.append(form);
      dialog.scrollTop = 0;
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('[name="name"]').focus();
    }
  };
  return editor;
}
