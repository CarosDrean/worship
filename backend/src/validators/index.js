const { ACTIVITY_TYPES, ATTENDANCE_STATUSES, QUOTE_CATEGORIES, DATE_FORMAT } = require("../config");

/**
 * Valida que una fecha tenga formato YYYY-MM-DD
 */
function isValidDate(dateStr) {
	if (!dateStr || typeof dateStr !== "string") return false;
	if (!DATE_FORMAT.test(dateStr)) return false;
	const [year, month, day] = dateStr.split("-").map(Number);
	const d = new Date(year, month - 1, day);
	return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/**
 * Valida que una hora tenga formato HH:mm
 */
function isValidTime(timeStr) {
	if (timeStr === "" || timeStr === null || timeStr === undefined) return true;
	if (typeof timeStr !== "string") return false;
	if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Valida datos de actividad para creacion
 */
function validateActivity(body, isUpdate = false) {
	const errors = [];

	if (!isUpdate) {
		if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
			errors.push("El titulo es obligatorio");
		}
		if (!body.date || !isValidDate(body.date)) {
			errors.push("La fecha es obligatoria y debe tener formato YYYY-MM-DD");
		}
		if (!body.type || !ACTIVITY_TYPES.includes(body.type)) {
			errors.push(`El tipo debe ser uno de: ${ACTIVITY_TYPES.join(", ")}`);
		}
	} else {
		if (
			body.title !== undefined &&
			(typeof body.title !== "string" || body.title.trim().length === 0)
		) {
			errors.push("El titulo no puede estar vacio");
		}
		if (body.date !== undefined && !isValidDate(body.date)) {
			errors.push("La fecha debe tener formato YYYY-MM-DD");
		}
		if (body.type !== undefined && !ACTIVITY_TYPES.includes(body.type)) {
			errors.push(`El tipo debe ser uno de: ${ACTIVITY_TYPES.join(", ")}`);
		}
	}

	if (body.time !== undefined && body.time !== null && !isValidTime(body.time)) {
		errors.push("La hora debe tener formato HH:mm");
	}
	if (body.endTime !== undefined && body.endTime !== null && !isValidTime(body.endTime)) {
		errors.push("La hora de fin debe tener formato HH:mm");
	}
	if (body.location !== undefined && typeof body.location !== "string") {
		errors.push("La ubicacion debe ser texto");
	}
	if (body.notes !== undefined && typeof body.notes !== "string") {
		errors.push("Las notas deben ser texto");
	}
	if (body.description !== undefined && typeof body.description !== "string") {
		errors.push("La descripcion debe ser texto");
	}

	// Validar recurrencia
	if (body.recurrence !== undefined && body.recurrence !== null) {
		if (!body.recurrence.frequency || !["weekly", "monthly"].includes(body.recurrence.frequency)) {
			errors.push('La frecuencia de recurrencia debe ser "weekly" o "monthly"');
		}
		if (
			body.recurrence.interval !== undefined &&
			(!Number.isInteger(body.recurrence.interval) || body.recurrence.interval < 1)
		) {
			errors.push("El intervalo de recurrencia debe ser un entero positivo");
		}
		if (
			body.recurrence.endDate !== undefined &&
			body.recurrence.endDate !== null &&
			!isValidDate(body.recurrence.endDate)
		) {
			errors.push("La fecha fin de recurrencia debe tener formato YYYY-MM-DD");
		}
	}

	return errors;
}

/**
 * Valida datos de asistencia
 */
function validateAttendance(body, isUpdate = false) {
	const errors = [];

	if (!isUpdate) {
		if (!body.activityId || typeof body.activityId !== "string") {
			errors.push("El activityId es obligatorio");
		}
		if (!body.status || !ATTENDANCE_STATUSES.includes(body.status)) {
			errors.push(`El estado debe ser uno de: ${ATTENDANCE_STATUSES.join(", ")}`);
		}
	} else {
		if (body.status !== undefined && !ATTENDANCE_STATUSES.includes(body.status)) {
			errors.push(`El estado debe ser uno de: ${ATTENDANCE_STATUSES.join(", ")}`);
		}
	}

	if (body.notes !== undefined && typeof body.notes !== "string") {
		errors.push("Las notas deben ser texto");
	}
	if (body.absenceReason !== undefined && typeof body.absenceReason !== "string") {
		errors.push("El motivo de ausencia debe ser texto");
	}
	if (body.fastingDuration !== undefined && body.fastingDuration !== null) {
		if (typeof body.fastingDuration !== "number" || body.fastingDuration < 0) {
			errors.push("La duracion del ayuno debe ser un numero positivo");
		}
	}
	if (body.vigilCompleted !== undefined && typeof body.vigilCompleted !== "boolean") {
		errors.push("vigilCompleted debe ser booleano");
	}

	return errors;
}

/**
 * Valida datos de reflexion
 */
function validateReflection(body, isUpdate = false) {
	const errors = [];

	if (!isUpdate) {
		if (!body.text || typeof body.text !== "string" || body.text.trim().length === 0) {
			errors.push("El texto de la reflexion es obligatorio");
		}
	} else {
		if (
			body.text !== undefined &&
			(typeof body.text !== "string" || body.text.trim().length === 0)
		) {
			errors.push("El texto de la reflexion no puede estar vacio");
		}
	}

	if (body.title !== undefined && typeof body.title !== "string") {
		errors.push("El titulo debe ser texto");
	}

	if (!isUpdate && !body.activityId && !body.attendanceId) {
		errors.push(
			"Debe asociarse a una actividad (activityId) o a un registro de asistencia (attendanceId)",
		);
	}

	if (
		body.activityId !== undefined &&
		body.activityId !== null &&
		typeof body.activityId !== "string"
	) {
		errors.push("activityId debe ser texto o null");
	}

	return errors;
}

/**
 * Valida datos de frase
 */
function validateQuote(body, isUpdate = false) {
	const errors = [];

	if (!isUpdate) {
		if (!body.text || typeof body.text !== "string" || body.text.trim().length === 0) {
			errors.push("El texto de la frase es obligatorio");
		}
	} else {
		if (
			body.text !== undefined &&
			(typeof body.text !== "string" || body.text.trim().length === 0)
		) {
			errors.push("El texto de la frase no puede estar vacio");
		}
	}

	if (body.category !== undefined && !QUOTE_CATEGORIES.includes(body.category)) {
		errors.push(`La categoria debe ser una de: ${QUOTE_CATEGORIES.join(", ")}`);
	}
	if (body.author !== undefined && typeof body.author !== "string") {
		errors.push("El autor debe ser texto");
	}
	if (body.source !== undefined && typeof body.source !== "string") {
		errors.push("La fuente debe ser texto");
	}

	return errors;
}

/**
 * Valida datos de configuracion
 */
function validateSettings(body) {
	const errors = [];

	if (body.theme !== undefined && !["light", "dark", "system"].includes(body.theme)) {
		errors.push('El tema debe ser "light", "dark" o "system"');
	}
	if (body.language !== undefined && body.language !== "es") {
		errors.push('El idioma solo puede ser "es"');
	}
	if (
		body.googleCalendarId !== undefined &&
		body.googleCalendarId !== null &&
		typeof body.googleCalendarId !== "string"
	) {
		errors.push("googleCalendarId debe ser texto");
	}

	return errors;
}

/**
 * Valida filtros de actividades
 */
function validateActivityFilters(query) {
	const errors = [];
	const filters = {};

	if (query.type) {
		if (!ACTIVITY_TYPES.includes(query.type)) {
			errors.push(`Tipo de actividad no valido: ${query.type}`);
		} else {
			filters.type = query.type;
		}
	}

	if (query.dateFrom) {
		if (!isValidDate(query.dateFrom)) {
			errors.push("dateFrom debe tener formato YYYY-MM-DD");
		} else {
			filters.dateFrom = query.dateFrom;
		}
	}

	if (query.dateTo) {
		if (!isValidDate(query.dateTo)) {
			errors.push("dateTo debe tener formato YYYY-MM-DD");
		} else {
			filters.dateTo = query.dateTo;
		}
	}

	if (query.status) {
		if (!ATTENDANCE_STATUSES.includes(query.status)) {
			errors.push(`Estado de asistencia no valido: ${query.status}`);
		} else {
			filters.status = query.status;
		}
	}

	if (query.search && typeof query.search === "string") {
		filters.search = query.search.trim().toLowerCase();
	}

	filters.archived = query.archived === "true";
	filters.includeArchived = query.includeArchived === "true";

	return { filters, errors };
}

/**
 * Valida datos de importacion
 */
function validateImportData(data) {
	const errors = [];

	if (!data || typeof data !== "object") {
		return ["Los datos de importacion deben ser un objeto JSON"];
	}

	// Validar estructura basica
	const expectedKeys = ["activities", "attendance", "quotes", "goals", "reflections", "settings"];
	const hasValidKey = expectedKeys.some((key) => data[key] !== undefined);
	if (!hasValidKey) {
		errors.push("El archivo de importacion no contiene ninguna clave reconocida");
	}

	// Validar que los arrays sean arrays
	if (data.activities !== undefined) {
		if (!Array.isArray(data.activities)) errors.push("activities debe ser un array");
		else {
			data.activities.forEach((a, i) => {
				if (!a.id) errors.push(`Actividad ${i + 1}: falta id`);
				if (!a.title) errors.push(`Actividad ${i + 1}: falta titulo`);
				if (!a.date) errors.push(`Actividad ${i + 1}: falta fecha`);
				if (a.type && !ACTIVITY_TYPES.includes(a.type))
					errors.push(`Actividad ${i + 1}: tipo no valido`);
			});
		}
	}

	if (data.attendance !== undefined) {
		if (!Array.isArray(data.attendance)) errors.push("attendance debe ser un array");
		else {
			data.attendance.forEach((a, i) => {
				if (!a.id) errors.push(`Asistencia ${i + 1}: falta id`);
				if (a.status && !ATTENDANCE_STATUSES.includes(a.status))
					errors.push(`Asistencia ${i + 1}: estado no valido`);
			});
		}
	}

	return errors;
}

module.exports = {
	isValidDate,
	isValidTime,
	validateActivity,
	validateAttendance,
	validateReflection,
	validateQuote,
	validateSettings,
	validateActivityFilters,
	validateImportData,
};
