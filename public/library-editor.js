import { escapeHTML as e, heading, icon } from './ui.js';
import { definitionKinds, draftDefinition, regions, traitCategories, themeTokens } from './definitions.js';
import { colorsForMode } from './theme-modes.js';

export const editorRoutes = {
  species: 'species', colors: 'palettes', eyes: 'eyes', personalities: 'personalities',
  mutations: 'mutations', items: 'items', themes: 'themes', atmospheres: 'atmospheres', appearance: 'siteThemes'
};
const textField = (label, key, value, required = false, suggestions = []) => `<label class="zone-field">${label}<input name="${key}" value="${e(value || '')}" maxlength="${key === 'name' ? 80 : 100}" ${required ? 'required' : ''} ${suggestions.length ? `list="${key}-suggestions"` : ''}></label>${suggestions.length ? `<datalist id="${key}-suggestions">${[...new Set(suggestions.filter(Boolean))].map(v => `<option value="${e(v)}"></option>`).join('')}</datalist>` : ''}`;
const checkbox = (label, key, checked) => `<label class="zone-choice"><input type="checkbox" name="${key}" ${checked ? 'checked' : ''}><span>${label}</span></label>`;
const editorGuidance = {
  species:['Define species and their available traits, then choose them in zone pools.','Species edits affect future encounters. Collected horses retain their saved species and traits.'],
  palettes:['Create complete nine-region horse palettes and organize them by type or event.','Palette edits affect future horses using this palette. Existing horse colors are preserved.'],
  eyes:['Define eye colors, color combinations, and rarity labels for future horses.','The preview sampler cycles through these eye definitions; final rarity rolls are still planned.'],
  personalities:['Write personality names and descriptions for future companions.','New encounters use these descriptions. Gameplay effects are not simulated.'],
  mutations:['Document mutation categories, descriptions, and selection weights.','These are definitions only. Mutation rolls, visual effects, and gameplay effects are not implemented yet.'],
  items:['Define accessories and potions, their prices, rarities, and item themes.','Editing an item does not grant it. Inventory, gacha rewards, and item use remain planned.'],
  themes:['Organize item styles and optional event associations.','These themes label items and future rewards. Website colors are managed in Appearance & Themes.'],
  atmospheres:['Customize zone tints and encounter headings.','Choose the saved atmosphere in a zone editor to apply its appearance and encounter heading.'],
  siteThemes:['Choose website colors or create your own dark and light variants.','Save your color variants, then select the theme above to apply it throughout the website.']
};
export function colorControl(key, value = '#D6B4DF', label = key) {
  const valid = /^#[\da-f]{6}$/i.test(value) ? value : '#D6B4DF';
  return `<label class="color-control"><span>${e(label)}</span><span class="color-inputs"><input type="color" data-color-picker="${e(key)}" value="${valid}" aria-label="${e(label)} color picker"><input name="color:${e(key)}" data-color-hex="${e(key)}" value="${e(value)}" pattern="#[0-9a-fA-F]{6}" maxlength="7" required aria-label="${e(label)} hex value"></span></label>`;
}
export function traitRow(category = '', values = []) {
  return `<div class="trait-editor-row"><label class="zone-field">Category<input data-trait-category value="${e(category)}" maxlength="60" required ${traitCategories.includes(category) ? 'readonly' : ''}></label><label class="zone-field">Trait names · one per line<textarea data-trait-values rows="3" placeholder="Add as many options as you like">${e(values.join('\n'))}</textarea></label><button class="text-button" type="button" data-action="remove-trait-category">Remove Category</button></div>`;
}
export function themePicker(catalog, state) {
  const mode = state.settings.websiteThemeMode || 'dark';
  return `<section class="theme-picker"><h2>Dress your sanctuary in a new color</h2><p>Your selection is saved for the whole website.</p><div class="theme-mode-switch" aria-label="Website color mode"><button class="button secondary" data-action="theme-mode" data-mode="dark" aria-pressed="${mode === 'dark'}">☾ Dark · default</button><button class="button secondary" data-action="theme-mode" data-mode="light" aria-pressed="${mode === 'light'}">☀ Light</button></div><div class="theme-grid">${catalog.siteThemes.map(theme => {
    const colors = colorsForMode(theme, theme.id === 'default' ? 'dark' : mode);
    return `<button type="button" class="theme-card" data-action="apply-theme" data-id="${e(theme.id)}" aria-pressed="${(state.settings.websiteTheme || 'default') === theme.id}"><span class="theme-swatches">${['bg','sidebar','panel','burgundy','gold'].map(k => `<span style="background:${colors[k]}"></span>`).join('')}</span><strong>${e(theme.name)}</strong><small>${e(theme.description)}</small><span>${(state.settings.websiteTheme || 'default') === theme.id ? '✓ Current theme' : 'Use this theme'} · ${theme.id === 'default' ? 'original dark' : mode}</span></button>`;
  }).join('')}</div></section>`;
}
export function libraryEditorPage(kind, catalog, state, draft) {
  draft ||= draftDefinition(kind);
  const current = draft.id ? catalog[kind].find(d => d.id === draft.id) : null;
  const readOnly = kind === 'siteThemes' && draft.id === 'default';
  const kindName = definitionKinds[kind];
  let fields = '';
  if (kind === 'species') {
    fields = textField('Event or group (optional)', 'event', draft.event, false, catalog.species.map(s => s.event)) +
      textField('Acquisition or rarity notes (optional)', 'restriction', draft.restriction) +
      `<fieldset class="zone-pool"><legend>Species-specific traits</legend><p>Add names one per line. Mane and Tail options supply the baseline traits for new preview horses. Add your own categories below.</p><div id="trait-rows">${Object.entries({ ...Object.fromEntries(traitCategories.map(k => [k, []])), ...draft.traits }).map(([key, values]) => traitRow(key, values)).join('')}</div><button class="button secondary" type="button" data-action="add-trait-category">Add trait category</button></fieldset><p class="preview-note">After saving a new species, select it in World & Items → Zones to make it appear in that zone.</p>`;
  }
  if (kind === 'palettes') fields = textField('Palette type or event', 'group', draft.group, true, catalog.palettes.map(p => p.group)) + checkbox('Natural palette', 'natural', draft.natural) +
    `<div class="color-editor-grid">${regions.map(r => colorControl(r, draft.colors?.[r] || '#D6B4DF')).join('')}</div><p class="preview-note">Each palette needs all nine regions. Choose it in a zone to use it for new horses.</p>`;
  if (kind === 'eyes') fields = textField('Rarity label (choose or type your own)', 'rarity', draft.rarity, true, catalog.eyes.map(d => d.rarity)) +
    `<div id="eye-color-rows" class="color-editor-grid">${(draft.colors || ['#8A689E']).map((c, i) => `<div class="eye-color-row">${colorControl(String(i), c, `Eye color ${i + 1}`)}<button class="text-button" type="button" data-action="remove-eye-color">Remove color</button></div>`).join('')}</div><button class="button secondary" type="button" data-action="add-eye-color">Add eye color</button>`;
  if (kind === 'mutations') fields = textField('Mutation category (choose or type your own)', 'type', draft.type, true, catalog.mutations.map(d => d.type)) +
    `<label class="zone-field">Selection weight (optional)<input type="number" min="0" max="1000000" step="any" name="weight" value="${draft.weight ?? ''}"></label><p class="callout">Definitions and weights are saved. Mutation rolls and gameplay effects are still awaiting the full generator; descriptions do not execute effects.</p>`;
  if (kind === 'items') fields = textField('Item type (choose or type your own)', 'type', draft.type || 'Accessory', true, catalog.items.map(d => d.type || 'Accessory')) +
    textField('Rarity (choose or type your own)', 'rarity', draft.rarity || 'Common', true, catalog.items.map(d => d.rarity)) +
    textField('Theme (optional, or add one in Item Themes)', 'theme', draft.theme, false, catalog.themes.map(d => d.name)) +
    `<label class="zone-field">Price in gold<input name="price" type="number" min="0" max="1000000" step="any" value="${draft.price ?? 0}" required></label><p class="callout">Item definitions are ready for inventory and gacha. Item use and potion effects are not active yet.</p>`;
  if (kind === 'themes') fields = textField('Event (optional)', 'event', draft.event, false, catalog.species.map(d => d.event));
  if (kind === 'atmospheres') fields = textField('Encounter heading', 'encounterTitle', draft.encounterTitle, true) + colorControl('tint', draft.tint, 'Woodland tint') + '<p class="preview-note">A new atmosphere becomes available in the zone editor immediately.</p>';
  if (kind === 'siteThemes') fields = `<input name="scheme" type="hidden" value="dark">${['dark','light'].map(mode => `<fieldset class="zone-pool"><legend>${mode === 'dark' ? 'Dark variant · default' : 'Light variant'}</legend><div class="color-editor-grid">${themeTokens.map(key => colorControl(`${mode}:${key}`, colorsForMode(draft, mode)[key], ({ bg:'Page background', panel:'Panels', 'panel-deep':'Secondary surfaces', sidebar:'Sidebar', border:'Borders', gold:'Accent text', 'gold-soft':'Secondary accent', text:'Main text', muted:'Secondary text', burgundy:'Primary buttons', green:'Success color' })[key])).join('')}</div></fieldset>`).join('')}<p class="preview-note">Save both variants, then choose a theme and mode above. The original theme keeps its original dark appearance.</p>`;
  return `${heading('THE KEEPER’S WORKBENCH', kindName, editorGuidance[kind][0])}
    <div class="editor-tabs">${Object.entries(editorRoutes).map(([path, k]) => `<a href="#dev/${path}" ${k === kind ? 'aria-current="page"' : ''}>${definitionKinds[k]}</a>`).join('')}</div>
    ${kind === 'siteThemes' ? themePicker(catalog, state) : ''}
    <div class="library-workbench"><section class="panel library-list-panel"><div class="panel-heading"><h2>Your collection of options</h2></div><label class="zone-field">Find an entry<input type="search" id="definition-search" placeholder="Search by name…"></label><button class="button primary" data-action="new-definition" data-kind="${kind}">${icon('spark')} Add new</button><div class="definition-list">${catalog[kind].map(d => `<button class="definition-list-item ${d.id === draft.id ? 'selected' : ''}" data-action="edit-definition" data-kind="${kind}" data-id="${e(d.id)}" data-search="${e(`${d.name} ${d.group || d.type || d.rarity || ''}`.toLowerCase())}"><strong>${e(d.name)}</strong><small>${e(d.group || d.type || d.event || d.rarity || (d.traitsComplete === false ? 'Trait data incomplete' : ''))}</small></button>`).join('')}</div><p id="definition-no-results" hidden>No matching entries.</p></section>
    <form id="definition-form" class="panel" data-kind="${kind}" data-id="${e(draft.id || '')}"><div class="panel-heading"><div><h2>${current ? 'Edit ' + e(current.name) : 'Create a new entry'}</h2><p>${e(editorGuidance[kind][1])}</p></div></div>
    ${readOnly ? '<p class="callout">The original theme is always preserved. Duplicate it below to make your own version.</p>' : ''}
    <fieldset class="definition-fields" ${readOnly ? 'disabled' : ''}>
    ${textField('Name', 'name', draft.name, true)}
    <label class="zone-field">Description & notes<textarea name="description" maxlength="4000" rows="4" placeholder="Add appearance, behavior, lore, or other details…">${e(draft.description || '')}</textarea></label>
    ${fields}</fieldset>
    <p id="definition-status" class="form-status" role="status"></p>
    <div class="form-actions">${!readOnly ? '<button class="button primary" type="submit">Save entry</button><button class="button secondary" type="reset">Cancel changes</button>' : ''}${current && !readOnly ? `<button class="text-button" type="button" data-action="delete-definition" data-kind="${kind}" data-id="${e(current.id)}">Delete Entry</button>` : ''}${current ? `<button class="text-button" type="button" data-action="duplicate-definition" data-kind="${kind}" data-id="${e(current.id)}">Duplicate</button>` : ''}</div>
    </form></div>`;
}
export function readDefinitionForm(form) {
  const data = new FormData(form), kind = form.dataset.kind;
  const values = Object.fromEntries(data);
  if (kind === 'species') {
    const entries = [...form.querySelectorAll('.trait-editor-row')].map(row => [row.querySelector('[data-trait-category]').value.trim(), row.querySelector('[data-trait-values]').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean)]);
    if (new Set(entries.map(([key]) => key)).size !== entries.length) throw new Error('Each trait category needs a different name.');
    values.traits = Object.fromEntries(entries);
  }
  const colors = [...data].filter(([key]) => key.startsWith('color:'));
  if (kind === 'eyes') values.colors = colors.map(([, value]) => value);
  if (kind === 'palettes') values.colors = Object.fromEntries(colors.map(([key, value]) => [key.slice(6), value]));
  if (kind === 'siteThemes') {
    for (const mode of ['dark','light']) values[`${mode}Colors`] = Object.fromEntries(colors.filter(([key]) => key.startsWith(`color:${mode}:`)).map(([key,value]) => [key.slice(`color:${mode}:`.length),value]));
    values.colors = values.darkColors;
  }
  if (kind === 'palettes') values.natural = form.elements.natural.checked;
  if (kind === 'mutations') values.weight = values.weight === '' ? null : Number(values.weight);
  if (kind === 'items') values.price = Number(values.price);
  if (kind === 'atmospheres') values.tint = values['color:tint'];
  return { kind, id: form.dataset.id || undefined, values };
}
export function applyWebsiteTheme(catalog, state) {
  const selected = catalog.siteThemes.find(t => t.id === state.settings.websiteTheme) || catalog.siteThemes.find(t => t.id === 'default');
  const mode = selected.id === 'default' ? 'dark' : state.settings.websiteThemeMode || 'dark';
  const colors = colorsForMode(selected, mode);
  document.documentElement.dataset.theme = selected.id;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.style.colorScheme = mode;
  for (const key of themeTokens) document.documentElement.style.setProperty(`--${key}`, colors[key]);
  document.documentElement.style.setProperty('--button-text', '#FFFFFF');
}


