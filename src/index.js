const { app } = require("electron");
const { createWindow } = require("./mainwindow");
const { registerKeybinds } = require("./keybinds");
const { settingsExist, createSettings, } = require("./settings/settings");
const { loadSettings } = require('./settings/runtime');
const { logSettings } = require("./settings/runtime");
const { loadAllDicts } = require("./dicts/manager");
const { initTokenizer } = require("./tokenizer/tokenize");
const { run } = require("./test")
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
    const tokenizerInited = await initTokenizer();
    console.log(`tokenizer loaded with resolve: ${tokenizerInited}`);

    console.log("RUNNING TEST FROM ./test.js");
    run();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

