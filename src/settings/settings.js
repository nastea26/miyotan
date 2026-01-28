const fs = require("fs");
const paths = require("../../utils/paths");
const { defaultSettings }  = require("./defaultSettings");


//create file with default settings if it doesnt exist
const settingsExist = fs.existsSync(paths.USERDATA.settings);
function createSettings(){
    console.log('creating settings');
    fs.writeFileSync( paths.USERDATA.settings, JSON.stringify(defaultSettings,null,2), "utf-8" );
}


//validate settings structure on app startup
function validateSettings(defaults, savedSettings){
    const validated = {};
    
    for (const key in defaults){
        const defaultVal = defaults[key];
        const settingsVal = savedSettings[key];

        //compare saved settings to default
        if(settingsVal === undefined || settingsVal === null || settingsVal === ""){
            validated[key] = defaultVal;
            continue
        }

        //if are object -> check inside
        if (typeof defaultVal === "object" && !Array.isArray(defaultVal)){
            if(typeof settingsVal !== "object" || Array.isArray(settingsVal)){
                validated[key] = defaultVal;
            }else{
                validated[key] = validateSettings(defaultVal, settingsVal);
            }
            continue
        }

        if(typeof settingsVal !== typeof defaultVal){
            validated[key] = defaultVal;
        }else{
            validated[key] = settingsVal
        }

    }
    return validated; 
}

function checkSettings (){
    let settings = {};
    try{
        const raw = fs.readFileSync(paths.USERDATA.settings,"utf-8");
        settings = JSON.parse(raw || "{}");
    }catch(err){
        console.log("something went wrong opening settings, reseting to default");
        settings = {};
    }
    const validated = validateSettings(defaultSettings, settings)
    fs.writeFileSync(paths.USERDATA.settings, JSON.stringify(validated, null, 2), "utf-8");
    return validated
}

//update a setting using path provided as an array:
function updateSetting(settings,pathArray, value) {
    if (!Array.isArray(pathArray) || pathArray.length === 0) return;


    let current = settings;
    pathArray.forEach((key, i) => {
        if (i === pathArray.length - 1) {
            current[key] = value;
        } else {
            if (!current[key] || typeof current[key] !== "object") current[key] = {};
            current = current[key];
        }
    });

    fs.writeFileSync(paths.USERDATA.settings, JSON.stringify(settings, null, 2), "utf-8");
    return settings;
}

module.exports = { settingsExist, createSettings, checkSettings, updateSetting};