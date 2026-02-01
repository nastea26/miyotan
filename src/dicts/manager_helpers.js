const wanakana = require('wanakana');

function load_tag_bank(data,targetMap){
    for (const entry of data){
        if(!entry || entry.length === 0)continue;

        const key = entry[0];
        const value = {
            name: entry[0],
            type: entry[1] ?? null,
            first_num_idk: entry[2] ?? null,
            description: entry[3] ?? null,
            second_num_idk:entry[4]?? null
        }

        if(!targetMap.has(key))targetMap.set(key,value);
    }
}

function load_glossary_index_and_terms(data,id,termMap,index){
    for (const entry of data){
        if(!entry || entry.length === 0)continue;

        const eid = id++; 
        
        const tags_claned = [entry[2], entry[3], entry[7]].filter(Boolean);
        const value = {
            expression: entry[0],
            reading: entry[1]??null, 
            tags: tags_claned,
            glossary: entry[5], 
            idk_num_1: entry[4],
            idk_num_2: entry[6]
        }

        termMap.set(eid,value);
        const key = entry[0];
        const readKey = (entry[1] === "" || !entry[1]) ? null : wanakana.toHiragana(entry[1]);
        if(!index.has(key)) index.set( key, [] );
        index.get(key).push(eid);

        if(readKey){
            if(!index.has(readKey)) index.set( readKey,[] )
            index.get(readKey).push(eid)
        }
        
    }
    return id;
}

function load_meta_index_and_term(data, id, termMap, index){

    const normalizedFreqObject = (val,dispVal) => ( { value: Number(val), displayValue: dispVal ?? val.toString() } )
    const handleValue = ( (f) =>{
        if(typeof f === "string" || Number.isInteger(f) )return normalizedFreqObject(f, typeof f === "string" ? f : undefined);
        return undefined;
    })

    for (const entry of data){
        if(!entry || entry.length === 0)continue;

        const eid = id++;
        const exp = entry[0];
        //double check if this fits with pitch
        const read = typeof entry[2] === "object" ? entry[2].reading : undefined;
        const typeEnt = entry[1];
        let entryData = [];
        if(typeEnt === "freq"){
            const freqEntry = entry[2];
            //needed for skipping checks
            entryData = undefined;

            //if already just a str or int:
            entryData = handleValue(freqEntry);

            //if it was an object 
            if ( typeof freqEntry === "object" && !Array.isArray(freqEntry) && entryData === undefined){
                const freq = freqEntry.frequency ?? freqEntry; 
                
                //freqEntry.frequency is an object or freqEntry.frequency doesnt exist and freqEntry is an object
                if( typeof freq === "object" && !Array.isArray(freq) && freq.hasOwnProperty("value") ){
                    entryData = normalizedFreqObject(freq.value, freq.displayValue ?? undefined) 
                }

                //freqEntry.frequnecy is a value, (if its an obj caught above, freqEntry being a value is handled above)
                if(entryData === undefined)
                entryData = handleValue(freq);
            }
        
        }

        if(typeEnt === "pitch"){
            const pitchEntry = entry[2];
            pitchEntry.pitches.forEach(pitchObj => {
                const devoiceExists = pitchObj.hasOwnProperty("devoice");
                const nasalExists = pitchObj.hasOwnProperty("nasal");
                const pitchPos = pitchObj.position;
                let devoiceVar, nasalVar;
                if(!devoiceExists){
                    devoiceVar = [];
                }
                if(!nasalExists){
                    nasalVar = [];
                }
                entryData.push( { position: pitchPos, nasal: nasalExists ? pitchObj.nasal : nasalVar, devoice: devoiceExists ? pitchObj.devoice : devoiceVar } )

            });
        }

        const value = {
            expression: exp,
            reading: read,
            type: typeEnt,
            data: entryData 
        }
        termMap.set(eid,value);
        const key = exp;
        if(!index.has(key)) index.set(key,[]);
        index.get(key).push(eid);
    }
    return id

}

async function load_glossary(zip,index,termMap,tagMap){
    let id = 0;
    const fileNames = Object.keys(zip.files);
    for (const fileName of fileNames){
        //skip non json
        if( !fileName.endsWith(".json") )continue;

        //skip index.json
        if( fileName === "index.json" )continue;

        //for now skip all kanji related dicts
        if( fileName.startsWith("kanji") )continue;

        //only read tag or term dicts just to make sure
        if( !fileName.startsWith("tag_") && !fileName.startsWith("term_") )continue

        const tag_file = fileName.startsWith("tag_bank");
        const term_file = fileName.startsWith("term_bank");
        
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

async function load_meta(zip,index,termMap){
    let id = 0;
    const fileNames = Object.keys(zip.files);
    for (const fileName of fileNames){
        if( !fileName.endsWith(".json") ) continue;
        if( fileName==="index.json" ) continue;
        if( fileName.startsWith("kanji") )continue
        if( !fileName.startsWith("term_meta_bank") )continue;


        const data = JSON.parse( await zip.file(fileName).async("string") );
        if(!Array.isArray(data))continue;
        
        id = load_meta_index_and_term(data, id, termMap, index)
    }
    return { type: "meta", index, termMap };
}


module.exports = { load_glossary, load_meta }