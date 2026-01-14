const { app } = require("electron");
const { createWindow }= require("./mainwindow");
const {registerKeybinds } = require("./keybinds");

// hook up ipc handlers to main process
require("./ipc");


// app stuff 
app.whenReady().then(() => {
    createWindow();
    registerKeybinds();
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

