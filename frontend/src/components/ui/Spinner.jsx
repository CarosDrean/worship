import "./Spinner.css";

export default function Spinner({ size = "md", label = "Cargando..." }) {
	return (
		<div className={`spinner spinner--${size}`} role="status" aria-label={label}>
			<div className="spinner__ring" />
			<span className="sr-only">{label}</span>
		</div>
	);
}
