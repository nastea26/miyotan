const { execFile } = require("child_process");

/**
 * Run tesseract OCR on an image
 * @param {string} imagePath
 * @param {string[]} args
 * @returns {Promise<string>}
 */


function runTesseract(imagePath, args = []) {
    return new Promise((resolve, reject) => {
        const cmd = "tesseract";

        const fullArgs = [
            imagePath,
            "stdout",
            ...args
        ];

        execFile(cmd, fullArgs, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                console.error("Tesseract error:", stderr || err.message);
                return reject(err);
            }

            resolve(stdout);
        });
    });
};

module.exports = { runTesseract };
