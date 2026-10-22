import {defaultSpawnSettings} from './spawn-config.js';
import {icon} from './ui.js';
import {saleHistoryTable} from './economy.js';
import {saleModifiers,saleModifierFields} from './sale-pricing.js';

function settingForm(state,economy = false,catalog) {
  const s = state.settings;
  const id = economy ? 'economy' : 'settings';
  return `<form id="${id}-form" class="panel">
  ${economy ? `<label class="setting-row"><span><strong>Current Gold</strong><small>Your saved balance, shown in the header.</small></span><input name="gold" type="number" min="0" max="1000000000" step="1" value="${state.gold}" required></label>
  <label class="setting-row"><span><strong>Horse selling price</strong><small>Base price before feature bonuses and multipliers.</small></span><input name="sellingPrice" type="number" min="0" max="1000000" value="${s.sellingPrice}" required></label>
  <h3 class="sale-modifiers-heading">Sale Price Modifiers</h3><p class="sale-price-formula">(Base Price + Trait Bonuses + Mutation Bonuses) × Special Multiplier</p>
  ${saleModifierFields.map(([key,label,description]) => `<label class="setting-row"><span><strong>${label}</strong><small>${description}</small></span><input name="saleModifier:${key}" type="number" min="0" max="${key.endsWith('Bonus') ? 1000000 : 1000}" step="${key.endsWith('Bonus') ? 1 : '0.1'}" value="${saleModifiers(s)[key]}" required></label>`).join('')}
` : `<label class="setting-row"><span><strong>Horses per search</strong><small>How many companions appear in a new clearing (1–12).</small></span><input name="horsesPerSearch" type="number" min="1" max="12" value="${s.horsesPerSearch}" required></label>
  <label class="setting-row"><span><strong>Stable capacity</strong><small>Maximum companions when the limit is enabled.</small></span><input name="stableCapacity" type="number" min="1" max="10000" value="${s.stableCapacity}" required></label>
  <label class="setting-row"><span><strong>Ignore stable capacity</strong><small>Allow new horses beyond the stable limit.</small></span><input class="toggle" name="ignoreStableLimit" type="checkbox" ${s.ignoreStableLimit ? 'checked' : ''}></label>
  <label class="setting-row"><span><strong>Allow Duplicate Mutations</strong><small>Allow the same standard mutation in multiple slots on one horse.</small></span><input class="toggle" name="ALLOW_DUPLICATE_MUTATIONS" type="checkbox" ${(catalog?.spawning || defaultSpawnSettings).ALLOW_DUPLICATE_MUTATIONS ? 'checked' : ''}></label>`}
  <div id="${id}-status" role="status" class="form-status"></div><div class="form-actions"><button class="button primary" type="submit">${icon('check')} Save Settings</button><button class="button secondary" type="reset">Cancel Changes</button><button class="text-button" type="button" data-action="defaults">Load Defaults</button></div></form>`;
}

export function gameSettingsPage(state,catalog) {
  return `<div class="settings-section-heading"><h1 data-copy-key="page.title">Encounter & Stable Settings</h1></div>
  ${settingForm(state,false,catalog)}
  <section class="economy-settings" aria-labelledby="economy-heading"><h2 id="economy-heading" data-copy-key="economy.heading">Economy Settings</h2>
  ${settingForm(state,true)}</section>${saleHistoryTable(state)}`;
}
