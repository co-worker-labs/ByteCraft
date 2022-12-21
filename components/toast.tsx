export function ToastContainer() {
    return (
        <div className="toast-container position-fixed top-0 end-0 p-2">
            <div id="toastTemplate" className="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true" >
                <div className="d-flex">
                    <div className="toast-body">
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>
    )
}