import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { ErrorState } from "../components/ui/StateView";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import "./Calendar.css";

const TYPE_LABELS = {
	culto: "Culto",
	ayuno: "Ayuno",
	vigilia: "Vigilia",
	estudio_biblico: "Est. Biblico",
	reunion: "Reunion",
	evangelismo: "Evangelismo",
	otro: "Otro",
};

const WEEKDAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const MONTHS = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

export default function Calendar() {
	const navigate = useNavigate();
	const today = new Date();
	const [viewYear, setViewYear] = useState(today.getFullYear());
	const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

	const { data, loading, error, refresh } = useApi(
		() => api.activities.calendar({ year: viewYear, month: viewMonth }),
		{
			immediate: true,
			deps: [viewYear, viewMonth],
		},
	);

	const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
	const firstDayOfWeek = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7;

	const days = useMemo(() => {
		const result = [];
		// Dias vacios del mes anterior
		for (let i = 0; i < firstDayOfWeek; i++) {
			result.push({ day: null, key: `empty-${i}` });
		}
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			result.push({ day: d, date: dateStr, key: dateStr });
		}
		return result;
	}, [viewYear, viewMonth, daysInMonth, firstDayOfWeek]);

	const activitiesByDate = useMemo(() => {
		const map = {};
		const days = data?.days || {};
		Object.entries(days).forEach(([date, acts]) => {
			if (Array.isArray(acts) && acts.length > 0) map[date] = acts;
		});
		return map;
	}, [data]);

	const isToday = (dateStr) => {
		const now = new Date();
		return (
			dateStr ===
			`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
		);
	};

	const prevMonth = () => {
		if (viewMonth === 1) {
			setViewYear(viewYear - 1);
			setViewMonth(12);
		} else setViewMonth(viewMonth - 1);
	};
	const nextMonth = () => {
		if (viewMonth === 12) {
			setViewYear(viewYear + 1);
			setViewMonth(1);
		} else setViewMonth(viewMonth + 1);
	};
	const goToToday = () => {
		setViewYear(today.getFullYear());
		setViewMonth(today.getMonth() + 1);
	};

	return (
		<div className="calendar-view">
			<div className="calendar-view__header">
				<h1>Calendario</h1>
				<Button variant="ghost" size="sm" onClick={goToToday}>
					Hoy
				</Button>
			</div>

			<Card className="calendar-card">
				<div className="calendar-nav">
					<button
						type="button"
						className="calendar-nav__btn"
						onClick={prevMonth}
						aria-label="Mes anterior"
					>
						←
					</button>
					<h2 className="calendar-nav__title">
						{MONTHS[viewMonth - 1]} {viewYear}
					</h2>
					<button
						type="button"
						className="calendar-nav__btn"
						onClick={nextMonth}
						aria-label="Mes siguiente"
					>
						→
					</button>
				</div>

				{loading && <Spinner />}

				{!loading && error && (
					<ErrorState description={error} action="Reintentar" onAction={refresh} />
				)}

				{!loading && !error && (
					// biome-ignore lint/a11y/useSemanticElements: se usa ARIA grid en lugar de <table> para mantener el CSS existente
					<div
						className="calendar-grid"
						role="grid"
						aria-label={`Calendario de ${MONTHS[viewMonth - 1]} ${viewYear}`}
					>
						{/* Cabeceras */}
						{/* biome-ignore lint/a11y/useSemanticElements: se usa role="row"/"columnheader" en vez de <tr>/<th> para mantener el CSS existente */}
						<div className="calendar-weekdays" role="row" tabIndex={0}>
							{WEEKDAYS.map((wd) => (
								// biome-ignore lint/a11y/useSemanticElements: se usa role="columnheader" en vez de <th> para mantener el CSS existente
								<div key={wd} className="calendar-weekday" role="columnheader" tabIndex={-1}>
									{wd}
								</div>
							))}
						</div>
						{/* Dias */}
						<div className="calendar-days">
							{days.map(({ day, date, key }) => (
								// biome-ignore lint/a11y/useSemanticElements: se usa ARIA gridcell en lugar de <td> para mantener el CSS existente
								<div
									key={key}
									className={`calendar-day ${!day ? "calendar-day--empty" : ""} ${date && isToday(date) ? "calendar-day--today" : ""}`}
									role="gridcell"
									tabIndex={day ? 0 : -1}
								>
									{day && (
										<>
											<span className="calendar-day__num">{day}</span>
											<div className="calendar-day__dots">
												{(activitiesByDate[date] || []).slice(0, 3).map((a) => (
													<span
														key={a.id}
														className={`calendar-dot calendar-dot--${a.type}`}
														title={`${TYPE_LABELS[a.type] || a.type}: ${a.title}`}
													/>
												))}
												{(activitiesByDate[date] || []).length > 3 && (
													<span className="calendar-day__more">
														+{(activitiesByDate[date] || []).length - 3}
													</span>
												)}
											</div>
										</>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</Card>

			{/* Lista de actividades del mes */}
			{!loading && !error && (
				<Card>
					<h3 style={{ marginBottom: "1rem" }}>
						Actividades de {MONTHS[viewMonth - 1]} {viewYear}
					</h3>
					{Object.keys(activitiesByDate).length === 0 ? (
						<p className="detail-empty">No hay actividades este mes.</p>
					) : (
						<div className="calendar-activities">
							{Object.entries(activitiesByDate)
								.sort(([a], [b]) => a.localeCompare(b))
								.map(([date, acts]) => (
									<div key={date} className="calendar-date-group">
										<h4 className="calendar-date-label">
											{new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
												weekday: "long",
												day: "numeric",
											})}
										</h4>
										{acts.map((a) => (
											<div key={a.id} className="calendar-activity-item">
												<span className={`calendar-dot calendar-dot--${a.type}`} />
												<span className="calendar-activity-title">{a.title}</span>
												{a.time && <span className="calendar-activity-time">{a.time}</span>}
												<Button
													variant="ghost"
													size="sm"
													style={{ marginLeft: "auto", fontSize: "0.8rem" }}
													onClick={() => navigate(`/actividades/${a.id}`)}
												>
													Ver
												</Button>
											</div>
										))}
									</div>
								))}
						</div>
					)}
				</Card>
			)}
		</div>
	);
}
