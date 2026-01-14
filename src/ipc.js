const {ipcMain} = require('electron');

// selection hanlder related: 
const { closeSelectionWindow } = require('./selectionwindow');
const { capture } = require("./capture/index");

//ocr section
const { prepIMG } = require("./ocr/prep");
const { ocr } = require("./ocr/ocr");


// user rectangle selection from rendered window
ipcMain.handle('selection', async (event, rect) => {
    if(rect)closeSelectionWindow();
    setTimeout(() => {
        // allow time to clear the area selections
    }, 1);
    await capture(rect);
    
    //ocr : 
    await prepIMG();
    await ocr();


});
