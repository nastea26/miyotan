const { globalShortcut } = require('electron');
const { createSelectionWindow, closeSelectionWindow, getSelectionWindow } = require('./selectionwindow');
const paths = require('../utils/paths');

const fs = require('fs');

function getData() { 
    const data = fs.readFileSync(`${paths.SRC.self}/keybinds.json`, "utf-8");
    return JSON.parse(data);
}

function registerKeybinds() {
    const keybinds = getData();
    
    globalShortcut.register(keybinds.selection.key, () => {
        if(getSelectionWindow())return;
        console.log('Selection keybind pressed');
        createSelectionWindow();
        console.log(keybinds.selection.description);
    })

    globalShortcut.register(keybinds.cancel.key, () => {
        if(!getSelectionWindow())return;
        closeSelectionWindow();
        console.log('cancel keybind pressed');
    })
}

exports.registerKeybinds = registerKeybinds;