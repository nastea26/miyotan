const { execFile } = require("child_process");
const fs = require("fs");
const paths = require("../../utils/paths");

/**
 * Capture a selected area on Linux using the compiled capture_area executable
 * @param {Object} rect - { x, y, width, height }
 * @returns {Promise<string>} - path to saved PNG
 */
function linux(rect) {
    return new Promise((resolve, reject) => {
        if (!rect || typeof rect !== "object") {
            return reject(new Error("Invalid rectangle"));
        }

        const { x, y, width, height } = rect;

        // Ensure temp folder exists
        if (!fs.existsSync(paths.temp)) fs.mkdirSync(paths.temp, { recursive: true });

        // Output file path
        const output = `${paths.temp}/selection.png`;

        // Path to your compiled capture_area executable
        console.log(`Path to linux: "${paths.BIN.linux}"`)
        const exePath = `${paths.BIN.linux}/capture`;

        // Spawn the executable
        execFile(exePath, [x, y, width, height, output], (err, stdout, stderr) => {
            if (err) {
                console.error("Linux capture error:", stderr || err.message);
                return reject(err);
            }

            resolve(output);
        });
    });
}

module.exports = { linux };
