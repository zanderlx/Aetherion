import {escapeHTML as e,icon} from './ui.js';
import {colorControl} from './library-editor.js';
import {trackForms,updateFormState,restoreBaseline} from './form-state.js';

const rarityOrder = ['common','uncommon','rare','ultra rare','epic','legendary','mythic'];
const eyeRarityChances = {common:60,uncommon:35,rare:5};
const rarityRank = rarity => { const rank = rarityOrder.indexOf(rarity.toLowerCase()); return rank < 0 ? rarityOrder.length : rank; };
const compareRarity = (a,b) => rarityRank(a)-rarityRank(b) || a.localeCompare(b);

export function filterEyes(eyes,query = '',rarity = '',sort = 'az') {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return eyes.filter(eye => (!rarity || eye.rarity === rarity) && words.every(word => [eye.name,eye.rarity,...eye.colors].join(' ').toLowerCase().includes(word))).sort((a,b) => sort === 'za' ? b.name.localeCompare(a.name) : sort === 'rarity' ? compareRarity(a.rarity,b.rarity) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
}

export function eyeResults(eyes,sort = 'az',allEyes = eyes) {
  if (sort !== 'rarity') return eyeCards(eyes,allEyes);
  const groups = new Map();
  for (const eye of eyes) {
    if (!groups.has(eye.rarity)) groups.set(eye.rarity,[]);
    groups.get(eye.rarity).push(eye);
  }
  return [...groups].sort(([a],[b]) => compareRarity(a,b)).map(([rarity,entries]) => `<section class="eye-rarity-section"><h2>${e(rarity)}${eyeRarityChances[rarity.toLowerCase()] === undefined ? '' : ` <span class="eye-rarity-chance">(${eyeRarityChances[rarity.toLowerCase()]}%)</span>`}</h2><div class="eye-definition-grid">${eyeCards(entries,allEyes)}</div></section>`).join('');
}

export function updateEyeGrid(root,catalog) {
  const eyes = filterEyes(catalog.eyes,root.querySelector('#eye-search').value,root.querySelector('#eye-rarity').value,root.querySelector('#eye-sort').value);
  const grid = root.querySelector('#eye-grid');
  const sort = root.querySelector('#eye-sort').value;
  grid.classList.toggle('eye-definition-grid',sort !== 'rarity');
  grid.innerHTML = eyeResults(eyes,sort,catalog.eyes);
  root.querySelector('#eye-empty').hidden = eyes.length > 0;
}

export function eyesManagerPage(catalog) {
  return `<div class="definitions-header"><h1 class="manager-heading">Eye Color Manager</h1><button class="button primary" data-action="new-definition" data-kind="eyes">Create Eye Color</button><p class="configuration-path">data/config/eyes.json</p></div>
    <div class="eye-grid-controls"><label class="zone-field">Search<input id="eye-search" type="search" placeholder="Search name, rarity, or hex…" aria-label="Search eye colors"></label><label class="zone-field">Rarity<select id="eye-rarity"><option value="">All Rarities</option>${[...new Set(catalog.eyes.map(eye => eye.rarity))].sort((a,b) => a.localeCompare(b)).map(rarity => `<option value="${e(rarity)}">${e(rarity)}</option>`).join('')}</select></label><label class="zone-field">Sort By<select id="eye-sort"><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="rarity">Rarity</option></select></label></div>
    <div id="eye-grid" class="eye-definition-grid">${eyeCards(filterEyes(catalog.eyes),catalog.eyes)}</div><p id="eye-empty" role="status" hidden>No eye colors match your filters.</p>`;
}

export function eyeIndividualChance(eye,allEyes) {
  const chance = eyeRarityChances[eye.rarity.toLowerCase()];
  if (chance === undefined) return '';
  const count = allEyes.filter(item => item.rarity.toLowerCase() === eye.rarity.toLowerCase()).length;
  return count ? ` · ${Number((chance/count).toFixed(4))}%` : '';
}

function eyeCards(eyes,allEyes) { return eyes.map(eye => `<button type="button" class="panel eye-definition-card" data-action="edit-definition" data-kind="eyes" data-id="${e(eye.id)}" aria-label="Edit ${e(eye.name)}"><span class="eye-card-name">${e(eye.name)}</span><span class="eye-card-hex">${eye.colors.map(color => e(color.toUpperCase())).join(' · ')}</span><span class="eye-swatches" aria-label="Eye colors">${eye.colors.map(color => `<span style="background:${e(color)}" title="${e(color)}"></span>`).join('')}</span><span class="eye-card-rarity">${e(eye.rarity)}${eyeIndividualChance(eye,allEyes)}</span></button>`).join(''); }

export function randomEyeDraft(eyes,rng = Math.random) {
  const source = eyes[Math.floor(rng()*eyes.length)];
  let name = `${source.name.slice(0,60)} Variation`, suffix = 1;
  while (eyes.some(eye => eye.name.toLowerCase() === name.toLowerCase())) name = `${source.name.slice(0,60)} Variation ${++suffix}`;
  return {...structuredClone(source),id:undefined,systemId:'',textureId:'',name};
}

export function createEyeEditor(renderEditor,getEyes) {
  const dialog = document.createElement('dialog');
  dialog.id = 'eye-definition-dialog';
  dialog.className = 'eye-definition-dialog';
  dialog.setAttribute('aria-labelledby','eye-editor-title');
  document.body.append(dialog);
  dialog.addEventListener('close',() => { if (!dialog.open) dialog.replaceChildren(); });
  dialog.addEventListener('click',event => {
    if (event.target.closest('[data-action="close-eye-editor"]')) dialog.close();
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
    rows.querySelector('.eye-add-tile').hidden = rows.querySelectorAll('.eye-color-row').length >= 6;
    const picker = row.querySelector('[type="color"]');
    picker.focus();
    updateFormState(dialog.querySelector('form'));
  });
  const editor = {
    dialog,
    open(draft) {
      const template = document.createElement('template');
      template.innerHTML = renderEditor(draft);
      dialog.innerHTML = `<div class="dialog-top"><h2 id="eye-editor-title">${draft?.id ? `Edit ${e(draft.name)}` : 'Create Eye Color'}</h2><button type="button" class="icon-button" data-action="close-eye-editor" aria-label="Close eye color editor">${icon('close')}</button></div>`;
      const form = template.content.querySelector('#definition-form');
      form.querySelector('.panel-heading')?.remove();
      form.querySelector('[data-action="duplicate-definition"]')?.remove();
      form.querySelector('[data-action="add-eye-color"]')?.remove();
      const colors = form.querySelector('#eye-color-rows');
      colors.insertAdjacentHTML('beforeend',`<div class="eye-add-tile" ${colors.children.length >= 6 ? 'hidden' : ''}><button type="button" class="icon-button" data-eye-add="manual" aria-label="Choose a new eye color">${icon('plus')}</button><button type="button" class="icon-button" data-eye-add="random" aria-label="Add a random eye color">${icon('refresh')}</button></div>`);
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
