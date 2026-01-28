const fs = require("fs");
const path = require("path");
const paths = require("../../utils/paths"); 
const JSZip = require("jszip");
const { app } = require("electron");

// in memory dicts 
const dicts = {};

async function initDataDir(){
    await fs.promises.mkdir(paths.USERDATA.dicts, { recursive: true });
}

async function loadDicts(zipPath){
    const zip = await JSZip.loadAsync(await fs.promises.readFile(zipPath));

    const termMap = new Map();
    const index = new Map();

    let id = 0;

    for (const fileName of Object.keys(zip.files)){
        //skip non json
        if (!fileName.endsWith(".json")) continue;
        if(fileName === "index.json" || fileName.startsWith("tag_blank_")) continue;

        const data = JSON.parse(await zip.file(fileName).async("string"));
        if(!Array.isArray(data))continue;

        for (const entry of data){
            const eid = id++; 
            termMap.set(eid,entry);
            const key = entry[0];
            if(!index.has(key)) index.set(key, []);
            index.get(key).push(eid);

        }
    }
    return {index, termMap}
}

async function importDict (fileData, fileName){
    await initDataDir();

    const name = path.basename(fileName, ".zip");
    const destPath = path.join(paths.USERDATA.dicts, `${name}.zip`);

    //persistance
    await fs.promises.writeFile(destPath, Buffer.from(fileData));

    const dict = await loadDicts(destPath);
    dicts[name] = dict;

    return {name, entries: dict.termMap.size};
}


function listDicts(){
    return Object.entries(dicts).map(([name,dict]) => ({
        name,
        entries:dict.termMap.size
    }))
}

async function loadAllDicts(){
    await initDataDir();

    const files = await fs.promises.readdir(paths.USERDATA.dicts);
    const zips = files.filter(f => f.endsWith(".zip"));

    for (const zip of zips){
        const zipPath = path.join(paths.USERDATA.dicts, zip);
        const name = path.basename(zip, ".zip");
        dicts[name] = await loadDicts(zipPath);
    }

    return listDicts();
}

async function removeDict(name){
    const fpath = path.join(paths.USERDATA.dicts, `${name}.zip`);
    await fs.promises.unlink(fpath).catch(()=>{});
    delete dicts[name];
}

module.exports = { dicts, importDict, listDicts, loadAllDicts, removeDict}