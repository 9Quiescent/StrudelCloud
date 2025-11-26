import { useRef } from "react";
import { useStrudel } from "../context/StrudelProvider";
import { defaultControls } from "../utils/preprocess"; 

export default function SettingsBar() {
    const { raw, setRaw, controls, setControls } = useStrudel();
    const fileRef = useRef(null);

    const API_BASE_URL = "http://localhost:5138"; // for marker, adjust this to your port

    const onSave = async () => {
        const name = window.prompt("Name this preset:");
        if (!name) return;

        // Merge shared defaults + current overrides
        const effectiveControls = { ...defaultControls, ...controls };

        console.log("effectiveControls before save:", effectiveControls);

        try {
            const res = await fetch(`${API_BASE_URL}/api/StrudelPreset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    raw,
                    controlsJson: JSON.stringify(effectiveControls),
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
            if (data.controls && typeof data.controls === "object") setControls(data.controls);
        } finally {
            e.target.value = ""; // needed to allow re-selecting the same file
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
