const {app, BrowserWindow} = require('electron');
const {readFileSync, writeFileSync} = require('node:fs');
const {join} = require('node:path');
app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const directory = join(__dirname, '../desktop/assets');
  const svg = readFileSync(join(directory, 'logo.svg'), 'utf8');
  const win = new BrowserWindow({show:false,width:256,height:256,frame:false,transparent:true,webPreferences:{sandbox:true}});
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<style>html,body{margin:0;background:transparent}svg{width:256px;height:256px;display:block}</style>'+svg));
  await new Promise(resolve=>setTimeout(resolve,500));
  const png = (await win.webContents.capturePage()).toPNG();
  writeFileSync(join(directory, 'icon.png'), png);
  // Windows ICO supports PNG-compressed 256px images.
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
  writeFileSync(join(directory, 'icon.ico'), Buffer.concat([header,png]));
  app.quit();
}).catch(error=>{console.error(error);app.exit(1);});

