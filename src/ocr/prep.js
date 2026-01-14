const paths = require("../../utils/paths");
const sharp = require("sharp");

async function prepIMG() {
    const img_path = `${paths.temp}/selection.png`;
    
    let img = sharp(img_path)
    .normalize()
    .grayscale()
    .blur(.5);

    await img.toFile(`${paths.temp}/selection-prepped.png`);
    return; 
}

module.exports = { prepIMG };