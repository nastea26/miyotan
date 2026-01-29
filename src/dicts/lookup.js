const { dicts } = require('./manager');
const wanakana = require('wanakana');

const fs = require("fs");
const path = require("path");

async function saveDictsToFile() {
    try {
        const outPath = path.join(__dirname, "out.json");

        const serializable = {
            glossary: {},
            meta: {}
        };

        for (const [groupName, group] of Object.entries(dicts)) {
            for (const [dictName, dict] of Object.entries(group)) {
                serializable[groupName][dictName] = {
                    termMap: Object.fromEntries(dict.termMap),
                    index: Object.fromEntries(dict.index),
                    tagMap: Object.fromEntries(dict.tagMap)
                };
            }
        }

        await fs.promises.writeFile(
            outPath,
            JSON.stringify(serializable, null, 2),
            "utf8"
        );

        console.log(`Dictionaries saved → ${outPath}`);
    } catch (err) {
        console.error("Failed to save dictionaries:", err);
    }
}



// prep
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

    saveDictsToFile();
    
}
module.exports = { lookup };