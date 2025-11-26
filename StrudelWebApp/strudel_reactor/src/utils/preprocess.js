// Keeping track of defaults so db can reflect merged results (before and after save)
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

    // Merge defaults + overrides once, then and only then proceed to destructure
    const merged = { ...defaultControls, ...controls };

    const cps = merged.cps;
    const room = merged.room;
    const gain = merged.gain;
    const muteDrums = merged.muteDrums;
    const drumsPattern = merged.drumsPattern;
    const p1Hushed = merged.p1Hushed;
    const synth = merged.synth;

    let out = String(raw);

    out = out.replaceAll("<p1_Radio>", p1Hushed ? "_" : "");
    out = out.replaceAll("<DRUMS>", muteDrums ? "~" : drumsPattern);
    out = out.replaceAll("<CPS>", String(cps));
    out = out.replaceAll("<ROOM>", String(room));
    out = out.replaceAll("<GAIN>", String(gain));
    out = out.replaceAll("<SYNTH>", String(synth));

    return out;
}
