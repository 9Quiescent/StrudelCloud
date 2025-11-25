export default function StrudelHost({
    id = "strudel-editor",
    label = "Live Stage",
    className = "",
    style,
    minHeight = 360, // probably keep this taller so CodeMirror isn't cramped
}) {
    return (
        <div className={className}>
            {label ? <label className="form-label" htmlFor={id}>{label}</label> : null}
            <div
                id={id}
                style={{
                    minHeight,
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    ...style,
                }}
            />
        </div>
    );
}
