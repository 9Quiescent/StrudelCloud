import { useEffect, useState } from "react";
import { useStrudel } from "../context/StrudelProvider";

export default function ControlsPanel() {
    const { controls, setControls, started } = useStrudel();

    // These keep track of local slider/text states
    const [roomLocal, setRoomLocal] = useState(controls.room ?? 0.2);
    const [gainLocal, setGainLocal] = useState(controls.gain ?? 1.2);
    const [tempoLocal, setTempoLocal] = useState(controls.tempo ?? "120/60/4");

    // These keep locals in sync if controls change from elsewhere (for example, load settings)
    useEffect(() => { setRoomLocal(controls.room ?? 0.2); }, [controls.room]);
    useEffect(() => { setGainLocal(controls.gain ?? 1.2); }, [controls.gain]);
    useEffect(() => { setTempoLocal(controls.tempo ?? "120/60/4"); }, [controls.tempo]);

    const commitRoom = () => setControls({ room: Number(roomLocal) });
    const commitGain = () => setControls({ gain: Number(gainLocal) });
    const commitTempo = () => setControls({ tempo: String(tempoLocal) });

    const onTempoKeyUp = (e) => {
        if (e.key === "Enter") commitTempo();
    };

    return (
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
                        checked={controls.p1Hushed}
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
                    checked={!!controls.drumsMuted}
                    onChange={(e) => setControls({ drumsMuted: e.target.checked })}
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

            {!started && <small className="text-muted">Audio is prepping, controls will take effect shortly…</small>}
        </div>
    );
}
