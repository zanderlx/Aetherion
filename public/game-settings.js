import {icon} from './ui.js';
import {saleHistoryTable} from './economy.js';

function settingForm(state,economy = false) {
  const s = state.settings;
  const id = economy ? 'economy' : 'settings';
  return `<form id="${id}-form" class="panel">
  ${economy ? `<label class="setting-row"><span><strong>Current Gold</strong><small>Your saved balance, shown in the header.</small></span><input name="gold" type="number" min="0" max="1000000000" step="1" value="${state.gold}" required></label>
  <label class="setting-row"><span><strong>Horse selling price</strong><small>Gold earned for each future sale.</small></span><input name="sellingPrice" type="number" min="0" max="1000000" value="${s.sellingPrice}" required></label>
` : `<label class="setting-row"><span><strong>Horses per search</strong><small>How many companions appear in a new clearing (1–12).</small></span><input name="horsesPerSearch" type="number" min="1" max="12" value="${s.horsesPerSearch}" required></label>
  <label class="setting-row"><span><strong>Stable capacity</strong><small>Maximum companions when the limit is enabled.</small></span><input name="stableCapacity" type="number" min="1" max="10000" value="${s.stableCapacity}" required></label>
  <label class="setting-row"><span><strong>Ignore stable capacity</strong><small>Allow new horses beyond the stable limit.</small></span><input class="toggle" name="ignoreStableLimit" type="checkbox" ${s.ignoreStableLimit ? 'checked' : ''}></label>`}
  <div id="${id}-status" role="status" class="form-status"></div><div class="form-actions"><button class="button primary" type="submit">${icon('check')} Save Settings</button><button class="button secondary" type="reset">Cancel Changes</button><button class="text-button" type="button" data-action="defaults">Load Defaults</button></div></form>`;
}

export function gameSettingsPage(state) {
  return `<div class="settings-section-heading"><h1 data-copy-key="page.title">Encounter & Stable Settings</h1></div>
  ${settingForm(state)}
  <section class="economy-settings" aria-labelledby="economy-heading"><h2 id="economy-heading" data-copy-key="economy.heading">Economy Settings</h2>
  ${settingForm(state,true)}</section>${saleHistoryTable(state)}`;
}
