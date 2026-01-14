const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('miyotanAPI', {
    selection: rect => {ipcRenderer.invoke('selection', rect)},
})