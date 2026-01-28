const { globalShortcut } = require('electron');
const { createSelectionWindow, closeSelectionWindow, getSelectionWindow } = require('./selectionwindow');
const { getSettings } = require('./settings/runtime');

function registerKeybinds() {
    const settings = getSettings()
    const keybinds = settings.hotkeys
    
    globalShortcut.register(keybinds.selection, () => {
        if(getSelectionWindow() || !settings.enabled)return;
        console.log('Selection keybind pressed');
        createSelectionWindow();
    })

    globalShortcut.register(keybinds.cancel, () => {
        if(!getSelectionWindow())return;
        closeSelectionWindow();
        console.log('cancel keybind pressed');
    })
}

function unregisterKeybinds() {
    globalShortcut.unregisterAll();
}

module.exports = { registerKeybinds, unregisterKeybinds };