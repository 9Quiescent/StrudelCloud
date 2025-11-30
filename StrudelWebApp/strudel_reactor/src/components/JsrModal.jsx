export default function JsrModal({ show, title, children, onClose, footer }) {
    if (!show) return null;

    return (
        <>
            <div
                className="modal fade show d-block jsr-modal-fade"
                tabIndex="-1"
                role="dialog"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content jsr-card">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                        {footer && (
                            <div className="modal-footer">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show jsr-backdrop-fade"></div>
        </>
    );
}
