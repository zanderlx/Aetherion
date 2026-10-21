import {createHorseDocument,readHorseDocument} from './horse-transfer.js';

export function createHorseTransfers({getState,save,notify,onImported}) {
  let picker, importing = false;
  function importHorse() {
    if (importing) return;
    if (!picker) {
      picker = document.createElement('input');
      picker.type = 'file';
      picker.accept = '.json,application/json';
      picker.hidden = true;
      picker.setAttribute('aria-label','Import horse JSON');
      document.body.append(picker);
      picker.addEventListener('change',async () => {
        const file = picker.files[0];
        if (!file || importing) return;
        importing = true;
        try {
          if (file.size > 524288) throw new Error('Horse files must be 512 KB or smaller.');
          let document;
          try { document = JSON.parse(await file.text()); }
          catch { throw new Error('This file is not valid JSON.'); }
          readHorseDocument(document);
          const state = await save('import-horse',document);
          onImported(state.horses.at(-1).id);
          notify('Horse imported to My Horses.');
        } catch (error) { notify(error.message,true); }
        finally { importing = false; picker.value = ''; }
      });
    }
    picker.value = '';
    picker.click();
  }
  function exportHorse(id) {
    const horse = getState().horses.find(h => h.id === id);
    if (!horse) return;
    try {
      const document = createHorseDocument(horse);
      const url = URL.createObjectURL(new Blob([JSON.stringify(document,null,2) + '\n'],{type:'application/json'}));
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${(horse.name || horse.species).replace(/[^a-z0-9_-]+/gi,'-').slice(0,60) || 'horse'}.horse.json`;
      window.document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url),1000);
      notify('Horse exported. Your horse stays in My Horses.');
    } catch (error) { notify(error.message,true); }
  }
  return {importHorse,exportHorse};
}
