const { v4: uuidv4 } = require("uuid");
const { getData, writeData } = require("../persistence/store");
const { createError } = require("../middleware/errorHandler");

/**
 * Lista reflexiones con filtros opcionales
 */
function listReflections(filters = {}) {
	const reflections = getData("reflections");

	let result = [...reflections];

	if (filters.activityId) {
		result = result.filter((r) => r.activityId === filters.activityId);
	}

	if (filters.attendanceId) {
		result = result.filter((r) => r.attendanceId === filters.attendanceId);
	}

	// Ordenar por fecha de creacion descendente
	result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

	return result;
}

/**
 * Obtiene una reflexion por ID
 */
function getReflection(id) {
	const reflections = getData("reflections");
	const reflection = reflections.find((r) => r.id === id);
	if (!reflection) {
		throw createError("NOT_FOUND", "Reflexion no encontrada", 404);
	}
	return reflection;
}

/**
 * Crea una nueva reflexion
 */
function createReflection(data) {
	const reflections = getData("reflections");
	const now = new Date().toISOString();

	// Verificar actividad si se proporciona activityId
	if (data.activityId) {
		const activities = getData("activities");
		if (!activities.find((a) => a.id === data.activityId)) {
			throw createError("NOT_FOUND", "Actividad no encontrada", 404);
		}
	}

	// Verificar asistencia si se proporciona attendanceId
	if (data.attendanceId) {
		const attendance = getData("attendance");
		if (!attendance.find((a) => a.id === data.attendanceId)) {
			throw createError("NOT_FOUND", "Registro de asistencia no encontrado", 404);
		}
	}

	const reflection = {
		id: uuidv4(),
		activityId: data.activityId || null,
		attendanceId: data.attendanceId || null,
		title: data.title || "",
		text: data.text.trim(),
		createdAt: now,
		updatedAt: now,
	};

	reflections.push(reflection);
	writeData("reflections", reflections);

	return reflection;
}

/**
 * Actualiza una reflexion existente
 */
function updateReflection(id, data) {
	const reflections = getData("reflections");
	const index = reflections.findIndex((r) => r.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Reflexion no encontrada", 404);
	}

	if (data.title !== undefined) {
		reflections[index].title = data.title.trim();
	}
	if (data.text !== undefined) {
		reflections[index].text = data.text.trim();
	}
	if (data.activityId !== undefined) {
		reflections[index].activityId = data.activityId || null;
	}
	if (data.attendanceId !== undefined) {
		reflections[index].attendanceId = data.attendanceId || null;
	}

	reflections[index].updatedAt = new Date().toISOString();
	writeData("reflections", reflections);

	return reflections[index];
}

/**
 * Elimina una reflexion
 */
function deleteReflection(id) {
	const reflections = getData("reflections");
	const index = reflections.findIndex((r) => r.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Reflexion no encontrada", 404);
	}

	const deleted = reflections[index];
	reflections.splice(index, 1);
	writeData("reflections", reflections);

	return deleted;
}

module.exports = {
	listReflections,
	getReflection,
	createReflection,
	updateReflection,
	deleteReflection,
};
