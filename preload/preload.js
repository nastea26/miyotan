const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('miyotanAPI', {
    selection: rect => {ipcRenderer.invoke('selection', rect)},
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSetting: (target,val) => ipcRenderer.invoke('update-setting', target, val ),

    import: async (fileData, fileName) => ipcRenderer.invoke('dict-import', fileData, fileName),
    list: () => ipcRenderer.invoke('dict-list'),
    remove: name => ipcRenderer.invoke('dict-remove', name),
})