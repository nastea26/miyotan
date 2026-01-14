const { runTesseract } = require("./tesseract");
const { scoreJapanese } = require("./post");
const paths = require("../../utils/paths");
//ocr PSMS 

const HORIZONTAL_PSMS = [7, 8, 11];
const VERTICAL_PSMS = [1, 3, 5,]; 

function normalizeJapanese(text) {
    return text
        .replace(/\s+/g, "")          
        .replace(/[=:\)\(\[\]\|]/g, "")        
        .replace(/〜/g, "ー")                  
        .replace(
            /[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}0-9０-９ー。、？！?!"「」『』…@#\/\-_]/gu,
            ""
        )
        .trim();
}

async function ocr() {
    const preprocessed = `${paths.temp}/selection-prepped.png`;

    const sharp = require("sharp");
    const metadata = await sharp(preprocessed).metadata();
    const isVertical = metadata.height > metadata.width * 1.25;

    const candidates = [];
    const psms = isVertical ? VERTICAL_PSMS : HORIZONTAL_PSMS;
    const lang = isVertical ? "jpn_vert" : "jpn";

  // Run OCR for each relevant PSM
    for (const psm of psms) {
        candidates.push(await runTesseract(preprocessed, ["-l", lang, "--psm", psm, "--oem", "3"]));
    }

  // Clean and filter
    const cleaned = candidates
        .map(normalizeJapanese)
        .filter(t => t.length >= 2);

  // Score and rank
    const ranked = cleaned
        .map(text => ({ text, score: scoreJapanese(text) }))
        .sort((a, b) => b.score - a.score);

    console.log("OCR candidates:", ranked.map(r => `${r.text} (${r.score})`));

    return ranked[0]?.text || "";
};

module.exports = { ocr }