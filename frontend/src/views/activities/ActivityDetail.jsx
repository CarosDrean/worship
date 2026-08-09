import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ActivityTypeBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { ErrorState } from "../../components/ui/StateView";
import { useToast } from "../../context/ToastContext";
import { useApi, useMutation } from "../../hooks/useApi";
import { api } from "../../lib/api";
import ActivityForm from "./ActivityForm";
import "./ActivityDetail.css";

const STATUS_OPTIONS = [
	{ value: "asisti", label: "Asisti" },
	{ value: "no_asisti", label: "No asisti" },
	{ value: "asistencia_parcial", label: "Asistencia parcial" },
];

export default function ActivityDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { toast } = useToast();
	const { success, error: showError } = toast || {};

	const {
		data: activity,
		loading,
		error,
		refresh,
	} = useApi(() => api.activities.get(id), { immediate: true, deps: [id] });

	const { data: attendanceList, refresh: refreshAtt } = useApi(
		() => api.attendance.list({ activityId: id }),
		{ immediate: true, deps: [id] },
	);

	const [showEdit, setShowEdit] = useState(false);
	const [showAttendance, setShowAttendance] = useState(false);
	const [attForm, setAttForm] = useState({
		status: "asisti",
		notes: "",
		fastingDuration: "",
		vigilCompleted: false,
	});

	const updateMutation = useMutation((data) => api.activities.update(id, data));
	const attMutation = useMutation((data) => api.attendance.create({ ...data, activityId: id }));
	const archiveMutation = useMutation(() => api.activities.archive(id));

	const handleUpdate = async (formData) => {
		try {
			await updateMutation.execute(formData);
			setShowEdit(false);
			success?.("Actividad actualizada");
			refresh();
		} catch (err) {
			showError?.(err.message);
		}
	};

	const handleAttendance = async (e) => {
		e.preventDefault();
		try {
			const payload = {
				...attForm,
				fastingDuration:
					attForm.fastingDuration && attForm.fastingDuration !== ""
						? Number(attForm.fastingDuration)
						: null,
			};
			await attMutation.execute(payload);
			setShowAttendance(false);
			setAttForm({
				status: "asisti",
				notes: "",
				fastingDuration: "",
				vigilCompleted: false,
			});
			success?.("Asistencia registrada");
			refreshAtt();
		} catch (err) {
			showError?.(err.message);
		}
	};

	const handleArchive = async () => {
		if (!window.confirm("¿Archivar esta actividad?")) return;
		try {
			await archiveMutation.execute();
			success?.("Actividad archivada");
			navigate("/actividades");
		} catch (err) {
			showError?.(err.message);
		}
	};

	if (loading) return <Spinner size="lg" />;

	if (error) {
		return (
			<div className="activity-detail">
				<ErrorState description={error} action="Volver" onAction={() => navigate("/actividades")} />
			</div>
		);
	}

	if (!activity) return null;

	const a = activity;
	const attendances = Array.isArray(attendanceList)
		? attendanceList
		: attendanceList?.attendance || [];

	return (
		<div className="activity-detail">
			<button
				type="button"
				className="activity-detail__back"
				onClick={() => navigate("/actividades")}
			>
				← Volver a actividades
			</button>

			<Card>
				<div className="detail-header">
					<div>
						<ActivityTypeBadge type={a.type} />
						<h1>{a.title}</h1>
					</div>
					<div className="detail-actions">
						<Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
							✏️ Editar
						</Button>
						<Button variant="ghost" size="sm" onClick={handleArchive}>
							📦 Archivar
						</Button>
					</div>
				</div>

				<div className="detail-meta">
					<p>
						<strong>Fecha:</strong>{" "}
						{new Date(a.date + (a.date.includes("T") ? "" : "T12:00:00")).toLocaleDateString(
							"es-ES",
							{
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							},
						)}
						{a.time && ` · ${a.time}`}
					</p>
					{a.location && (
						<p>
							<strong>Ubicacion:</strong> {a.location}
						</p>
					)}
				</div>

				{a.description && (
					<div className="detail-section">
						<h3>Descripcion</h3>
						<p>{a.description}</p>
					</div>
				)}

				{a.notes && (
					<div className="detail-section">
						<h3>Notas</h3>
						<p>{a.notes}</p>
					</div>
				)}
			</Card>

			{/* Asistencia */}
			<Card>
				<div className="detail-section__header">
					<h3>Asistencia</h3>
					<Button size="sm" onClick={() => setShowAttendance(true)}>
						+ Registrar asistencia
					</Button>
				</div>

				{attendances.length === 0 ? (
					<p className="detail-empty">Aun no hay registros de asistencia.</p>
				) : (
					<div className="attendance-records">
						{attendances.map((att) => (
							<div key={att.id} className="attendance-record">
								<span className={`att-status att-status--${att.status}`}>
									{att.status === "asisti"
										? "✓ Asisti"
										: att.status === "no_asisti"
											? "✕ No asisti"
											: att.status === "asistencia_parcial"
												? "◐ Parcial"
												: att.status}
								</span>
								{att.fastingDuration > 0 && (
									<span className="att-fasting">🕊️ Ayuno: {att.fastingDuration}h</span>
								)}
								{att.vigilCompleted && <span className="att-vigil">🌙 Vigilia completada</span>}
								{att.notes && <p className="att-notes">{att.notes}</p>}
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Modal editar */}
			<Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar actividad" size="md">
				<ActivityForm
					initial={a}
					onSubmit={handleUpdate}
					loading={updateMutation.loading}
					onCancel={() => setShowEdit(false)}
				/>
			</Modal>

			{/* Modal registrar asistencia */}
			<Modal
				open={showAttendance}
				onClose={() => setShowAttendance(false)}
				title="Registrar asistencia"
				size="sm"
			>
				<form onSubmit={handleAttendance} className="attendance-form">
					<div className="attendance-form__field">
						<fieldset className="field__group" aria-label="Estado de asistencia">
							<legend className="field__label">Estado</legend>
							<div className="status-options">
								{STATUS_OPTIONS.map((opt) => (
									<label
										key={opt.value}
										className={`status-option ${attForm.status === opt.value ? "status-option--active" : ""}`}
									>
										<input
											type="radio"
											name="status"
											value={opt.value}
											checked={attForm.status === opt.value}
											onChange={(e) => setAttForm((f) => ({ ...f, status: e.target.value }))}
											className="sr-only"
										/>
										{opt.label}
									</label>
								))}
							</div>
						</fieldset>
					</div>

					{/* Campos de ayuno para actividades tipo ayuno */}
					{(a.type === "ayuno" || a.type === "vigilia") && (
						<div className="attendance-form__field">
							<label className="field__label" htmlFor="fasting-hours">
								Horas de ayuno
							</label>
							<input
								id="fasting-hours"
								type="number"
								className="field__input"
								min="0"
								max="72"
								value={attForm.fastingDuration}
								onChange={(e) => setAttForm((f) => ({ ...f, fastingDuration: e.target.value }))}
								placeholder="Ej: 12"
							/>
						</div>
					)}

					{a.type === "vigilia" && (
						<div className="attendance-form__field">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={attForm.vigilCompleted}
									onChange={(e) =>
										setAttForm((f) => ({
											...f,
											vigilCompleted: e.target.checked,
										}))
									}
								/>
								Vigilia completada
							</label>
						</div>
					)}

					<div className="attendance-form__field">
						<label className="field__label" htmlFor="att-notes">
							Notas (opcional)
						</label>
						<textarea
							id="att-notes"
							className="field__input"
							rows={3}
							value={attForm.notes}
							onChange={(e) => setAttForm((f) => ({ ...f, notes: e.target.value }))}
							placeholder="Motivo de ausencia, reflexion..."
						/>
					</div>

					<div className="attendance-form__actions">
						<Button
							variant="ghost"
							onClick={() => setShowAttendance(false)}
							type="button"
							disabled={attMutation.loading}
						>
							Cancelar
						</Button>
						<Button type="submit" loading={attMutation.loading}>
							Guardar asistencia
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
