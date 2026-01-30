const fs = require("fs");
const path = require("path");
const paths = require("../../utils/paths"); 
const JSZip = require("jszip");

//helpers 
const { load_glossary, load_meta } = require("./manager_helpers");

// in memory dicts 
const dicts = {
    glossary:{},
    meta:{}
};


async function initDataDir(){
    await fs.promises.mkdir(paths.USERDATA.dicts, { recursive: true });
}


async function loadDicts(zipPath){
    const zip = await JSZip.loadAsync(await fs.promises.readFile(zipPath));

    const termMap = new Map();
    const index = new Map();
    const tagMap = new Map();

    const hasGlossary = Object.keys(zip.files).some(name => name.startsWith("term_bank_"));
    const hasMeta = Object.keys(zip.files).some(name => name.startsWith("term_meta_bank_"));

    //glossary only
    if(hasGlossary && !hasMeta){
        return load_glossary(zip,index, termMap, tagMap)
    }

    //meta only
    else if(!hasGlossary && hasMeta){
        return load_meta(zip, index, termMap);
    }

    //mixed
    else if(hasGlossary && hasMeta){

    }
    return null;
}

async function importDict (fileData, fileName){
    await initDataDir();

    const name = path.basename(fileName, ".zip");
    const destPath = path.join(paths.USERDATA.dicts, `${name}.zip`);

    //persistance
    await fs.promises.writeFile(destPath, Buffer.from(fileData));

    const dict = await loadDicts(destPath);
    if (!dict) return null;

    if (dict.type === "glossary") {
        dicts.glossary[name] = dict;
    } else {
        dicts.meta[name] = dict;
    }

    return { name, entries: dict.termMap.size };
}


function listDicts(){
    return {
        glossary: Object.entries(dicts.glossary).map(([name, d]) => ({
            name,
            entries: d.termMap.size
        })),
        meta: Object.entries(dicts.meta).map(([name, d]) => ({
            name,
            entries: d.termMap.size
        }))
    };
}

async function loadAllDicts(){
    await initDataDir();

    const files = await fs.promises.readdir(paths.USERDATA.dicts);
    const zips = files.filter(f => f.endsWith(".zip"));

    for (const zip of zips){
        const zipPath = path.join(paths.USERDATA.dicts, zip);
        const name = path.basename(zip, ".zip");
        
        const dict = await loadDicts(zipPath);
        if (!dict) continue;

        if (dict.type === "glossary") {
            dicts.glossary[name] = dict;
        } else {
            dicts.meta[name] = dict;
        }
    }

    return listDicts();
}

async function removeDict(name){
    const fpath = path.join(paths.USERDATA.dicts, `${name}.zip`);
    await fs.promises.unlink(fpath).catch(()=>{});
    delete dicts.glossary[name];
    delete dicts.meta[name];
}

module.exports = { dicts, importDict, listDicts, loadAllDicts, removeDict}