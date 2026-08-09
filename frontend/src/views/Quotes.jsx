import { useState } from "react";
import Badge from "../components/ui/Badge";
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
import "./Quotes.css";

const CATEGORY_OPTIONS = [
	{ value: "", label: "Todas las categorias" },
	{ value: "fe", label: "Fe" },
	{ value: "perseverancia", label: "Perseverancia" },
	{ value: "oracion", label: "Oracion" },
	{ value: "disciplina", label: "Disciplina" },
	{ value: "servicio", label: "Servicio" },
	{ value: "esperanza", label: "Esperanza" },
];

const CATEGORY_LABELS = {
	fe: "Fe",
	perseverancia: "Perseverancia",
	oracion: "Oracion",
	disciplina: "Disciplina",
	servicio: "Servicio",
	esperanza: "Esperanza",
	personalizada: "Personalizada",
};

export default function Quotes() {
	const { toast } = useToast();
	const { success, error: showError } = toast || {};
	const [category, setCategory] = useState("");

	const { data, loading, error, refresh } = useApi(
		() => api.quotes.list({ category: category || undefined }),
		{ immediate: true, deps: [category] },
	);

	const { data: randomQuote, execute: getRandom } = useApi(() => api.quotes.random(), {
		immediate: false,
	});

	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [form, setForm] = useState({ text: "", author: "", category: "fe" });

	const createMutation = useMutation((data) => api.quotes.create(data));
	const updateMutation = useMutation((id, data) => api.quotes.update(id, data));
	const deleteMutation = useMutation((id) => api.quotes.delete(id));

	const quotes = Array.isArray(data) ? data : data?.quotes || [];

	const openCreate = () => {
		setForm({ text: "", author: "", category: "fe" });
		setEditing(null);
		setShowForm(true);
	};

	const openEdit = (q) => {
		setForm({
			text: q.text || "",
			author: q.author || "",
			category: q.category || "fe",
		});
		setEditing(q);
		setShowForm(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.text.trim()) return;
		try {
			if (editing) {
				await updateMutation.execute(editing.id, form);
				success?.("Frase actualizada");
			} else {
				await createMutation.execute(form);
				success?.("Frase creada");
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
			success?.("Frase eliminada");
			setDeleteId(null);
			refresh();
		} catch (err) {
			showError?.(err.message);
		}
	};

	const handleRandom = async () => {
		try {
			await getRandom();
		} catch {
			/* handled by error state in the random card */
		}
	};

	return (
		<div className="quotes-view">
			<div className="quotes-view__header">
				<h1>Frases</h1>
				<div className="quotes-view__actions">
					<Button variant="secondary" size="sm" onClick={handleRandom}>
						🎲 Frase aleatoria
					</Button>
					<Button size="sm" onClick={openCreate}>
						+ Nueva frase
					</Button>
				</div>
			</div>

			{/* Frase aleatoria */}
			{randomQuote && (
				<Card className="random-quote-card">
					<p className="random-quote__text">"{randomQuote.text || randomQuote.content}"</p>
					{(randomQuote.author || randomQuote.reference) && (
						<p className="random-quote__author">— {randomQuote.author || randomQuote.reference}</p>
					)}
					{randomQuote.category && (
						<Badge variant="dorado">
							{CATEGORY_LABELS[randomQuote.category] || randomQuote.category}
						</Badge>
					)}
				</Card>
			)}

			{/* Filtro */}
			<Card className="quotes-view__filters">
				<Select
					label="Categoria"
					options={CATEGORY_OPTIONS}
					value={category}
					onChange={(e) => setCategory(e.target.value)}
				/>
			</Card>

			{loading && <Spinner />}

			{!loading && error && (
				<ErrorState description={error} action="Reintentar" onAction={refresh} />
			)}

			{!loading && !error && quotes.length === 0 && (
				<EmptyState
					icon="💬"
					title="Sin frases"
					description="Agrega frases motivacionales a tu coleccion."
					action="Nueva frase"
					onAction={openCreate}
				/>
			)}

			{!loading && !error && quotes.length > 0 && (
				<div className="quotes-grid">
					{quotes.map((q) => (
						<Card key={q.id} className="quote-card">
							<p className="quote-card__text">"{q.text || q.content}"</p>
							{(q.author || q.reference) && (
								<p className="quote-card__author">— {q.author || q.reference}</p>
							)}
							<div className="quote-card__footer">
								{q.category && <Badge>{CATEGORY_LABELS[q.category] || q.category}</Badge>}
								<div className="quote-card__actions">
									<button
										type="button"
										className="quote-card__action-btn"
										onClick={() => openEdit(q)}
										aria-label="Editar frase"
										title="Editar"
									>
										✏️
									</button>
									<button
										type="button"
										className="quote-card__action-btn"
										onClick={() => setDeleteId(q.id)}
										aria-label="Eliminar frase"
										title="Eliminar"
									>
										🗑️
									</button>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Modal crear/editar */}
			<Modal
				open={showForm}
				onClose={() => setShowForm(false)}
				title={editing ? "Editar frase" : "Nueva frase"}
				size="md"
			>
				<form onSubmit={handleSubmit} className="quote-form">
					<Input
						label="Frase"
						type="textarea"
						value={form.text}
						onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
						required
						placeholder="Escribe la frase..."
					/>
					<Input
						label="Autor o referencia"
						value={form.author}
						onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
						placeholder="Ej: Proverbios 3:5"
					/>
					<Select
						label="Categoria"
						options={CATEGORY_OPTIONS.filter((o) => o.value !== "")}
						value={form.category}
						onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
					/>
					<div className="quote-form__actions">
						<Button
							variant="ghost"
							onClick={() => setShowForm(false)}
							type="button"
							disabled={createMutation.loading || updateMutation.loading}
						>
							Cancelar
						</Button>
						<Button type="submit" loading={createMutation.loading || updateMutation.loading}>
							{editing ? "Guardar cambios" : "Crear frase"}
						</Button>
					</div>
				</form>
			</Modal>

			<ConfirmDialog
				open={!!deleteId}
				title="Eliminar frase"
				message="¿Estas seguro de que deseas eliminar esta frase?"
				confirmLabel="Eliminar"
				variant="danger"
				loading={deleteMutation.loading}
				onConfirm={handleDelete}
				onCancel={() => setDeleteId(null)}
			/>
		</div>
	);
}
