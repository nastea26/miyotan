const { BrowserWindow } = require("electron");
const paths = require("../utils/paths");

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: paths.preload,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile(paths.RENDERER.index);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

function getWindow() {
    return mainWindow;
}

module.exports = { createWindow, getWindow };
