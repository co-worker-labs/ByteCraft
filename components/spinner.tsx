export default function Spinner() {
    return (
        <div className="w-100 text-center py-5 h-100">
            <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
}