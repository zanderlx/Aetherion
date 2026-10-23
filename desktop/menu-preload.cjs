const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktopMenu',{exit:()=>ipcRenderer.send('menu-exit')});
