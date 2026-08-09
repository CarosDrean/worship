import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { EmptyState, ErrorState } from "../components/ui/StateView";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import "./Dashboard.css";

function StatCard({ label, value, icon, color = "salvia" }) {
	return (
		<Card className={`stat-card stat-card--${color}`}>
			<span className="stat-card__icon" aria-hidden="true">
				{icon}
			</span>
			<div className="stat-card__info">
				<span className="stat-card__value">{value ?? "-"}</span>
				<span className="stat-card__label">{label}</span>
			</div>
		</Card>
	);
}

export default function Dashboard() {
	const navigate = useNavigate();

	const { data, loading, error, refresh } = useApi(() => api.dashboard.get("month"), {
		immediate: true,
		deps: [],
	});

	const { data: quoteData } = useApi(() => api.quotes.daily(), {
		immediate: true,
	});

	if (loading) return <Spinner size="lg" />;

	if (error) {
		return (
			<div className="dashboard">
				<h1>Inicio</h1>
				<ErrorState description={error} action="Reintentar" onAction={refresh} />
			</div>
		);
	}

	const d = data || {};
	const dailyQuote = quoteData?.quote || quoteData;

	return (
		<div className="dashboard">
			<h1 className="dashboard__title">Inicio</h1>

			{/* Frase del dia */}
			{dailyQuote && (
				<Card className="daily-quote">
					<p className="daily-quote__text">"{dailyQuote.text || dailyQuote.content}"</p>
					{(dailyQuote.author || dailyQuote.reference) && (
						<p className="daily-quote__ref">— {dailyQuote.author || dailyQuote.reference}</p>
					)}
				</Card>
			)}

			{/* Proxima actividad */}
			{d.nextActivity && (
				<Card className="next-activity">
					<div className="next-activity__label">Proxima actividad</div>
					<div className="next-activity__info">
						<h3>{d.nextActivity.title}</h3>
						<p>
							{new Date(d.nextActivity.date).toLocaleDateString("es-ES", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
							{d.nextActivity.time && ` · ${d.nextActivity.time}`}
						</p>
					</div>
				</Card>
			)}

			{/* Estadisticas rapidas */}
			<div className="stats-grid">
				<StatCard
					label="Asistencias del mes"
					value={d.monthlyAttendance ?? 0}
					icon="✅"
					color="salvia"
				/>
				<StatCard
					label="Porcentaje asistencia"
					value={d.attendanceRate != null ? `${d.attendanceRate}%` : "-"}
					icon="📊"
					color="azul"
				/>
				<StatCard label="Racha actual" value={d.currentStreak ?? 0} icon="🔥" color="terracota" />
				<StatCard label="Mejor racha" value={d.bestStreak ?? 0} icon="🏆" color="dorado" />
				<StatCard
					label="Ayunos completados"
					value={d.completedFasts ?? 0}
					icon="🕊️"
					color="terracota"
				/>
				<StatCard
					label="Vigilias completadas"
					value={d.completedVigils ?? 0}
					icon="🌙"
					color="azul"
				/>
			</div>

			{/* Actividades por categoria */}
			{d.activitiesByType && Object.keys(d.activitiesByType).length > 0 && (
				<Card>
					<h3 style={{ marginBottom: "1rem" }}>Actividades por categoria</h3>
					<div className="category-bars">
						{Object.entries(d.activitiesByType).map(([type, count]) => {
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
								<div key={type} className="category-bar">
									<span className="category-bar__label">{labels[type] || type}</span>
									<div className="category-bar__track">
										<div
											className="category-bar__fill"
											style={{
												width: `${Math.min((count / (Math.max(...Object.values(d.activitiesByType)) || 1)) * 100, 100)}%`,
											}}
										/>
									</div>
									<span className="category-bar__count">{count}</span>
								</div>
							);
						})}
					</div>
				</Card>
			)}

			{/* Sin datos */}
			{!d.nextActivity && !d.monthlyAttendance && !d.currentStreak && (
				<EmptyState
					icon="📋"
					title="Bienvenido a Worship"
					description="Aun no hay actividades registradas. Crea tu primera actividad para empezar a hacer seguimiento."
					action="Crear actividad"
					onAction={() => navigate("/actividades")}
				/>
			)}
		</div>
	);
}
