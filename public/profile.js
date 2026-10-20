import { escapeHTML as e, icon, number } from './ui.js';
import { horseArt } from './art.js';
import { displayBirthday } from './dates.js';

export function profileContent(horse, state) {
  const collected = state.horses.some(h => h.id === horse.id);
  const sold = state.sold.some(h => h.id === horse.id);
  return `<div class="dialog-top">${sold ? '<span class="eyebrow">FROM THE ARCHIVES</span>' : ''}<button class="icon-button" data-action="close-profile" aria-label="Close horse profile">${icon('close')}</button></div>
  <div class="profile-grid"><div class="profile-art">${horseArt(horse, true)}<span class="art-caption">ILLUSTRATIVE PLACEHOLDER · NOT EXACT SPECIES ART</span><div class="profile-palette"><span class="eyebrow">HORSE COLORS</span><div class="color-regions">${Object.entries(horse.palette.colors).map(([name, color]) => `<div><span style="background:${color}" title="${color}"></span><small>${e(name)}</small><code>${color}</code></div>`).join('')}</div></div></div>
  <div class="profile-info"><span class="badge">Phase 1 sample · ${horse.specialSpawn || 'No special spawn'}</span><h2 id="profile-title">${e(horse.name || horse.species)}</h2><p class="muted">${e(horse.species)} · ${horse.gender === 'Female' ? '♀ Female' : '♂ Male'}</p>
  <dl class="horse-facts">${[['Age', horse.age], ['Origin', horse.origin], ['Size', `${horse.size} (${horse.sizePercent}%)`], ['Birthday', displayBirthday(horse.birthday)], ['Personality', horse.personality.name]].map(([label, value]) => `<div><dt>${label}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>
  <div class="personality-note"><h3>${icon('leaf')} ${e(horse.personality.name)} at heart</h3><p>${e(horse.personality.description)}</p><small>Source personality description; behavior effects are not simulated.</small></div>
  ${collected ? `<form id="rename-form" data-id="${horse.id}"><label for="horse-name">Give your companion a name</label><div class="rename-controls"><input id="horse-name" name="name" maxlength="60" placeholder="${e(horse.species)}" value="${e(horse.name)}"><button class="button secondary" type="submit">Save name</button></div></form>` : ''}</div></div>
  <div class="profile-lower"><section><h3>Traits & little details</h3>${!horse.traitsComplete ? '<p class="data-warning">This species has no supplied trait list yet. Mane and tail are explicitly unassigned placeholders.</p>' : ''}<dl class="trait-list">${Object.entries(horse.traits).map(([name, values]) => `<div><dt>${e(name)}</dt><dd>${values.length ? values.map(e).join(', ') : 'None'}</dd></div>`).join('')}<div><dt>Eye color</dt><dd>${e(horse.eye.name)}</dd></div></dl></section><section><h3>Mutations</h3><div class="mutation-empty">${icon('spark')}<span>No mutations in this preview sample.<small>Probability-based generation arrives in Phase 2.</small></span></div></section></div>
  <div class="profile-actions">${sold ? `<span class="gold-text">Sold for ${number(horse.soldFor)} gold · ${e(new Date(horse.soldAt).toLocaleDateString())}</span>` : `${collected ? `<button class="button secondary" data-action="favorite" data-id="${horse.id}">${icon('heart')} ${horse.favorite ? 'Unfavorite' : 'Favorite'}</button>` : `<button class="button primary" data-action="catch" data-id="${horse.id}">${icon('stable')} Bring to my stable</button>`}<button class="button secondary" data-action="sell" data-id="${horse.id}">${icon('coin')} Sell for ${number(state.settings.sellingPrice)} gold</button>`}<button class="text-button" data-action="delete-horse" data-id="${horse.id}">Delete Horse</button></div><p class="horse-id profile-id-footer">Horse ID<br><code>${e(horse.id)}</code></p>`;
}








