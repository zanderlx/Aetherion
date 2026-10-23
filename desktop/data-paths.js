import {existsSync} from 'node:fs';
import {join} from 'node:path';
// Prefer the new name for new installations; reuse legacy storage without moving player files.
export function desktopDataPath(appData,packaged,exists=existsSync){
  const current=join(appData,packaged?'Gallorin':'Gallorin Development');
  const legacy=join(appData,packaged?'Aetherion':'Aetherion Development');
  return exists(current)?current:exists(legacy)?legacy:current;
}
