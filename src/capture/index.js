const { linux } = require("./linux")
const { windows } = require("./windows")
const { macos } = require("./macos")
const type = process.platform;

async function capture(rect){
    if (type === "linux")return linux(rect);
    if (type === "win32")return windows(rect);
    if (type === "darwin")return macos(rect);
    throw new Error("Unsupported platform");
}

module.exports = { capture };