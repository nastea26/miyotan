const { app } = require("electron");
const path = require("path");

const root = app.getAppPath();
const preload = path.join(root, "preload", "preload.js");

const SRC = {
    self : path.join(root, "src"),
}

const RENDERER = {
    self : path.join(root, "renderer"),
    index : path.join(root, "renderer", "index.html"),
}

module.exports = {
    root,
    preload,
    SRC, 
    RENDERER
}