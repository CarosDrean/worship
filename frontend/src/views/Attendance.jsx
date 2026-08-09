import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AttendanceBadge } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Spinner from "../components/ui/Spinner";
import { EmptyState, ErrorState } from "../components/ui/StateView";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import "./Attendance.css";

function getCurrentMonth() {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthDateRange(monthStr) {
	const [year, month] = monthStr.split("-").map(Number);
	const dateFrom = `${monthStr}-01`;
	const lastDay = new Date(year, month, 0).getDate();
	const dateTo = `${monthStr}-${String(lastDay).padStart(2, "0")}`;
	return { dateFrom, dateTo };
}

export default function Attendance() {
	const navigate = useNavigate();
	const [month, setMonth] = useState(getCurrentMonth());
	const { dateFrom, dateTo } = getMonthDateRange(month);

	const { data, loading, error, refresh } = useApi(
		() => api.attendance.list({ dateFrom, dateTo }),
		{ immediate: true, deps: [month] },
	);

	const attendance = Array.isArray(data) ? data : data?.attendance || [];

	// Generar opciones de meses
	const monthOptions = [];
	const now = new Date();
	for (let i = 0; i < 12; i++) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		const label = d.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
		});
		monthOptions.push({ value, label });
	}

	return (
		<div className="attendance-view">
			<div className="attendance-view__header">
				<h1>Asistencia</h1>
			</div>

			<Card className="attendance-view__filters">
				<Select
					label="Mes"
					options={monthOptions}
					value={month}
					onChange={(e) => setMonth(e.target.value)}
				/>
			</Card>

			{loading && <Spinner />}

			{!loading && error && (
				<ErrorState description={error} action="Reintentar" onAction={refresh} />
			)}

			{!loading && !error && attendance.length === 0 && (
				<EmptyState
					icon="✅"
					title="Sin registros de asistencia"
					description="Registra tu asistencia desde el detalle de una actividad."
					action="Ir a actividades"
					onAction={() => navigate("/actividades")}
				/>
			)}

			{!loading && !error && attendance.length > 0 && (
				<div className="attendance-list">
					{attendance.map((att) => (
						<Card key={att.id} className="attendance-item">
							<div className="attendance-item__info">
								<h3 className="attendance-item__title">
									{att.activityTitle || att.activity?.title || "Actividad sin titulo"}
								</h3>
								<p className="attendance-item__date">
									{att.activityDate
										? new Date(`${att.activityDate}T12:00:00`).toLocaleDateString("es-ES", {
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											})
										: att.date || ""}
								</p>
							</div>
							<div className="attendance-item__status">
								<AttendanceBadge status={att.status} />
								{att.fastingDuration > 0 && (
									<span className="attendance-item__extra">🕊️ {att.fastingDuration}h</span>
								)}
								{att.vigilCompleted && <span className="attendance-item__extra">🌙 Vigilia</span>}
							</div>
							{att.notes && <p className="attendance-item__notes">{att.notes}</p>}
							{att.activityId && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate(`/actividades/${att.activityId}`)}
								>
									Ver actividad
								</Button>
							)}
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
