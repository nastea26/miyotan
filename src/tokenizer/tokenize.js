const kuromoji = require("kuromoji");
const paths = require("../../utils/paths");

let tokenizer;

async function initTokenizer() {
    return new Promise( (resolve,reject) =>{
        if(tokenizer) return resolve(true);

        kuromoji.builder( { dicPath: `${paths.root}/node_modules/kuromoji/dict` } ).build( (err, t) =>{
            if(err) return reject(err);
            tokenizer  = t;
            return resolve(true)
        })   
    })

}

function get_sentence_tokens(sentence){
    if(!tokenizer) throw new Error("Tokenizer not initialized yet");
    return tokenizer.tokenize(sentence)

}


module.exports = { initTokenizer, get_sentence_tokens }