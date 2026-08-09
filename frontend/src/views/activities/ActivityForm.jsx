import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const TYPE_OPTIONS = [
	{ value: "", label: "Seleccionar tipo...", disabled: true },
	{ value: "culto", label: "Culto" },
	{ value: "ayuno", label: "Ayuno" },
	{ value: "vigilia", label: "Vigilia" },
	{ value: "estudio_biblico", label: "Estudio Biblico" },
	{ value: "reunion", label: "Reunion" },
	{ value: "evangelismo", label: "Evangelismo" },
	{ value: "otro", label: "Otro" },
];

export default function ActivityForm({ initial = {}, onSubmit, loading, onCancel }) {
	const [form, setForm] = useState({
		title: initial.title || "",
		type: initial.type || "",
		date: initial.date || new Date().toISOString().slice(0, 10),
		time: initial.time || "",
		location: initial.location || "",
		description: initial.description || "",
		notes: initial.notes || "",
	});
	const [errors, setErrors] = useState({});

	const handleChange = (field) => (e) => {
		setForm((f) => ({ ...f, [field]: e.target.value }));
		if (errors[field]) setErrors((errs) => ({ ...errs, [field]: "" }));
	};

	const validate = () => {
		const errs = {};
		if (!form.title.trim()) errs.title = "El titulo es obligatorio";
		if (!form.type) errs.type = "Selecciona un tipo de actividad";
		if (!form.date) errs.date = "La fecha es obligatoria";
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validate()) return;
		onSubmit({
			...form,
			title: form.title.trim(),
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
		>
			<Input
				label="Titulo"
				value={form.title}
				onChange={handleChange("title")}
				error={errors.title}
				required
				placeholder="Ej: Culto de sabado"
			/>
			<Select
				label="Tipo de actividad"
				options={TYPE_OPTIONS}
				value={form.type}
				onChange={handleChange("type")}
				error={errors.type}
				required
			/>
			<div style={{ display: "flex", gap: "0.75rem" }}>
				<Input
					label="Fecha"
					type="date"
					value={form.date}
					onChange={handleChange("date")}
					error={errors.date}
					required
				/>
				<Input label="Hora" type="time" value={form.time} onChange={handleChange("time")} />
			</div>
			<Input
				label="Ubicacion"
				value={form.location}
				onChange={handleChange("location")}
				placeholder="Ej: Templo principal"
			/>
			<Input
				label="Descripcion"
				type="textarea"
				value={form.description}
				onChange={handleChange("description")}
				placeholder="Describe la actividad..."
			/>
			<Input
				label="Notas"
				type="textarea"
				value={form.notes}
				onChange={handleChange("notes")}
				placeholder="Notas adicionales..."
			/>
			<div
				style={{
					display: "flex",
					gap: "0.75rem",
					justifyContent: "flex-end",
					marginTop: "0.5rem",
				}}
			>
				<Button variant="ghost" onClick={onCancel} type="button" disabled={loading}>
					Cancelar
				</Button>
				<Button type="submit" loading={loading}>
					{initial.id ? "Guardar cambios" : "Crear actividad"}
				</Button>
			</div>
		</form>
	);
}
