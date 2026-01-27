const { app } = require("electron");
const path = require("path");

const root = app.getAppPath();
const usrData = app.getPath("userData");
const USERDATA = {
    self : usrData,
    settings : path.join(usrData,"settings.json")
}

const preload = path.join(root, "preload", "preload.js");
const temp = path.join(root, "temp");
const SRC = {
    self : path.join(root, "src"),
}

const RENDERER = {
    self : path.join(root, "renderer"),
    index : path.join(root, "renderer", "index.html"),
    selection: path.join(root, "renderer", "selection.html"),
}

const BIN = {
    self : path.join(root,"bin"),
    linux : path.join(root,"bin","linux"),
    macos : path.join(root, "bin", "macos"),
    win : path.join(root,"bin", "win")
}

module.exports = {
    root,
    USERDATA,
    
    preload,
    temp,

    
    BIN,
    SRC, 
    RENDERER,
}