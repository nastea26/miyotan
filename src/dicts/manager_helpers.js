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
        if(!index.has(key)) index.set(key, []);
        index.get(key).push(eid);
    }
    return id;
}




module.exports = { load_tag_bank, load_glossary_index_and_terms  }