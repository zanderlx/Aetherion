import {desktopDataPath} from './data-paths.js';
import updater from 'electron-updater';
import {app, BrowserWindow, Menu, dialog, shell, session, ipcMain} from 'electron';
import {appendFileSync, existsSync, mkdirSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {importLegacyData} from './data-migration.js';
import {configureUpdates} from './updater.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const smoke = process.argv.includes('--smoke-test');
if (smoke && !process.env.AETHERION_TEST_DATA) throw new Error('Smoke testing requires an isolated AETHERION_TEST_DATA directory.');
if (process.env.AETHERION_SOFTWARE_RENDERING === '1') app.disableHardwareAcceleration();
app.setName('Gallorin');
const userDirectory = smoke ? join(process.env.AETHERION_TEST_DATA, 'browser')
  : desktopDataPath(app.getPath('appData'),app.isPackaged);
// Select Chromium storage before ready; development must not lock the installed game's cache or saves.
mkdirSync(join(userDirectory, 'chromium'), {recursive:true});
app.setPath('userData', userDirectory);
app.setPath('sessionData', join(userDirectory, 'chromium'));
const data = smoke ? join(process.env.AETHERION_TEST_DATA, 'data') : join(app.getPath('userData'), 'data');
let main, splash, backend, stopping = false, stopped = false;
const log = message => {
  try { appendFileSync(join(app.getPath('userData'), 'desktop.log'), new Date().toISOString() + ' ' + String(message) + '\n'); } catch {}
};
async function shutdown() {
  if (stopped) return;
  await backend?.closeGameServer();
  stopped = true;
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (main) { if (main.isMinimized()) main.restore(); main.show(); main.focus(); } });
  app.on('before-quit', event => {
    if (stopped) return;
    event.preventDefault();
    if (stopping) return;
    stopping = true;
    shutdown().then(() => app.quit()).catch(error => {log(error); stopping = false; dialog.showErrorBox('Unable to close safely', error.message);});
  });
  app.on('window-all-closed', () => app.quit());
  app.whenReady().then(start).catch(error => {
    log(error.stack);
    if (smoke) {console.error(error); app.exit(1);}
    else {dialog.showErrorBox('Gallorin could not start', error.message + '\nYour existing files have been preserved.'); app.quit();}
  });
}

async function start() {
  await mkdir(app.getPath('userData'), {recursive:true});
  const options = {nodeIntegration:false, contextIsolation:true, sandbox:true};
  splash = new BrowserWindow({width:640, height:430, resizable:false, frame:false, backgroundColor:'#1d1b18', show:false,
    icon:join(root, 'desktop/assets/icon.png'), webPreferences:options});
  splash.setMenu(null);
  await splash.loadFile(join(root, 'desktop/splash.html'));
  splash.show();
  if (smoke) {await new Promise(resolve=>setTimeout(resolve,200)); await writeFile(join(process.env.AETHERION_TEST_DATA,'splash-smoke.png'),(await splash.webContents.capturePage()).toPNG());}
  const started = Date.now();
  if (!smoke && !existsSync(data)) await offerImport();
  process.env.HORSE_DATA_DIR = data;
  process.env.PORT = '0'; // An independent, OS-assigned port cannot collide with the browser server.
  backend = await import('../server.js');
  const origin = await backend.serverReady;
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  main = new BrowserWindow({width:1440, height:960, minWidth:800, minHeight:640, show:false, backgroundColor:'#1d1b18',
    title:'Gallorin', icon:join(root, 'desktop/assets/icon.png'), webPreferences:{...options, paintWhenInitiallyHidden:false, preload:join(root,'desktop/menu-preload.cjs'), autoplayPolicy:'no-user-gesture-required'}});
  main.on('closed',()=>app.quit());
  main.webContents.setWindowOpenHandler(() => ({action:'deny'}));
  main.webContents.on('will-navigate', (event, url) => {if (url !== menuURL && new URL(url).origin !== origin) event.preventDefault();});
  main.webContents.on('will-attach-webview', event => event.preventDefault());
  const checkUpdates = configureUpdates({autoUpdater:updater.autoUpdater, packaged:app.isPackaged, show:options=>dialog.showMessageBox(main,options), shutdown, log});
  const openFolder = async folder => {await mkdir(folder, {recursive:true}); const error = await shell.openPath(folder); if(error) log(error);};
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'Gallorin', submenu:[
      {label:'Open Save Folder', click:()=>openFolder(join(data, 'player'))},
      {label:'Open Configuration Folder', click:()=>openFolder(join(data, 'config'))},
      {label:'Open Backups Folder', click:()=>openFolder(join(data, 'backups'))},
      {type:'separator'}, {label:'Check for Updates', click:()=>checkUpdates(true)}, {role:'quit'}]},
    {label:'Edit', submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},
    {label:'View', submenu:[{role:'reload'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]}
  ]));
  let audioPreferences={volume:35,muted:false};
  const audioFile=join(app.getPath('userData'),'audio-settings.json');
  try{const saved=JSON.parse(await readFile(audioFile,'utf8'));if(Number.isFinite(saved.volume))audioPreferences={volume:Math.max(0,Math.min(100,saved.volume)),muted:saved.muted===true};}catch{}
  const audioWindow=new BrowserWindow({show:false,webPreferences:{...options,autoplayPolicy:'no-user-gesture-required'}});
  await audioWindow.loadFile(join(root,'desktop/audio.html'));
  const updateAudio=()=>audioWindow.webContents.executeJavaScript('(()=>{const a=document.querySelector("audio");a.volume='+audioPreferences.volume+'/100;a.muted='+audioPreferences.muted+';})()');
  await updateAudio();
  ipcMain.handle('audio-state',event=>event.sender===main.webContents ? audioPreferences : null);
  let audioWrite=Promise.resolve();
  ipcMain.handle('audio-set',async(event,value)=>{if(event.sender!==main.webContents || !Number.isFinite(value.volume))return;audioPreferences={volume:Math.max(0,Math.min(100,value.volume)),muted:value.muted===true};await updateAudio();audioWrite=audioWrite.then(()=>writeFile(audioFile,JSON.stringify(audioPreferences))).catch(log);await audioWrite;return audioPreferences;});
  const menuURL = pathToFileURL(join(root,'desktop/menu.html')).href + '?game=' + encodeURIComponent(origin);
  ipcMain.handle('desktop-version',event=>event.sender===main.webContents ? app.getVersion() : null);
  ipcMain.on('menu-exit',event=>{if(event.sender===main.webContents && event.senderFrame.url===menuURL)app.quit();});
  const fromGame = event => event.sender === main.webContents && event.senderFrame.url.startsWith(origin + '/');
  ipcMain.on('pause-main-menu',event=>{if(fromGame(event))void main.loadURL(menuURL);});
  ipcMain.on('pause-exit',event=>{if(fromGame(event))app.quit();});
  main.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || input.key !== 'Escape' || input.isAutoRepeat) return;
    if (main.webContents.getURL().startsWith(origin + '/')) {
      event.preventDefault();
      main.webContents.send('desktop-pause');
    }
  });
  await main.loadURL(menuURL);
  // A short aesthetic reveal, not a fabricated progress percentage.
  await new Promise(resolve => setTimeout(resolve, Math.max(0, 4500 - (Date.now()-started))));
  main.show(); splash.destroy(); splash = null;
  await audioWindow.webContents.executeJavaScript('document.querySelector("audio").play()');
  if (smoke) {
    await writeFile(join(process.env.AETHERION_TEST_DATA,'menu-smoke.png'),(await main.webContents.capturePage()).toPNG());
    const menuTest=await main.webContents.executeJavaScript("(()=>{document.querySelector('#settings').click();const opened=document.querySelector('dialog').open;const slider=document.querySelector('#volume');slider.value=35;slider.dispatchEvent(new Event('input'));document.querySelector('#mute').click();const valid=opened && true;document.querySelector('dialog').close();return valid;})()");
    if(!menuTest)throw new Error('Menu audio controls failed');
    await main.webContents.executeJavaScript("document.querySelector('#play').click()");
    for (let attempt=0; attempt<100; attempt++) {
      if(await main.webContents.executeJavaScript("Boolean(document.querySelector('.brand'))")) break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    if(!await audioWindow.webContents.executeJavaScript('!document.querySelector("audio").paused'))throw new Error('Music stopped during game navigation');
    // Exercise a real save through the renderer's same-origin API, using only isolated smoke data.
    const savedId = await main.webContents.executeJavaScript(`(async()=>{
      const snapshot=await (await fetch('/api/state')).json();
      const horse=Object.values(snapshot.state.encounters).flat()[0];
      if(!horse) throw new Error('No initial encounters');
      const response=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'catch',payload:{id:horse.id}})});
      const saved=await response.json();
      if(!response.ok || !saved.state.horses.some(item=>item.id===horse.id)) throw new Error('Desktop save failed');
      const exported=await (await fetch('/api/export')).json();
      if(!exported.state.horses.some(item=>item.id===horse.id)) throw new Error('Desktop backup failed');
      return horse.id;
    })()`);
    await main.loadURL(origin);
    for(let attempt=0; attempt<100; attempt++){
      if(await main.webContents.executeJavaScript("Boolean(document.querySelector('.brand'))")) break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    const stored = JSON.parse(await readFile(join(data,'player/save.json'),'utf8'));
    if(!stored.horses.some(horse=>horse.id===savedId)) throw new Error('Desktop save did not persist.');
    const result = await main.webContents.executeJavaScript("(async()=>({title:document.title, brand:!!document.querySelector('.brand'), state:(await (await fetch('/api/state')).json()).appVersion, node:typeof window.require}))()");
    if (!result.brand || result.node !== 'undefined') throw new Error('Desktop renderer failed to initialize securely.');
    await writeFile(join(process.env.AETHERION_TEST_DATA,'desktop-smoke.json'), JSON.stringify(result));
    await writeFile(join(process.env.AETHERION_TEST_DATA,'desktop-smoke.png'), (await main.webContents.capturePage()).toPNG());
    await shutdown(); app.quit();
  } else {setTimeout(()=>checkUpdates(false), 3000);}
}

async function offerImport() {
  const choice = await dialog.showMessageBox(splash, {type:'question', message:'Welcome to Gallorin',
    detail:'Start a new sanctuary, or copy your existing browser save and configuration. Close the browser server before copying its data folder. The original files will remain untouched.',
    buttons:['Start New', 'Copy Existing Data'], defaultId:0, cancelId:0});
  if (choice.response !== 1) return;
  const selection = await dialog.showOpenDialog(splash, {title:'Choose your original Gallorin data folder', properties:['openDirectory']});
  if (selection.canceled) throw new Error('Import cancelled. Restart to choose a save or start a new sanctuary.');
  const {GameStore} = await import('../src/store.js');
  const catalog = JSON.parse(await readFile(join(root,'data/definitions/catalog.json'),'utf8'));
  const defaults = JSON.parse(await readFile(join(root,'data/defaults/settings.json'),'utf8'));
  await importLegacyData(selection.filePaths[0], data, async staging => {await new GameStore(staging,catalog,defaults).init();});
}
