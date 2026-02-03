const { dicts } = require("./manager");
const wanakana = require("wanakana");
const util = require("util");

function make_variations(term){
    if(wanakana.isRomaji(term) || wanakana.isHiragana(term) || wanakana.isKatakana(term)){
        return {
            base : term,
            hiragana : wanakana.toHiragana(term),
            katakana : wanakana.toKatakana(term),
            wasKata: wanakana.isKatakana(term),
            wasHira: wanakana.isHiragana(term),
            wasRomaji: wanakana.isRomaji(term),
            kanji: false,
            mixed: false,
            success: true,
        }
    }
    if(wanakana.isKanji(term)){
        return {
            base : term,
            kanji: true,
            mixed: false,
            success: true,
        }
    }
    if(wanakana.isJapanese(term)){
        return {
            base : term,
            kanji: false,
            mixed: true,
            success: true,
        }
    }
    return { success:false };
}


function makeUniqueKey(expression, reading) {
    return `${expression}｜${reading ?? ""}`;
}


//{
// dict:{
//      "expression":{entry}
//  }
//}
//merges entries in dict if the expression and reading were the same (merges tags + glossary)
function getGlossEntriesSortedByDicts(termArray){
    const out = {};
    termArray.forEach(term => {
        const glossKeys = Object.keys(dicts.glossary);
        const dictGloss = dicts.glossary;
        glossKeys.forEach(key => {
            const entries = dictGloss[key].index.get(term);

            if(!entries)return;

            let tempOut = {};                    
            entries.forEach(entry =>{
                const glossEntr = dictGloss[key].termMap.get(entry); 
                const uniqueKey = makeUniqueKey(glossEntr.expression,glossEntr.reading)
                //merge

                if( tempOut[uniqueKey] && tempOut[uniqueKey].reading === glossEntr.reading ){

                    //make current tags into set so we can filter duplicates
                    const tagsSet = new Set(tempOut[uniqueKey].tags);
                    glossEntr.tags.forEach(tag => tagsSet.add(tag))
                    //to array again
                    tempOut[uniqueKey].tags = Array.from(tagsSet); 
                    glossEntr.glossary.forEach(gloss => { tempOut[uniqueKey].glossary.push(gloss) } );
                }
                //append
                else{
                    tempOut[uniqueKey] = glossEntr;
                }
            })
            
            out[key] = tempOut;
        })
    });
    return out;
}

function getDictEntry(termArray){
    const GlossEntriesByDictionaries = getGlossEntriesSortedByDicts(termArray);
    const dictKeys = Object.keys(GlossEntriesByDictionaries);
    const GlossEntriesMergedByExpr = {};
    
    //merge into 
    //Im gonna ignore merging the numbers i dont know the meaing of (idk_num 1 and 2)
    // "expression":{
    //     "expression":x, "reading":x, glossary: {"dictName": [] , "dictName": []}, tags: {"dictName":[], "dictName" :[]}
    // }
    //remade to "expression | reading" because cases like 来る
    dictKeys.forEach(dict => {
        const expressionKeys = Object.keys(GlossEntriesByDictionaries[dict]);
        expressionKeys.forEach(uniqueKey =>{
            const entry = GlossEntriesByDictionaries[dict][uniqueKey];

            if(!GlossEntriesMergedByExpr[uniqueKey]){
                GlossEntriesMergedByExpr[uniqueKey] = {
                    expression: entry.expression,
                    reading: entry.reading,
                    glossary: {},
                    tags: {}
                }
            }

            GlossEntriesMergedByExpr[uniqueKey].glossary[dict] = entry.glossary ?? [];
            GlossEntriesMergedByExpr[uniqueKey].tags[dict] = entry.tags ?? [];
        })
    })

    //add by term / reading meta info

    const expressionKeys = Object.keys(GlossEntriesMergedByExpr);
    const metaDicts = dicts.meta
    const metaKeys = Object.keys(metaDicts);
    
    expressionKeys.forEach(exprKey => {
        const exprEntry = GlossEntriesMergedByExpr[exprKey];
        const expr = exprEntry.expression
        
        
        metaKeys.forEach(key => {
            const entries = metaDicts[key].index.get(expr)
            if(!entries)return
            
            let entry_array = [];
            entries.forEach( index => {
                const entry = metaDicts[key].termMap.get(index);
                if(!entry)return;
                //check if expression and reading fit;
                if( exprEntry.expression === entry.expression ){
                    //if expression matches but reading doesnt -> cant add pitch / freq
                    if( entry.reading && exprEntry.reading !== entry.reading )return
                    entry_array.push(entry.data);
                }

            })

            //type is same for all in one dict so we can get the first one
            const type = metaDicts[key].termMap.get(entries[0]).type;
            if(!exprEntry[type]) exprEntry[type] = {};

            exprEntry[type][key] = entry_array;

        })

    })   

    return Object.values(GlossEntriesMergedByExpr);
}


//main
function lookup(term){
    const variations = make_variations(term);
    
    if(!variations.success){
        return false; 
    }
    let varsArray = [];
    // use original input as first, but compare also other 
    if(!variations.mixed && !variations.kanji){
        if(variations.wasHira || variations.wasRomaji){
            varsArray.push(variations.hiragana);
            varsArray.push(variations.katakana);
        }else{
            varsArray.push(variations.katakana);
            varsArray.push(variations.hiragana);
        }
    }
    else{
        //only use base from for kanji + kanji+kana 
        varsArray.push(variations.base);
    }

    

    return getDictEntry(varsArray);
    //mem log
    // const totalAPPsize = process.memoryUsage().heapUsed;
    // console.log(`App uses ${(totalAPPsize/1024/1024).toFixed(2)}MB of memory `)
}
module.exports = { lookup };