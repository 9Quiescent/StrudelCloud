import { useState } from "react";
import { useStrudel } from "../context/StrudelProvider";
import { defaultControls } from "../utils/preprocess";

const API_BASE_URL = "http://localhost:5138"; // for marker, adjust this to your port

// Enforce CPS as int/int/int (e.g. 120/60/4)
const CPS_REGEX = /^\d+\/\d+\/\d+$/;

export default function SettingsBar() {
    const { raw, setRaw, controls, setControls } = useStrudel();

    // DB load modal state
    const [showDbModal, setShowDbModal] = useState(false);
    const [presets, setPresets] = useState([]);
    const [isLoadingPresets, setIsLoadingPresets] = useState(false);
    const [loadError, setLoadError] = useState("");

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

    // --- Load from DB Stuff ---

    const openDbModal = async () => {
        setShowDbModal(true);
        setIsLoadingPresets(true);
        setLoadError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/StrudelPreset`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to load presets: ${res.status} ${text}`);
            }
            const data = await res.json();
            setPresets(data); // this wants id, name, createdAt and so forth
        } catch (err) {
            console.error(err);
            setLoadError("Error loading presets from database.");
        } finally {
            setIsLoadingPresets(false);
        }
    };

    const closeDbModal = () => {
        setShowDbModal(false);
        setLoadError("");
    };

    const handlePresetClick = async (id) => {
        const confirmOverride = window.confirm(
            "Loading this preset will overwrite your current song and settings. Continue?"
        );
        if (!confirmOverride) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/StrudelPreset/${id}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to load preset: ${res.status} ${text}`);
            }

            const preset = await res.json();
            // Should give me a { id, name, rawCode, controlsJson, createdAt }

            if (typeof preset.rawCode === "string") {
                setRaw(preset.rawCode);
            }

            if (preset.controlsJson) {
                try {
                    const parsedControls = JSON.parse(preset.controlsJson);
                    if (parsedControls && typeof parsedControls === "object") {
                        setControls(parsedControls);
                    }
                } catch (parseErr) {
                    console.error("Failed to parse controlsJson:", parseErr);
                    alert("Preset loaded, but controls JSON could not be parsed.");
                }
            }

            setShowDbModal(false);
        } catch (err) {
            console.error(err);
            alert("Error loading preset from database. Check console for details.");
        }
    };

    return (
        <>
            <div className="card jsr-card mb-3">
                <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <h6 className="mb-0">Check it Out:</h6>
                        <span className="text-muted small">
                            If you're the forgetful type, you can SAVE your song/settings
                            and LOAD them back from the database.
                        </span>
                    </div>
                    <div className="d-flex gap-2">
                        <button type="button" className="btn jsr" onClick={onSave}>
                            <strong>SAVE</strong> to DB
                        </button>
                        <button type="button" className="btn jsr" onClick={openDbModal}>
                            <strong>LOAD</strong> from DB
                        </button>
                    </div>
                </div>
            </div>

            {/*  Bootstrap modal for DB presets */}
            {showDbModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Load Preset from Database</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeDbModal}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {isLoadingPresets && (
                                        <p className="text-muted mb-0">Loading presets...</p>
                                    )}

                                    {loadError && (
                                        <p className="text-danger mb-2">{loadError}</p>
                                    )}

                                    {!isLoadingPresets && !loadError && presets.length === 0 && (
                                        <p className="text-muted mb-0">
                                            No presets found yet. Try saving one first.
                                        </p>
                                    )}

                                    {!isLoadingPresets && presets.length > 0 && (
                                        <div className="list-group">
                                            {presets.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                                    onClick={() => handlePresetClick(p.id)}
                                                >
                                                    <span>{p.name}</span>
                                                    <small className="text-muted">
                                                        {p.createdAt
                                                            ? new Date(p.createdAt).toLocaleString()
                                                            : ""}
                                                    </small>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeDbModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Backdrop */}
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </>
    );
}
