const { BrowserWindow, screen } = require("electron");
const paths = require("../utils/paths");

let selectionWindow = null; 
function createSelectionWindow(){
    if (selectionWindow) return; 

    const displays = screen.getAllDisplays();
    const minX = Math.min (...displays.map(display => display.bounds.x));
    const minY = Math.min (...displays.map(display => display.bounds.y));
    const maxX = Math.max (...displays.map(display => display.bounds.x + display.bounds.width));
    const maxY = Math.max (...displays.map(display => display.bounds.y + display.bounds.height));
    console.log(`Creating selection window covering area: ${minX},${minY} to ${maxX},${maxY}`);
    selectionWindow = new BrowserWindow({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        
        frame: false,
        transparent: true,
        resizable:false,
        movable:false,
        fullscreenable: false,
        hasShadow:false,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: true,

        webPreferences: {
            preload: paths.preload,
        }
    });

    selectionWindow.loadFile(paths.RENDERER.selection);   
}

function closeSelectionWindow() {
    if(!selectionWindow)return;
    selectionWindow.setBounds({x:-9999, y:-9999, width:1, height:1});
    selectionWindow.close();
    selectionWindow = null;
}

function getSelectionWindow() {
    return selectionWindow? selectionWindow : false;
}

module.exports = { createSelectionWindow, closeSelectionWindow, getSelectionWindow };