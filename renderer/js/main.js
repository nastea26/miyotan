document.querySelectorAll('.hover-el').forEach(el => {
    let interval;
    el.addEventListener("mouseenter", e =>{
        const sharedClasses = ['span', 'text-2xl', 'text-cyan-100','transition', 'duration-200', 'opacity-100'];
        const Lclasses = ['mr-2'];
        const Rclasses = ['ml-2'];
        const spanL = document.createElement("span");
        const spanR = document.createElement("span");
        spanL.classList.add(...sharedClasses, ...Lclasses);
        spanR.classList.add(...sharedClasses, ...Rclasses);
        spanL.textContent = ">";
        spanR.textContent = "<";
        interval = setInterval(() => {
            spanL.classList.toggle('opacity-0');
            spanL.classList.toggle('opacity-100');
            spanR.classList.toggle('opacity-0');
            spanR.classList.toggle('opacity-100');
        }, 500);
        
        el.prepend(spanL);
        el.appendChild(spanR);
    });

    el.addEventListener("mouseleave", e=>{
        document.querySelectorAll(".span").forEach(el => { el.remove() } );
        clearInterval(interval);
    });
});

//keybind handling

const modifierKeys = new Set(["Ctrl", "Shift", "Alt", "Super"]);

function isValidKeybind(keys) {
    if (keys.size === 0) return false;

    let hasNormal = false;
    let hasCtrl = false;
    let hasAlt = false;
    let hasSuper = false;

    for (const key of keys) {
        if (!modifierKeys.has(key)) hasNormal = true;
        if (key === "Ctrl") hasCtrl = true;
        if (key === "Alt") hasAlt = true;
        if (key === "Super") hasSuper = true;
    }

    // Must contain at least one non-modifier key
    if (!hasNormal) return false;

    // If Super is used → must include Ctrl or Alt
    if (hasSuper && !(hasCtrl || hasAlt)) return false;

    return true;
}

let recordingEl = null;
let pressedKeys = new Set();
let prevKeybind = "";

function normalizeKey(key) {
    const map = {
        Control: "Ctrl",
        Shift: "Shift",
        Alt: "Alt",
        Meta: "Super",
        Escape: "Escape"
    };
    return map[key] || key.toUpperCase();
}

function formatKeybind(keys) {
    return [...keys].join("+");
}

function startRecording(el) {
    // If another element is already recording, cancel it
    if (recordingEl && recordingEl !== el) {
        recordingEl.textContent = prevKeybind;
        recordingEl.classList.remove("ring-2","ring-cyan-400");
        pressedKeys.clear();
        recordingEl = null;
    }

    recordingEl = el;
    prevKeybind = el.textContent;
    pressedKeys.clear();
    el.textContent = "Press keys...";
    el.classList.add("ring-2","ring-cyan-400");
}

function stopRecording() {
    if (!recordingEl || pressedKeys.size === 0) return;

    if (!isValidKeybind(pressedKeys)) {
        recordingEl.textContent = prevKeybind

        recordingEl.classList.remove("ring-2","ring-cyan-400");
        recordingEl = null;

        pressedKeys.clear();
        return;
    }

    const combo = formatKeybind(pressedKeys);

    recordingEl.textContent = combo;
    recordingEl.classList.remove("ring-2","ring-cyan-400");

    //gotta update it here cuz the other one works on change
    window.miyotanAPI.updateSetting(recordingEl.dataset.setting, combo);

    recordingEl = null;
    pressedKeys.clear();
}

// Cancel recording if user clicks outside the keybind element
window.addEventListener("click", e => {
    if (!recordingEl) return;

    if (!recordingEl.contains(e.target)) {
        recordingEl.textContent = prevKeybind;

        recordingEl.classList.remove("ring-2","ring-cyan-400");

            recordingEl = null;
        pressedKeys.clear();
    }
});


document.querySelectorAll(".keybind-el").forEach(el => {
    el.addEventListener("click", () => startRecording(el));
});

window.addEventListener("keydown", e => {
    if (!recordingEl) return;

    e.preventDefault();
    pressedKeys.add(normalizeKey(e.key));
    recordingEl.textContent = formatKeybind(pressedKeys);
});

window.addEventListener("keyup", e => {
    if (!recordingEl) return;

    setTimeout(stopRecording, 30);
});


//fetch settings and preset values based on settings
window.addEventListener("DOMContentLoaded", async() =>{
    const settings = await window.miyotanAPI.getSettings();
    document.querySelector("#enable-miyotan").checked = settings.enabled;
    document.querySelector("#launch-on-startup").checked = settings.launchOnStartup;
    document.querySelector(`option[value="${settings.ocr.language}"]`).selected = true;
    document.querySelector("#ocr-keybind").textContent = settings.hotkeys.selection
    document.querySelector("#cancel-keybind").textContent = settings.hotkeys.cancel
});

//handle changes in settings right as they happen
document.querySelectorAll('.settings-el').forEach(el => {
    el.addEventListener("change", (e) => {
        const target = el.dataset.setting
        let val;
        if(el.type === "checkbox"){
            val = el.checked;
        }else if(el.tagName.toLowerCase() === "select"){
            val = el.value;
        }else if(el.type === "number"){
            val = Number(el.value);
        }else{
            val = el.value
        }
        window.miyotanAPI.updateSetting(target,val);
    })
});

