import { escapeHTML as e, icon, number } from './ui.js';
import { horseArt } from './art.js';
import { displayBirthday } from './dates.js';
import { copyKey } from './page-copy.js';

export function profileContent(horse, state) {
  const collected = state.horses.some(h => h.id === horse.id);
  const editField = field => state.settings.developerEditMode ? `<button class="icon-button horse-field-pencil" data-copy-skip data-action="edit-horse-field" data-id="${horse.id}" data-field="${field}" aria-label="Edit ${field}">&#9998;</button>` : '';
  const sold = state.sold.some(h => h.id === horse.id);
  return `<div class="dialog-top">${sold ? '<span class="eyebrow">FROM THE ARCHIVES</span>' : ''}<button class="icon-button" data-action="close-profile" aria-label="Close horse profile">${icon('close')}</button></div>
  <div class="profile-grid"><div class="profile-art">${horseArt(horse, true)}<span class="art-caption" data-copy-key="art.caption">ILLUSTRATIVE PLACEHOLDER · NOT EXACT SPECIES ART</span><div class="profile-palette"><span class="eyebrow" data-copy-key="colors.heading">HORSE COLORS</span><div class="color-regions">${Object.entries(horse.palette.colors).map(([name, color]) => `<div><span style="background:${color}" title="${color}"></span><small>${e(name)}</small><code>${color}</code></div>`).join('')}</div></div></div>
  <div class="profile-info"><div class="horse-name-row" data-copy-skip><h2 id="profile-title">${collected ? `<button class="horse-name-text" data-action="rename-horse" data-id="${horse.id}" aria-label="Rename horse">${e(horse.name || horse.species)}</button>` : e(horse.name || horse.species)}</h2></div><p class="muted" data-copy-key="horse.subtitle" data-copy-default="{species} · {gender}">${e(horse.species)} · ${horse.gender === 'Female' ? '♀ Female' : '♂ Male'}</p>
  <dl class="horse-facts">${[['Age', horse.age], ['Origin', horse.origin], ['Size', `${horse.size} (${horse.sizePercent}%)`], ['Birthday', displayBirthday(horse.birthday)], ['Personality', horse.personality.name]].map(([label, value]) => `<div><dt data-copy-key="fact.${label.toLowerCase().replaceAll(' ','-')}">${label}</dt><dd><span>${e(value)}</span>${editField(label.toLowerCase())}</dd></div>`).join('')}</dl>
  <section class="horse-description"><h3 data-copy-key="personality.heading">Description</h3>${collected ? `<button type="button" class="horse-text-display" data-copy-skip data-action="edit-horse-text" data-form="horse-description-form" aria-label="Edit description">${e(horse.personalityDescription ?? horse.personality.description ?? '') || '<span class="muted">Click to add a description</span>'}</button><form hidden id="horse-description-form" data-id="${horse.id}" data-copy-skip><textarea aria-label="Description" name="description" rows="3" maxlength="4000">${e(horse.personalityDescription ?? horse.personality.description ?? '')}</textarea><div class="form-actions"><button class="button primary" type="submit">Save Description</button><button class="button secondary" type="reset">Cancel Changes</button></div></form>` : `<p data-copy-skip>${e(horse.personalityDescription ?? horse.personality.description ?? '')}</p>`}</section>
  ${collected ? `<section class="horse-notes"><h3 data-copy-key="notes.heading">Notes</h3><button type="button" class="horse-text-display" data-copy-skip data-action="edit-horse-text" data-form="horse-notes-form" aria-label="Edit notes">${e(horse.notes || '') || '<span class="muted">Click to add notes</span>'}</button><form hidden id="horse-notes-form" data-id="${horse.id}" data-copy-skip><textarea aria-label="Notes" id="horse-notes" name="notes" rows="5" maxlength="4000" placeholder="Write notes about this horse...">${e(horse.notes || '')}</textarea><div class="form-actions"><button class="button primary" type="submit">Save Notes</button><button class="button secondary" type="reset">Cancel Changes</button></div></form></section>` : ''}
  </div></div>
  <div class="profile-lower"><section><h3>Traits & little details</h3>${!horse.traitsComplete ? '<p class="data-warning">This species has no supplied trait list yet. Mane and tail are explicitly unassigned placeholders.</p>' : ''}<dl class="trait-list"><div><dt data-copy-key="trait.eye-color">Eye color</dt><dd>${e(horse.eye.name)}${editField('eye')}</dd></div>${Object.entries(horse.traits).map(([name, values]) => `<div><dt data-copy-key="trait.${copyKey(name)}">${e(name)}</dt><dd>${values.length ? values.map(e).join(', ') : 'None'}</dd></div>`).join('')}</dl></section><section><h3>Mutations</h3><div class="mutation-empty">${icon('spark')}<span><span data-copy-key="mutations.empty">No mutations in this preview sample.</span><small data-copy-key="mutations.note">Probability-based generation is planned.</small></span></div></section></div>

  <div class="profile-actions">${sold ? `<span class="gold-text">Sold for ${number(horse.soldFor)} gold · ${e(new Date(horse.soldAt).toLocaleDateString())}</span>` : `${collected ? `<button class="button secondary" data-action="favorite" data-id="${horse.id}">${icon('heart')} ${horse.favorite ? 'Unfavorite' : 'Favorite'}</button>` : `<button class="button primary" data-action="catch" data-id="${horse.id}">${icon('stable')} Catch</button>`}${collected ? `<button class="button secondary" data-action="sell" data-id="${horse.id}">${icon('coin')} Sell for ${number(state.settings.sellingPrice)} gold</button>` : ''}`}${collected || sold ? `<button class="text-button" data-action="delete-horse" data-id="${horse.id}">${collected ? 'Release Horse' : 'Delete Horse'}</button>` : ''}</div>`;
}










