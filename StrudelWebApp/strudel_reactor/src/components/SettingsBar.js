import { useRef } from "react";
import { useStrudel } from "../context/StrudelProvider";
import { defaultControls } from "../utils/preprocess";

const API_BASE_URL = "http://localhost:5138"; // for marker, adjust this to your port

// Enforce CPS as int/int/int (e.g. 120/60/4)
const CPS_REGEX = /^\d+\/\d+\/\d+$/;

export default function SettingsBar() {
    const { raw, setRaw, controls, setControls } = useStrudel();
    const fileRef = useRef(null);

    const onSave = async () => {
        const name = window.prompt("Name this preset:");
        if (!name) return;

        // CPS that preprocessSong uses
        const cpsValue = String(
            controls.cps ??
            defaultControls.cps
        );

        if (!CPS_REGEX.test(cpsValue)) {
            alert(
                "CPS must be in the format int/int/int\n" +
                "For example: 120/60/4"
            );
            return;
        }

        // snapshot of settings for save
        const presetControls = {
            cps: cpsValue,
            room: controls.room ?? defaultControls.room,
            gain: controls.gain ?? defaultControls.gain,
            muteDrums: controls.muteDrums ?? defaultControls.muteDrums,
            drumsPattern: controls.drumsPattern ?? defaultControls.drumsPattern,
            p1Hushed: controls.p1Hushed ?? defaultControls.p1Hushed,
            synth: controls.synth ?? defaultControls.synth,
        };

        console.log("presetControls before save:", presetControls);

        try {
            const res = await fetch(`${API_BASE_URL}/api/StrudelPreset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    raw,
                    controlsJson: JSON.stringify(presetControls),
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to save preset: ${res.status} ${text}`);
            }

            alert("Preset saved to database.");
        } catch (err) {
            console.error(err);
            alert("Error saving preset, check console for details.");
        }
    };

    const onOpenClick = () => fileRef.current?.click();

    const onLoad = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (typeof data.raw === "string") setRaw(data.raw);
            if (data.controls && typeof data.controls === "object") {
                setControls(data.controls);
            }
        } finally {
            // Needed to allow re-selecting the same file name again
            e.target.value = "";
        }
    };

    return (
        <div className="card jsr-card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">Check it Out:</h6>
                    <span className="text-muted small">
                        If you're the forgetful type, you can also SAVE and LOAD your song/settings.
                        Now we can save to the database too.
                    </span>
                </div>
                <div className="d-flex gap-2">
                    <button type="button" className="btn jsr" onClick={onSave}>
                        <strong>SAVE</strong> to DB
                    </button>
                    <button type="button" className="btn jsr" onClick={onOpenClick}>
                        <strong>LOAD</strong> Song/Settings JSON
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/json"
                        hidden
                        onChange={onLoad}
                    />
                </div>
            </div>
        </div>
    );
}
