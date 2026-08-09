import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import Spinner from "../components/ui/Spinner";
import { EmptyState, ErrorState } from "../components/ui/StateView";
import { useToast } from "../context/ToastContext";
import { useApi, useMutation } from "../hooks/useApi";
import { api } from "../lib/api";
import "./Reflections.css";

export default function Reflections() {
	const { toast } = useToast();
	const { success, error: showError } = toast || {};

	const { data, loading, error, refresh } = useApi(() => api.reflections.list(), {
		immediate: true,
	});

	// Cargar actividades activas para el selector
	const { data: activitiesData } = useApi(() => api.activities.list(), {
		immediate: true,
	});
	const activities = Array.isArray(activitiesData)
		? activitiesData
		: activitiesData?.activities || [];

	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [form, setForm] = useState({ title: "", text: "", activityId: "" });

	const createMutation = useMutation((data) => api.reflections.create(data));
	const updateMutation = useMutation((id, data) => api.reflections.update(id, data));
	const deleteMutation = useMutation((id) => api.reflections.delete(id));

	const reflections = Array.isArray(data) ? data : data?.reflections || [];

	const openCreate = () => {
		setForm({ title: "", text: "", activityId: "" });
		setEditing(null);
		setShowForm(true);
	};

	const openEdit = (r) => {
		setForm({
			title: r.title || "",
			text: r.text || "",
			activityId: r.activityId || "",
		});
		setEditing(r);
		setShowForm(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.title.trim() || !form.text.trim()) return;
		try {
			if (editing) {
				await updateMutation.execute(editing.id, form);
				success?.("Reflexion actualizada");
			} else {
				await createMutation.execute(form);
				success?.("Reflexion creada");
			}
			setShowForm(false);
			refresh();
		} catch (err) {
			showError?.(err.message);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteMutation.execute(deleteId);
			success?.("Reflexion eliminada");
			setDeleteId(null);
			refresh();
		} catch (err) {
			showError?.(err.message);
		}
	};

	return (
		<div className="reflections-view">
			<div className="reflections-view__header">
				<h1>Reflexiones</h1>
				<Button onClick={openCreate}>+ Nueva reflexion</Button>
			</div>

			{loading && <Spinner />}

			{!loading && error && (
				<ErrorState description={error} action="Reintentar" onAction={refresh} />
			)}

			{!loading && !error && reflections.length === 0 && (
				<EmptyState
					icon="📝"
					title="Sin reflexiones"
					description="Escribe tu primera reflexion personal."
					action="Nueva reflexion"
					onAction={openCreate}
				/>
			)}

			{!loading && !error && reflections.length > 0 && (
				<div className="reflections-grid">
					{reflections.map((r) => (
						<Card key={r.id} className="reflection-card">
							<h3 className="reflection-card__title">{r.title}</h3>
							<p className="reflection-card__date">
								{r.createdAt
									? new Date(r.createdAt).toLocaleDateString("es-ES", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})
									: ""}
							</p>
							<p className="reflection-card__content">{r.text}</p>
							<div className="reflection-card__actions">
								<Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
									✏️ Editar
								</Button>
								<Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)}>
									🗑️ Eliminar
								</Button>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Modal crear/editar */}
			<Modal
				open={showForm}
				onClose={() => setShowForm(false)}
				title={editing ? "Editar reflexion" : "Nueva reflexion"}
				size="md"
			>
				<form onSubmit={handleSubmit} className="reflection-form">
					<Input
						label="Titulo"
						value={form.title}
						onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
						required
						placeholder="Titulo de la reflexion"
					/>
					<Input
						label="Contenido"
						type="textarea"
						value={form.text}
						onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
						required
						placeholder="Escribe tu reflexion..."
					/>
					<Select
						label="Actividad (opcional)"
						options={[
							{ value: "", label: "Sin actividad asociada" },
							...activities.map((a) => ({
								value: a.id,
								label: `${a.title} (${a.date})`,
							})),
						]}
						value={form.activityId}
						onChange={(e) => setForm((f) => ({ ...f, activityId: e.target.value }))}
					/>
					<div className="reflection-form__actions">
						<Button
							variant="ghost"
							onClick={() => setShowForm(false)}
							type="button"
							disabled={createMutation.loading || updateMutation.loading}
						>
							Cancelar
						</Button>
						<Button type="submit" loading={createMutation.loading || updateMutation.loading}>
							{editing ? "Guardar cambios" : "Crear reflexion"}
						</Button>
					</div>
				</form>
			</Modal>

			<ConfirmDialog
				open={!!deleteId}
				title="Eliminar reflexion"
				message="¿Estas seguro de que deseas eliminar esta reflexion? Esta accion no se puede deshacer."
				confirmLabel="Eliminar"
				variant="danger"
				loading={deleteMutation.loading}
				onConfirm={handleDelete}
				onCancel={() => setDeleteId(null)}
			/>
		</div>
	);
}
