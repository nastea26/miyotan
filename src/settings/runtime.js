const { checkSettings, updateSetting } = require('./settings'); 
let settings = {};

function loadSettings(){
    settings = checkSettings();
}

function getSettings() {
    return settings;
}

function updateSettingWithPath(path, val){
    settings = updateSetting(settings,path,val);

}








function logSettings(){ 
    console.log(settings)
}
module.exports = {loadSettings, getSettings, logSettings, updateSettingWithPath }