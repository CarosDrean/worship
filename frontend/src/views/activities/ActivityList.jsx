import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityTypeBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import { EmptyState, ErrorState } from "../../components/ui/StateView";
import { useToast } from "../../context/ToastContext";
import { useApi, useMutation } from "../../hooks/useApi";
import { api } from "../../lib/api";
import ActivityForm from "./ActivityForm";
import "./ActivityList.css";

const TYPE_OPTIONS = [
	{ value: "", label: "Todos los tipos" },
	{ value: "culto", label: "Culto" },
	{ value: "ayuno", label: "Ayuno" },
	{ value: "vigilia", label: "Vigilia" },
	{ value: "estudio_biblico", label: "Estudio Biblico" },
	{ value: "reunion", label: "Reunion" },
	{ value: "evangelismo", label: "Evangelismo" },
	{ value: "otro", label: "Otro" },
];

export default function ActivityList() {
	const navigate = useNavigate();
	const [filter, setFilter] = useState({ type: "", search: "" });
	const [showForm, setShowForm] = useState(false);
	const [editingActivity, setEditingActivity] = useState(null);
	const { toast } = useToast();
	const { success, error } = toast || {};

	const {
		data,
		loading,
		error: listError,
		refresh,
	} = useApi(() => api.activities.list(filter), {
		immediate: true,
		deps: [JSON.stringify(filter)],
	});

	const createMutation = useMutation((formData) => api.activities.create(formData));
	const updateMutation = useMutation((id, formData) => api.activities.update(id, formData));
	const archiveMutation = useMutation((id) => api.activities.archive(id));

	const handleCreate = async (formData) => {
		try {
			await createMutation.execute(formData);
			setShowForm(false);
			success?.("Actividad creada correctamente");
			refresh();
		} catch (err) {
			error?.(err.message || "Error al crear la actividad");
		}
	};

	const handleUpdate = async (formData) => {
		try {
			await updateMutation.execute(editingActivity.id, formData);
			setEditingActivity(null);
			success?.("Actividad actualizada correctamente");
			refresh();
		} catch (err) {
			error?.(err.message || "Error al actualizar la actividad");
		}
	};

	const handleArchive = async (activity) => {
		if (!window.confirm(`¿Archivar "${activity.title}"?`)) return;
		try {
			await archiveMutation.execute(activity.id);
			success?.("Actividad archivada");
			refresh();
		} catch (err) {
			error?.(err.message || "Error al archivar la actividad");
		}
	};

	const activities = Array.isArray(data) ? data : data?.activities || [];

	return (
		<div className="activity-list">
			<div className="activity-list__header">
				<h1>Actividades</h1>
				<Button
					onClick={() => {
						setEditingActivity(null);
						setShowForm(true);
					}}
				>
					+ Nueva actividad
				</Button>
			</div>

			{/* Filtros */}
			<Card className="activity-list__filters">
				<Select
					label="Tipo"
					options={TYPE_OPTIONS}
					value={filter.type}
					onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
				/>
				<input
					type="search"
					className="field__input"
					placeholder="Buscar actividades..."
					value={filter.search}
					onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
					aria-label="Buscar actividades"
					style={{ minWidth: 0 }}
				/>
			</Card>

			{/* Contenido */}
			{loading && <Spinner />}

			{!loading && listError && (
				<ErrorState description={listError} action="Reintentar" onAction={refresh} />
			)}

			{!loading && !listError && activities.length === 0 && (
				<EmptyState
					icon="📋"
					title="Sin actividades"
					description={
						filter.type || filter.search
							? "No hay actividades con los filtros actuales."
							: "Crea tu primera actividad para empezar."
					}
					action={!filter.type && !filter.search ? "Crear actividad" : null}
					onAction={() => setShowForm(true)}
				/>
			)}

			{!loading && !listError && activities.length > 0 && (
				<div className="activity-list__grid">
					{activities.map((activity) => (
						<Card key={activity.id} className="activity-card">
							<div className="activity-card__header">
								<ActivityTypeBadge type={activity.type} />
								<div className="activity-card__actions">
									<button
										type="button"
										className="activity-card__action-btn"
										onClick={() => setEditingActivity(activity)}
										aria-label={`Editar ${activity.title}`}
										title="Editar"
									>
										✏️
									</button>
									<button
										type="button"
										className="activity-card__action-btn"
										onClick={() => handleArchive(activity)}
										aria-label={`Archivar ${activity.title}`}
										title="Archivar"
									>
										📦
									</button>
								</div>
							</div>
							<h3 className="activity-card__title">{activity.title}</h3>
							<p className="activity-card__date">
								{new Date(
									activity.date + (activity.date.includes("T") ? "" : "T12:00:00"),
								).toLocaleDateString("es-ES", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
								{activity.time && ` · ${activity.time}`}
							</p>
							{activity.location && (
								<p className="activity-card__location">📍 {activity.location}</p>
							)}
							{activity.description && (
								<p className="activity-card__desc">{activity.description}</p>
							)}
							<div className="activity-card__footer">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate(`/actividades/${activity.id}`)}
								>
									Ver detalle
								</Button>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Modal crear */}
			<Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva actividad" size="md">
				<ActivityForm
					onSubmit={handleCreate}
					loading={createMutation.loading}
					onCancel={() => setShowForm(false)}
				/>
			</Modal>

			{/* Modal editar */}
			<Modal
				open={!!editingActivity}
				onClose={() => setEditingActivity(null)}
				title="Editar actividad"
				size="md"
			>
				{editingActivity && (
					<ActivityForm
						initial={editingActivity}
						onSubmit={handleUpdate}
						loading={updateMutation.loading}
						onCancel={() => setEditingActivity(null)}
					/>
				)}
			</Modal>
		</div>
	);
}
