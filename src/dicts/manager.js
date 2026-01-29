const fs = require("fs");
const path = require("path");
const paths = require("../../utils/paths"); 
const JSZip = require("jszip");

//helpers 
const { load_tag_bank, load_glossary_index_and_terms } = require("./manager_helpers");

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
        let id = 0;
        const fileNames = Object.keys(zip.files)
        for (const fileName of fileNames){
            //skip non json
            if( !fileName.endsWith(".json") )continue;

            //skip index.json
            if( fileName === "index.json" )continue;

            //for now skip all kanji related dicts
            if( fileName.startsWith("kanji") )continue;

            //only read tag or term dicts just to make sure
            if( !fileName.startsWith("tag_") && !fileName.startsWith("term_") )continue

            const tag_file = fileName.startsWith("tag_");
            const term_file = fileName.startsWith("term_");
            
            const data = JSON.parse( await zip.file(fileName).async("string") );
            //skip if empty -> so far all ive seen were arrays 
            if(!Array.isArray(data))continue

            if(tag_file){
                load_tag_bank(data,tagMap)
                continue;
            }
            else if(term_file){
                //load current file update id
                id = load_glossary_index_and_terms(data,id,termMap,index)
            }

        }
        return { type: "glossary", index, termMap, tagMap };
    }

    //meta only
    else if(!hasGlossary && hasMeta){
        return { type: "meta", index, termMap, tagMap };
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