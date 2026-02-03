const fs = require("fs");
const path = require("path");
const { lookup } = require('./dicts/lookup');
const { get_sentence_tokens } = require("./tokenizer/tokenize");

function run(){
    const testcase = "どうしようかなー、今日何もしてなかった";
    const out = [];
    const tokens = get_sentence_tokens(testcase);
    tokens.forEach(token => {
        out.push(lookup(token.basic_form));
    });

    save_out(out)
    

}

const out_path = "../temp/out.json"
function save_out(f){
    const fullPath = path.resolve(__dirname, out_path);
    fs.writeFileSync(fullPath, JSON.stringify(f, null, 2), "utf8");
}

module.exports = { run }