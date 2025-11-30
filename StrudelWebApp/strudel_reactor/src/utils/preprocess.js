// utils/preprocess.js

// Single source of truth for control defaults
export const defaultControls = {
    cps: "120/60/4",                       // bpm/spm/bpc
    room: 0.2,
    gain: 1.2,
    muteDrums: false,
    drumsPattern: "bd sd [~ bd] sd, hh*16",
    p1Hushed: false,
    synth: "gm_piano:0",
};

export function preprocessSong(raw, controls = {}) {
    if (!raw) return "";

    const cps =
        controls.cps ??
        defaultControls.cps;

    const room =
        controls.room ??
        defaultControls.room;

    const gain =
        controls.gain ??
        defaultControls.gain;

    const muteDrums =
        controls.muteDrums ??
        defaultControls.muteDrums;

    const drumsPattern =
        controls.drumsPattern ??
        defaultControls.drumsPattern;

    const p1Hushed =
        controls.p1Hushed ??
        defaultControls.p1Hushed;

    const synth =
        controls.synth ??
        defaultControls.synth;

    let out = String(raw);

    out = out.replaceAll("<p1_Radio>", p1Hushed ? "_" : "");
    out = out.replaceAll("<DRUMS>", muteDrums ? "~" : drumsPattern);
    out = out.replaceAll("<CPS>", String(cps));
    out = out.replaceAll("<ROOM>", String(room));
    out = out.replaceAll("<GAIN>", String(gain));
    out = out.replaceAll("<SYNTH>", String(synth));

    return out;
}
