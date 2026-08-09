const { v4: uuidv4 } = require("uuid");
const { getData, writeData } = require("../persistence/store");
const { createError } = require("../middleware/errorHandler");

/**
 * Lista actividades con filtros opcionales
 */
function listActivities(filters = {}) {
	const activities = getData("activities");

	let result = [...activities];

	// Filtrar por tipo
	if (filters.type) {
		result = result.filter((a) => a.type === filters.type);
	}

	// Filtrar por rango de fechas
	if (filters.dateFrom) {
		result = result.filter((a) => a.date >= filters.dateFrom);
	}
	if (filters.dateTo) {
		result = result.filter((a) => a.date <= filters.dateTo);
	}

	// Filtrar por busqueda de texto
	if (filters.search) {
		const s = filters.search;
		result = result.filter(
			(a) =>
				a.title?.toLowerCase().includes(s) ||
				a.description?.toLowerCase().includes(s) ||
				a.location?.toLowerCase().includes(s) ||
				a.notes?.toLowerCase().includes(s),
		);
	}

	// Filtrar por archivadas
	if (!filters.includeArchived) {
		result = result.filter((a) => !a.archived);
	}

	// Si se solicita filtrar por estado de asistencia
	if (filters.status) {
		const attendanceData = getData("attendance");
		const activityIdsWithStatus = new Set(
			attendanceData.filter((att) => att.status === filters.status).map((att) => att.activityId),
		);
		result = result.filter((a) => activityIdsWithStatus.has(a.id));
	}

	// Ordenar por fecha descendente y luego por hora
	result.sort((a, b) => {
		if (a.date !== b.date) return b.date.localeCompare(a.date);
		return (b.time || "").localeCompare(a.time || "");
	});

	return result;
}

/**
 * Obtiene datos del calendario mensual
 */
function getCalendarData(year, month) {
	const activities = getData("activities").filter((a) => !a.archived);

	// Generar fechas del mes
	const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
	const lastDay = new Date(year, month, 0).getDate(); // 0 = ultimo dia del mes anterior
	const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

	// Filtrar actividades en el rango
	const monthActivities = activities.filter((a) => a.date >= startDate && a.date <= endDate);

	// Agrupar por fecha
	const days = {};
	for (let d = 1; d <= lastDay; d++) {
		const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
		days[dateStr] = monthActivities.filter((a) => a.date === dateStr);
	}

	return {
		year,
		month,
		startDate,
		endDate,
		totalActivities: monthActivities.length,
		byType: countByType(monthActivities),
		days,
	};
}

/**
 * Obtiene una actividad por ID
 */
function getActivity(id) {
	const activities = getData("activities");
	const activity = activities.find((a) => a.id === id);
	if (!activity) {
		throw createError("NOT_FOUND", "Actividad no encontrada", 404);
	}
	return activity;
}

/**
 * Crea una nueva actividad
 */
function createActivity(data) {
	const activities = getData("activities");
	const now = new Date().toISOString();

	const activity = {
		id: uuidv4(),
		type: data.type,
		title: data.title.trim(),
		description: data.description || "",
		date: data.date,
		time: data.time || null,
		endTime: data.endTime || null,
		location: data.location || "",
		notes: data.notes || "",
		recurrence: data.recurrence || null,
		googleEventId: data.googleEventId || null,
		archived: false,
		createdAt: now,
		updatedAt: now,
	};

	activities.push(activity);

	// Si tiene recurrencia, generar instancias futuras
	if (activity.recurrence) {
		generateRecurringInstances(activity, activities);
	}

	writeData("activities", activities);

	return activity;
}

/**
 * Actualiza una actividad existente
 */
function updateActivity(id, data) {
	const activities = getData("activities");
	const index = activities.findIndex((a) => a.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Actividad no encontrada", 404);
	}

	const now = new Date().toISOString();
	const allowedFields = [
		"type",
		"title",
		"description",
		"date",
		"time",
		"endTime",
		"location",
		"notes",
		"recurrence",
	];

	for (const field of allowedFields) {
		if (data[field] !== undefined) {
			activities[index][field] = data[field];
		}
	}

	// Normalizar campos de hora: "" equivale a null
	if (activities[index].time === "") activities[index].time = null;
	if (activities[index].endTime === "") activities[index].endTime = null;

	// Permitir actualizar googleEventId explícitamente
	if (data.googleEventId !== undefined) {
		activities[index].googleEventId = data.googleEventId;
	}

	activities[index].updatedAt = now;
	writeData("activities", activities);

	return activities[index];
}

/**
 * Archiva una actividad (soft delete)
 */
function archiveActivity(id) {
	const activities = getData("activities");
	const index = activities.findIndex((a) => a.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Actividad no encontrada", 404);
	}

	if (activities[index].archived) {
		throw createError("VALIDATION_ERROR", "La actividad ya esta archivada", 400);
	}

	activities[index].archived = true;
	activities[index].updatedAt = new Date().toISOString();
	writeData("activities", activities);

	return activities[index];
}

/**
 * Restaura una actividad archivada
 */
function restoreActivity(id) {
	const activities = getData("activities");
	const index = activities.findIndex((a) => a.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Actividad no encontrada", 404);
	}

	if (!activities[index].archived) {
		throw createError("VALIDATION_ERROR", "La actividad no esta archivada", 400);
	}

	activities[index].archived = false;
	activities[index].updatedAt = new Date().toISOString();
	writeData("activities", activities);

	return activities[index];
}

/**
 * Obtiene actividades para un rango de fechas (util para calendario)
 */
function getActivitiesByDateRange(startDate, endDate) {
	const activities = getData("activities").filter((a) => !a.archived);
	return activities.filter((a) => a.date >= startDate && a.date <= endDate);
}

/**
 * Genera instancias recurrentes de una actividad hasta endDate
 */
function generateRecurringInstances(activity, activitiesRef) {
	if (!activity.recurrence?.frequency) return;

	const { frequency, interval = 1, endDate } = activity.recurrence;
	const end = endDate || getDefaultRecurrenceEnd(activity.date);
	const activities = activitiesRef || getData("activities");

	const currentDate = new Date(`${activity.date}T00:00:00`);
	const endDateObj = new Date(`${end}T00:00:00`);
	const maxInstances = 52; // Limite por seguridad

	let instancesGenerated = 0;

	while (currentDate <= endDateObj && instancesGenerated < maxInstances) {
		// Avanzar segun frecuencia
		if (frequency === "weekly") {
			currentDate.setDate(currentDate.getDate() + 7 * interval);
		} else if (frequency === "monthly") {
			currentDate.setMonth(currentDate.getMonth() + interval);
		}

		if (currentDate > endDateObj) break;

		const dateStr = currentDate.toISOString().slice(0, 10);

		// Verificar que no exista ya una instancia para esta fecha con el mismo titulo y tipo
		const exists = activities.some(
			(a) =>
				a.date === dateStr &&
				a.title === activity.title &&
				a.type === activity.type &&
				a.id !== activity.id,
		);

		if (!exists) {
			const now = new Date().toISOString();
			activities.push({
				id: uuidv4(),
				type: activity.type,
				title: activity.title,
				description: activity.description || "",
				date: dateStr,
				time: activity.time,
				endTime: activity.endTime,
				location: activity.location || "",
				notes: "",
				recurrence: null, // Las instancias no son recurrentes
				googleEventId: null,
				archived: false,
				createdAt: now,
				updatedAt: now,
			});
			instancesGenerated++;
		}
	}

	if (activitiesRef) {
		// Si se paso referencia externa, no guardar (el llamador lo hara)
	} else {
		writeData("activities", activities);
	}
}

function getDefaultRecurrenceEnd(startDate) {
	// Por defecto, un año desde la fecha de inicio
	const d = new Date(`${startDate}T00:00:00`);
	d.setFullYear(d.getFullYear() + 1);
	return d.toISOString().slice(0, 10);
}

function countByType(activities) {
	const counts = {};
	activities.forEach((a) => {
		counts[a.type] = (counts[a.type] || 0) + 1;
	});
	return counts;
}

module.exports = {
	listActivities,
	getCalendarData,
	getActivity,
	createActivity,
	updateActivity,
	archiveActivity,
	restoreActivity,
	getActivitiesByDateRange,
	generateRecurringInstances,
};
