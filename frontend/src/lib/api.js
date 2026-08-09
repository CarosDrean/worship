/**
 * Cliente API normalizado para Worship.
 * Todas las respuestas siguen: { ok: true, data } | { ok: false, error: { code, message, details? } }
 */

const BASE_URL = "/api";

class ApiError extends Error {
	constructor(code, message, details = null, status = 0) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.details = details;
		this.status = status;
	}
}

async function handleResponse(response) {
	const contentType = response.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");

	if (!response.ok) {
		if (isJson) {
			const body = await response.json();
			const err = body.error || {};
			throw new ApiError(
				err.code || "HTTP_ERROR",
				err.message || `Error del servidor (${response.status})`,
				err.details || null,
				response.status,
			);
		}
		const text = await response.text().catch(() => "");
		throw new ApiError(
			"HTTP_ERROR",
			`Error del servidor (${response.status})`,
			text,
			response.status,
		);
	}

	if (!isJson) {
		throw new ApiError("INVALID_RESPONSE", "El servidor no devolvio JSON");
	}

	const body = await response.json();
	if (!body.ok) {
		const err = body.error || {};
		throw new ApiError(
			err.code || "API_ERROR",
			err.message || "Error desconocido de la API",
			err.details || null,
			response.status,
		);
	}

	return body;
}

async function request(path, options = {}) {
	const url = `${BASE_URL}${path}`;
	const config = {
		headers: { "Content-Type": "application/json" },
		...options,
	};

	if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
		config.body = JSON.stringify(config.body);
	}

	try {
		const response = await fetch(url, config);
		return await handleResponse(response);
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new ApiError(
			"NETWORK_ERROR",
			"No se pudo conectar con el servidor. Verifica que el backend este funcionando.",
			error.message,
		);
	}
}

// ===== API =====

export const api = {
	// Salud
	health: () => request("/health"),

	// Actividades
	activities: {
		list: (params = {}) => {
			const qs = new URLSearchParams();
			if (params.type) qs.set("type", params.type);
			if (params.status) qs.set("status", params.status);
			if (params.month) qs.set("month", params.month);
			if (params.search) qs.set("search", params.search);
			const query = qs.toString();
			return request(`/activities${query ? `?${query}` : ""}`);
		},
		get: (id) => request(`/activities/${id}`),
		create: (data) => request("/activities", { method: "POST", body: data }),
		update: (id, data) => request(`/activities/${id}`, { method: "PUT", body: data }),
		archive: (id) => request(`/activities/${id}`, { method: "DELETE" }),
		restore: (id) => request(`/activities/${id}/restore`, { method: "POST" }),
		calendar: (params) => {
			const year = params?.year;
			const month = params?.month;
			return request(`/activities/calendar?year=${year}&month=${month}`);
		},
	},

	// Asistencia
	attendance: {
		list: (params = {}) => {
			const qs = new URLSearchParams();
			if (params.activityId) qs.set("activityId", params.activityId);
			if (params.status) qs.set("status", params.status);
			if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
			if (params.dateTo) qs.set("dateTo", params.dateTo);
			const query = qs.toString();
			return request(`/attendance${query ? `?${query}` : ""}`);
		},
		get: (id) => request(`/attendance/${id}`),
		create: (data) => request("/attendance", { method: "POST", body: data }),
		update: (id, data) => request(`/attendance/${id}`, { method: "PUT", body: data }),
		history: () => request("/attendance/history"),
	},

	// Reflexiones
	reflections: {
		list: (params = {}) => {
			const qs = new URLSearchParams();
			if (params.activityId) qs.set("activityId", params.activityId);
			const query = qs.toString();
			return request(`/reflections${query ? `?${query}` : ""}`);
		},
		get: (id) => request(`/reflections/${id}`),
		create: (data) => request("/reflections", { method: "POST", body: data }),
		update: (id, data) => request(`/reflections/${id}`, { method: "PUT", body: data }),
		delete: (id) => request(`/reflections/${id}`, { method: "DELETE" }),
	},

	// Frases
	quotes: {
		list: (params = {}) => {
			const qs = new URLSearchParams();
			if (params.category) qs.set("category", params.category);
			const query = qs.toString();
			return request(`/quotes${query ? `?${query}` : ""}`);
		},
		get: (id) => request(`/quotes/${id}`),
		create: (data) => request("/quotes", { method: "POST", body: data }),
		update: (id, data) => request(`/quotes/${id}`, { method: "PUT", body: data }),
		delete: (id) => request(`/quotes/${id}`, { method: "DELETE" }),
		favorite: (id) => request(`/quotes/${id}/favorite`, { method: "POST" }),
		random: () => request("/quotes/random"),
		daily: () => request("/quotes/daily"),
	},

	// Dashboard
	dashboard: {
		get: (period) => {
			const qs = period ? `?period=${period}` : "";
			return request(`/dashboard${qs}`);
		},
	},

	// Datos
	data: {
		export: () => request("/data/export"),
		import: (data) => request("/data/import", { method: "POST", body: data }),
	},

	// Ajustes
	settings: {
		get: () => request("/settings"),
		update: (data) => request("/settings", { method: "PUT", body: data }),
	},

	// Google Calendar
	google: {
		status: () => request("/google/status"),
		authUrl: () => request("/google/auth"),
		calendars: () => request("/google/calendars"),
		selectCalendar: (calendarId) =>
			request("/google/select-calendar", {
				method: "POST",
				body: { calendarId },
			}),
		sync: (data) => request("/google/sync", { method: "POST", body: data }),
		syncHistory: () => request("/google/sync-history"),
	},
};

export { ApiError };
export default api;
