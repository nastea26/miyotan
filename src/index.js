const { app } = require("electron");
const { createWindow } = require("./mainwindow");
const { registerKeybinds } = require("./keybinds");
const { settingsExist, createSettings, } = require("./settings/settings");
const { loadSettings } = require('./settings/runtime');
const { logSettings } = require("./settings/runtime");
const { loadAllDicts } = require("./dicts/manager");

require("./ipc");


// app stuff 
app.whenReady().then(async () => {
    createWindow();
    if (!settingsExist) createSettings();
    loadSettings();
    logSettings();
    try {
        const allDicts = await loadAllDicts();
        console.log("Dictionaries loaded:", allDicts.glossary.map(d => d.name));
        console.log("Dictionaries loaded:", allDicts.meta.map(d => d.name));
    } catch (err) {
        console.error("Error loading dictionaries:", err);
    }
    registerKeybinds();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

