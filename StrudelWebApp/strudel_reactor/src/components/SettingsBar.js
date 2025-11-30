import { useState } from "react";
import { useStrudel } from "../context/StrudelProvider";
import { defaultControls } from "../utils/preprocess";
import JsrModal from "./JsrModal";

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

    // search state for presets
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // UI modal for messages + confirms
    const [uiModal, setUiModal] = useState({
        kind: null,
        title: "",
        body: "",
        onConfirm: null,
    });

    // Name input modal for save
    const [showNameModal, setShowNameModal] = useState(false);
    const [presetName, setPresetName] = useState("");

    const openMessageModal = (title, body) => {
        setUiModal({ kind: "message", title, body, onConfirm: null });
    };

    const openConfirmModal = (title, body, onConfirm) => {
        setUiModal({ kind: "confirm", title, body, onConfirm });
    };

    const closeUiModal = () => {
        setUiModal((prev) => ({ ...prev, kind: null, onConfirm: null }));
    };

    const handleConfirmYes = () => {
        if (uiModal.onConfirm) {
            uiModal.onConfirm();
        }
        closeUiModal();
    };

    // Open modal to name the preset
    const beginSave = () => {
        setPresetName("");
        setShowNameModal(true);
    };

    // only if the user has provided a preset name in the modal, perform the save
    const performSave = async (name) => {
        // CPS that preprocessSong uses
        const cpsValue = String(
            controls.cps ??
            defaultControls.cps
        );

        if (!CPS_REGEX.test(cpsValue)) {
            openMessageModal(
                "Invalid CPS",
                "CPS must be in the format int/int/int\nFor example: 120/60/4"
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

            openMessageModal("Preset Saved", "Preset saved to database.");
        } catch (err) {
            console.error(err);
            openMessageModal(
                "Save Error",
                "Error saving preset, check browser console for details."
            );
        }
    };

    const handleNameSave = () => {
        const trimmed = presetName.trim();
        if (!trimmed) {
            return;
        }
        setShowNameModal(false);
        performSave(trimmed);
    };

    const closeNameModal = () => {
        setShowNameModal(false);
        setPresetName("");
    };

    // --- Load from DB Stuff ---

    const openDbModal = async () => {
        setShowDbModal(true);
        setIsLoadingPresets(true);
        setLoadError("");
        setSearchTerm(""); // reset search when opening modal

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
        setSearchTerm("");
    };

    // search by name 
    const handleSearch = async () => {
        const term = searchTerm.trim();
        setIsSearching(true);
        setLoadError("");

        try {
            const url = term
                ? `${API_BASE_URL}/api/StrudelPreset/search?q=${encodeURIComponent(term)}`
                : `${API_BASE_URL}/api/StrudelPreset`;

            const res = await fetch(url);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to search presets: ${res.status} ${text}`);
            }

            const data = await res.json();
            setPresets(data);
        } catch (err) {
            console.error(err);
            setLoadError("Error searching presets from database.");
        } finally {
            setIsSearching(false);
        }
    };

    const onSearchKeyUp = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const actuallyLoadPreset = async (id) => {
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
                    openMessageModal(
                        "Load Warning",
                        "Preset loaded, but controls JSON could not be parsed."
                    );
                }
            }

            setShowDbModal(false);

            openMessageModal(
                "Preset Loaded",
                preset.name
                    ? `Preset "${preset.name}" loaded from database.`
                    : "Preset loaded from database."
            );
        } catch (err) {
            console.error(err);
            openMessageModal(
                "Load Error",
                "Error loading preset from database. Check console for details."
            );
        }
    };

    const handlePresetClick = (id) => {
        openConfirmModal(
            "Load Preset",
            "Loading this preset will overwrite your current song and settings. Proceed?",
            () => actuallyLoadPreset(id)
        );
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
                        <button type="button" className="btn jsr" onClick={beginSave}>
                            <strong>SAVE</strong> to DB
                        </button>
                        <button type="button" className="btn jsr" onClick={openDbModal}>
                            <strong>LOAD</strong> from DB
                        </button>
                    </div>
                </div>
            </div>

            {/* DB presets modal */}
            <JsrModal
                show={showDbModal}
                title="Load an existing Preset"
                onClose={closeDbModal}
                footer={
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeDbModal}
                    >
                        Close
                    </button>
                }
            >
                {/* search bar */}
                <div className="mb-3">
                    <label htmlFor="presetSearch" className="form-label">
                        Search by name
                    </label>
                    <div className="input-group">
                        <input
                            id="presetSearch"
                            className="form-control"
                            placeholder="e.g. default, chill, breakbeat"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyUp={onSearchKeyUp}
                        />
                        <button
                            type="button"
                            className="btn jsr"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>
                    <small className="text-muted">
                        Leave empty and press Search to reset the list.
                    </small>
                </div>

                {(isLoadingPresets || isSearching) && (
                    <p className="text-muted mb-0">Loading presets...</p>
                )}

                {loadError && (
                    <p className="text-danger mb-2">{loadError}</p>
                )}

                {!isLoadingPresets && !isSearching && !loadError && presets.length === 0 && (
                    <p className="text-muted mb-0">
                        No presets found yet. Try saving one first.
                    </p>
                )}

                {!isLoadingPresets && !isSearching && presets.length > 0 && (
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
            </JsrModal>

            {/* Name prset modal  */}
            <JsrModal
                show={showNameModal}
                title="Save Preset"
                onClose={closeNameModal}
                footer={
                    <>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeNameModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn jsr"
                            onClick={handleNameSave}
                        >
                            Save
                        </button>
                    </>
                }
            >
                <div className="mb-3">
                    <label htmlFor="presetName" className="form-label">
                        Preset name
                    </label>
                    <input
                        id="presetName"
                        className="form-control"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="e.g. Default Beat"
                    />
                    <small className="text-muted">
                        Note: You'll be able to search for this preset by this name in the preset list, then load it in if you tap the load button.
                    </small>
                </div>
            </JsrModal>

            {/* modal for message + confirm */}
            <JsrModal
                show={uiModal.kind !== null}
                title={uiModal.title}
                onClose={closeUiModal}
                footer={
                    uiModal.kind === "confirm" ? (
                        <>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeUiModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn jsr"
                                onClick={handleConfirmYes}
                            >
                                Yes, load preset
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="btn jsr"
                            onClick={closeUiModal}
                        >
                            OK
                        </button>
                    )
                }
            >
                <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
                    {uiModal.body}
                </p>
            </JsrModal>
        </>
    );
}
