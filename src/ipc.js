const {ipcMain} = require('electron');

// selection hanlder related: 
const { closeSelectionWindow } = require('./selectionwindow');
const { capture } = require("./capture/index");


// user rectangle selection from rendered window
ipcMain.handle('selection', async (event, rect) => {
    if(rect)closeSelectionWindow();
    console.log('User selected rectangle:', rect);
    await capture(rect);

});