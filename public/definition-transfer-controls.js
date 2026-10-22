import {icon} from './ui.js';
// Shared placement and styling for all definition transfer/delete actions.
export function definitionTransferControls(form,dialog,draft,kind,label) {
 form.querySelector('[data-action="duplicate-definition"]')?.remove();
 const remove=form.querySelector('[data-action="delete-definition"]');
 if(!remove) return;
 remove.className='button secondary definition-transfer-button';
 remove.innerHTML=icon('trash');remove.title=`Delete ${label}`;remove.setAttribute('aria-label',`Delete ${draft.name}`);
 const actions=document.createElement('div');actions.className='definition-delete-actions';actions.append(remove);form.append(actions);
 const exportButton=document.createElement('button');exportButton.type='button';exportButton.className='button secondary eye-header-delete definition-transfer-button';
 exportButton.dataset.action=kind==='palettes' ? 'export-palette' : 'export-definition';
 exportButton.dataset.kind=kind;exportButton.dataset.id=draft.id;
 exportButton.innerHTML=icon('upload');exportButton.title=`Export ${label}`;exportButton.setAttribute('aria-label',`Export ${label}`);
 dialog.querySelector('h2').after(exportButton);
}