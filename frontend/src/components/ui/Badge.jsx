import "./Badge.css";

const TYPE_COLORS = {
	culto: "badge--salvia",
	ayuno: "badge--terracota",
	vigilia: "badge--azul",
	estudio_biblico: "badge--dorado",
	reunion: "badge--purpura",
	evangelismo: "badge--verde",
	otro: "badge--gris",
};

const STATUS_COLORS = {
	asisti: "badge--success",
	no_asisti: "badge--error",
	pendiente: "badge--warning",
	asistencia_parcial: "badge--info",
};

export function ActivityTypeBadge({ type }) {
	const labels = {
		culto: "Culto",
		ayuno: "Ayuno",
		vigilia: "Vigilia",
		estudio_biblico: "Est. Biblico",
		reunion: "Reunion",
		evangelismo: "Evangelismo",
		otro: "Otro",
	};
	return (
		<span className={`badge ${TYPE_COLORS[type] || "badge--gris"}`}>{labels[type] || type}</span>
	);
}

export function AttendanceBadge({ status }) {
	const labels = {
		asisti: "Asisti",
		no_asisti: "No asisti",
		pendiente: "Pendiente",
		asistencia_parcial: "Parcial",
	};
	return (
		<span className={`badge ${STATUS_COLORS[status] || "badge--gris"}`}>
			{labels[status] || status}
		</span>
	);
}

export default function Badge({ children, variant = "gris", className = "" }) {
	return <span className={`badge badge--${variant} ${className}`}>{children}</span>;
}
