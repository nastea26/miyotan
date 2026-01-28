const {ipcMain} = require('electron');

// selection hanlder related: 
const { closeSelectionWindow } = require('./selectionwindow');
const { capture } = require("./capture/index");

//ocr section
const { prepIMG } = require("./ocr/prep");
const { ocr } = require("./ocr/ocr");

//settings section
const { getSettings, updateSettingWithPath } = require('./settings/runtime');
const { registerKeybinds, unregisterKeybinds } = require("./keybinds");

//dictionary 
const { dicts, importDict, listDicts, loadAllDicts, removeDict } = require('./dicts/manager');

// user rectangle selection from rendered window
ipcMain.handle('selection', async (event, rect) => {
    if(rect)closeSelectionWindow();
    setTimeout(() => {
        // time to clear the area selections
    }, 1);
    await capture(rect);
    
    //ocr : 
    await prepIMG();
    const ocr_out = await ocr();
    console.log(`Best candidate: ${ocr_out}`)

});

ipcMain.handle("get-settings", () => {
    return getSettings();    
});

ipcMain.handle('update-setting', (event, target, val) =>{
    console.log(`target -> ${target}, new val ${val}`)
    const path = target.split('.')
    updateSettingWithPath(path,val);
    //reset keybinds if hotkey chagned
    if(target.includes('hotkeys')){
        unregisterKeybinds();
        registerKeybinds();
    }

    console.log(getSettings());

});

ipcMain.handle('dict-import', async (event, fileData, fileName) => {
    try{
        return await importDict(fileData, fileName);
    }
    catch(err){
        console.error(err);
        return {error: err.message};
    }
});

ipcMain.handle('dict-list', () => listDicts());

ipcMain.handle('dict-remove', async (event, name) => {
    try{
        await removeDict(name);
        return {success:true};
    }
    catch(err){
        console.error(err);
        return {error: err.message};
    }
})
