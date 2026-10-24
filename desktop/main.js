import {parseChangelog} from '../public/changelog.js';
import {brandLogo} from '../public/brand-logo.js';
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
  if(smoke)main.webContents.on('console-message',(...args)=>console.error(args.slice(1).map(value=>typeof value==='object'?value?.message:value).join(' ')));
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
  const audioWindow=new BrowserWindow({show:false,webPreferences:{...options,autoplayPolicy:'no-user-gesture-required',backgroundThrottling:false}});
  await audioWindow.loadFile(join(root,'desktop/audio.html'));
  const audioCommand=value=>audioWindow.webContents.executeJavaScript('window.musicTransport.command('+JSON.stringify(value)+')');
  const updateAudio=async()=>{await audioCommand({type:'volume',value:audioPreferences.volume/100});await audioCommand({type:'mute',value:audioPreferences.muted});};
  ipcMain.handle('music-state',event=>event.sender===main.webContents?audioWindow.webContents.executeJavaScript('window.musicTransport.snapshot()'):null);
  ipcMain.handle('music-command',async(event,value)=>{
    if(event.sender!==main.webContents||!value||!['select','play','pause','stop','seek','volume','mute'].includes(value.type))return null;
    if(value.type==='select'){
      if(!value.track||typeof value.track.url!=='string'||!value.track.url.startsWith(origin+'/api/music/media/')||!/^http:\/\/127\.0\.0\.1:\d+\/api\/music\/media\/(menu|[a-f0-9-]{36})$/.test(value.track.url))return null;
      value={type:'select',track:{id:String(value.track.id),name:String(value.track.name),url:value.track.url},fadeSeconds:Math.max(0,Math.min(10,Number(value.fadeSeconds)||0))};
    }
    return audioCommand(value);
  });
  await updateAudio();
  ipcMain.handle('audio-state',event=>event.sender===main.webContents ? audioPreferences : null);
  let audioWrite=Promise.resolve();
  ipcMain.handle('audio-set',async(event,value)=>{if(event.sender!==main.webContents || !Number.isFinite(value.volume))return;audioPreferences={volume:Math.max(0,Math.min(100,value.volume)),muted:value.muted===true};await updateAudio();audioWrite=audioWrite.then(()=>writeFile(audioFile,JSON.stringify(audioPreferences))).catch(log);await audioWrite;return audioPreferences;});
  const menuURL = pathToFileURL(join(root,'desktop/menu.html')).href + '?game=' + encodeURIComponent(origin);
  ipcMain.handle('desktop-logo',event=>event.sender===main.webContents ? brandLogo('pause',72,'pause-logo') : '');
  ipcMain.handle('desktop-changelog',event=>event.sender===main.webContents ? readFile(join(root,'CHANGELOG.md'),'utf8') : '');
  ipcMain.handle('desktop-version',event=>event.sender===main.webContents ? app.getVersion() : null);
  ipcMain.on('menu-exit',event=>{if(event.sender===main.webContents && event.senderFrame.url===menuURL)app.quit();});
  const fromGame = event => event.sender === main.webContents && event.senderFrame.url.startsWith(origin + '/');
  ipcMain.on('pause-main-menu',event=>{if(fromGame(event)){void (async()=>{const library=await (await fetch(origin+'/api/music')).json();const id=library.assignments.default||'menu';const track=library.tracks.find(t=>t.id===id);await audioCommand({type:'select',track:{id,name:track?.name||'The Symphony of the Wilds',url:origin+'/api/music/media/'+id},fadeSeconds:library.fadeSeconds});})();void main.loadURL(menuURL);}});
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
  const initialMusic=await (await fetch(origin+'/api/music')).json();
  const initialId=initialMusic.assignments.default||'menu',initialTrack=initialMusic.tracks.find(t=>t.id===initialId);
  await audioCommand({type:'select',track:{id:initialId,name:initialTrack?.name||'The Symphony of the Wilds',url:origin+'/api/music/media/'+initialId},fadeSeconds:0});
  await audioCommand({type:'play'});
  if (smoke) {
    await writeFile(join(process.env.AETHERION_TEST_DATA,'menu-smoke.png'),(await main.webContents.capturePage()).toPNG());
    const footerCaption='Gallorin v'+app.getVersion()+'|Changelog';
    if(await main.webContents.executeJavaScript("document.querySelector('.menu-version-links').textContent.replace(/\\s/g,'')")!==footerCaption.replace(/\s/g,''))throw new Error('Main menu version label differs from package version');
    const historyCount=parseChangelog(await readFile(join(root,'CHANGELOG.md'),'utf8')).length;
    await main.webContents.executeJavaScript("document.querySelector('#open-changelog').click()");
    for(let attempt=0;attempt<50;attempt++){
      if(await main.webContents.executeJavaScript("document.querySelectorAll('.changelog-release').length==="+historyCount))break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    if(!await main.webContents.executeJavaScript("document.querySelector('#changelog-dialog').open && document.querySelectorAll('.changelog-release').length==="+historyCount))throw new Error('Changelog history failed to load');
    await writeFile(join(process.env.AETHERION_TEST_DATA,'changelog-smoke.png'),(await main.webContents.capturePage()).toPNG());
    main.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});
    main.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});
    await new Promise(resolve=>setTimeout(resolve,100));
    if(await main.webContents.executeJavaScript("document.querySelector('#changelog-dialog').open"))throw new Error('Escape did not close changelog');
    const menuTest=await main.webContents.executeJavaScript("(()=>{document.querySelector('#settings').click();const opened=document.querySelector('dialog').open;const slider=document.querySelector('#volume');slider.value=35;slider.dispatchEvent(new Event('input'));document.querySelector('#mute').click();const valid=opened && true;document.querySelector('dialog').close();return valid;})()");
    if(!menuTest)throw new Error('Menu audio controls failed');
    await main.webContents.executeJavaScript("document.querySelector('#play').click()");
    for (let attempt=0; attempt<100; attempt++) {
      if(await main.webContents.executeJavaScript("Boolean(document.querySelector('.brand'))")) break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    if(!await audioWindow.webContents.executeJavaScript('window.musicTransport.snapshot().playing'))throw new Error('Music stopped during game navigation');
    // Music smoke tests use a copied built-in MP3 and only the isolated smoke library.
    const songResponse=await fetch(origin+'/api/music/import',{method:'POST',headers:{Origin:origin,'Content-Type':'audio/mpeg','X-File-Name':'Smoke Song.mp3'},body:await readFile(join(root,'desktop/assets/menu-music.mp3'))});
    if(!songResponse.ok)throw new Error('Music import failed');
    const songLibrary=await songResponse.json(),songId=songLibrary.tracks[0].id;
    const range=await fetch(origin+'/api/music/media/'+songId,{headers:{Range:'bytes=0-15'}});
    if(range.status!==206||(await range.arrayBuffer()).byteLength!==16)throw new Error('Music seek streaming failed');
    await main.webContents.executeJavaScript("location.hash='dev/music'");
    for(let attempt=0;attempt<80;attempt++){
      if(await main.webContents.executeJavaScript("Boolean(document.querySelector('[data-music-location]'))"))break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    // The library is cached by the player; reload to pick up a test import made outside its UI.
    await main.reload();
    for(let attempt=0;attempt<80;attempt++){
      if(await main.webContents.executeJavaScript("Boolean(document.querySelector('option[value=\""+songId+"\"]'))"))break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    await main.webContents.executeJavaScript("(()=>{const s=document.querySelector('[data-music-location=\"wilds/aetherion\"]');s.value='"+songId+"';s.dispatchEvent(new Event('change'));})()");
    await main.webContents.executeJavaScript("location.hash='wilds/aetherion'");
    for(let attempt=0;attempt<80;attempt++){
      if((await audioWindow.webContents.executeJavaScript('window.musicTransport.snapshot()')).track?.id===songId)break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    if((await audioWindow.webContents.executeJavaScript('window.musicTransport.snapshot()')).track?.id!==songId)throw new Error('Location music assignment failed');
    await new Promise(resolve=>setTimeout(resolve,2200));
    if((await audioWindow.webContents.executeJavaScript('window.musicTransport.snapshot()')).transitioning)throw new Error('Hidden audio crossfade did not finish');
    await audioCommand({type:'seek',value:5});
    if((await audioWindow.webContents.executeJavaScript('window.musicTransport.snapshot()')).currentTime<4)throw new Error('Music seek failed');
    await main.webContents.executeJavaScript("document.querySelector('[data-music=\"toggle\"]').click()");
    await new Promise(resolve=>setTimeout(resolve,150));
    if((await audioWindow.webContents.executeJavaScript('window.musicTransport.snapshot()')).playing)throw new Error('Music pause failed');
    await main.webContents.executeJavaScript("document.querySelector('[data-music=\"toggle\"]').click()");
    await main.webContents.executeJavaScript("location.hash='dev/music'");
    await new Promise(resolve=>setTimeout(resolve,1500));
    await writeFile(join(process.env.AETHERION_TEST_DATA,'music-smoke.png'),(await main.webContents.capturePage()).toPNG());
    main.setSize(800,700);await new Promise(resolve=>setTimeout(resolve,400));
    if(!await main.webContents.executeJavaScript('document.querySelector(".music-player").getBoundingClientRect().right<=innerWidth && document.documentElement.scrollWidth<=innerWidth'))throw new Error('Music player overflow on narrow screen');
    await writeFile(join(process.env.AETHERION_TEST_DATA,'music-responsive-smoke.png'),(await main.webContents.capturePage()).toPNG());
    main.setSize(1440,960);
    await main.webContents.executeJavaScript("location.hash='wilds/aetherion'");
    await new Promise(resolve=>setTimeout(resolve,300));
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
    if(await main.webContents.executeJavaScript("document.querySelector('.sidebar-foot').textContent.replace(/\\s/g,'')")!==footerCaption.replace(/\s/g,''))throw new Error('Sidebar version label differs from package version');
    await main.webContents.executeJavaScript("document.querySelector('#sidebar-changelog').click()");
    for(let attempt=0;attempt<50;attempt++){
      if(await main.webContents.executeJavaScript("document.querySelectorAll('.changelog-release').length==="+historyCount))break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    if(!await main.webContents.executeJavaScript("document.querySelector('#changelog-dialog').open && document.querySelectorAll('.changelog-release').length==="+historyCount))throw new Error('Sidebar changelog did not load');
    main.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});
    main.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});
    await new Promise(resolve=>setTimeout(resolve,100));
    if(await main.webContents.executeJavaScript("document.querySelector('#changelog-dialog').open"))throw new Error('Escape did not close sidebar changelog');
    // Let the gameplay reveal finish before checking the rendered branding.
    await new Promise(resolve=>setTimeout(resolve,1800));
    if(!await main.webContents.executeJavaScript("document.querySelector('.brand-logo')?.getAttribute('viewBox')==='0 0 200 200'"))throw new Error('Sidebar logo failed');
    main.webContents.send('desktop-pause');
    for(let attempt=0;attempt<50;attempt++){
      if(await main.webContents.executeJavaScript("Boolean(document.querySelector('#desktop-pause .pause-logo'))"))break;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    if(!await main.webContents.executeJavaScript("document.querySelector('#desktop-pause .pause-logo')?.getAttribute('viewBox')==='0 0 200 200'"))throw new Error('Pause logo failed');
    await writeFile(join(process.env.AETHERION_TEST_DATA,'pause-smoke.png'),(await main.webContents.capturePage()).toPNG());
    main.webContents.send('desktop-pause');
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
