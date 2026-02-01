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

//{
// dict:{
//      "expression":{entry}
//  }
//}
//merges entries in dict if the expression and reading were the same (merges tags + glossary)
function getGlossEntriesSortedByDicts(termArray){
    const out = {};
    termArray.forEach(term => {
        console.log(term)
        const glossKeys = Object.keys(dicts.glossary);
        const dictGloss = dicts.glossary;
        let entries;
        glossKeys.forEach(key => {
            if(dictGloss[key].index.has(term)){
                entries = dictGloss[key].index.get(term);
            }

            if(!entries)return;

            let tempOut = {};                    
            entries.forEach(entry =>{
                const glossEntr = dictGloss[key].termMap.get(entry); 
                //merge
                if( tempOut.hasOwnProperty(glossEntr.expression) && tempOut[glossEntr.expression].reading === glossEntr.reading ){
                    glossEntr.tags.forEach(tag => { tempOut[glossEntr.expression].tags.push(tag) } );
                    glossEntr.glossary.forEach(gloss => { tempOut[glossEntr.expression].glossary.push(gloss) } );
                }
                //append
                else{
                    tempOut[glossEntr.expression] = glossEntr;
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
    dictKeys.forEach(dict => {
        const expressionKeys = Object.keys(GlossEntriesByDictionaries[dict]);
        expressionKeys.forEach(expr =>{
            const entry = GlossEntriesByDictionaries[dict][expr];

            if(!GlossEntriesMergedByExpr[expr]){
                GlossEntriesMergedByExpr[expr] = {
                    expression: expr,
                    reading: entry.reading,
                    glossary: {},
                    tags: {}
                }
            }

            GlossEntriesMergedByExpr[expr].glossary[dict] = entry.glossary ?? [];
            GlossEntriesMergedByExpr[expr].tags[dict] = entry.tags ?? [];
        })
    })

    //add by term / reading meta info

    const expressionKeys = Object.keys(GlossEntriesMergedByExpr);
    const metaDicts = dicts.meta
    const metaKeys = Object.keys(metaDicts);
    
    expressionKeys.forEach(expr => {
        
        metaKeys.forEach(key => {
            const entries = metaDicts[key].index.get(expr)
            if(!entries)return
            
            let entry_array = [];
            entries.forEach( index => {
                const entry = metaDicts[key].termMap.get(index);
                console.log(entry)
                if(!entry)return;
                //check if expression and reading fit;
                if( GlossEntriesMergedByExpr[expr].expression === entry.expression ){
                    //if expression matches but reading doesnt -> cant add pitch / freq
                    console.log(`The if statement at like 133: ${entry.hasOwnProperty("reading") && GlossEntriesMergedByExpr[expr].reading !== entry.reading}`)
                    if( entry.reading && GlossEntriesMergedByExpr[expr].reading !== entry.reading )return
                    entry_array.push(entry.data);
                }

            })

            //type is same for all in one dict so we can get the first one
            const type = metaDicts[key].termMap.get(entries[0]).type;
            if(!GlossEntriesMergedByExpr[expr][type]) GlossEntriesMergedByExpr[expr][type] = {};

            GlossEntriesMergedByExpr[expr][type][key] = entry_array;

        })

    })   

    console.log(
        util.inspect(GlossEntriesMergedByExpr, {
            depth: null,
            colors: true,
            maxArrayLength: null,
            compact: false
        })
    );

}


//main
function lookup(term){
    const variations = make_variations(term);
    console.log("Lookup variations:\n", variations);
    
    if(!variations.success){
        console.log(`No valid variations could be made for term ${term}`);
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

    

    getDictEntry(varsArray);
    //mem log
    // const totalAPPsize = process.memoryUsage().heapUsed;
    // console.log(`App uses ${(totalAPPsize/1024/1024).toFixed(2)}MB of memory `)
}
module.exports = { lookup };