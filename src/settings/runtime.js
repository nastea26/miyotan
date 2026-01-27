const { checkSettings } = require('./settings'); 
let settings = {};

function loadSettings(){
    settings = checkSettings();
}

function getSettings() {
    return settings;
}










function logSettings(){ 
    console.log(settings)
}
module.exports = {loadSettings, getSettings, logSettings }