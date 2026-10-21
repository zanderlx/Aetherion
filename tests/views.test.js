import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createEncounters } from '../src/encounters.js';
import { wildPage, stablePage, collectionCards, settingsPage, editModePage, libraryPage, savesPage, plannedPage } from '../public/pages.js';
import { profileContent } from '../public/profile.js';
import { groups, sidebar } from '../public/ui.js';
import { locationsFor, newZoneDraft, randomZone, validateZone } from '../public/zones.js';
import { zoneEditorPage } from '../public/zone-editor.js';
import { normalizeCatalog, definitionKinds } from '../public/definitions.js';
import { libraryEditorPage, editorRoutes } from '../public/library-editor.js';
import { keeperPage, avatarSVG } from '../public/keeper.js';
import { roadmapPage } from '../public/roadmap.js';
import { card } from '../public/ui.js';

const catalog = normalizeCatalog(JSON.parse(await readFile(new URL('../data/definitions/catalog.json', import.meta.url), 'utf8')));
const settings = JSON.parse(await readFile(new URL('../data/defaults/settings.json', import.meta.url), 'utf8'));
const horses = createEncounters(catalog, 'aetherion', 3);
const state = { settings, horses: [], sold: [], gold: 0, encounters: { aetherion: horses }, transactions: [], savedAt: new Date().toISOString() };
test('zone tags render as safe text without icons and can be removed', () => {
  const location = {...catalog.locations[0],tags:['The evergreen realm','Free exploration','<script>Quiet</script>']};
  const html = wildPage(location,state);
  const tags = html.match(/<div class="hero-bottom">(.*?)<\/div>/s)[1];
  assert.match(tags,/The evergreen realm/);
  assert.match(tags,/Free exploration/);
  assert.match(tags,/&lt;script&gt;Quiet&lt;\/script&gt;/);
  assert.doesNotMatch(tags,/<svg|<script/);
  assert.match(wildPage({...location,tags:[]},state),/<div class="hero-bottom"><\/div>/);
  const editor = zoneEditorPage(catalog,state);
  assert.match(editor,/name="tags"/);
  assert.match(editor,/The evergreen realm\nFree exploration/);
});
test('wild horses have no deletion control; owned horses can be released', () => {
  assert.doesNotMatch(profileContent(horses[0],state), /data-action="delete-horse"/);
  const owned = profileContent(horses[0],{...state,horses:[horses[0]]});
  assert.match(owned,/Release Horse/);
  assert.doesNotMatch(owned,/Delete Horse/);
  assert.match(owned,/data-action="rename-horse"/);
  assert.match(owned,/horse-notes-form/);
  assert.match(owned,/class="horse-text-display"[^>]*data-form="horse-description-form"/);
  assert.match(owned,/class="horse-text-display"[^>]*data-form="horse-notes-form"/);
  assert.match(owned,/<form hidden id="horse-description-form"/);
  assert.match(owned,/<form hidden id="horse-notes-form"/);
  assert.match(owned,/>Description<\/h3>/);
  assert.doesNotMatch(owned,/>Personality Description<\/h3>/);
  assert.ok(owned.indexOf('horse-notes-form') < owned.indexOf('profile-lower'));
  assert.ok(owned.indexOf('trait.eye-color') < owned.indexOf('trait.' + 'text-'));
  assert.doesNotMatch(owned,/personality-note|Horse notes|Horse ID/);
  assert.doesNotMatch(profileContent(horses[0],state),/horse-notes-form|data-action="sell"/);
  assert.match(owned,/data-action="sell"/);
  assert.doesNotMatch(owned,/rename-form|Give your companion a name/);
  assert.doesNotMatch(profileContent(horses[0],state),/data-action="rename-horse"/);
});
test('horse fields have individual edit controls only in edit mode and notes are escaped', () => {
  const horse = {...horses[0],notes:'</textarea><script>bad</script>'};
  const html = profileContent(horse,{...state,horses:[horse],settings:{...settings,developerEditMode:true}});
  for (const field of ['age','origin','size','birthday','personality','eye']) assert.ok(html.includes(`data-field="${field}"`));
  assert.doesNotMatch(profileContent(horse,state),/data-action="edit-horse-field"/);
  assert.match(html,/&lt;\/textarea&gt;&lt;script&gt;/);
});
test('horse previews and details expose edit targets and the simplified nine-color layout', () => {
  const horse = {...horses[0],birthday:'2020-02-29',palette:{...horses[0].palette,name:'HiddenPaletteName'}};
  const html = profileContent(horse,state);
  assert.match(html,/id="profile-title"/);
  assert.match(html,/02-29-2020/);
  assert.doesNotMatch(html,/HiddenPaletteName|>Return |IN YOUR CARE|A WILD ACQUAINTANCE/);
  assert.ok(html.indexOf('Eye color') > html.indexOf('Traits & little details'));
  assert.doesNotMatch(html,/profile-id-footer|Horse ID/);
  const preview = card(horse,state,'stable');
  assert.equal((preview.match(/--swatch:/g) || []).length,9);
  assert.doesNotMatch(preview,/HiddenPaletteName|A NEW ACQUAINTANCE|In your care/);
  const wild = wildPage(catalog.locations[0],state);
  assert.doesNotMatch(wild,/encounters.count|A CHANCE ENCOUNTER|wandered into the clearing/);
  assert.doesNotMatch(wild,/field-note|stable-shortcut/);
});
test('every navigation destination renders content without undefined values', () => {
  for (const [route] of groups.flatMap(group => group.items)) {
    const [section, page] = route.split('/');
    const html = section === 'wilds' ? wildPage(catalog.locations.find(l => l.id === page), state)
      : route === 'stable/breeding' ? plannedPage(route,state)
      : section === 'stable' ? stablePage(page, state)
      : ['dev/settings', 'dev/economy'].includes(route) ? settingsPage(state)
      : route === 'dev/saves' ? savesPage(state)
      : route === 'dev/edit-mode' ? editModePage(state)
      : route === 'dev/profile' ? keeperPage(state)
      : route === 'dev/roadmap' ? roadmapPage()
      : route === 'dev/locations' ? zoneEditorPage(catalog, state)
      : section === 'dev' && Object.hasOwn(editorRoutes, page) ? libraryEditorPage(editorRoutes[page], catalog, state)
      : plannedPage(route, state);
    assert.match(html, /<h1/, route);
    assert.doesNotMatch(html, /undefined|NaN/, route);
  }
});
test('navigation groups have alphabetized links and profile content safely renders user text', () => {
  assert.deepEqual(groups.find(g => g.title === 'Stables').items.map(item => item[1]),['My Horses','Breeding']);
  assert.equal(groups.some(g => g.title === 'Breeding'),false);
  for (const group of groups.filter(g => g.title !== 'Stables')) assert.deepEqual(group.items.map(item => item[1]),group.items.map(item => item[1]).sort((a,b) => a.localeCompare(b)));
  const html = keeperPage({...state,keeper:{name:'<Keeper>',about:'</textarea><script>bad</script>',avatarSeed:27}});
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/&lt;Keeper&gt;/);
  assert.doesNotMatch(html,/generate-avatar|Generate Avatar/);
  assert.match(html,/Rose avatar/);
  assert.notEqual(avatarSVG(11),avatarSVG(27));
  assert.equal(avatarSVG(11),avatarSVG(11));
});
test('editor guidance is page-specific and the logo inherits theme colors', () => {
  const appearance = libraryEditorPage('siteThemes',catalog,state);
  assert.doesNotMatch(appearance,/Existing horses keep|Horse coat colors/);
  assert.match(appearance,/apply it throughout the website/);
  const atmosphere = libraryEditorPage('atmospheres',catalog,state);
  assert.match(atmosphere,/zone editor to apply/);
  const nav = sidebar('dev/appearance',state,new Set(),catalog);
  assert.match(nav,/class="brand-logo"/);
  assert.match(nav,/fill="var\(--gold\)"/);
  assert.match(nav,/fill="var\(--panel-deep\)"/);
});
test('economy and game settings display only their relevant fields', () => {
  const economy = settingsPage(state,true), game = settingsPage(state,false);
  assert.match(economy,/name="sellingPrice"/);
  assert.doesNotMatch(economy,/name="horsesPerSearch"|name="stableCapacity"/);
  assert.match(game,/name="horsesPerSearch"/);
  assert.doesNotMatch(game,/name="sellingPrice"|name="startingGold"/);
});
test('edit mode has one dedicated page and economy exposes the actual gold balance', () => {
  assert.doesNotMatch(settingsPage(state), /toggle-copy-mode/);
  assert.doesNotMatch(settingsPage(state,true), /toggle-copy-mode/);
  assert.match(editModePage(state), /data-action="toggle-copy-mode"/);
  assert.match(settingsPage({...state,gold:12345},true), /name="gold"[^>]+value="12345"/);
});
test('wild view has three inspectable illustrations and explicit preview labeling', () => {
  const html = wildPage(catalog.locations[0], state);
  assert.equal((html.match(/class="horse-card"/g) || []).length, 3);
  assert.match(html, /not final spawn odds/);
  assert.match(html, /ILLUSTRATIVE PLACEHOLDER/);
});
test('horse profile escapes names and preserves source traits and all nine color regions', () => {
  const horse = { ...horses[0], name: '<img src=x onerror=alert(1)>', caughtAt: new Date().toISOString() };
  const html = profileContent(horse, { ...state, horses: [horse] });
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /Mane/);
  assert.match(html, /Tail/);
  assert.match(html, /Eye color/);
  assert.match(html, /Awaiting species data/);
  for (const region of Object.keys(horse.palette.colors)) assert.ok(html.includes(region));
});
test('collection search, sorting and favorites work with complete saved records', () => {
  const collected = horses.map((h, i) => ({ ...h, name: ['Willow', 'Ash', 'Moss'][i], favorite: i === 1, caughtAt: new Date().toISOString() }));
  const populated = { ...state, horses: collected };
  const filtered = collectionCards('all', populated, 'willow');
  assert.match(filtered, /Willow/);
  assert.doesNotMatch(filtered, /<h3><button[^>]*>Ash</);
  const favorites = collectionCards('favorites', populated);
  assert.equal((favorites.match(/class="horse-card"/g) || []).length, 1);
  const favoriteSorted = collectionCards('all', populated, '', 'favorites');
  assert.equal((favoriteSorted.match(/class="horse-card"/g) || []).length,3);
  assert.ok(favoriteSorted.indexOf('>Ash<') < favoriteSorted.indexOf('>Willow<'));
  assert.ok(favoriteSorted.indexOf('>Ash<') < favoriteSorted.indexOf('>Moss<'));
  assert.match(card(collected[1],populated,'stable'),/aria-pressed="true"/);
  assert.doesNotMatch(profileContent(collected[1],populated),/data-action="favorite"/);
  const page = stablePage('all',populated);
  assert.match(page,/>My Horses<\/h1>/);
  assert.match(page,/<option value="favorites">Favorites<\/option>/);
  assert.doesNotMatch(page,/A place to call home|A growing collection|Explore the wilds/);
  assert.doesNotMatch(card(collected[0],populated),/picture-badge|Preview encounter/);
  const sorted = collectionCards('all', populated, '', 'name');
  assert.ok(sorted.indexOf('>Ash<') < sorted.indexOf('>Willow<'));
});
test('active sidebar destination is exposed to assistive technology', () => {
  const html = sidebar('wilds/aetherion', state, new Set(['Wilds']));
  assert.match(html, /href="#wilds\/aetherion" aria-current="page"/);
  assert.match(html, /data-group="Wilds" open/);
});
test('custom zones appear in navigation and wild pages with safe text; disabled zones stay hidden', () => {
  const zone = { ...newZoneDraft(), id: 'zone-test', name: '<script>magic</script>', description: 'Moon & stars', custom: true, atmosphere: 'moonlit' };
  const populated = { ...state, customLocations: [zone, { ...zone, id: 'zone-hidden', name: 'Hidden', enabled: false }] };
  const locations = locationsFor(catalog, populated);
  const nav = sidebar('wilds/zone-test', populated, new Set(), catalog);
  assert.match(nav, /href="#wilds\/zone-test" aria-current="page"/);
  assert.doesNotMatch(nav, /#wilds\/zone-hidden|<script>/);
  const html = wildPage(zone, populated, locations);
  assert.match(html, /hero moonlit/);
  assert.match(html, /&lt;script&gt;magic&lt;\/script&gt;/);
  assert.doesNotMatch(html, /#wilds\/zone-hidden/);
  const editor = zoneEditorPage(catalog, populated, zone);
  assert.match(editor, /Generate random zone/);
  assert.match(editor, /name="speciesPool"/);
  assert.doesNotMatch(editor, /<script>/);
});
test('random zone drafts are valid, varied, editable data and avoid duplicate names', () => {
  const existing = locationsFor(catalog);
  const names = new Set();
  for (let i = 0; i < 100; i++) {
    const zone = randomZone(catalog, existing);
    assert.doesNotThrow(() => validateZone(zone, catalog));
    assert.equal(new Set(zone.speciesPool).size, zone.speciesPool.length);
    assert.equal(new Set(zone.palettePool).size, zone.palettePool.length);
    names.add(zone.name);
    existing.push(zone);
  }
  assert.equal(names.size, 100);
  const same = randomZone(catalog, [], () => 0);
  assert.notEqual(randomZone(catalog, [same], () => 0).name, same.name);
});
test('all existing definitions and blank editor forms render without missing values', () => {
  for (const kind of Object.keys(definitionKinds)) {
    for (const draft of [undefined, ...catalog[kind]]) {
      const html = libraryEditorPage(kind, catalog, state, draft);
      assert.match(html, /id="definition-form"/);
      assert.doesNotMatch(html, /undefined|NaN/, `${kind}: ${draft?.name || 'new'}`);
    }
  }
});


