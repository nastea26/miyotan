function scoreJapanese(text) {
    let score = 0;

    if (text.length <= 6 && /[0-9]/.test(text.slice(-1))) {
    score -= 1; // discourage ending with a number in a short sentence
    }
    // Small bonus for sentence-ending punctuation
    if (/[？！?]$/.test(text)) {
        // For short sentences, give a stronger boost
        if (text.length <= 6) {
            score += 3;  // short meaningful sequence
        } else {
            score += 0.8; // normal bonus for long sentences
        }
    }
    // Keep punctuation and special symbols
    const punctuation = (text.match(/[。、？！「」『』…?@#\/\-_]/g) || []).length;
    score += punctuation * 0.7;

    const chars = text.replace(/[。、？！「」『』…]/g, "");
    const specialChars = (chars.match(/[@#\/\-_]/g) || []).length;
    let effectiveLength = chars.length - specialChars;

    const kanji = (chars.match(/[一-龯]/g) || []).length;
    const hira  = (chars.match(/[ぁ-ん]/g) || []).length;
    const kata  = (chars.match(/[ァ-ン]/g) || []).length;
    const nums  = (chars.match(/[0-9０-９]/g) || []).length;

    // Base scoring
    score += kanji * 2 + hira * 1.5 + kata * 1.5 + nums * 1.2;

    // Extra boosts
    if (/[0-9０-９]+(分|時|人|円|回)/.test(chars)) score += 5;

    // Penalties
    if (kanji === 0 && nums === 0 && chars.length > 6) score -= 6; // long kana-only sequences
    if (/([ぁ-んァ-ン])\1{2,}/.test(chars)) score -= 6;                // repeated kana

    // Pre-kanji kana penalty (likely furigana or junk)
    const firstKanjiIndex = chars.search(/[一-龯]/);
    if (firstKanjiIndex > 0) {
        // Penalize kana before first kanji
        const preKanji = chars.slice(0, firstKanjiIndex);
        const preKana = (preKanji.match(/[ぁ-んァ-ン]/g) || []).length;
        score -= preKana * 1.5; // heavier than before
    }

    // Bloat detection in isolated chunks
    const furiganaChunks = chars.match(/[一-龯][ぁ-んァ-ン]{5,}/g) || [];
    const katakanaChunks = chars.match(/[ァ-ン]{6,}/g) || [];
    score -= (furiganaChunks.length + katakanaChunks.length) * 2;

    // Length multiplier for main text (after first kanji)
    let mainLength = effectiveLength;
    if (firstKanjiIndex >= 0) mainLength = effectiveLength - firstKanjiIndex; // count only after first kanji
    const lengthMultiplier = 1 + Math.log(mainLength + 1) / Math.log(1.3);

    // Apply multiplier
    score *= lengthMultiplier;

    // Small bonus for sentence-ending punctuation
    if (/[？！]$/.test(text)) score += 0.5;

    return score;
}
module.exports = { scoreJapanese }
