const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('miyotanAPI', {
    selection: rect => {ipcRenderer.invoke('selection', rect)},
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSetting: (target,val) => ipcRenderer.invoke('update-setting', target, val ),
})