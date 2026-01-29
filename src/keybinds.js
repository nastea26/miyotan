const { globalShortcut } = require('electron');
const { createSelectionWindow, closeSelectionWindow, getSelectionWindow } = require('./selectionwindow');
const { getSettings } = require('./settings/runtime');
const { lookup } = require('./dicts/lookup');

function registerKeybinds() {
    const settings = getSettings()
    const keybinds = settings.hotkeys
    
    globalShortcut.register(keybinds.selection, () => {
        if(getSelectionWindow() || !settings.enabled)return;
        console.log('Selection keybind pressed');
        createSelectionWindow();
    });

    globalShortcut.register(keybinds.cancel, () => {
        if(!getSelectionWindow())return;
        closeSelectionWindow();
        console.log('cancel keybind pressed');
    });

    globalShortcut.register(keybinds.test, () => {
        lookup("食べる");
    });
}

function unregisterKeybinds() {
    globalShortcut.unregisterAll();
}

module.exports = { registerKeybinds, unregisterKeybinds };