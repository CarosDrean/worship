const { v4: uuidv4 } = require("uuid");
const { getData, writeData } = require("../persistence/store");
const { createError } = require("../middleware/errorHandler");

/**
 * Lista registros de asistencia
 */
function listAttendance(filters = {}) {
	const attendance = getData("attendance");
	const activities = getData("activities");
	const activityMap = new Map(activities.map((a) => [a.id, a]));

	let result = [...attendance];

	if (filters.activityId) {
		result = result.filter((a) => a.activityId === filters.activityId);
	}

	if (filters.status) {
		result = result.filter((a) => a.status === filters.status);
	}

	if (filters.dateFrom || filters.dateTo) {
		result = result.filter((att) => {
			const activity = activityMap.get(att.activityId);
			if (!activity) return false;
			if (filters.dateFrom && activity.date < filters.dateFrom) return false;
			if (filters.dateTo && activity.date > filters.dateTo) return false;
			return true;
		});
	}

	// Enriquecer con titulo y fecha de la actividad
	result = result.map((att) => {
		const activity = activityMap.get(att.activityId);
		return {
			...att,
			activityTitle: activity?.title || null,
			activityDate: activity?.date || null,
		};
	});

	// Ordenar por fecha de creacion descendente
	result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

	return result;
}

/**
 * Obtiene un registro de asistencia por ID
 */
function getAttendance(id) {
	const attendance = getData("attendance");
	const record = attendance.find((a) => a.id === id);
	if (!record) {
		throw createError("NOT_FOUND", "Registro de asistencia no encontrado", 404);
	}
	return record;
}

/**
 * Obtiene la asistencia para una actividad especifica
 */
function getAttendanceByActivity(activityId) {
	const attendance = getData("attendance");
	return attendance.filter((a) => a.activityId === activityId);
}

/**
 * Crea un registro de asistencia
 */
function createAttendance(data) {
	const attendance = getData("attendance");
	const activities = getData("activities");

	// Verificar que la actividad existe
	const activity = activities.find((a) => a.id === data.activityId);
	if (!activity) {
		throw createError("NOT_FOUND", "Actividad no encontrada", 404);
	}

	// Verificar que no exista ya un registro para esta actividad
	const existing = attendance.find((a) => a.activityId === data.activityId);
	if (existing) {
		throw createError(
			"DUPLICATE",
			"Ya existe un registro de asistencia para esta actividad. Editalo en lugar de crear uno nuevo.",
			409,
		);
	}

	const now = new Date().toISOString();

	const record = {
		id: uuidv4(),
		activityId: data.activityId,
		status: data.status,
		notes: data.notes || "",
		absenceReason: data.absenceReason || "",
		fastingDuration: data.fastingDuration || null,
		vigilCompleted: data.vigilCompleted === true,
		createdAt: now,
		updatedAt: now,
	};

	attendance.push(record);
	writeData("attendance", attendance);

	return record;
}

/**
 * Actualiza un registro de asistencia
 */
function updateAttendance(id, data) {
	const attendance = getData("attendance");
	const index = attendance.findIndex((a) => a.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Registro de asistencia no encontrado", 404);
	}

	const allowedFields = ["status", "notes", "absenceReason", "fastingDuration", "vigilCompleted"];

	for (const field of allowedFields) {
		if (data[field] !== undefined) {
			attendance[index][field] = data[field];
		}
	}

	attendance[index].updatedAt = new Date().toISOString();
	writeData("attendance", attendance);

	return attendance[index];
}

/**
 * Obtiene historial completo de asistencia con datos de actividad
 */
function getAttendanceHistory() {
	const attendance = getData("attendance");
	const activities = getData("activities");
	const activityMap = new Map(activities.map((a) => [a.id, a]));

	const history = attendance
		.map((att) => {
			const activity = activityMap.get(att.activityId);
			if (!activity) return null;
			return {
				...att,
				activity,
			};
		})
		.filter(Boolean);

	// Ordenar por fecha de actividad descendente
	history.sort((a, b) => b.activity.date.localeCompare(a.activity.date));

	return history;
}

module.exports = {
	listAttendance,
	getAttendance,
	getAttendanceByActivity,
	createAttendance,
	updateAttendance,
	getAttendanceHistory,
};
