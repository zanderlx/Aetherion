import {defaultSpawnSettings} from './spawn-config.js';
import {validateSettingsNumbers} from './game-settings.js';
import {raritiesManagerPage,readRaritySettings} from './rarities-manager.js';
import {defaultRaritySettings,rarityNames,raritySettings} from './rarity-settings.js';
import {horseCardRank} from './horse-rank.js';
import {saleQuoteBreakdown} from './sale-quote.js';
import {horseSalePrice,defaultSaleModifiers} from './sale-pricing.js';
import {personalityForm} from './personalities-manager.js';
import {closePersonalityEditor} from './personality-editor.js';
import {eyesManagerPage,createEyeEditor,updateEyeGrid,labelEyeColors} from './eyes-manager.js';
import {mutationsManagerPage,createMutationEditor,updateMutationGrid} from './mutations-manager.js';
import {traitsEditorPage,readTraitsForm} from './traits-editor.js';
import { createHorseTransfers } from './horse-transfer-ui.js';
import { startHorseRename } from './horse-inline-name.js';
import { createHorseDialogs } from './horse-dialogs.js';
import { icon, sidebar, groups, navigationSection, escapeHTML as e, number } from './ui.js';
import { wildPage, stablePage, collectionCards, settingsPage, editModePage, libraryPage, savesPage, plannedPage, routeTitle } from './pages.js';
import { profileContent } from './profile.js';
import {bindProfileTabs,selectProfileTab} from './profile-layout.js';
import {bindHorseArtViewer} from './horse-art-viewer.js';
import { displayBirthday, horseAcquisitionDate } from './dates.js';
import { locationsFor, newZoneDraft, randomZone, validateZone } from './zones.js';
import { zoneEditorPage, zonePreview } from './zone-editor.js';
import { draftDefinition, validateDefinition } from './definitions.js';
import { editorRoutes, libraryEditorPage, readDefinitionForm, traitRow, colorControl, applyWebsiteTheme } from './library-editor.js';
import { createCopyEditor } from './copy-editor.js';
import { prepareSearch, searchEntries } from './site-search.js';
import { keeperPage, avatarSVG } from './keeper.js';
import { roadmapPage } from './roadmap.js';
import { trackForms, updateFormState, formSignature, formBaseline, restoreBaseline } from './form-state.js';

let state, catalog, defaults, appVersion, busy = false, toastTimer;
let stableGridColumns = 5;
let route = location.hash.slice(1) || 'wilds/aetherion';
let routeVersion = 0, pendingDeletion;
let searchState, searchIndex = [], searchDialog, searchResults = [], searchTimer, pendingSearchResult;
const openGroups = new Set(groups.filter(g => g.open).map(g => g.title));
const $ = selector => document.querySelector(selector);
const main = $('#main');
bindProfileTabs();
const horseArtViewer = bindHorseArtViewer();
const profile = $('#profile');
const confirmation = $('#confirm');
const personalityCreation = document.createElement('dialog');
personalityCreation.className = 'personality-creation-dialog';
personalityCreation.setAttribute('aria-label','Create Personality');
document.body.append(personalityCreation);
personalityCreation.addEventListener('close',()=>{if (!personalityCreation.open) personalityCreation.replaceChildren();});
personalityCreation.addEventListener('cancel',event=>{event.preventDefault();closePersonalityEditor(personalityCreation.querySelector('form'),()=>personalityCreation.close());});
const eyeEditor = createEyeEditor(draft => libraryEditorPage('eyes',catalog,state,draft),() => catalog.eyes);
const mutationEditor = createMutationEditor(draft => libraryEditorPage('mutations',catalog,state,draft));
const copyEditor = createCopyEditor({ getState:() => state, getRoute:() => route, save:action, notify });

const profileCopyEditor = createCopyEditor({ getState:() => state, getRoute:() => 'horse/profile', save:action, notify, includeChrome:false, getValues:() => {
  const horse = findHorse(profile.dataset.horseId);
  return horse ? {horseName:horse.name || horse.species,species:horse.species,gender:horse.gender,birthday:horseAcquisitionDate(horse) ? displayBirthday(horseAcquisitionDate(horse)) : 'Not caught yet',personality:horse.personality.name,personalityDescription:horse.personality.description,specialSpawn:horse.specialSpawn || 'No special spawn'} : {};
}});
const horseDialogs = createHorseDialogs({getState:() => state,getCatalog:() => catalog,findHorse,save:action,notify,onSaved:async (id,kind) => {
  if (kind === 'catch') {
    // Navigate before opening the owned profile so route cleanup cannot close it.
    history.pushState(null,'','#stable/all');
    await navigate();
    if (route === 'stable/all') inspect(id);
  } else {render();inspect(id);}
}});
const horseTransfers = createHorseTransfers({getCatalog:() => catalog,getState:() => state,save:action,notify,onImported:() => {render();}});
async function request(path, body) {
  const response = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Unable to save. Please try again.');
  return result;
}
async function action(type, payload) {
  const result = await request('/api/action', { type, payload });
  state = result.state;
  if (result.catalog) catalog = result.catalog;
  return state;
}
function notify(message, error = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `visible ${error ? 'error' : ''}`;
  toast.setAttribute('role', error ? 'alert' : 'status');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.className = '', error ? 8000 : 4500);
}
function renderChrome() {
  const navScroll = $('#sidebar nav')?.scrollTop || 0;
  for (const details of $('#sidebar').querySelectorAll('details')) { if (details.open) openGroups.add(details.dataset.group); else openGroups.delete(details.dataset.group); }
  applyWebsiteTheme(catalog, state);
  $('#sidebar').innerHTML = sidebar(route, state, openGroups, catalog, appVersion);
  $('#sidebar').querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => {
    if (details.open) openGroups.add(details.dataset.group);
    else openGroups.delete(details.dataset.group);
  }));
  const section = navigationSection(route);
  const sectionName = state.pageCopy?.site?.[`group-${section.title.toLowerCase()}`] ?? section.title;
  const definitionKind = route === 'dev/rarities' ? 'rarities' : route === 'dev/traits' ? 'species' : editorRoutes[route.split('/')[1]];
  const definitionPath = section.title === 'Horse Definitions' && definitionKind ? `data/config/${definitionKind}.json` : '';
  $('#topbar').innerHTML = `<div class="breadcrumb"><button class="icon-button mobile-menu" data-action="menu" aria-label="Open navigation" aria-expanded="${document.body.classList.contains('nav-open')}">${icon('menu')}</button>${icon(section.icon)}<span>${e(sectionName)}</span><span class="crumb-separator">/</span><strong>${e(routeTitle(route, locationsFor(catalog, state)))}</strong>${definitionPath ? `<span class="breadcrumb-path" title="${e(definitionPath)}">— ${e(definitionPath)}</span>` : ''}</div><div class="header-right"><button class="icon-button" data-action="site-search" aria-label="Search entire site" title="Search entire site (Ctrl+K)">${icon('search')}</button><span class="save-status"><span class="save-dot"></span>Saved locally</span><div class="gold-balance" role="group" aria-label="Current gold balance">${icon('coin')}<strong>${number(state.gold)}</strong><span>GOLD</span></div><a href="#dev/profile" class="keeper-avatar" aria-label="Open my profile">${avatarSVG(state.keeper?.avatarSeed ?? 11)}</a></div>`;
}
function pageContent(pageRoute, pageState = state) {
  const state = pageState;
  const [section, page] = pageRoute.split('/');
  const route = pageRoute;
  const locations = locationsFor(catalog, state);
  if (section === 'wilds' && locations.some(l => l.id === page && l.enabled)) return wildPage(locations.find(l => l.id === page), state, locations, catalog);
  else if (route === 'stable/breeding') return plannedPage(route,state);
  else if (section === 'stable') return stablePage(page, state,catalog);
  else if (route === 'dev/settings' || route === 'dev/economy') return settingsPage(state,catalog);
  else if (route === 'dev/saves') return savesPage(state);
  else if (route === 'dev/roadmap') return roadmapPage();
  else if (route === 'dev/profile') return keeperPage(state);
  else if (route === 'dev/edit-mode') return editModePage(state);
  else if (route === 'dev/locations') return zoneEditorPage(catalog, state);
  else if (section === 'dev' && page === 'rarities') return raritiesManagerPage(catalog);
  else if (section === 'dev' && page === 'eyes') return eyesManagerPage(catalog);
  else if (section === 'dev' && page === 'mutations') return mutationsManagerPage(catalog);
  else if (section === 'dev' && page === 'traits') return traitsEditorPage(catalog);
  else if (section === 'dev' && Object.hasOwn(editorRoutes, page)) return libraryEditorPage(editorRoutes[page], catalog, state);
  else return plannedPage(route, state);
}
function render() {
  renderChrome();
  main.innerHTML = pageContent(route);
  if ($('#horse-grid-size')) {
    $('#horse-grid-size').value = String(stableGridColumns);
    $('#horse-grid-size').setAttribute('aria-valuetext',`${stableGridColumns} horses per row`);
    $('#horse-grid-value').textContent = stableGridColumns;
    $('#horse-grid-size').closest('.stable-grid-slider').style.setProperty('--grid-position',`${(stableGridColumns-3)/3*100}%`);
    $('#collection-grid').style.setProperty('--stable-grid-columns',stableGridColumns);
  }
  document.title = `${routeTitle(route, locationsFor(catalog, state))} · Aetherion`;
  copyEditor.attach(main);
  trackForms(main);
}
async function navigate({refreshSpawns = false} = {}) {
  const version = ++routeVersion;
  route = location.hash.slice(1) || 'wilds/aetherion';
  if (route.startsWith('wilds/') && !locationsFor(catalog,state).some(zone => zone.enabled && route === `wilds/${zone.id}`)) {
    const available = locationsFor(catalog,state).find(zone => zone.enabled);
    route = available ? `wilds/${available.id}` : 'stable/all';
    history.replaceState(null,'',`#${route}`);
  }
  const movedRoutes = {'dev/editor':'dev/roadmap','dev/generator':'dev/roadmap','dev/spawn':'dev/roadmap','dev/economy':'dev/settings','stable/favorites':'stable/all','breeding/stable':'stable/breeding','breeding/history':'stable/all','stable/sold':'stable/all'};
  if (movedRoutes[route]) { route = movedRoutes[route]; history.replaceState(null,'', '#' + route); }
  closeMenu();
  if (profile.open) profile.close();
  if (confirmation.open) confirmation.close();
  copyEditor.close();
  profileCopyEditor.close();
  horseDialogs.close();
  horseArtViewer.close();
  eyeEditor.dialog.close();
  mutationEditor.dialog.close();
  try {
    if (route.startsWith('wilds/') && (refreshSpawns || !state.encounters[route.split('/')[1]]) && locationsFor(catalog, state).some(l => l.id === route.split('/')[1] && l.enabled)) await action(refreshSpawns ? 'search' : 'visit', { locationId: route.split('/')[1] });
    if (version !== routeVersion) return;
    render();
    if (pendingSearchResult?.route === route) {
      const result = pendingSearchResult;
      pendingSearchResult = null;
      if (result.kind) showDefinition(result.kind,catalog[result.kind].find(d => d.id === result.id));
      if (result.horse) inspect(result.id);
      if (result.zone) showZoneDraft(locationsFor(catalog,state).find(d => d.id === result.id));
    }
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  } catch (error) { notify(error.message, true); }
}
function findHorse(id) { return [...state.horses, ...state.sold, ...Object.values(state.encounters).flat()].find(h => h.id === id); }
function openSiteSearch() {
  if (searchState !== state) {
    const entries = [], locations = locationsFor(catalog,state);
    const routes = new Map(groups.flatMap(group => group.items).filter(([path]) => !path.startsWith('wilds/')));
    for (const zone of locations.filter(z => z.enabled)) routes.set(`wilds/${zone.id}`,zone.name);
    const template = document.createElement('template');
    // Horse records have their own index entries; don't generate their artwork to index page copy.
    const pageState = {...state, horses:[], sold:[], encounters:{}, transactions:[]};
    for (const [path,title] of routes) {
      template.innerHTML = pageContent(path,pageState);
      template.content.querySelectorAll('.definition-list,.horse-grid,.theme-grid,input,select,textarea').forEach(el => el.remove());
      entries.push({ route:path, title:state.pageCopy?.[path]?.['page.title'] || title, text:template.content.textContent.replace(/\s+/g,' ') + ' ' + Object.values(state.pageCopy?.[path] || {}).join(' '), category:'Page' });
    }
    for (const [path,kind] of Object.entries(editorRoutes)) for (const entry of catalog[kind]) entries.push({
      route:`dev/${path}`, kind, id:entry.id, title:entry.name, text:JSON.stringify(entry), category:kind
    });
    for (const zone of locations) entries.push({ route:'dev/locations', zone:true,id:zone.id,title:zone.name,text:JSON.stringify(zone),category:'Zone' });
    const seen = new Set();
    for (const [path,horses] of [['stable/all',state.horses],['stable/all',state.sold],...Object.entries(state.encounters).map(([id,horses]) => [`wilds/${id}`,horses])]) {
      for (const horse of horses) {
        if (seen.has(horse.id)) continue;
        seen.add(horse.id);
        entries.push({ route:path.startsWith('wilds/') && !locations.some(z => `wilds/${z.id}` === path && z.enabled) ? 'stable/all' : path, horse:true,id:horse.id,title:horse.name || horse.species,text:JSON.stringify(horse),category:'Horse' });
      }
    }
    for (const [key,text] of Object.entries(state.pageCopy?.site || {})) entries.push({route:key.startsWith('nav-') ? key.slice(4).replace('-', '/') : 'dev/edit-mode',title:text,text:'Shared website wording',category:'Website text'});
    if (state.keeper) entries.push({route:'dev/profile',title:state.keeper.name,text:state.keeper.about,category:'Profile'});
    searchIndex = prepareSearch(entries);
    searchState = state;
  }
  if (!searchDialog) {
    searchDialog = document.createElement('dialog');
    searchDialog.id = 'site-search-dialog';
    searchDialog.setAttribute('aria-labelledby','site-search-title');
    searchDialog.innerHTML = `<div class="dialog-top"><h2 id="site-search-title">Search The Site</h2><button class="icon-button" data-search-close aria-label="Close search">×</button></div><label for="site-search-input">Pages, settings, traits, colors, zones, and horses</label><input type="search" id="site-search-input" placeholder="Try natural gold, selling price, or a horse name…" autocomplete="off"><p role="status" id="site-search-status"></p><div class="site-search-results"></div>`;
    document.body.append(searchDialog);
    searchDialog.querySelector('input').addEventListener('input',() => { clearTimeout(searchTimer); searchTimer = setTimeout(updateSiteSearch,120); });
    searchDialog.addEventListener('click',event => {
      if (event.target.closest('[data-search-close]')) searchDialog.close();
      const button = event.target.closest('[data-search-result]');
      if (!button) return;
      const result = searchResults[Number(button.dataset.searchResult)];
      pendingSearchResult = result;
      searchDialog.close();
      if (route === result.route) navigate(); else location.hash = result.route;
    });
  }
  searchDialog.showModal();
  updateSiteSearch();
  searchDialog.querySelector('input').focus();
}
function updateSiteSearch() {
  const query = searchDialog.querySelector('input').value;
  searchResults = searchEntries(searchIndex,query);
  searchDialog.querySelector('#site-search-status').textContent = !query.trim() ? 'Type keywords to search the whole site.' : searchResults.length ? `${searchResults.length} results${searchResults.length === 60 ? ' · showing the first 60; add words to narrow your search' : ''}` : 'No matches. Try a name, color, trait, or setting.';
  searchDialog.querySelector('.site-search-results').innerHTML = searchResults.map((result,index) => `<button class="site-search-result" data-search-result="${index}"><strong>${e(result.title)}</strong><small>${e(result.category)} · ${e(routeTitle(result.route,locationsFor(catalog,state)))}</small></button>`).join('');
}
function readZoneForm(form) {
  const values = new FormData(form);
  return { id: form.dataset.id || undefined, name: values.get('name'), subtitle: locationsFor(catalog,state).find(l => l.id === form.dataset.id)?.subtitle || '',
    description: values.get('description'), atmosphere: values.get('atmosphere'),
    creatures:values.getAll('speciesPool').map(name => {const sp = catalog.species.find(s => s.name === name); return {speciesId:sp.id,weight:Number(values.get(`weight:${sp.id}`))};}),
    tags: String(values.get('tags') || '').split(/\r?\n/).map(tag => tag.trim()).filter(Boolean),
    enabled: form.elements.enabled.checked, event: form.elements.event.checked, speciesPool: values.getAll('speciesPool'), palettePool: values.getAll('palettePool') };
}
function showZoneDraft(draft) {
  main.innerHTML = zoneEditorPage(catalog, state, draft);
  copyEditor.attach(main);
  trackForms(main);
  if (!draft.id && draft.name) restoreBaseline($('#zone-form'),'unsaved-generated-draft');
  $('#zone-form input[name="name"]').focus({ preventScroll: true });
  $('#zone-form').scrollIntoView({ block: 'start' });
}
function showDefinition(kind, draft) {
  if (kind === 'mutations') {
    mutationEditor.open(draft);
    trackForms(mutationEditor.dialog);
    return;
  }
  if (kind === 'personalities') {
    render();
    personalityCreation.setAttribute('aria-label',draft.id ? 'Edit Personality' : 'Create Personality');
    personalityCreation.innerHTML = personalityForm(draft);
    if (!personalityCreation.open) personalityCreation.showModal();
    trackForms(personalityCreation);
    personalityCreation.querySelector('[name=name]').focus();
    return;
  }
  if (kind === 'eyes') {
    eyeEditor.open(draft);
    trackForms(eyeEditor.dialog);
    if (!draft?.id && draft?.name) restoreBaseline(eyeEditor.dialog.querySelector('#definition-form'),'new-eye-draft');
    return;
  }
  main.innerHTML = libraryEditorPage(kind, catalog, state, draft);
  copyEditor.attach(main);
  trackForms(main);
  if (!draft.id && draft.name) restoreBaseline($('#definition-form'),'unsaved-duplicate-draft');
  $('#definition-form input[name="name"]')?.focus({ preventScroll: true });
}
function inspect(id) {
  const horse = findHorse(id);
  if (!horse) return;
  const currentTab = profile.dataset.horseId === id ? profile.querySelector('[data-profile-tab][aria-selected="true"]')?.dataset.profileTab : 'overview';
  profile.dataset.horseId = id;
  const rankColor = raritySettings(catalog).colors[horseCardRank(horse,catalog).key];
  // Reapply on every horse so an unranked profile cannot inherit the previous border.
  profile.toggleAttribute('data-rarity-border',Boolean(rankColor));
  if (rankColor) profile.style.setProperty('--profile-rarity-color',rankColor);
  else profile.style.removeProperty('--profile-rarity-color');
  profile.innerHTML = profileContent(horse, state, {catalog});
  selectProfileTab(profile,currentTab || 'overview');
  profileCopyEditor.attach(profile);
  trackForms(profile);
  if (!profile.open) profile.showModal();
}
function closeMenu() {
  document.body.classList.remove('nav-open');
  $('.workspace').inert = false;
  if (matchMedia('(max-width: 900px)').matches) $('#sidebar').inert = true;
  $('.mobile-menu')?.setAttribute('aria-expanded', 'false');
}
function syncResponsiveMenu() {
  const mobile = matchMedia('(max-width: 900px)').matches;
  const opened = document.body.classList.contains('nav-open');
  $('#sidebar').inert = mobile && !opened;
  $('.workspace').inert = mobile && opened;
}
function askToSell(id) {
  confirmation.classList.remove('eye-delete-confirm');
  const horse = findHorse(id);
  confirmation.innerHTML = `<div class="dialog-top"><span class="eyebrow">A FOND FAREWELL</span><button class="icon-button" data-action="cancel-sell" aria-label="Cancel sale">${icon('close')}</button></div><h2 id="confirm-title">Sell ${e(horse.name || horse.species)}?</h2><p>You’ll receive <strong>${number(horseSalePrice(horse,state.settings).total)} gold</strong>. This horse will leave your care, and its full profile will be kept in your sold-horse history.</p>${saleQuoteBreakdown(horseSalePrice(horse,state.settings))}<div class="form-actions"><button class="button secondary" data-action="cancel-sell" autofocus>Keep this horse</button><button class="button primary" data-action="confirm-sell" data-id="${id}">Sell horse</button></div>`;
  confirmation.showModal();
}
function updateAvatarPreview() {
  const form = $('#keeper-form');
  if (!form) return;
  const seed = Number(form.elements.avatarSeed.value);
  $('#keeper-preview').innerHTML = avatarSVG(seed);
  form.querySelectorAll('[data-seed]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.seed) === seed)));
  updateFormState(form);
}
function askToDelete(type, payload, name, detail, verb = type === 'delete-profile' ? 'Reset' : 'Delete') {
  pendingDeletion = {type,payload};
  confirmation.classList.toggle('eye-delete-confirm',type === 'delete-definition' && ['eyes','mutations'].includes(payload.kind));
  confirmation.innerHTML = `<div class="dialog-top"><h2 id="confirm-title">${verb} ${e(name)}?</h2></div><p class="delete-warning">${e(detail)} This is saved immediately. The previous save is kept in your backup folder.</p><div class="form-actions"><button class="button secondary" data-action="cancel-delete" autofocus>${verb === 'Release' ? 'No' : 'Keep It'}</button><button class="button primary" data-action="confirm-delete">${verb === 'Release' ? 'Yes' : `Confirm ${verb}`}</button></div>`;
  confirmation.showModal();
}
function updateStableSort(direction = $('[data-action="sort-direction"]')?.dataset.direction) {
  const toggle = $('[data-action="sort-direction"]');
  toggle.dataset.direction = direction;
  const label = direction === 'asc' ? 'Ascending order. Switch to descending' : 'Descending order. Switch to ascending';
  toggle.setAttribute('aria-label',label);
  toggle.title = label;
  $('#collection-grid').innerHTML = collectionCards(route.split('/')[1],state,$('#horse-search').value,$('#horse-sort').value,catalog,direction);
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button || busy) return;
  const { action: intent, id } = button.dataset;
  if (intent === 'wilds-home') {button.closest('details').open=true;openGroups.add('Wilds');return;}
  if (intent === 'sort-direction') {updateStableSort(button.dataset.direction === 'asc' ? 'desc' : 'asc'); return;}
  if (intent === 'eye-sort-direction') {
    button.dataset.direction = button.dataset.direction === 'asc' ? 'desc' : 'asc';
    updateEyeGrid(main,catalog);
    return;
  }
  if (intent === 'mutation-sort-direction') {
    button.dataset.direction = button.dataset.direction === 'asc' ? 'desc' : 'asc';
    updateMutationGrid(main,catalog);
    return;
  }
  if (intent === 'choose-avatar') {
    $('#keeper-form').elements.avatarSeed.value = button.dataset.seed;
    updateAvatarPreview();
    return;
  }
  if (intent === 'cancel-delete') { pendingDeletion = null; confirmation.close(); return; }
  if (intent === 'delete-profile') return askToDelete('delete-profile',{},'Profile','Reset your display name, About Me, and avatar. Horses and progress stay unchanged.');
  if (intent === 'delete-horse') {
    const owned = state.horses.some(h => h.id === id);
    if (!owned && !state.sold.some(h => h.id === id)) return;
    return askToDelete('delete-horse',{id},findHorse(id)?.name || findHorse(id)?.species || 'Horse',owned ? 'Release this horse from your stable. Releasing gives no gold.' : 'Remove this horse from the sold archive. This does not reverse the sale.',owned ? 'Release' : 'Delete');
  }
  if (intent === 'delete-zone') return askToDelete('delete-zone',{id},locationsFor(catalog,state).find(z => z.id === id)?.name || 'Zone','Remove this zone and its wild encounters. Collected horses and sold records stay unchanged.');
  if (intent === 'delete-definition') {
    const kind = button.dataset.kind;
    if (kind === 'mutations') return askToDelete('delete-definition',{kind,id},catalog.mutations.find(m => m.id === id)?.name || 'Mutation','Remove this mutation from future spawns. Existing horses keep their saved mutations.');
    if (kind === 'eyes') return askToDelete('delete-definition',{kind,id},catalog.eyes.find(eye => eye.id === id)?.name || 'Eye Color','Remove this eye color from future spawns. Existing horses keep their saved eye colors.');
    return askToDelete('delete-definition',{kind,id},catalog[kind].find(d => d.id === id)?.name || 'Entry','Remove this option from future use. Existing horse details stay unchanged. Matching zone pools are updated; zones with empty pools close. Deleted atmospheres use a remaining atmosphere, item themes are cleared, and a deleted active website theme returns to Original.');
  }
  if (intent === 'import-horse') return horseTransfers.importHorse();
  if (intent === 'export-horse') return horseTransfers.exportHorse(id);
  if (intent === 'site-search') return openSiteSearch();
  if (intent === 'catch') return horseDialogs.open(id,'catch');
  if (intent === 'edit-horse-text') {
    const form = profile.querySelector('#' + button.dataset.form);
    if (!form) return;
    button.hidden = true;
    form.hidden = false;
    form.querySelector('textarea').focus();
    return;
  }
  if (intent === 'rename-horse') return startHorseRename(button,{horse:findHorse(id),save:action,onSaved:render,notify});
  if (intent === 'edit-horse-field') return horseDialogs.open(id,'field',button.dataset.field);
  if (intent === 'inspect') return inspect(id);
  if (intent === 'close-profile') return profile.close();
  if (intent === 'cancel-sell') return confirmation.close();
  if (intent === 'sell') return askToSell(id);
  if (intent === 'new-zone') return showZoneDraft(newZoneDraft());
  if (intent === 'edit-zone') return showZoneDraft(locationsFor(catalog, state).find(l => l.id === id));
  if (intent === 'default-rarity-colors') {
    const form = $('#rarity-settings-form');
    for (const key of Object.keys(rarityNames)) {
      form.elements.namedItem(`enabled:${key}`).checked = !!defaultRaritySettings.colors[key];
      const color = defaultRaritySettings.colors[key] || '#8D949E';
      form.elements.namedItem(`color:${key}`).value = color;
      form.querySelector(`[data-color-picker="${key}"]`).value = color;
    }
    updateFormState(form);
    return;
  }
  if (intent === 'close-personality-editor') return closePersonalityEditor($('#definition-form'),()=>{if (personalityCreation.open) personalityCreation.close(); else render();});
  if (intent === 'new-definition') return showDefinition(button.dataset.kind, draftDefinition(button.dataset.kind));
  if (intent === 'edit-definition') return showDefinition(button.dataset.kind, catalog[button.dataset.kind].find(d => d.id === id));
  if (intent === 'duplicate-definition') {
    const kind = button.dataset.kind, copy = structuredClone(catalog[kind].find(d => d.id === id));
    delete copy.id;
    let suffix = 1, name = `${copy.name.slice(0, 65)} copy`;
    while (catalog[kind].some(d => d.name.toLowerCase() === name.toLowerCase())) name = `${copy.name.slice(0, 65)} copy ${++suffix}`;
    copy.name = name;
    if (copy.systemId) {
      const base = copy.systemId.slice(0,85);
      let suffix = 1, id = `${base}-copy`;
      while (catalog[kind].some(d => d.systemId === id)) id = `${base}-copy-${++suffix}`;
      copy.systemId = id;
    }
    return showDefinition(kind, copy);
  }
  if (intent === 'add-trait-category') {
    $('#trait-rows').insertAdjacentHTML('beforeend', traitRow());
    $('#trait-rows').lastElementChild.querySelector('input').focus();
    updateFormState($('#traits-form') || $('#definition-form'));
    return;
  }
  if (intent === 'remove-trait-category') {
    button.closest('.trait-editor-row').remove();
    updateFormState($('#traits-form') || $('#definition-form'));
    return;
  }
  if (intent === 'add-eye-color') {
    const rows = [...$('#eye-color-rows').children];
    if (rows.length >= 6) return notify('You can combine up to six eye colors.', true);
    const key = crypto.randomUUID();
    $('#eye-color-rows').insertAdjacentHTML('beforeend', `<div class="eye-color-row">${colorControl(key, '#8A689E', 'Additional eye color')}<button class="text-button" type="button" data-action="remove-eye-color">Remove color</button></div>`);
    updateFormState($('#traits-form') || $('#definition-form'));
    return;
  }
  if (intent === 'remove-eye-color') {
    if ($('#eye-color-rows').querySelectorAll('.eye-color-row').length === 1) return;
    button.closest('.eye-color-row').remove();
    const tile = $('#eye-color-rows').querySelector('.eye-add-tile');
    if (tile) tile.hidden = false;
    labelEyeColors($('#eye-color-rows'));
    updateFormState($('#traits-form') || $('#definition-form'));
    return;
  }
  if (intent === 'random-zone') {
    const editingId = $('#zone-form').dataset.id;
    const baseline = formBaseline($('#zone-form'));
    showZoneDraft({ ...randomZone(catalog, locationsFor(catalog, state)), ...(editingId ? { id: editingId } : {}) });
    restoreBaseline($('#zone-form'),baseline);
    $('#zone-status').textContent = 'A new idea is ready. Adjust anything you like, then save your zone.';
    return;
  }
  if (intent === 'menu') {
    const opened = document.body.classList.toggle('nav-open');
    syncResponsiveMenu();
    button.setAttribute('aria-expanded', String(opened));
    if (opened) $('#sidebar a').focus();
    return;
  }
  if (intent === 'defaults') {
    const form = button.closest('form');
    for (const [name, value] of Object.entries(defaults)) {
      const input = form.elements.namedItem(name);
      if (!input) continue;
      if (input.type === 'checkbox') input.checked = value; else input.value = value;
    }
    if (form.id === 'settings-form') form.elements.ALLOW_DUPLICATE_MUTATIONS.checked = defaultSpawnSettings.ALLOW_DUPLICATE_MUTATIONS;
    if (form.id === 'economy-form') for (const [key,value] of Object.entries(defaults.saleModifiers || defaultSaleModifiers)) form.elements.namedItem(`saleModifier:${key}`).value = value;
    updateFormState(form);
    form.querySelector('[role=status]').textContent = 'Defaults loaded into the form. Save settings to apply, or cancel to keep your current values.';
    return;
  }
  busy = true;
  button.disabled = true;
  try {
    if (intent === 'confirm-delete') {
      if (!pendingDeletion) return;
      await action(pendingDeletion.type,pendingDeletion.payload);
      personalityCreation.close();
      eyeEditor.dialog.close();
      mutationEditor.dialog.close();
      pendingDeletion = null;
      confirmation.close();
      profile.close();
      render();
      notify('Removed and saved.');
    } else if (intent === 'toggle-copy-mode') {
      await action('developer-edit-mode', { enabled:!state.settings.developerEditMode });
      render();
      if (profile.open) inspect(profile.dataset.horseId);
      notify(state.settings.developerEditMode ? 'Edit mode enabled. Use the pencils beside page text.' : 'Edit mode closed. Unsaved drafts remain available until you reload.');
    } else if (intent === 'apply-theme' || intent === 'theme-mode') {
      await action('website-theme', { id:intent === 'theme-mode' ? state.settings.websiteTheme || 'default' : id, mode:intent === 'theme-mode' ? button.dataset.mode : state.settings.websiteThemeMode || 'dark' });
      render();
      (intent === 'theme-mode' ? main.querySelector(`[data-action="theme-mode"][data-mode="${button.dataset.mode}"]`) : main.querySelector(`[data-action="apply-theme"][data-id="${id}"]`))?.focus({ preventScroll: true });
      notify('Your website theme is saved.');
    } else if (intent === 'search') {
      await action('search', { locationId: route.split('/')[1] });
      render();
      main.querySelector('[data-action="search"]')?.focus({ preventScroll: true });
      notify('Fresh hoofprints. New companions are waiting.');
    } else if (intent === 'confirm-sell') {
      await action('sell', { id });
      confirmation.close();
      profile.close();
      render();
      main.focus({ preventScroll: true });
      notify(`A fond farewell. ${number(state.sold.find(h => h.id === id).soldFor)} gold added.`);
    } else if (intent === 'favorite') {
      const search = $('#horse-search')?.value || '';
      const sort = $('#horse-sort')?.value || 'recent';
      const direction = $('[data-action="sort-direction"]')?.dataset.direction;
      await action('favorite', { id });
      render();
      if ($('#horse-search')) {
        $('#horse-search').value = search;
        $('#horse-sort').value = sort;
        updateStableSort(direction);
      }
      if (profile.open) {
        inspect(id);
        profile.querySelector('[data-action="favorite"]')?.focus();
      } else main.querySelector(`[data-action="favorite"][data-id="${id}"]`)?.focus({ preventScroll: true });
      notify(findHorse(id).favorite ? 'A special place in your heart.' : 'Removed from favorites.');
    } else if (intent === 'backup') {
      await action('backup');
      render();
      notify('A dated backup was saved in data/backups.');
    }
  } catch (error) { notify(error.message, true); }
  finally { busy = false; button.disabled = false; }
});
const horseTextForms = '#horse-description-form,#horse-notes-form';
function closeHorseText(form) {
  form.hidden = true;
  const display = profile.querySelector(`[data-form="${form.id}"]`);
  if (display) display.hidden = false;
}
function savedHorseText(form) {
  const input = form.querySelector('textarea');
  input.defaultValue = input.value;
  restoreBaseline(form,formSignature(form));
  const display = profile.querySelector(`[data-form="${form.id}"]`);
  display.replaceChildren();
  if (input.value.trim()) display.textContent = input.value;
  else {
    const placeholder = document.createElement('span');
    placeholder.className = 'muted empty-horse-notes';
    placeholder.textContent = form.id === 'horse-notes-form' ? 'Click to add notes' : 'Click to add a description';
    display.append(placeholder);
  }
  closeHorseText(form);
}
function finishHorseText(form) {
  if (!form?.isConnected || form.hidden || busy) return;
  if (formSignature(form) === formBaseline(form)) closeHorseText(form);
  else form.requestSubmit();
}
profile.addEventListener('focusout',event => {
  const form = event.target.closest(horseTextForms);
  if (form) setTimeout(() => {
    if (!form.contains(document.activeElement)) finishHorseText(form);
  },0);
});
profile.addEventListener('keydown',event => {
  const form = event.target.closest(horseTextForms);
  if (form && event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    finishHorseText(form);
  }
});
document.addEventListener('submit', async event => {
  const form = event.target;
  if (!['horse-description-form', 'horse-notes-form', 'keeper-form', 'spawn-settings-form', 'gold-form', 'economy-form', 'settings-form', 'zone-form', 'definition-form', 'traits-form', 'rarity-settings-form'].includes(form.id)) return;
  event.preventDefault();
  if (busy) return;
  busy = true;
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;
  try {
    if (['economy-form','settings-form'].includes(form.id)) validateSettingsNumbers(form);
    const values = Object.fromEntries(new FormData(form));
    if (form.id === 'rarity-settings-form') {
      await action('rarity-settings',readRaritySettings(form));
      render();
      notify('Rarity colors saved.');
    } else if (form.id === 'traits-form') {
      const payload = readTraitsForm(form);
      await action('save-traits',payload);
      main.innerHTML = traitsEditorPage(catalog,payload.id);
      trackForms(main);
      notify('Traits saved.');
    } else if (form.id === 'spawn-settings-form') {
      await action('spawn-settings',{ALLOW_DUPLICATE_MUTATIONS:form.elements.ALLOW_DUPLICATE_MUTATIONS.checked});
      render();
      notify('Spawning configuration saved.');
    } else if (form.id === 'horse-description-form') {
      await action('horse-description',{id:form.dataset.id,description:values.description});
      savedHorseText(form);
      notify('Description saved.');
    } else if (form.id === 'horse-notes-form') {
      await action('horse-notes',{id:form.dataset.id,notes:values.notes});
      savedHorseText(form);
      notify('Horse notes saved.');
    } else if (form.id === 'keeper-form') {
      await action('save-profile', {name:values.name,about:values.about,avatarSeed:Number(values.avatarSeed)});
      render();
      notify('Profile saved.');
    } else if (form.id === 'economy-form') {
      await action('economy-settings',{gold:Number(values.gold),sellingPrice:Number(values.sellingPrice),saleModifiers:Object.fromEntries(Object.keys(defaultSaleModifiers).map(key => [key,Number(values[`saleModifier:${key}`])]))});
      render();
      notify('Saved successfully.');
    } else if (form.id === 'gold-form') {
      await action('current-gold', { gold:Number(values.gold) });
      render();
      notify('Current gold balance saved.');
    } else if (form.id === 'definition-form') {
      const payload = readDefinitionForm(form);
      if (payload.kind === 'species') payload.values.traits = catalog.species.find(s => s.id === payload.id)?.traits || {};
      validateDefinition(payload.kind, payload.values);
      await action('save-definition', payload);
      renderChrome();
      const saved = catalog[payload.kind].find(d => payload.id ? d.id === payload.id : d.name === payload.values.name.trim() && (payload.kind !== 'mutations' || d.type === payload.values.type.trim()));
      if (payload.kind === 'eyes') { eyeEditor.dialog.close(); render(); }
      else if (payload.kind === 'mutations') {mutationEditor.dialog.close();render();}
      else if (payload.kind === 'personalities') {personalityCreation.close();render();}
      else showDefinition(payload.kind, saved);
      if ($('#definition-status')) $('#definition-status').textContent = payload.kind === 'siteThemes' ? 'Theme saved. Select it above to apply it to the website.' : payload.kind === 'atmospheres' ? 'Atmosphere saved. Choose it in a zone to use it.' : ['items','themes'].includes(payload.kind) ? 'Definition saved. Gameplay effects and rewards remain planned.' : 'Saved to the local configuration files. Future spawns use this definition.';
      notify('Your new possibilities are saved.');
    } else if (form.id === 'zone-form') {
      const draft = readZoneForm(form);
      validateZone(draft, catalog);
      await action('save-zone', draft);
      renderChrome();
      const saved = state.customLocations.find(l => l.id === draft.id || l.name === draft.name.trim());
      showZoneDraft(saved);
      $('#zone-status').textContent = saved.enabled ? 'Saved! Your zone is now in the Wilds navigation and the atlas below.' : 'Saved as a closed zone. Enable exploration whenever you are ready.';
      notify('Your new corner of the world is saved.');
    } else if (form.id === 'settings-form') {
      await action('settings', {
        horsesPerSearch: Number(values.horsesPerSearch ?? state.settings.horsesPerSearch), sellingPrice: Number(values.sellingPrice ?? state.settings.sellingPrice),
        startingGold: Number(values.startingGold ?? state.settings.startingGold), stableCapacity: Number(values.stableCapacity ?? state.settings.stableCapacity),
        ignoreStableLimit: form.elements.ignoreStableLimit?.checked ?? state.settings.ignoreStableLimit,
        ALLOW_DUPLICATE_MUTATIONS:form.elements.ALLOW_DUPLICATE_MUTATIONS.checked
      });
      render();
      notify('Saved successfully.');

    }
  } catch (error) {
    if (form.id === 'zone-form' && $('#zone-status')) $('#zone-status').textContent = error.message;
    if (form.id === 'definition-form' && $('#definition-status')) $('#definition-status').textContent = error.message;
    notify(error.message, true);
  }
  finally { busy = false; if (submit) submit.disabled = false; }
});
document.addEventListener('input', event => {
  if (event.target.id === 'horse-grid-size') {
    const count = Number(event.target.value);
    if ([3,4,5,6].includes(count)) {
      stableGridColumns = count;
      $('#horse-grid-value').textContent = count;
      event.target.closest('.stable-grid-slider').style.setProperty('--grid-position',`${(count-3)/3*100}%`);
      event.target.setAttribute('aria-valuetext',`${count} horses per row`);
      $('#collection-grid').style.setProperty('--stable-grid-columns',count);
    }
  }

  if (event.target.matches('[data-color-picker]')) {
    event.target.closest('.color-inputs').querySelector('[data-color-hex]').value = event.target.value.toUpperCase();
  }
  if (event.target.matches('[data-color-hex]') && /^#[\da-f]{6}$/i.test(event.target.value)) {
    event.target.closest('.color-inputs').querySelector('[data-color-picker]').value = event.target.value;
  }
  updateFormState(event.target.form);
  if (event.target.id === 'eye-search') updateEyeGrid(main,catalog);
  if (event.target.id === 'definition-search') {
    const query = event.target.value.trim().toLowerCase();
    let matches = 0;
    for (const item of main.querySelectorAll('.definition-list-item')) {
      item.hidden = !item.dataset.search.includes(query);
      if (!item.hidden) matches++;
    }
    $('#definition-no-results').hidden = matches > 0;
  }
  if (event.target.closest('#zone-form')) $('#zone-preview').innerHTML = zonePreview(readZoneForm($('#zone-form')), catalog);
  if (event.target.id === 'horse-search') updateStableSort();
  if (event.target.id === 'mutation-search') updateMutationGrid(main,catalog);
});
document.addEventListener('change', event => {
  if (event.target.id === 'mutation-sort') main.querySelector('[data-action="mutation-sort-direction"]').dataset.direction = event.target.value === 'weight' ? 'desc' : 'asc';
  if (['mutation-type','mutation-sort','mutation-weights'].includes(event.target.id)) updateMutationGrid(main,catalog);
  if (event.target.id === 'eye-sort') main.querySelector('[data-action="eye-sort-direction"]').dataset.direction = 'asc';
  if (['eye-rarity','eye-sort','eye-percent'].includes(event.target.id)) updateEyeGrid(main,catalog);
  if (event.target.id === 'traits-species') {main.innerHTML = traitsEditorPage(catalog,event.target.value); trackForms(main); return;}
  updateFormState(event.target.form);
  if (event.target.id === 'horse-sort') updateStableSort(['recent','rarity','favorites'].includes(event.target.value) ? 'desc' : 'asc');
});
document.addEventListener('reset', event => {
  if (event.target.id === 'traits-form') {
    event.preventDefault();
    main.innerHTML = traitsEditorPage(catalog,event.target.dataset.id);
    trackForms(main);
    return;
  }
  if (['horse-description-form','horse-notes-form'].includes(event.target.id)) {
    event.target.hidden = true;
    profile.querySelector(`[data-form="${event.target.id}"]`).hidden = false;
  }
  setTimeout(() => { updateFormState(event.target); if (event.target.id === 'keeper-form') updateAvatarPreview(); },0);
  if (['settings-form','economy-form'].includes(event.target.id)) event.target.querySelector('[role=status]').textContent = '';
  if (event.target.id === 'zone-form') {
    event.preventDefault();
    showZoneDraft(locationsFor(catalog, state).find(l => l.id === event.target.dataset.id) || newZoneDraft());
  }
  if (event.target.id === 'definition-form') {
    event.preventDefault();
    const kind = event.target.dataset.kind;
    showDefinition(kind, catalog[kind].find(d => d.id === event.target.dataset.id) || draftDefinition(kind));
  }
});
$('.scrim').addEventListener('click', closeMenu);
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!document.querySelector('dialog[open]')) openSiteSearch(); }
  if (event.key === 'Tab' && document.body.classList.contains('nav-open') && matchMedia('(max-width: 900px)').matches) {
    const focusable = [...$('#sidebar').querySelectorAll('a, summary')].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
    closeMenu();
    $('.mobile-menu').focus();
  }
});
for (const dialog of [profile, confirmation]) dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
matchMedia('(max-width: 900px)').addEventListener('change', syncResponsiveMenu);
window.addEventListener('hashchange', navigate);
try {
  ({ state, catalog, defaults, appVersion } = await request('/api/state'));
  await navigate({refreshSpawns:true});
  syncResponsiveMenu();
} catch (error) {
  main.innerHTML = `<section class="panel"><h1>The sanctuary couldn’t open</h1><p>${e(error.message)}</p><p>Check that the local server is running, then reload this page. Existing save files have been preserved.</p><button class="button primary" id="retry-load">Try again</button></section>`;
  $('#retry-load').addEventListener('click', () => location.reload());
}





