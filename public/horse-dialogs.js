import {escapeHTML as e} from './ui.js';
import {horseFieldOptions} from './horse-fields.js';

export function createHorseDialogs({getState,getCatalog,findHorse,save,onSaved,notify}) {
  let dialog, current, saving = false;
  function open(id,kind,field) {
    const horse = findHorse(id);
    if (!horse || (kind === 'field' && !getState().settings.developerEditMode)) return;
    if (kind === 'rename' && !getState().horses.some(h => h.id === id)) return;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'horse-edit-dialog';
      dialog.setAttribute('aria-labelledby','horse-edit-title');
      document.body.append(dialog);
      dialog.addEventListener('input',event => {
        if (current?.kind === 'catch' && event.target.name === 'value') {
          event.target.classList.toggle('default-horse-name',event.target.value === event.target.defaultValue);
        }
      });
      dialog.addEventListener('click',event => { if (event.target.closest('[data-horse-cancel]')) dialog.close(); });
      dialog.addEventListener('submit',async event => {
        event.preventDefault();
        if (saving) return;
        const {id,kind,field} = current;
        const value = new FormData(event.target).get('value');
        saving = true;
        dialog.querySelectorAll('button').forEach(button => button.disabled = true);
        try {
          const action = kind === 'catch' ? 'catch' : kind === 'rename' ? 'rename' : 'horse-field';
          const payload = kind === 'field' ? {id,field,value} : {id,name:value};
          await save(action,payload);
          dialog.close();
          onSaved(id,kind);
          notify(kind === 'catch' ? 'Your companion is saved in My Horses.' : 'Horse updated.');
        } catch (error) { dialog.querySelector('[role=status]').textContent = error.message; }
        finally { saving = false; dialog.querySelectorAll('button').forEach(button => button.disabled = false); }
      });
    }
    current = {id,kind,field};
    dialog.classList.toggle('catch-name-dialog',kind === 'catch');
    const title = kind === 'catch' ? 'Name Your New Companion?' : kind === 'rename' ? 'Rename Horse' : `Edit ${field === 'eye' ? 'Eye Color' : field}`;
    let input;
    if (kind !== 'field') input = `<input class="${kind === 'catch' ? 'default-horse-name' : ''}" aria-label="Horse name" name="value" maxlength="60" value="${e(horse.name || horse.species)}">`;
    else if (field === 'birthday') input = `<label>Birthday<input type="date" name="value" min="0001-01-01" max="${new Date().toISOString().slice(0,10)}" value="${e(horse.birthday)}" required></label>`;
    else {
      const options = horseFieldOptions(field,getCatalog(),getState());
      const selected = ['personality','eye'].includes(field) ? options.find(option => option.value === horse[field]?.id || option.label === horse[field]?.name)?.value : horse[field];
      input = `<label>${e(field === 'eye' ? 'Eye Color' : field)}<select name="value" required>${selected && options.some(option => option.value === selected) ? '' : '<option value="" selected disabled>Choose an option</option>'}${options.map(option => `<option value="${e(option.value)}" ${option.value === selected ? 'selected' : ''}>${e(option.label)}</option>`).join('')}</select></label>`;
    }
    dialog.innerHTML = `<form><div class="dialog-top"><h2 id="horse-edit-title">${e(title)}</h2>${kind === 'catch' ? '' : '<button type="button" class="icon-button" data-horse-cancel aria-label="Close">×</button>'}</div><div class="horse-edit-body">${kind === 'catch' ? '<p>Choose a name before saving this horse to your stable, or keep its current name.</p>' : ''}${input}<p role="status"></p><div class="form-actions"><button type="submit" class="button primary">${kind === 'catch' ? 'Save' : 'Save Changes'}</button><button type="button" class="text-button" data-horse-cancel>Cancel</button></div></div></form>`;
    dialog.showModal();
    dialog.querySelector('input,select').focus();
  }
  return {open,close:() => dialog?.close()};
}
