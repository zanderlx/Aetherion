import {escapeHTML as e,icon} from './ui.js';

export function eyesManagerPage(catalog) {
  return `<div class="definitions-header"><h1 class="manager-heading">Eye Color Manager</h1><button class="button primary" data-action="new-definition" data-kind="eyes">Create Eye Color</button><p class="configuration-path">data/config/eyes.json</p></div>
    <div class="eye-definition-grid">${catalog.eyes.map(eye => `<article class="panel eye-definition-card"><button class="icon-button eye-edit" data-action="edit-definition" data-kind="eyes" data-id="${e(eye.id)}" aria-label="Edit ${e(eye.name)}">${icon('edit')}</button><h2>${e(eye.name)}</h2><p>${e(eye.rarity)}</p><div class="eye-swatches" aria-label="Eye colors">${eye.colors.map(color => `<span style="background:${e(color)}" title="${e(color)}"></span>`).join('')}</div></article>`).join('')}</div>`;
}

export function createEyeEditor(renderEditor) {
  const dialog = document.createElement('dialog');
  dialog.id = 'eye-definition-dialog';
  dialog.className = 'eye-definition-dialog';
  dialog.setAttribute('aria-labelledby','eye-editor-title');
  document.body.append(dialog);
  dialog.addEventListener('close',() => { if (!dialog.open) dialog.replaceChildren(); });
  dialog.addEventListener('click',event => {
    if (event.target.closest('[data-action="close-eye-editor"]')) dialog.close();
  });
  return {
    dialog,
    open(draft) {
      const template = document.createElement('template');
      template.innerHTML = renderEditor(draft);
      dialog.innerHTML = `<div class="dialog-top"><h2 id="eye-editor-title">${draft?.id ? `Edit ${e(draft.name)}` : 'Create Eye Color'}</h2><button type="button" class="icon-button" data-action="close-eye-editor" aria-label="Close eye color editor">${icon('close')}</button></div>`;
      const form = template.content.querySelector('#definition-form');
      form.querySelector('.panel-heading')?.remove();
      dialog.append(form);
      dialog.scrollTop = 0;
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('[name="name"]').focus();
    }
  };
}
