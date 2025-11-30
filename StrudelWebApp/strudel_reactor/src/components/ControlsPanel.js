import { useEffect, useState } from "react";
import { useStrudel } from "../context/StrudelProvider";
import JsrModal from "./JsrModal";

// Enforce CPS as int/int/int 
const CPS_REGEX = /^\d+\/\d+\/\d+$/;

export default function ControlsPanel() {
    const { controls, setControls, started } = useStrudel();

    // These track local slider/text states
    const [roomLocal, setRoomLocal] = useState(controls.room ?? 0.2);
    const [gainLocal, setGainLocal] = useState(controls.gain ?? 1.2);
    const initialCps = controls.cps ?? "120/60/4";
    const [tempoLocal, setTempoLocal] = useState(initialCps);
    const [lastValidTempo, setLastValidTempo] = useState(initialCps);

    // CPS error modal
    const [cpsModalOpen, setCpsModalOpen] = useState(false);

    const closeCpsModal = () => setCpsModalOpen(false);

    // These sync the locals 
    useEffect(() => { setRoomLocal(controls.room ?? 0.2); }, [controls.room]);
    useEffect(() => { setGainLocal(controls.gain ?? 1.2); }, [controls.gain]);
    useEffect(() => {
        const cps = controls.cps ?? "120/60/4";
        setTempoLocal(cps);
        setLastValidTempo(cps);
    }, [controls.cps]);

    const commitRoom = () => setControls({ room: Number(roomLocal) });
    const commitGain = () => setControls({ gain: Number(gainLocal) });

    const commitTempo = () => {
        const value = String(tempoLocal).trim();

        if (!CPS_REGEX.test(value)) {
            // revert back to last valid CPS value if its invalid
            setTempoLocal(lastValidTempo);
            setCpsModalOpen(true);
            return;
        }

        setLastValidTempo(value);
        setControls({ cps: value });
    };

    const onTempoKeyUp = (e) => {
        if (e.key === "Enter") commitTempo();
    };

    return (
        <>
            <div className="vstack gap-3">

                {/* Radio hushing on placeholder tag */}
                <div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="p1"
                            id="p1_on"
                            checked={!controls.p1Hushed}
                            onChange={() => setControls({ p1Hushed: false })}
                        />
                        <label className="form-check-label" htmlFor="p1_on">No Hush</label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="p1"
                            id="p1_hush"
                            checked={!!controls.p1Hushed}
                            onChange={() => setControls({ p1Hushed: true })}
                        />
                        <label className="form-check-label" htmlFor="p1_hush">Add Hushes</label>
                    </div>
                </div>

                {/* Tempo (commit on blur or Enter) */}
                <div>
                    <label className="form-label" htmlFor="tempo">Tempo expr (setcps):</label>
                    <input
                        id="tempo"
                        className="form-control"
                        placeholder="e.g. 120/60/4"
                        value={tempoLocal}
                        onChange={(e) => setTempoLocal(e.target.value)}
                        onBlur={commitTempo}
                        onKeyUp={onTempoKeyUp}
                    />
                </div>

                {/* Room slider (commit on release) */}
                <div>
                    <label className="form-label" htmlFor="room">Room: {roomLocal}</label>
                    <input
                        id="room"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        className="form-range"
                        value={roomLocal}
                        onChange={(e) => setRoomLocal(parseFloat(e.target.value))}
                        onMouseUp={commitRoom}
                        onTouchEnd={commitRoom}
                    />
                </div>

                {/* Gain slider (commit on release) */}
                <div>
                    <label className="form-label" htmlFor="gain">Gain: {gainLocal}</label>
                    <input
                        id="gain"
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        className="form-range"
                        value={gainLocal}
                        onChange={(e) => setGainLocal(parseFloat(e.target.value))}
                        onMouseUp={commitGain}
                        onTouchEnd={commitGain}
                    />
                </div>

                {/* Drums mute feature (immediate) */}
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="drumsMuted"
                        checked={!!controls.muteDrums}
                        onChange={(e) => setControls({ muteDrums: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="drumsMuted">Mute drums</label>
                </div>

                {/* Synth select (immediate) */}
                <div>
                    <label className="form-label" htmlFor="synth">Synth:</label>
                    <select
                        id="synth"
                        className="form-select"
                        value={controls.synth ?? "gm_piano:0"}
                        onChange={(e) => setControls({ synth: e.target.value })}
                    >
                        <option value="gm_piano:0">GM Piano</option>
                        <option value="gm_piano:4">GM E.Piano</option>
                    </select>
                </div>

                {!started && (
                    <small className="text-muted">
                        Loading Audio...
                    </small>
                )}
            </div>

            {/* CPS validation modal*/}
            <JsrModal
                show={cpsModalOpen}
                title="Invalid CPS"
                onClose={closeCpsModal}
                footer={
                    <button
                        type="button"
                        className="btn jsr"
                        onClick={closeCpsModal}
                    >
                        OK
                    </button>
                }
            >
                <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
                    {"CPS must be in the format int/int/int.\nFor example: 120/60/4"}
                </p>
            </JsrModal>
        </>
    );
}
