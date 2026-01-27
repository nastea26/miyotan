const { app } = require("electron");
const { createWindow }= require("./mainwindow");
const { registerKeybinds } = require("./keybinds");
const { settingsExist, createSettings,} = require("./settings/settings");
const { loadSettings } = require('./settings/runtime');
const { logSettings } = require("./settings/runtime");
// hook up ipc handlers to main process
require("./ipc");


// app stuff 
app.whenReady().then(() => {
    createWindow();
    if( !settingsExist )createSettings();
    loadSettings();
    logSettings();
    registerKeybinds();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

